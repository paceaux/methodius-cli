import { promises, constants } from 'fs';
import process from 'process';
import path from 'path';

import { LOG_FILE_NAME, DEFAULT_OUTPUT_FILE } from './constants.js';
import { jsonifyData } from './utils.js';
import Log from './logger.js';

export default class Outputter {
  constructor(defaultOutputFile = DEFAULT_OUTPUT_FILE, logger = new Log(LOG_FILE_NAME)) {
    this.defaultOutputFile = defaultOutputFile;
    this.log = logger;
  }

  /**
   * @description checks if a directory exists
   * @param  {string} directoryName name of the directory to check
   * @returns {boolean} whether the directory exists
   */
  static directoryExists(directoryName) {
    // don't care that lint doesn't like. it's convenient here
    // eslint-disable-next-line no-bitwise
    return promises.access(directoryName, constants.F_OK | constants.W_OK)
      .then(() => true)
      .catch(() => false);
  }

  /**
   * Outputs the results to a file
   * @param  {Map} resultsMap
   * @param  {string} fileName
   */

  async writeFileAsync(data, fileName) {
    if (!data || !fileName) {
      throw new Error('No data or filename provided');
    }

    const dirName = path.dirname(fileName);
    const directoryExists = await Outputter.directoryExists(dirName);
    const fullFileAndPath = path.resolve(dirName, fileName);

    try {
      if (dirName && !directoryExists) {
        await promises.mkdir(dirName, { recursive: true });
      }
      await promises.writeFile(fullFileAndPath, data, {
        encoding: 'utf-8',
      });
    } catch (fileWriteError) {
      await this.log.errorToFileAsync(fileWriteError);
    }
  }

  /**
   * @description Stringifies an object and writes it to a file
   * @param  {object} data a data object to be written to a file
   * @param  {string} fileName defaults to this.defaultOutputFile name of the file
   */
  async writeDataAsync(data, fileName) {
    let outputFileName = this.defaultOutputFile;

    if (fileName !== this.defaultOutputFile) {
      const hasFileExtension = fileName.search(/\.(json|txt)$/g) !== -1;
      const fileExtension = typeof data === 'string' ? 'txt' : 'json';
      outputFileName = hasFileExtension ? fileName : `${fileName}.${fileExtension}`;
    }

    const fullFileAndPath = path.resolve(process.cwd(), outputFileName);

    try {
      const jsonifiedData = jsonifyData(data);

      await this.writeFileAsync(jsonifiedData, fullFileAndPath);
    } catch (writeDataAsyncError) {
      await this.log.errorToFileAsync(writeDataAsyncError);
    }
  }
}
