import fs from 'fs';

try {
  const d = JSON.parse(fs.readFileSync('excel_dump.json', 'utf8'));
  const cleanedData = {};

  for (const sheetName in d) {
    const rawRows = d[sheetName];
    if (!rawRows || rawRows.length === 0) {
      cleanedData[sheetName] = [];
      continue;
    }

    // Find the header row by looking for the row with the most non-empty string values in the first 5 rows
    let headerRowIndex = 0;
    let maxCols = 0;
    
    for (let i = 0; i < Math.min(5, rawRows.length); i++) {
        const row = rawRows[i];
        let colsCount = Object.values(row).filter(v => typeof v === 'string' && v.trim().length > 0).length;
        if (colsCount > maxCols) {
            maxCols = colsCount;
            headerRowIndex = i;
        }
    }

    const rawHeaderRow = rawRows[headerRowIndex];
    const keyToHeaderMap = {};
    for (const [key, val] of Object.entries(rawHeaderRow)) {
        if (typeof val === 'string') {
            const cleanVal = val.trim();
            if (cleanVal.length > 0) {
                keyToHeaderMap[key] = cleanVal;
            }
        }
    }

    const finalRows = [];
    for (let i = headerRowIndex + 1; i < rawRows.length; i++) {
        const rawItem = rawRows[i];
        const cleanItem = {};
        for (const [key, val] of Object.entries(rawItem)) {
            const mappedHeader = keyToHeaderMap[key];
            if (mappedHeader) {
                cleanItem[mappedHeader] = val;
            }
        }
        if (Object.keys(cleanItem).length > 2) {
            finalRows.push(cleanItem);
        }
    }

    cleanedData[sheetName] = finalRows;
  }

  if (!fs.existsSync('src/data')) {
    fs.mkdirSync('src/data', { recursive: true });
  }
  const tsContent = 'export const masterData = ' + JSON.stringify(cleanedData, null, 2) + ';\n';
  fs.writeFileSync('src/data/masterData.ts', tsContent);
  console.log("Successfully created sanitized src/data/masterData.ts");

  fs.writeFileSync('clean_dump.json', JSON.stringify(cleanedData, null, 2));
} catch(e) { console.error(e); }
