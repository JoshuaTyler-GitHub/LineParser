/**
 * Copyright (c) 2022 Relyt LLC
 * Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International
 */

// utils
import ValidationUtils from './ValidationUtils.js';

class ObjectUtils {
  /**
   * @async
   * @recursive
   * @static
   * @param {Object} objectNew
   * @param {Object} objectOld
   * @param {String[]} ignoreKeys
   * @returns {Promise<Object>}
   */
  static async changeSet(objectNew = {}, objectOld = {}, ignoreKeys = []) {
    const keys = Object.keys({ ...objectNew, ...objectOld });
    const changeSet = {};
    await Promise.all(
      keys.map(async (key) => {
        let recursionRequired = Boolean(false);

        // stringify new values
        let newString = String('undefined');
        if (ValidationUtils.exists(objectNew[key])) {
          if (ValidationUtils.string(objectNew[key])) {
            newString = String(objectNew[key]);
          } else {
            recursionRequired = Boolean(true);
          }
        }

        // stringify old values
        let oldString = String('undefined');
        if (ValidationUtils.exists(objectOld[key])) {
          if (ValidationUtils.string(objectOld[key])) {
            oldString = String(objectOld[key]);
          } else {
            recursionRequired = Boolean(true);
          }
        }

        // recurse if needed
        if (recursionRequired) {
          const resursiveChangeSet = await ObjectUtils.changeSet(
            objectNew[key],
            objectOld[key],
          );
          if (Object.keys(resursiveChangeSet).length > 0) {
            changeSet[key] = { ...resursiveChangeSet };
          }
        } else if (String(newString) !== String(oldString)) {
          changeSet[key] = {};
          if (ValidationUtils.exists(objectNew[key])) {
            changeSet[key].new = objectNew[key];
          }
          if (ValidationUtils.exists(objectOld[key])) {
            changeSet[key].old = objectOld[key];
          }
        }
      }),
    );
    return changeSet;
  }

  /**
   * @async
   * @recursive
   * @static
   * @param {Object} object
   * @param {String[]} ignoreKeys
   * @returns {Promise<Number>}
   */
  static async deepEntriesCount(object = {}, ignoreKeys = []) {
    let entriesCount = Number('0');
    const keys = Object.keys(object);
    if (keys.length > 0) {
      const recursiveEntriesCounts = await Promise.all(
        keys.map(async (key) => {
          if (!ignoreKeys.includes(key)) {
            entriesCount++;
            if (object[key] instanceof Object) {
              return ObjectUtils.deepEntriesCount(object[key], ignoreKeys);
            }
          }
          return Number('0');
        }),
      );
      recursiveEntriesCounts.forEach((count) => (entriesCount += count));
    }
    return entriesCount;
  }

  /**
   * @async
   * @recursive
   * @static
   * @param {Object} object
   * @param {String[]} filterKeys
   * @param {Boolean} isExclusive
   * @returns {Promise<Object>}
   */
  static async deepFilterKeys(
    object,
    filterKeys = [],
    isExclusive = Boolean(false),
  ) {
    const filteredObject = {};
    await Promise.all(
      Object.entries(object).map(async ([key, value]) => {
        if (
          (isExclusive && !filterKeys.includes(key)) ||
          (!isExclusive && filterKeys.includes(key))
        ) {
          if (value instanceof Object) {
            filteredObject[key] = await ObjectUtils.deepFilterKeys(
              value,
              filterKeys,
              isExclusive,
            );
          } else {
            filteredObject[key] = value;
          }
        }
      }),
    );
    return filteredObject;
  }

  /**
   * @async
   * @recursive
   * @static
   * @param {Object} object
   * @param {String[]} filterValues
   * @param {Boolean} isExclusive
   * @returns {Promise<Object>}
   */
  static async deepFilterValues(
    object,
    filterValues = [],
    isExclusive = Boolean(false),
  ) {
    const filteredObject = {};
    await Promise.all(
      Object.entries(object).map(async ([key, value]) => {
        if (
          (isExclusive && !filterValues.includes(value)) ||
          (!isExclusive && filterValues.includes(value))
        ) {
          if (value instanceof Object) {
            filteredObject[key] = await ObjectUtils.deepFilterValues(
              value,
              filterValues,
              isExclusive,
            );
          } else {
            filteredObject[key] = value;
          }
        }
      }),
    );
    return filteredObject;
  }

  /**
   * @async
   * @recursive
   * @static
   * @param {Object} object
   * @param {String[]} ignoreKeys
   * @param {Boolean} ignoreDuplicates
   * @returns {Promise<Array<any>>}
   */
  static async deepValues(
    object = {},
    ignoreKeys = [],
    ignoreDuplicates = Boolean(false),
  ) {
    const finalValues = [];
    const entries = Object.entries(object);
    if (entries.length > 0) {
      const recursiveValues = await Promise.all(
        entries.map(async ([key, value]) => {
          if (!ignoreKeys.includes(key)) {
            if (value instanceof Object) {
              return ObjectUtils.deepValues(
                value,
                ignoreKeys,
                ignoreDuplicates,
              );
            } else {
              return [value];
            }
          } else {
            return null;
          }
        }),
      );

      await Promise.all(
        recursiveValues.map(async (values) => {
          if (values !== null) {
            return Promise.all(
              values.map(async (value) => {
                if (value !== null) {
                  const isDuplicate = Boolean(finalValues.includes(value));
                  const isIgnored = Boolean(ignoreDuplicates && isDuplicate);
                  if (!isIgnored) {
                    finalValues.push(value);
                  }
                }
              }),
            );
          }
        }),
      );
    }
    return finalValues;
  }
}
export default ObjectUtils;
