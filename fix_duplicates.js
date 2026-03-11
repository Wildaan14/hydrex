const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'src', 'pages');

const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.tsx') || f.endsWith('.ts'));

for (const file of files) {
    const filePath = path.join(pagesDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // A reliable marker of a fresh file paste is the first line or 'import React'
    // Or 'export const ' for the specific page. Let's divide by regular expression for imports.
    // Actually, we can split by a pattern that appears exactly once in a normal file
    // but multiple times in a duplicated file.
    // E.g., 'export const <FileName>' or 'export default function <FileName>'

    const componentNameMatch = file.match(/^([A-Za-z0-9]+)\.tsx?$/);
    if (!componentNameMatch) continue;
    const componentName = componentNameMatch[1];

    // Try to find how many times the imports block resets or the main export happens.
    // A good heuristic for complete file duplication is the string `import React` or `import {`
    // appearing again after the first few lines, especially if preceded by nothing but whitespace 
    // or at the very beginning of a line.

    const chunks = content.split(/^(?=import React|import \{|\/\*\*[\r\n]+ \* ====)/m);

    // The first chunk might be empty if it starts exactly with the delimiter.
    const validChunks = chunks.filter(c => c.trim().length > 100);

    if (validChunks.length > 1) {
        console.log(`Found ${validChunks.length} duplicated blocks in ${file}`);
        // Keep the LAST chunk, which is typically the most recent paste in this bug pattern
        const latestVersion = validChunks[validChunks.length - 1];

        // Check if it's truly a duplicate by checking if it exports the main component
        if (latestVersion.includes(`export const ${componentName}`) ||
            latestVersion.includes(`export default`) ||
            latestVersion.includes(`export function ${componentName}`)) {
            fs.writeFileSync(filePath, latestVersion.trim() + '\n', 'utf8');
            console.log(`Fixed ${file}: Kept the last available block, new size: ${latestVersion.length} bytes`);
        } else {
            console.log(`Warning: Last chunk of ${file} does not contain the main export. Manual fix needed.`);
        }
    } else {
        // maybe duplicated without import? Let's check for 'export const PageName'
        const exportRegex = new RegExp(`^(?:export const ${componentName}|export default function ${componentName})`, 'gm');
        const matches = [...content.matchAll(exportRegex)];
        if (matches.length > 1) {
            console.log(`Found ${matches.length} exported definitions in ${file}`);
            // The user likely just pasted the component repeatedly. We can slice from the LAST export
            // But wait! It might be missing imports if we only slice from export.
            // So we have to find the last 'import ' statement that precedes this last export.
            let lastExportIndex = matches[matches.length - 1].index;
            let lastImportIndex = content.lastIndexOf('import ', lastExportIndex);
            if (lastImportIndex !== -1) {
                let sliced = content.slice(lastImportIndex);
                fs.writeFileSync(filePath, sliced.trim() + '\n', 'utf8');
                console.log(`Fixed ${file} by slicing from last import before last export.`);
            }
        }
    }
}
