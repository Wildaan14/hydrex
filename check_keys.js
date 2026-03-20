import fs from 'fs';
const d = JSON.parse(fs.readFileSync('clean_dump.json', 'utf8'));

console.log("=== 10 Marketplace ===");
console.log(JSON.stringify(d['10_Marketplace_Listings']?.[0] || d['04_Marketplace']?.[0], null, 2));

console.log("\n=== 11 Transactions ===");
console.log(JSON.stringify(d['11_Transactions']?.[0] || d['05_Transactions']?.[0], null, 2));

console.log("\n=== 09 ESG Score ===");
console.log(JSON.stringify(d['09_ESG_Final_Score']?.[0] || d['06_ESG_Scoring']?.[0], null, 2));
