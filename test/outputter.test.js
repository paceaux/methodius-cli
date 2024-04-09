import { promises } from 'fs';
import { createHmac } from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';
import Outputter from '../src/outputter.js';
import Logger from '../src/logger.js';

const thisDir = path.dirname(fileURLToPath(import.meta.url));
const DIR_BASE = path.resolve(thisDir, '__outputter__');
const testFileName = 'test.txt';
const customFileName = 'custom.txt';
const testString = 'test information';
const testData = { information: 'test' };
const testLogger = new Logger('test.log.txt');

/**
 * @description creates a random file name
 * @param  {string} [fileName=testFileName] the name of the file
 * @returns {string} a random file name [DIR_BASE]/[randomDirectory]/[fileName
 */
function getRandomFileName(fileName = testFileName) {
  const randomDirectory = createHmac('sha256', 'test')
    .update(`${new Date()}`)
    .digest('hex');
  const fileNameAndPath = path.resolve(DIR_BASE, randomDirectory, fileName);

  return fileNameAndPath;
}
describe('Outputter', () => {
  describe('properties', () => {
    const outputter = new Outputter(testFileName, testLogger);
    test('default output file', () => {
      expect(outputter.defaultOutputFile).toMatch(testFileName);
    });
    test('it has a built-in logger', () => {
      expect(outputter.log).toBeInstanceOf(Logger);
    });
  });
  describe('writeFileAsync', () => {
    const outputter = new Outputter(testFileName, testLogger);

    afterAll(async () => {
      await promises.rmdir(DIR_BASE, { recursive: true });
    });
    test('it writes data to a file', async () => {
      const fileNameAndPath = getRandomFileName();
      await outputter.writeFileAsync(testString, fileNameAndPath);

      const fileContents = await promises.readFile(fileNameAndPath, { encoding: 'utf-8' });

      expect(fileContents).toContain(testString);
    });
    test('it writes data to a file in a deeper directory', async () => {
      const fileNameAndPath = getRandomFileName('deeper/test.txt');
      await outputter.writeFileAsync(testString, fileNameAndPath);

      const fileContents = await promises.readFile(fileNameAndPath, { encoding: 'utf-8' });

      expect(fileContents).toContain(testString);
    });
    test('an error happens when it doesn\'t have data ', async () => {
      const fileName = getRandomFileName();
      await expect(outputter.writeFileAsync(undefined, fileName)).rejects.toThrow();
    });
    test('an error happens when it doesn\'t have a filename ', async () => {
      await expect(outputter.writeFileAsync(testString)).rejects.toThrow();
    });
    test('an error happens when it doesn\'t have a filename or data ', async () => {
      await expect(outputter.writeFileAsync()).rejects.toThrow();
    });
  });
  describe('writeDataAsync', () => {
    const outputter = new Outputter(testFileName, testLogger);

    afterAll(async () => {
      await promises.rmdir(DIR_BASE, { recursive: true });
    });
    test('it writes data to a file', async () => {
      const fileName = getRandomFileName();
      await outputter.writeDataAsync(testData, fileName);

      const fileContents = await promises.readFile(fileName, { encoding: 'utf-8' });

      expect(fileContents).toContain(JSON.stringify(testData, null, 2));
    });
    test('it writes a custom filename ', async () => {
      const customFile = path.resolve(DIR_BASE, customFileName);
      await outputter.writeDataAsync(testData, customFile);

      const fileContents = await promises.readFile(customFile, { encoding: 'utf-8' });

      expect(fileContents).toContain(JSON.stringify(testData, null, 2));
    });
  });
});
