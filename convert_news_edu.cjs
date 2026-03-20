const fs = require('fs');

try {
    const rawData = JSON.parse(fs.readFileSync('news_edu_dump.json', 'utf8'));
    
    let tsContent = 'export const newsEduData = ' + JSON.stringify(rawData, null, 2) + ';\n';
    
    fs.writeFileSync('src/data/newsEduData.ts', tsContent);
    console.log('Successfully wrote to src/data/newsEduData.ts');
} catch (error) {
    console.error('Error:', error);
}
