const fs = require('fs');
const path = require('path');

function inspectButtons(dir, issues = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name === '.next' || entry.name === '.git') continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      inspectButtons(fullPath, issues);
    } else if (/\.(tsx|jsx)$/.test(entry.name)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      
      // Look for buttons without onClick or type='submit'
      const buttonMatches = content.match(/<button\b[^>]*>/gi) || [];
      buttonMatches.forEach((btn) => {
        if (!btn.includes('onClick') && !btn.includes('type="submit"') && !btn.includes("type='submit'") && !btn.includes('disabled')) {
          issues.push({ file: path.relative('.', fullPath), type: 'native <button> without onClick or submit', snippet: btn.slice(0, 100) });
        }
      });

      // Look for Button component without onClick or type='submit'
      const customBtnMatches = content.match(/<Button\b[^>]*>/g) || [];
      customBtnMatches.forEach((btn) => {
        if (!btn.includes('onClick') && !btn.includes('type="submit"') && !btn.includes("type='submit'") && !btn.includes('disabled')) {
          issues.push({ file: path.relative('.', fullPath), type: 'Custom <Button> without onClick or submit', snippet: btn.slice(0, 100) });
        }
      });

      // Look for empty onClick
      const emptyOnClick = content.match(/onClick=\{?\(\)?\s*=>\s*\{\s*\}?\}?/g) || [];
      if (emptyOnClick.length > 0) {
        issues.push({ file: path.relative('.', fullPath), type: 'Empty onClick handler', count: emptyOnClick.length });
      }

      // Look for href="#"
      if (content.includes('href="#"') || content.includes("href='#'")) {
        issues.push({ file: path.relative('.', fullPath), type: 'Dead link href="#"' });
      }
    }
  }
  return issues;
}

const issues = inspectButtons(path.resolve('apps/web'));
console.log(`Found ${issues.length} potential button/link issues:`);
console.log(JSON.stringify(issues, null, 2));
