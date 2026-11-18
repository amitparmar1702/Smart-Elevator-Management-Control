const fs = require('fs');
const path = require('path');

function getFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.next') {
        results = results.concat(getFiles(fullPath));
      }
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      results.push(fullPath);
    }
  });
  return results;
}

const files = getFiles('apps/web');
const hrefs = new Set();
const regex = /href\s*[:=]\s*['"]([^'"]+)['"]/g;

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  let match;
  while ((match = regex.exec(content)) !== null) {
    if (match[1].startsWith('/') && !match[1].startsWith('//')) {
      hrefs.add(match[1]);
    }
  }
});

console.log('Found ' + hrefs.size + ' unique links:');
Array.from(hrefs).sort().forEach(h => console.log(h));
