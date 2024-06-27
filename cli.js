#!/usr/bin/env node

/**
 * This script reads a file and produces an analysis of the text
 * @example
 * node index.js -f file.txt -l 15 -o output.json
 */

import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';

import {
  LOG_FILE_NAME,
  DEFAULT_OUTPUT_FILE,
  DEFAULT_LIMIT,
  PROPERTIES,
  TOP_METHODS,
  DEFAULT_MERGE_OUTPUT_FILE,
} from './src/constants.js';
import { forEachAsync } from './src/utils.js';
import Log from './src/logger.js';
import {
  analyzeTextFile,
} from './src/analyze.js';
import { merge } from './src/merge.js';

const log = new Log(LOG_FILE_NAME);

const { argv } = yargs(hideBin(process.argv))
  .option('files', {
    alias: 'f',
    type: 'array',
    description: 'The files to read',
  })
  .option('topLimit', {
    alias: 'l',
    type: 'number',
    description: 'If requesting from topMethods, this is the upperlimit to pass into them',
    default: DEFAULT_LIMIT,
  })
  .option('properties', {
    alias: 'p',
    type: 'array',
    description: 'The properties to get off a Methodius instance',
    default: PROPERTIES,
  })
  .option('topMethods', {
    alias: 't',
    type: 'array',
    description: 'The methods to execute off of a Methodius instance',
    default: TOP_METHODS,
  })
  .option('outputFileName', {
    alias: 'o',
    description: 'name of output file. If analyzing multiple files, you can make this a directory with a trailing /',
    type: 'string',
    default: DEFAULT_OUTPUT_FILE,
  })
  .option('mergeResults', {
    alias: 'm',
    description: 'if multiple files are analyzed, merge the results into a single file',
    type: 'boolean',
    default: false,
  })
  .help()
  .alias('help', 'h');

const {
  files,
  topLimit,
  properties,
  topMethods,
  mergeResults,
  outputFileName,
} = argv;

const analyzerConfig = {
  files,
  topLimit,
  topMethods,
  properties,
  mergeResults,
  outputFileName,
};
/**
 * @typedef {object} AnalyzerConfig
 * @property {string[]} files - the files to read
 * @property {string[]} properties - the properties to get
 * @property {string[]} topMethods - the methods to get
 * @property {string} outputFileName - the name of the output file
 */
/**
 * @description main function for the cli
 * @param  {AnalyzerConfig} config configuration object
 */
async function main(config) {
  if (!config.files) {
    await log
      .toConsole('No file provided')
      .errorToFileAsync(new Error('No file provided'));
    throw new Error('No file provided');
  }

  const startMessage = `
    📓  Methodius Analysis is starting!

    📂  File: ${config.files}
`;
  await log
    .toConsole(startMessage, true)
    .startTimer()
    .infoToFileAsync();

  const resultsFiles = [];
  await forEachAsync(config.files, async (file) => {
    const resultFile = await analyzeTextFile(file, config);
    const resultFileName = resultFile?.endsWith('.json') ? resultFile : `${resultFile}.json`;
    resultsFiles.push(resultFileName);
  });

  const endMessage = `
📓  Methodius Analysis Finished
🏷  Properties: ${config.properties.join(', ')}
🏷  topMethods: ${config.topMethods.join(', ')}

📂 results: ${resultsFiles.join(', ')}
  `;

  await log
    .toConsole(endMessage, true)
    .infoToFileAsync();

  if (config.mergeResults) {
    let mergeOutputFileName = `${config.outputFileName.replace('json', '')}.${DEFAULT_MERGE_OUTPUT_FILE}`;
    mergeOutputFileName = mergeOutputFileName.replace('..', '.');

    const mergeConfig = {
      files: resultsFiles,
      properties: [...config.properties, ...config.topMethods],
      outputFileName: mergeOutputFileName,
    };
    await merge(mergeConfig);
  }
}

main(analyzerConfig);
