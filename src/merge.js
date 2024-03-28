import { promises } from 'fs';

import { LOG_FILE_NAME, DEFAULT_MERGE_OUTPUT_FILE } from './constants.js';
import Log from './logger.js';
import Outputter from './outputter.js';
import { forEachAsync, convertMapToObject } from './utils.js';

const log = new Log(LOG_FILE_NAME);

/**
 * @description guarantees that a thing that could be iterable is iterable
 * @param  {any} value - the value to check/convert to something iterable
 * @returns {Array} an array containing keys from a map or values from an array/set
 */
export function getIterableValue(value) {
  let newIterable = [];
  const isValueNull = value === null;
  const isValueArray = Array.isArray(value);
  const isValueObject = !isValueNull && !isValueArray && (typeof value === 'object');
  const isValueMap = value instanceof Map;
  const isValueSet = value instanceof Set;

  // if it's an object, I want to merge keys
  if (isValueObject || isValueArray) {
    // map and set are objects, but they don't convert w/ Object.keys
    const keys = isValueMap || isValueSet
      ? [...value.keys()]
      : Object.keys(value);

    newIterable = isValueObject
      ? keys
      : value;
  }

  return newIterable;
}

/**
 * @description calculates the average value of an array of numbers
 * @param  {number[]} value the array of numbers from which to get an average
 * @returns {number} the average value
 */
export function getAverageValue(value) {
  const sum = value.reduce((acc, curr) => acc + curr, 0);
  return sum / value.length;
}

/**
 * @description loops through the array of files, reads them, and merges the properties
 * @param  {string[]} [fileNames=[]] - the names of the files to read
 * @param  {string[]} [propertyNames = []] - the names of the properties to merge
 * @returns {Map<string, any>} a map of property names and their merged values
 */
export async function getPropertiesFromFiles(fileNames = [], propertyNames = []) {
  const propertyMap = new Map();

  propertyNames.forEach((propertyName) => {
    propertyMap.set(propertyName, []);
  });

  await forEachAsync(fileNames, async (file, fileIndex) => {
    try {
      const fileContents = await promises.readFile(file, 'utf-8');
      const parsedFileContents = JSON.parse(fileContents);

      propertyNames.forEach((propertyName) => {
        const newValue = parsedFileContents[propertyName];
        const isValueNumber = (typeof newValue === 'number') && !Number.isNaN(newValue);
        const existingValue = propertyMap.get(propertyName);
        const newIterableValue = getIterableValue(newValue);

        // note: not worried if the value is a number, b/c getIterableValue would return empty array
        newIterableValue.forEach((item) => {
          if (!existingValue.includes(item)) {
            existingValue.push(item);
          }
        });

        // if it's a number, let's average it
        if (isValueNumber) {
          const isLastFile = fileIndex === fileNames.length - 1;
          existingValue.push(newValue);

          if (isLastFile) {
            const average = getAverageValue(existingValue);
            propertyMap.set(propertyName, average);
          }
        }
      });
    } catch (readFileError) {
      await log.errorToFileAsync(readFileError);
    }
  });

  return propertyMap;
}

/**
 * @typedef {object} MergeConfig
 * @property {string[]} files - the files to read
 * @property {string[]} properties - the properties to merge
 * @property {string} outputFileName - the name of the output file
 */
/**
 * @description merges properties from files and writes the output to a file
 * @param  {MergeConfig} config - the configuration for the merge
 */
export async function merge(config) {
  const outputter = new Outputter(DEFAULT_MERGE_OUTPUT_FILE, log);
  if (!config.files) {
    const error = new Error('No files provided');
    await log.errorToFileAsync(error);
    throw error;
  }

  if (!config.properties) {
    const error = new Error('No properties provided');
    await log.errorToFileAsync(error);
    throw error;
  }

  const startMessage = `
📓 Methodius Result Merger is starting!
📂 Beginning merge of ${config.files.join(', ')}

🏷 Merging properties: ${config.properties.join(', ')}
`;

  await log
    .toConsole(startMessage, true)
    .infoToFileAsync();

  try {
    const propertyMap = await getPropertiesFromFiles(config.files, config.properties);
    const propertyObject = convertMapToObject(propertyMap);

    await outputter.writeDataAsync(propertyObject, config.outputFileName);

    const outputFile = `${config.outputFileName}${config.outputFileName !== 'merged.json' ? '.merged.json' : ''}`;
    const endMessage = `
📓 Methodius Result Merger Finished

🏷 Properties: ${config.properties.join(', ')}
💾  Results File: ${outputFile}
`;
    await log
      .toConsole(endMessage, true)
      .infoToFileAsync();
  } catch (mainError) {
    await log.errorToFileAsync(mainError);
  }
}
