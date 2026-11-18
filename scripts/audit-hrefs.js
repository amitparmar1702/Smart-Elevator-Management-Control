const fs = require('fs');
const path = require('path');
const http = require('http');

function findHrefs(dir, list = []) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) {
      if (f !== 'node_modules' && f !== '.next') findHrefs(full, list);
    } else if (f.endsWith('.tsx') || f.endsWith('.ts')) {
      const content = fs.readFileSync(full, 'utf8');
      const regex = /(?:href=|href:\s*)['"]([^'"]+)['"]/g;
      let match;
      while ((match = regex.exec(content)) !== null) {
        const url = match[1];
        if (url.startsWith('/') && !url.includes('${') && !list.includes(url)) {
          list.push(url);
        }
      }
    }
  }
  return list;
}

const allHrefs = findHrefs(path.resolve(__dirname, '../apps/web'));
console.log('Total internal static hrefs found:', allHrefs.length);

async function testAll() {
  let failed = 0;
  for (const url of allHrefs) {
    await new Promise((resolve) => {
      http.get('http://localhost:3000' + url, (res) => {
        if (res.statusCode !== 200) {
          console.error(`FAIL [${res.statusCode}]: ${url}`);
          failed++;
        } else {
          console.log(`OK [200]: ${url}`);
        }
        resolve();
      }).on('error', (err) => {
        console.error(`ERROR: ${url} -> ${err.message}`);
        failed++;
        resolve();
      });
    });
  }
  console.log(`\nAudit complete: ${allHrefs.length - failed}/${allHrefs.length} OK, Failed: ${failed}`);
  if (failed > 0) process.exit(1);
}

testAll();
