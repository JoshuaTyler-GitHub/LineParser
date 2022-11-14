import fs from 'fs';

const FILE_PATH = String('./temp.txt');
const ENCODING = String('utf8');

const file = fs.readFileSync(FILE_PATH, { encoding: ENCODING });
const rows = String(file).split('\r\n');

const parsedRows = [];
for (const row of rows) {

  const splitRow = row.split(',');
  const title = splitRow[0].split('"')[1];
  const formattedTitle = title.split('_').map((i, index) => {
    if(index > 0) {
      return String(i.substring(0, 1).toUpperCase() + i.substring(1));
    } else {
      return i;
    }
  }).join('');
  splitRow[2] = String(`"${title}:${title}"`);
  const formattedRow = splitRow.map((i) => i.trim()).join(', ').trim();
  parsedRows.push(formattedRow);
}
fs.writeFileSync('output.txt', parsedRows.join('\n'));
