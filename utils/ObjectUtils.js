class ObjectUtils {
  /**
   * @recursive
   * @static
   * @param {Object} objectNew
   * @param {Object} objectOld
   * @returns {Object} changeSet
   */
  static changeSet(objectNew = {}, objectOld = {}) {
    // determine keys to iterate over
    const keysToIterate = Object.keys({ ...objectNew, ...objectOld });

    // create a changeSet of the two objects
    const changeSet = {};

    // iterate over the keys
    // recurse if either value is a nested object
    keysToIterate.forEach((key) => {
      const isRecursionRequired =
        ObjectUtils.validate(objectNew[key]) ||
        ObjectUtils.validate(objectOld[key]);
      if (isRecursionRequired) {
        const resursiveChangeSet = ObjectUtils.changeSet(
          objectNew[key],
          objectOld[key],
        );
        if (Object.keys(resursiveChangeSet).length > 0) {
          changeSet[key] = { ...resursiveChangeSet };
        }
      }

      // if the values are not string equivalent, add them to the changeSet
      else {
        const newString = String(objectNew[key]);
        const oldString = String(objectOld[key]);
        if (newString !== oldString) {
          changeSet[key] = {};
          if (newString !== 'undefined') {
            changeSet[key].new = objectNew[key];
          }
          if (oldString !== 'undefined') {
            changeSet[key].old = objectOld[key];
          }
        }
      }
    });
    return changeSet;
  }

  /**
   * @recursive
   * @static
   * @param {Object} object
   * @returns {Number} count
   */
  static deepEntriesCount(object = {}) {
    // determine keys to iterate over
    const keysToIterate = Object.keys(object);

    // create a entry count of the object's keys
    let entriesCount = Number('0');

    // iterate over the keys, mapping them to a count of their entries
    keysToIterate
      .map((key) => {
        if (ObjectUtils.validate(object[key])) {
          return ObjectUtils.deepEntriesCount(object[key]);
        } else {
          return Number('1');
        }
      })
      .forEach((count) => (entriesCount += count));
    return entriesCount;
  }

  /**
   * @recursive
   * @static
   * @param {Object} object
   * @param {String[]} keysToFilter
   * @param {Boolean} isWhitelist
   * @returns {Object} filteredObject
   */
  static deepFilterKeys(
    object = {},
    keysToFilter = [],
    isWhitelist = Boolean(true),
  ) {
    // determine keys to iterate over
    const keys = Object.keys(object);
    const keysToIterate = isWhitelist
      ? keys.filter((key) => keysToFilter.includes(key))
      : keys.filter((key) => !keysToFilter.includes(key));

    // create a filtered object
    const filteredObject = {};

    // iterate over the keys, adding them to the filtered object
    keysToIterate.forEach((key) => {
      if (ObjectUtils.validate(object[key])) {
        filteredObject[key] = ObjectUtils.deepFilterKeys(
          object[key],
          keysToFilter,
          isWhitelist,
        );
      } else {
        filteredObject[key] = object[key];
      }
    });
    return filteredObject;
  }

  /**
   * @recursive
   * @static
   * @param {Object} object
   * @param {String[]} valuesToFilter
   * @param {Boolean} isWhitelist
   * @returns {Object}
   */
  static deepFilterValues(
    object = {},
    valuesToFilter = [],
    isWhitelist = Boolean(true),
  ) {
    // determine values to iterate over in the object
    const keysToIterate = Object.keys(object);

    // create a filtered object
    const filteredObject = {};

    // iterate over the keys, adding their value pairs to the filtered object
    keysToIterate.forEach((key) => {
      if (ObjectUtils.validate(object[key])) {
        const deepValues = ObjectUtils.deepFilterValues(
          object[key],
          valuesToFilter,
          isWhitelist,
        );
        if (Object.keys(deepValues).length > 0) {
          filteredObject[key] = deepValues;
        }
      } else if (
        (isWhitelist && valuesToFilter.includes(object[key])) ||
        (!isWhitelist && !valuesToFilter.includes(object[key]))
      ) {
        filteredObject[key] = object[key];
      }
    });
    return filteredObject;
  }

  /**
   * @recursive
   * @static
   * @param {Object} object
   * @param {Boolean} ignoreDuplicates
   * @returns {Array<any>} values
   */
  static deepValues(object = {}, ignoreDuplicates = Boolean(false)) {
    // determine keys to iterate over
    const keysToIterate = Object.keys(object);

    // create a values array
    const values = [];

    // iterate over the keys, tracking corresponding values
    keysToIterate.forEach((key) => {
      if (ObjectUtils.validate(object[key])) {
        ObjectUtils.deepValues(object[key], ignoreDuplicates).forEach((value) =>
          values.push(value),
        );
      } else {
        values.push(object[key]);
      }
    });

    // ignore duplicates if specified
    return ignoreDuplicates ? Array.from(new Set(values)) : values;
  }

  /**
   * @recursive
   * @static
   * @param {Object} object
   * @param {String} delimiter
   * @returns {Object} flattenedObject
   * @throws {Error} if the delimiter specified is not allowed
   * Allowed delimiters are: .!@#$%^&*-_=+|~
   * (see ObjectUtils.FLATTEN_DELIMITERS_ALLOWED)
   */
  static flatten(object = {}, delimiter = String('.')) {
    if (!ObjectUtils.FLATTEN_DELIMITERS_ALLOWED.includes(delimiter)) {
      const delimiters = ObjectUtils.FLATTEN_DELIMITERS_ALLOWED.join('');
      throw new Error(
        `[ObjectUtils] flatten() - delimiter must be one of the following characters: "${delimiters}"`
      );
    }

    // determine keys to iterate over
    const keysToIterate = Object.keys(object);

    // create a flattened object
    const flattenedObject = {};

    // iterate over the keys, adding them to the flattened object
    keysToIterate.forEach((key) => {
      if (ObjectUtils.validate(object[key])) {
        const flattenedValue = ObjectUtils.flatten(object[key], delimiter);
        Object.keys(flattenedValue).forEach((flattenedKey) => {
          const delimitedKey = String(`${key}${delimiter}${flattenedKey}`);
          flattenedObject[delimitedKey] = flattenedValue[flattenedKey];
        });
      } else {
        flattenedObject[key] = object[key];
      }
    });
    return flattenedObject;
  }

  /**
   * @static
   * @param {Object} value
   * @returns {Boolean} isValid
   */
  static validate(value) {
    try {
      return (
        value !== null &&
        value !== undefined &&
        value instanceof Object &&
        String(value) !== String('null') &&
        String(value) !== String('undefined') &&
        String(value) === String('[object Object]')
      );
    } catch {
      return Boolean(false);
    }
  }
}

ObjectUtils.FLATTEN_DELIMITERS_ALLOWED = [
  '.',
  '!',
  '@',
  '#',
  '$',
  '%',
  '^',
  '&',
  '*',
  '-',
  '_',
  '=',
  '+',
  '|',
  '~',
];

export default ObjectUtils;
