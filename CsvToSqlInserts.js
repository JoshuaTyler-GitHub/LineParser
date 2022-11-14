import fs from 'fs';

const CSV_PATH = String("./temp.csv");
const CSV_TYPE = String("utf8");

const file = fs.readFileSync(CSV_PATH, { encoding: CSV_TYPE });
const csvRows = String(file).split('\r\n');

const rows = [];
for(const csvRow of csvRows) {
    const csvRowSplit = csvRow.split(',');
    let [columnName, columnDefinition] = csvRowSplit;

    if(csvRowSplit[2].endsWith(')"')) {
        columnDefinition += `,${csvRowSplit[2]}`;
    }

    columnDefinition = columnDefinition
        .toUpperCase()
        .replace('CHARACTER VARYING', 'VARCHAR')
        .replace(' WITHOUT TIME ZONE', '')
        .split('"').join('');

    rows.push(`${columnName} ${columnDefinition},`);
}
fs.writeFileSync('output.txt', rows.join('\n'));