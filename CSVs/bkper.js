import fs from 'fs';

const DECODING_DELIMITER = String(';');
const ENCODING = String('utf8');
const ENCODING_DELIMITER = String('|');
const INPUT_FOLDER = String('../input');
const OUTPUT_FOLDER = String('../output');

const INPUT_FILE = String(`${INPUT_FOLDER}/input.txt`);
const file = fs.readFileSync(INPUT_FILE, { encoding: ENCODING });
const rows = String(file).split('\r\n');

// tracks accounts & transactions
const accounts = [];
const transactions = [];

// parse rows
for (const row of rows) {
  // split row by delimiter
  const splitRow = row.split(DECODING_DELIMITER);
  const [date, fromAccount, toAccount, description, amount] = splitRow; // prettier-ignore

  // format transaction
  const formattedDate = date.trim();
  const formattedFromAccount = fromAccount.trim();
  const formattedToAccount = toAccount.trim();
  const formattedDescription = description.trim();
  const formattedAmount = amount.trim();
  const formattedDebit = `(${formattedAmount})`;
  const formattedCredit = formattedAmount;

  // add transaction to list
  transactions.push([formattedDate, formattedFromAccount, formattedToAccount, formattedDescription, formattedDebit, formattedCredit].join(ENCODING_DELIMITER)); // prettier-ignore

  // determine accounts involved adding to
  // accounts list if not already present
  if (!accounts.includes(formattedFromAccount)) {
    accounts.push(formattedFromAccount);
  }
  if (!accounts.includes(formattedToAccount)) {
    accounts.push(formattedToAccount);
  }
}

// define transaction headers - done last due to reverse() below
transactions.push(['Transaction Date', 'From Account', 'To Account', 'Description', 'Debit', 'Credit', 'Balance'].join(ENCODING_DELIMITER)); // prettier-ignore

// write accounts & transactions to output files
fs.writeFileSync(`${OUTPUT_FOLDER}/accounts.txt`, accounts.sort().join('\r\n'));
fs.writeFileSync(`${OUTPUT_FOLDER}/transactions.txt`, transactions.reverse().join('\r\n'));
