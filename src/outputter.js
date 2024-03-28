import { promises } from 'fs';
import process from 'process';
import path from 'path';

import { LOG_FILE_NAME, DEFAULT_OUTPUT_FILE } from './constants.js';
import { jsonifyData } from './utils.js';
import Log from './logger.js';

const fs = promises;

export default class Outputter {
  constructor(defaultOutputFile = DEFAULT_OUTPUT_FILE, logger = new Log(LOG_FILE_NAME)) {
    this.defaultOutputFile = defaultOutputFile;
    this.log = logger;
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

    const fullFileAndPath = path.resolve(process.cwd(), fileName);

    try {
      await fs.writeFile(fullFileAndPath, data, {
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
      const hasFileExtension = path.extname(fileName);
      outputFileName = hasFileExtension ? fileName : `${fileName}.json`;
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
