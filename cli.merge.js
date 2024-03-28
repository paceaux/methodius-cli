#!/usr/bin/env node

/**
 * This script reads  files produced from index.js and
 * merges the properties (it's a way to produce data from multiple sources)
 * @example
 * node sample-merge.js -f file1.json file2.json -p property1 property2 -o output.json
 */
import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';

import {
  DEFAULT_MERGE_OUTPUT_FILE,
  PROPERTIES,
  TOP_METHODS,
} from './src/constants.js';
import { merge } from './src/merge.js';

const { argv } = yargs(hideBin(process.argv))
  .option('files', {
    alias: 'f',
    type: 'array',
    description: 'The files to read',
  })
  .option('properties', {
    alias: 'p',
    type: 'array',
    description: 'The properties to merge',
    default: PROPERTIES,
  })
  .option('topMethods', {
    alias: 'm',
    type: 'array',
    description: 'The properties to get',
    default: TOP_METHODS,
  })
  .option('outputFileName', {
    alias: 'o',
    description: 'name of output file',
    type: 'string',
    default: DEFAULT_MERGE_OUTPUT_FILE,
  })
  .help()
  .alias('help', 'h');

const {
  files,
  properties,
  topMethods,
  outputFileName,
} = argv;

const mergerConfig = {
  files,
  properties,
  topMethods,
  outputFileName,
};

/**
 * @typedef {object} MergeConfig
 * @property {string[]} files - the files to read
 * @property {string[]} properties - the properties to merge
 * @property {string} outputFileName - the name of the output file
 */

/**
 * @param  {MergeConfig} config - the configuration for the merge
 */
async function main(config) {
  await merge(config);
}

main(mergerConfig);
