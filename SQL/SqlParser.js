/**
 *
 * @param {String} rawTableCreateStatement
 * @returns {Object} table
 */
const parse = (rawTableCreateStatement) => {
  const formattedCreateStatementLines = String(rawTableCreateStatement)
    .toUpperCase()
    .split('\t')
    .join('')
    .split('\n');

  const table = {};
  const columns = {};
  for (const index in formattedCreateStatementLines) {
    const column = String(formattedCreateStatementLines[index])
      .toUpperCase()
      .trim();

    // name table based on create line
    if (column.startsWith('CREATE TABLE')) {
        table.name = String(column.split(' ')[2]);
        continue;
    }

    // skip if empty line or final line
    else if (column == '' || column == ');') {
      continue;
    }

    // column name
    const columnName = column.split(' ')[0];
    // console.debug('columnName', columnName);

    // column data
    const columnData = column.substring(columnName.length + 1);
    const columnDataTypeIncludesParenthesis = columnData
      .split(' ')[0]
      .includes('(');
    // console.debug('columnData', columnData);

    // column data type
    const columnDataType = columnDataTypeIncludesParenthesis
      ? columnData.split('(')[0].replace(',', '')
      : columnData.split(' ')[0].replace(',', '');
    // console.debug('columnDataType', columnDataType);

    // column data type definition
    const columnDataTypeDefinition = columnData
      .substring(columnDataType.length)
      .trim();
    const columnDataDefinition = columnDataTypeDefinition.substring(
      columnDataTypeDefinition.indexOf('(') + 1,
      columnDataTypeDefinition.indexOf(')'),
    );
    // console.debug('columnDataTypeDefinition', columnDataTypeDefinition);
    // console.debug('columnDataDefinition', columnDataDefinition);

    // column default
    const columnProperties = columnDataTypeDefinition
      .substring(columnDataDefinition.length + 2)
      .trim();
    const isDefaultPresent = column.includes('DEFAULT');
    const columnDefault = columnProperties.split(' ')[1];
    // console.debug('columnProperties', columnProperties);
    // console.debug('columnDefault', columnDefault);

    // column nullable
    const isColumnNullable = Boolean(!column.includes('NOT NULL'));
    // console.debug('isColumnNullable', isColumnNullable);

    columns[columnName] = {
      default: isDefaultPresent ? columnDefault : null,
      definition: columnDataDefinition,
      nullable: isColumnNullable,
      type: columnDataType,
    };
  }
  table.columns = columns;
  return table;
};
export default parse;
