const dataTypes = [
  'DATE',
  'NUMBER',
  'TEXT',
  'TIMESTAMP',
  'VARCHAR2',
  'VARCHAR',
];

/**
 *
 * @param {String} rawTableCreateStatement
 * @returns {Object} table
 */
 const parseDcrSchema = (rawTableCreateStatement) => {
  const formattedCreateStatementLines = String(rawTableCreateStatement)
    .toUpperCase()
    .split('\t')
    .join(' ')
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

    // column data (line with name removed)
    let columnDataType = null;
    const columnData = column.substring(columnName.length).trim();

    // check for characters matching dataTypes
    let columnDataClone = String(columnData);
    const dataTypesIncluded = [];
    for(const index in dataTypes) {
      const dataType = dataTypes[index];
      if(columnDataClone.includes(dataType)) {
        dataTypesIncluded.push(dataType);
        columnDataClone = columnDataClone.replace(dataType, '');
      }
    }

    // single dataType match
    if(dataTypesIncluded.length === 1) {
      columnDataType = dataTypesIncluded[0];
    }

    // multiple dataType match
    else if(dataTypes.length > 1) {
      console.error(`[OracleDescribeParser] parseOracleDescribe() - Ambiguous dataType for line #[${index}], line: [${column}].`);
      continue;
    }

    // no dataType match
    else {
      console.error(`[OracleDescribeParser] parseOracleDescribe() - No known dataType for line #[${index}], line: [${column}].`);
      continue;
    }

    // column dataType definition - parenthesis after dataType
    let columnDataDefinition = null;
    const columnDataTypeSuffx = column.split(columnDataType)[1];
    const charAfterDataType = columnDataTypeSuffx.charAt(0);
    const isDefinitionIncluded = charAfterDataType === '(';
    if(isDefinitionIncluded) { 
      columnDataDefinition = columnDataTypeSuffx.substring(
        columnDataTypeSuffx.indexOf('(') + 1,
        columnDataTypeSuffx.indexOf(')'),
      )
    }

    // set columnDataDefinition to "6" for TIMESTAMP
    if(columnDataType === 'TIMESTAMP') {
      columnDataDefinition = '6';
    }

    // console.debug('columnDataTypeDefinition', columnDataTypeDefinition);
    // console.debug('columnDataDefinition', columnDataDefinition);

    // column default
    let columnDefault = null;

    // column nullable
    const isColumnNullable = column.substring(column.length - 1) === 'Y';
    // console.debug('isColumnNullable', isColumnNullable);

    columns[columnName] = {
      default: columnDefault,
      definition: columnDataDefinition,
      nullable: isColumnNullable,
      type: columnDataType,
    };
  }
  table.columns = columns;
  return table;
};
export default parseDcrSchema;
