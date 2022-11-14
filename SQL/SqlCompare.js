import parseDcrSchema from './DcrSchemaParser.js';
import parseOracleDescribe from './OracleDescribeParser.js';
import ObjectUtils from '../utils/ObjectUtils.js';

import CompareSchema from '../resources/CompareSchema.js';
import CompareTable from '../resources/CompareTable.js';

const parsedTable = parseOracleDescribe(CompareTable);
const parsedSchema = parseDcrSchema(CompareSchema);

const asyncExecute = async () => {
  const changeSet = await ObjectUtils.changeSet(parsedTable, parsedSchema);
  console.log('changeSet', JSON.stringify(changeSet));
};
asyncExecute();
