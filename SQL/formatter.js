import fs from 'fs';

const CSV_PATH = String("./temp.csv");
const CSV_TYPE = String("utf8");

const file = fs.readFileSync(CSV_PATH, { encoding: CSV_TYPE });
const csvRows = String(file).split('\r\n');

const rows = [];
for(const csvRow of csvRows) {
    let [rowName, startIndex, endIndex] = csvRow.split(',');

    rowName = rowName.toLowerCase();
    const rowNameLength = rowName.length;
    for(let i = 0; i < rowNameLength; i++) {
        if(rowName[i] === '_') {
            const char = rowName.charAt(i + 1);
            rowName = rowName.substring(0, i) + char.toUpperCase() + rowName.substring(i + 2, rowName.length);
        }
    }

    let suffix = '#gploadStringFormatter';
    if(rowName.includes('Dt') || rowName.includes('Dtm')) {
        suffix = '#invalidDateEqualsNull';
    }

    // rows.push(`<value>${rowName}, ${startIndex}-${endIndex}</value>`);
    rows.push(`<value>${rowName}, ${suffix}</value>`);
}
// console.log(rows.join('\n'));
fs.writeFileSync('output.txt', rows.join('\n'));