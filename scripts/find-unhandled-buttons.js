const fs = require('fs');
const path = require('path');

function findDeadButtons(dir, unhandled = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name === '.next' || entry.name === '.git') continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      findDeadButtons(fullPath, unhandled);
    } else if (/\.(tsx|jsx)$/.test(entry.name)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const lines = content.split('\n');

      lines.forEach((line, lineIdx) => {
        // Look for <Button or <button
        if (/<(Button|button)\b/.test(line)) {
          // Check surrounding 5 lines before and after for <Link or onClick or type="submit"
          const contextStart = Math.max(0, lineIdx - 4);
          const contextEnd = Math.min(lines.length, lineIdx + 8);
          const block = lines.slice(contextStart, contextEnd).join('\n');

          const hasOnClick = /onClick=/.test(block);
          const hasSubmit = /type=["']submit["']/.test(block);
          const hasLinkWrapper = /<Link\b/.test(block) && /<\/Link>/.test(block);
          const isButtonComponentDeclaration = /export const Button/.test(block) || /export function Button/.test(block);

          if (!hasOnClick && !hasSubmit && !hasLinkWrapper && !isButtonComponentDeclaration) {
            unhandled.push({
              file: path.relative('.', fullPath),
              line: lineIdx + 1,
              code: line.trim()
            });
          }
        }
      });
    }
  }
  return unhandled;
}

const unhandled = findDeadButtons(path.resolve('apps/web'));
console.log(`Found ${unhandled.length} unhandled buttons:`);
unhandled.forEach(u => console.log(`${u.file}:${u.line} -> ${u.code}`));
