import fs from 'fs';
const d = JSON.parse(fs.readFileSync('excel_dump.json', 'utf8'));

console.log("=== 01 Community Data ===");
console.log(JSON.stringify(d['01_Community_Projects']?.slice(0, 3), null, 2));

console.log("\n=== 04 Marketplace Data ===");
console.log(JSON.stringify(d['04_Marketplace']?.slice(0, 3), null, 2));
