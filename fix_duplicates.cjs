const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'src', 'pages');
const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.tsx') || f.endsWith('.ts'));

// Also check components directory just in case
const dirsToCheck = [pagesDir, path.join(__dirname, 'src', 'components')];

for (const dir of dirsToCheck) {
    if (!fs.existsSync(dir)) continue;
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx') || f.endsWith('.ts'));

    for (const file of files) {
        const filePath = path.join(dir, file);
        let content = fs.readFileSync(filePath, 'utf8');

        if (file === 'index.ts') continue;

        // Some files start with 'import React' multiple times.
        // Let's count how many times 'import React' appears at the start of a line (or with spaces)
        const importRegex = /^[ \t]*import React(?:.*?)from/gm;
        let importMatches = [...content.matchAll(importRegex)];

        // Also try counting '/**' at the beginning if that's the separator
        const headerRegex = /^[ \t]*\/\*\*[\r\n]+[ \t]*\* =====/gm;
        let headerMatches = [...content.matchAll(headerRegex)];

        if (importMatches.length > 1) {
            console.log(`Fixing ${file}: Found 'import React' ${importMatches.length} times.`);
            // Take the last one and see if it's a complete file
            const lastIndex = importMatches[importMatches.length - 1].index;

            // Is there an export after this last index?
            if (content.indexOf('export ', lastIndex) !== -1) {
                let lastCopy = content.substring(lastIndex);

                // Wait, what if the header /** belongs to this block?
                // Let's look up to 1000 characters backwards for a '/**' header
                let beforeImport = content.substring(Math.max(0, lastIndex - 1000), lastIndex);
                let headerStart = beforeImport.lastIndexOf('/**');
                if (headerStart !== -1) {
                    lastCopy = content.substring(Math.max(0, lastIndex - 1000) + headerStart);
                }

                fs.writeFileSync(filePath, lastCopy.trim() + '\n', 'utf8');
                console.log(`-> Trimmed ${file} (now ${lastCopy.length} bytes)`);
                continue;
            }
        } else if (headerMatches.length > 1) {
            console.log(`Fixing ${file}: Found header ${headerMatches.length} times.`);
            const lastIndex = headerMatches[headerMatches.length - 1].index;
            const lastCopy = content.substring(lastIndex);
            fs.writeFileSync(filePath, lastCopy.trim() + '\n', 'utf8');
            console.log(`-> Trimmed ${file} using header (now ${lastCopy.length} bytes)`);
            continue;
        }

        // Try finding component export multiple times
        const componentMatch = file.match(/^([A-Za-z0-9]+)\.tsx?$/);
        if (componentMatch) {
            const compName = componentMatch[1];
            const exportRegex = new RegExp('^[ \\t]*export (?:const|default function|function|default )[ \\t]*' + compName, 'gmi');
            let exportsFound = [...content.matchAll(exportRegex)];
            if (exportsFound.length > 1) {
                console.log(`Fixing ${file}: Found ${exportsFound.length} exports of ${compName}`);
                // We have multiple exports. We only want the last block.
                const lastExportIndex = exportsFound[exportsFound.length - 1].index;
                // Find last 'import ' or '/**' before this export
                const cutPart = content.substring(0, lastExportIndex);
                let cutIndex = cutPart.lastIndexOf('import ');
                let possibleCommentIndex = cutPart.lastIndexOf('/**');
                if (possibleCommentIndex !== -1 && (cutIndex === -1 || cutIndex - possibleCommentIndex < 2000)) {
                    cutIndex = possibleCommentIndex;
                }
                if (cutIndex !== -1) {
                    let lastCopy = content.substring(cutIndex);
                    fs.writeFileSync(filePath, lastCopy.trim() + '\n', 'utf8');
                    console.log(`-> Trimmed ${file} using export (now ${lastCopy.length} bytes)`);
                }
            }
        }
    }
}
