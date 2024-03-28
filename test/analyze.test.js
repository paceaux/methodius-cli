import { promises } from 'fs';

import {
  convertMapToObject,
  getMethodius,
  getProperties,
  getTopMethods,
  analyzeTextFile,
} from '../src/analyze';

const testFileName = 'test.txt';
const testData = 'test information';
const testConfig = {
  properties: ['uniqueWords'],
  limit: 5,
  files: [testFileName],
  topMethods: ['getTopWords'],
  outputFileName: 'test.json',
};

describe('analyze.js', () => {
  describe('convertMapToObject', () => {
    it('converts a Map to an Object', () => {
      const map = new Map();
      map.set('key', 'value');
      const result = convertMapToObject(map);
      expect(result).toEqual({ key: 'value' });
    });
    it('returns the input if the input is not a Map', () => {
      const input = { key: 'value' };
      const result = convertMapToObject(input);
      expect(result).toEqual(input);
    });
    it('converts a nested Map to a nested Object', () => {
      const map = new Map();
      map.set('key', new Map().set('nestedKey', 'nestedValue'));
      const result = convertMapToObject(map);
      expect(result).toEqual({ key: { nestedKey: 'nestedValue' } });
    });
    it('will not convert a map with a number as a key', () => {
      const map = new Map();
      map.set(1, 'value');
      const result = convertMapToObject(map);
      expect(result).toEqual({});
    });
  });
  describe('getMethodius', () => {
    it('returns an instance of Methodius', () => {
      const methodius = getMethodius('text');
      expect(methodius).toBeDefined();
      expect(methodius.constructor.name).toEqual('Methodius');
    });
  });
  describe('getProperties', () => {
    it('returns an object with the properties of a Methodius instance', () => {
      const methodius = getMethodius('text');
      const properties = getProperties(methodius, ['uniqueWords']);
      expect(properties.uniqueWords).toBeDefined();
      expect(properties.uniqueWords).toEqual(expect.arrayContaining(['text']));
    });
    it('throws an error if the first argument is not an instance of Methodius', () => {
      expect(() => getProperties({})).toThrow();
    });
  });
  describe('getTopMethods', () => {
    it('returns an object with the results of the methods provided', () => {
      const methodius = getMethodius('text');
      const topMethods = getTopMethods(methodius, 5, ['getTopWords']);
      expect(topMethods.getTopWords).toBeDefined();
      expect(topMethods.getTopWords).toEqual({ text: 1 });
    });
    it('returns an object with the results of the method without starting withthe word get', () => {
      const methodius = getMethodius('text');
      const topMethods = getTopMethods(methodius, 5, ['topWords']);
      expect(topMethods.topWords).toBeDefined();
      expect(topMethods.topWords).toEqual({ text: 1 });
    });
    it('throws an error if the first argument is not an instance of Methodius', () => {
      expect(() => getTopMethods({})).toThrow();
    });
  });
  describe('analyzeTextFile', () => {
    afterAll(async () => {
      await promises.unlink(testFileName);
      await promises.unlink('test.json');
    });
    it('throws an error if sent invalid filename', async () => {
      await expect(analyzeTextFile(23, testConfig)).rejects.toThrow();
    });
    it('throws an error if not sent config object', async () => {
      await expect(analyzeTextFile(testFileName)).rejects.toThrow();
    });
    it('throws an error if the config object is missing required properties', async () => {
      await expect(analyzeTextFile(testFileName, {})).rejects.toThrow();
    });
    it('returns null if sent a bad filename', async () => {
      const result = await analyzeTextFile('foo', testConfig);
      expect(result).toBeNull();
    });
    it('produces an analysis file', async () => {
      await promises.writeFile(testFileName, testData, {
        encoding: 'utf-8',
      });
      const resultsFileName = await analyzeTextFile(testFileName, testConfig);
      expect(resultsFileName).toBeDefined();
      expect(resultsFileName).toEqual('test.json');
    });
  });
});
