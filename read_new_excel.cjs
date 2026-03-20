const xlsx = require('xlsx');
const fs = require('fs');

try {
  const workbook = xlsx.readFile('data/HydrEx_News_Education_Content.xlsx');
  const result = {};

  // Dynamically determine header row based on column count for robust parsing
  workbook.SheetNames.forEach(sheetName => {
    const sheet = workbook.Sheets[sheetName];
    // Convert to array of arrays first to inspect rows
    const rawData = xlsx.utils.sheet_to_json(sheet, { header: 1 });
    
    if (rawData.length === 0) return;
    
    // Find the first row that looks like a header (has multiple string values)
    let headerRowIndex = 0;
    let maxCols = 0;
    
    for (let i = 0; i < Math.min(10, rawData.length); i++) {
        const row = rawData[i];
        if (!row) continue;
        const stringCols = row.filter(cell => typeof cell === 'string' && cell.trim() !== '').length;
        if (stringCols > maxCols && stringCols > 2) {
            maxCols = stringCols;
            headerRowIndex = i;
        }
    }
    
    console.log(`Sheet "${sheetName}" using row ${headerRowIndex + 1} as header.`);

    // Convert to JSON using the detected header row
    const json = xlsx.utils.sheet_to_json(sheet, { 
      range: headerRowIndex,
      defval: null 
    });
    
    result[sheetName] = json;
  });

  fs.writeFileSync('news_edu_dump.json', JSON.stringify(result, null, 2));
  console.log('Successfully wrote to news_edu_dump.json');
} catch (error) {
  console.error("Error processing Excel file:", error);
}
