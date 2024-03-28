import {
  LOG_FILE_NAME,
  DEFAULT_OUTPUT_FILE,
  DEFAULT_MERGE_OUTPUT_FILE,
  PROPERTIES,
  TOP_METHODS,
} from '../src/constants.js';

describe('constants', () => {
  test('log file', () => {
    expect(LOG_FILE_NAME).toBeTruthy();
    expect(typeof LOG_FILE_NAME).toEqual('string');
    expect(LOG_FILE_NAME).toEqual('log.txt');
  });
  test('sitemap url', () => {
    expect(DEFAULT_MERGE_OUTPUT_FILE).toBeTruthy();
    expect(typeof DEFAULT_MERGE_OUTPUT_FILE).toEqual('string');
  });
  test('default file', () => {
    expect(DEFAULT_OUTPUT_FILE).toBeTruthy();
    expect(typeof DEFAULT_OUTPUT_FILE).toEqual('string');
    expect(DEFAULT_OUTPUT_FILE).toEqual('analysis.json');
  });
  test('PROPERTIES', () => {
    expect(PROPERTIES).toBeTruthy();
    expect(Array.isArray(PROPERTIES)).toEqual(true);
    expect(PROPERTIES).toContain('bigramFrequencies');
  });
  test('TOP METHODS', () => {
    expect(TOP_METHODS).toBeTruthy();
    expect(Array.isArray(TOP_METHODS)).toEqual(true);
    expect(TOP_METHODS).toContain('topBigrams');
  });
});
