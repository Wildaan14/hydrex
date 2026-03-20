import xlsx from 'xlsx';
import fs from 'fs';

try {
  const wb = xlsx.readFile('data/HydrEx_Master_Data_v2.0.xlsx');
  const res = {};
  wb.SheetNames.forEach(s => {
    res[s] = xlsx.utils.sheet_to_json(wb.Sheets[s]);
  });
  fs.writeFileSync('excel_dump.json', JSON.stringify(res, null, 2));
  console.log("Successfully dumped excel to excel_dump.json");
} catch (e) {
  console.error("Failed to read excel:", e);
}
