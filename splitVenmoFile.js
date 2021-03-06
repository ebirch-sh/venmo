const hl = require('highland');
const csvParse = require('csv-parse');
const csvStringify = require('csv-stringify');
const path = require('path');
const fs = require('fs');

const fileNames = fs.readdirSync(path.join(__dirname, '_SOURCE'));
const columns = {
  id: 'Unique Trans. ID',
  date: 'Date',
  note: 'Memo',
  name: 'Name',
  amount: 'amount',
  fee: 'fee',
  source: 'Account Type',
};
const headers = [
  'date',
  'Time',
  'TimeZone',
  'name',
  'note',
  'Status',
  'Currency',
  'amount',
  'Receipt ID',
  'Balance',
];

let index = 0;

hl(fileNames)
  .filter(name => name !== '.DS_Store')
  .flatMap(fileName => hl(fs.createReadStream(path.join(__dirname, `_SOURCE/${fileName}`))
    .pipe(csvParse({ columns: headers, auto_parse: val => (!val ? undefined : val) }))).drop(1))
  // .filter(({ amount }) => +amount < 0)
  .map(({ name, type, ...rest }) => Object.assign({ source: 'Venmo' }, rest))
  // .batch(9)
  .stopOnError(err => console.log(err))
  .doto(a => index++)
  .each((rows) => {
    // console.log(rows);
    hl(rows).pipe(csvStringify({ columns, header: true }))
      .pipe(fs.createWriteStream(path.join(__dirname, `_OUTPUT/transactions-${index}.csv`)));
  });

