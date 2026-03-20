const XLSX = require('xlsx');
const path = require('path');

const filePath = path.join(__dirname, 'data', 'HydrEx_News_Education_Content.xlsx');
const workbook = XLSX.readFile(filePath);

console.log("Sheets found in Excel:");
workbook.SheetNames.forEach(name => {
  console.log(`- "${name}" (Length: ${name.length})`);
});
