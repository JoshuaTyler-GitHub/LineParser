// constants
import Names from '../resources/Names.js';
const alphabet = String('abcdefghijklmnopqrstuvwxyz');
const numbers = String('1234567890');

// dynamic
let columnsOverriden = [];

/**
 *
 * @param {Object} table
 * @param {Number} insertCount
 * @param {Object} columnOverrides
 * @returns {String[]} insertStatements
 */
const generate = (table, insertCount = 1, columnOverrides = {}) => {
  const { columns, name } = table;
  columnsOverriden = [];
  const lines = [];
  lines.push(`INSERT INTO ${name}`);
  lines.push(`(${Object.keys(columns).join(', ')})`);
  lines.push('VALUES');

  // generate column values
  for (const columnName in columns) {
    columns[columnName].values = generateColumnValues(
      columns[columnName],
      columnName,
      columnOverrides,
      insertCount,
    );
  }
  console.debug(`Overridden column generate values: [${columnsOverriden}]`);

  // format column values into CSVs
  for (let i = 0; i < insertCount; i++) {
    const line = [];
    for (const columnName in columns) {
      line.push(`${columns[columnName].values[i]}`);
    }
    lines.push(`(${line.join(', ')}),`);
  }
  return lines;
};

const generateColumnValues = (
  column,
  columnName,
  columnOverrides,
  insertCount,
) => {
  const { default: defaultValue, definition, nullable, type } = column;
  const values = [];
  for (let i = 0; i < insertCount; i++) {
    const value = String(
      generateValue(
        columnName,
        columnOverrides,
        defaultValue,
        definition,
        nullable,
        type,
      ),
    );
    if (type !== 'NUMBER') {
      values.push(`'${value}'`);
    } else {
      values.push(value);
    }
  }
  return values;
};

const generateValue = (
  columnName,
  columnOverrides,
  defaultValue,
  definition,
  nullable,
  type,
) => {
  if (Object.keys(columnOverrides).includes(columnName)) {
    if(!columnsOverriden.includes(columnName)) {
      columnsOverriden.push(columnName);
    }
    return columnOverrides[columnName].callback();
  }

  // dates
  if (type === 'DATE') {
    const year = random(2000, 2022);
    let month = random(1, 12);
    if (month < 10) {
      month = '0' + month;
    }
    let day = random(1, 28);
    if (day < 10) {
      day = '0' + day;
    }
    return String(`${year}-${month}-${day}`);
  }

  // numbers
  else if (type === 'NUMBER') {
    const [whole, decimal] = definition.split(',');

    // max whole value
    const maxWholeValue = Number(
      `1${Array(Math.max(0, Number(whole - decimal) - 1))
        .fill('0')
        .join('')}`,
    );

    // min whole value
    const minWholeValue = Number(String(maxWholeValue).substring(0, String(maxWholeValue).length - 2) + '1');

    // max decimal value
    const maxDecimalValue = Number(
      `1${Array(Math.max(0, Number(decimal) - 1))
        .fill('0')
        .join('')}`,
    );

    // min decimal value
    const minDecimalValue = Number(String(maxDecimalValue).substring(0, String(maxDecimalValue).length - 2) + '1');

    const randomWhole = Number(`${random(minWholeValue, maxWholeValue)}`);
    let randomValue = decimal === '0'
      ? randomWhole
      : Number(`${randomWhole}.${random(minDecimalValue, maxDecimalValue)}`);
    if(String(randomValue).startsWith('9')) {
      randomValue = Number(String('8' + String(randomValue).substring(1)));
    }
    return randomValue;
  }

  // strings
  else if (type === 'TEXT' || type === 'VARCHAR' || type === 'VARCHAR2') {
    const charLimit = Number(definition.split(' ')[0]);

    // name
    if (columnName.includes('NAME')) {
      return Names.getRandomName().substring(0, charLimit);
    }

    // ssn
    if (columnName.includes('SSN')) {
      const characters = [];
      for (let i = 0; i < charLimit; i++) {
        characters.push(numbers[Math.floor(random(0, numbers.length))]);
      }
      return String(characters.join(''));
    }

    // status
    else if (
      columnName.includes('FLAG') ||
      columnName.includes('FLG') ||
      columnName.includes('IND') ||
      columnName.includes('INDICATOR') ||
      columnName.includes('STATUS')
    ) {
      return String(Math.random() > 0.5 ? 'YES_STATUS' : 'NO_STATUS').substring(
        0,
        charLimit,
      );
    }

    // other
    else {
      const characters = [];
      for (let i = 0; i < charLimit; i++) {
        characters.push(alphabet[Math.floor(random(0, alphabet.length))]);
      }
      return String(characters.join('').toUpperCase());
    }
  }

  // timestamp
  else if (type === 'TIMESTAMP') {
    const year = random(2000, 2022);
    let month = random(1, 12);
    if (month < 10) {
      month = '0' + month;
    }
    let day = random(1, 28);
    if (day < 10) {
      day = '0' + day;
    }
    let hour = random(0, 23);
    if (hour < 10) hour = '0' + hour;
    let minute = random(0, 59);
    if (minute < 10) minute = '0' + minute;
    let second = random(0, 59);
    if (second < 10) second = '0' + second;
    let nano = random(0, 999);
    if (nano < 10) nano = '00' + nano;
    else if (nano < 100) nano = '0' + nano;
    return String(
      `${year}-${month}-${day} ${hour}:${minute}:${second}.${nano}`,
    );
  }

  // unkown
  else {
    console.error(`Unkown type: [${type}]`);
  }
  return null;
};

const random = (min, max) => {
  const dif = max - min;
  return Math.round(Math.random() * dif) + min;
};
export default generate;
