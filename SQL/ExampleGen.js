import fs from 'fs';
import generate from './SqlInsertsGenerator.js';
import parse from './SqlParser.js';

const servicerIDs = [
	'100',
	'150',
	'200',
	'250',
	'300',
	'350',
	'400',
	'450',
];

const columnOverrides = {
	ACTIVE_FLG: { callback: () => String(Math.random() > 0.1 ? 'Y' : 'N') },
	AMOUNT: { callback: () => String('500.50') },
	LEGACY_IND: { callback: () => String(Math.random() > 0.1 ? 'Y' : 'N') },
	STATUS: { callback: () => String(Math.random() > 0.1 ? 'READY FOR DISCHARGE' : 'IDK SOMETHING ELSE') },
	MAINTAPP: { callback: () => String('MAINTAPP') },
	QUALIFIED_IND: { callback: () => String(Math.random() > 0.1 ? 'Y' : 'N') },
	REFUND_IND: { callback: () => String(Math.random() > 0.8 ? 'Y' : 'N') },
	SENT_STATUS: { callback: () => String(Math.random() > 0.1 ? 'READY TO SEND' : 'IDK SOMETHING ELSE') },
	SERVICER_ID: { callback: () => String(servicerIDs[Math.floor(Math.random() * servicerIDs.length)]) },
};

// gen borrowers
const MAIN_TABLE = parse(MAIN);
const MAIN_INSERTS = generate(MAIN_TABLE, 50, columnOverrides);

// add borrowerIds to column overrides
const borrowerIds = [];
for(const lineIndex in MAIN_INSERTS) {
	if(lineIndex < 3) continue;
	const line = MAIN_INSERTS[lineIndex];
	borrowerIds.push(line.split(',')[0].replace('(', ''));
}
columnOverrides.BRWR_ID = { callback: () => String(borrowerIds[Math.floor(Math.random() * borrowerIds.length)]) };


// gen loans
const LF_LOAN_MAIN_TABLE = parse(LF_LOAN_MAIN);
const LF_LOAN_MAIN_INSERTS = generate(LF_LOAN_MAIN_TABLE, 100, columnOverrides);

// write output files
fs.writeFileSync('output_MAIN.txt', MAIN_INSERTS.join('\r\n'));
fs.writeFileSync('output_LF_LOAN_MAIN.txt', LF_LOAN_MAIN_INSERTS.join('\r\n'));
