const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      if (!full.includes('node_modules') && !full.includes('.next')) {
        results = results.concat(walk(full));
      }
    } else if (file.endsWith('.tsx')) {
      results.push(full);
    }
  }
  return results;
}

const files = walk('./apps/web');
console.log('Total TSX files:', files.length);

const findings = [];

files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  const lines = content.split('\n');

  lines.forEach((line, idx) => {
    // Check rigid grid-cols-2 to 6 without breakpoint
    const classMatch = line.match(/className=["']([^"']*)["']/);
    if (classMatch) {
      const classes = classMatch[1].split(/\s+/);
      const rigidGrid = classes.find(c => /^grid-cols-[2-6]$/.test(c));
      if (rigidGrid) {
        findings.push({ file: f, line: idx + 1, issue: 'Rigid grid: ' + rigidGrid, text: line.trim() });
      }
    }

    // Check fixed large width > 340px
    const widthMatch = line.match(/\bw-\[(\d+)px\]/);
    if (widthMatch) {
      const px = parseInt(widthMatch[1]);
      if (px > 340 && !line.includes('max-w-') && !line.includes('overflow')) {
        findings.push({ file: f, line: idx + 1, issue: 'Fixed width w-[' + px + 'px]', text: line.trim() });
      }
    }

    // Check modal max width or fixed width
    if (line.includes('fixed inset-0') && !content.includes('max-w-')) {
      // modal overlay without max-w
    }
  });

  if (content.includes('<table') && !content.includes('overflow-x-auto') && !content.includes('overflow-auto')) {
    findings.push({ file: f, line: 1, issue: 'Table file without overflow-x-auto container', text: '<table' });
  }
});

console.log('Found ' + findings.length + ' potential responsiveness items:');
findings.forEach(item => {
  console.log(item.file + ':' + item.line + ' - ' + item.issue + ' -> ' + item.text.substring(0, 100));
});
