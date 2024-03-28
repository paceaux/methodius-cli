import { promises } from 'fs';
import path from 'path';
import { Methodius } from 'methodius';
import Log from './logger.js';
import { LOG_FILE_NAME, DEFAULT_LIMIT, DEFAULT_OUTPUT_FILE } from './constants.js';
import Outputter from './outputter.js';

const log = new Log(LOG_FILE_NAME);
const outputter = new Outputter(DEFAULT_OUTPUT_FILE, log);

// note: not using the one from utils because there's a bug in Methodius,
// where numbers are making the list.
/**
 * @description Recursively converts a map to an object
 * @param  {Map<any, any>} map a map to convert
 * @returns {object} an object with the same key-value pairs as the map
 */
export function convertMapToObject(map) {
  if (Object.getPrototypeOf(map) !== Map.prototype) {
    return map;
  }

  const convertedMap = {};

  map.forEach((value, key) => {
    const isKeyANumber = !Number.isNaN(Number(key));
    if (!isKeyANumber) {
      convertedMap[key] = convertMapToObject(value);
    }
  });

  return convertedMap;
}

/**
 * @description generates an instance of Methodius
 * @param  {string} text the text to analyze
 * @returns {Methodius} an instance of Methodius
 */
export function getMethodius(text) {
  return new Methodius(text);
}

/**
 * @description takes a list of properties from a methodius instance and creates an object
 * @param  {Methodius} methodius - the instance of Methodius
 * @param  {string[]} [propertyList] - the list of properties to analyze
 * @returns {object} an object with the properties
 */
export function getProperties(methodius, propertyList = []) {
  if (!methodius || !(methodius instanceof Methodius)) {
    throw new Error('You must provide an instance of Methodius');
  }
  const analysis = {};
  propertyList.forEach((propertyName) => {
    analysis[propertyName] = convertMapToObject(methodius[propertyName]);
  });
  return analysis;
}

/**
 * @description takes a list of methods (only the ones that getTop<whatever) and returns an object
 * @param  {Methodius} methodius - the instance of Methodius
 * @param  {number} [limit = 15] - how many for a given method to return
 * @param  {string[]} [methodList] - list of methods
 * @returns {object} an object with the results of the methods provided
 */
export function getTopMethods(methodius, limit = DEFAULT_LIMIT, methodList = []) {
  if (!methodius || !(methodius instanceof Methodius)) {
    throw new Error('You must provide an instance of Methodius');
  }
  const analysis = {};
  methodList.forEach((methodName) => {
    let safeMethodName = methodName;
    const propertyExists = methodName in methodius;
    if (!propertyExists) {
      safeMethodName = `get${methodName.charAt(0).toUpperCase()}${methodName.slice(1)}`;
    }
    const safeMethodNameExists = safeMethodName in methodius;
    if (safeMethodNameExists && typeof methodius[safeMethodName] === 'function') {
      const value = methodius[safeMethodName](limit);
      analysis[methodName] = convertMapToObject(value);
    }
  });

  return analysis;
}

/**
 * @typedef {object} AnalyzerConfig
 * @property {string[]} files - the files to read
 * @property {string[]} properties - the properties to get
 * @property {string[]} topMethods - the methods to get
 * @property {string} outputFileName - the name of the output file
 */
/**
 * @param  {string} file filename to analyze
 * @param  {AnalyzerConfig} config configuration object
 * @returns {string} output fileName of the analysis
 */
export async function analyzeTextFile(file, config) {
  let outputFile = null;

  if (typeof file !== 'string') {
    throw new Error('File must be a string');
  }
  if (!config || typeof config !== 'object') {
    throw new Error('configuration object is required');
  }

  const hasFiles = config.files && Array.isArray(config.files);
  const hasProperties = config.properties && Array.isArray(config.properties);
  const hasTopMethods = config.topMethods && Array.isArray(config.topMethods);
  const hasOutputFileName = config.outputFileName && typeof config.outputFileName === 'string';

  if (!hasFiles || !hasProperties || !hasTopMethods || !hasOutputFileName) {
    throw new Error('Configuration object is missing required properties');
  }
  try {
    const text = await promises.readFile(file, 'utf-8');

    const analysis = {};

    await log
      .toConsole(`Read ${file}'s  ${text.length} characters`)
      .infoToFileAsync();

    const methodius = getMethodius(text);
    const propertyAnalysis = getProperties(methodius, config.properties);
    const topAnalysis = getTopMethods(methodius, config.topLimit, config.topMethods);
    const relatedAnalysis = {
      relatedBigrams: convertMapToObject(methodius.getRelatedTopNgrams(2, config.topLimit)),
      relatedTrigrams: convertMapToObject(methodius.getRelatedTopNgrams(3, config.topLimit)),
    };

    Object.assign(analysis, propertyAnalysis, topAnalysis, relatedAnalysis);

    await log
      .toConsole('Analysis Object Prepared')
      .infoToFileAsync();

    log.endTimer();

    const { elapsedTime } = log;
    const shouldHaveManyOutputs = config.files.length > 1;
    outputFile = config.outputFileName;
    const isDefaultOutputFile = outputFile === DEFAULT_OUTPUT_FILE;

    if (shouldHaveManyOutputs) {
      const inputFileName = path.parse(file).name;
      outputFile = isDefaultOutputFile
        ? `${inputFileName}.${outputFile}`
        : `${outputFile}.${inputFileName}`;
    }
    await outputter.writeDataAsync(analysis, outputFile);

    const endMessage = `
📓  Methodius File Analysis is finished!

⏱   Time lapsed: ${elapsedTime}
🧮  Mean word size: ${analysis.meanWordSize}
📏  Median word size: ${analysis.medianWordSize}
🖇️ Top Related Bigrams: ${Object.keys(analysis.relatedBigrams).join(', ')}

💾  Results File: ${outputFile}
`;
    await log.toConsole(endMessage, true).infoToFileAsync();
  } catch (mainError) {
    await log.errorToFileAsync(mainError);
  }
  return outputFile;
}
