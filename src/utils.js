/**
 * @description Asynchronous foreach
 * @param  {Array} array items to iterate over
 * @param  {Function} callback asynchronous callback to execute
 */
export async function forEachAsync(array, callback) {
  for (let index = 0; index < array.length; index += 1) {
    // the entire friggin' point of this function is this problem
    // eslint-disable-next-line no-await-in-loop
    await callback(array[index], index, array);
  }
}

/**
 * @description Converts a map to an Object so that it can be JSONified
 * @param  {Map} map a map to convert
 * @returns {object} an object with the same key-value pairs as the map
 */
export function convertMapToObject(map) {
  if (Object.getPrototypeOf(map) !== Map.prototype) {
    return map;
  }

  const convertedMap = {};

  map.forEach((value, key) => {
    convertedMap[key] = convertMapToObject(value);
  });

  return convertedMap;
}

/**
 * @description It makes Data JSON Data
 * @param  {object} data data to stringify
 * @returns {string} a stringified version of the data
 */
export function jsonifyData(data) {
  const convertedMap = convertMapToObject(data);
  return JSON.stringify(convertedMap, null, 2);
}
