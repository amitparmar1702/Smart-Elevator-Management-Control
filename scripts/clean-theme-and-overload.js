const fs = require('fs');
const path = require('path');

// Exclude Sidebar.tsx from converting #1B2236 because Sidebar is intentionally industrial navy
function shouldExcludeFile(filePath) {
  return filePath.endsWith('Sidebar.tsx');
}

function cleanFileContent(filePath, content) {
  let updated = content;

  // 1. Remove all dark: utility classes
  // e.g. "dark:bg-[#121726]" or "dark:text-[#E1E6F0]" or "dark:hover:bg-[#1B2236]" etc.
  updated = updated.replace(/\s*dark:[a-zA-Z0-9_\-\/\[\]#:]+/g, '');

  if (!shouldExcludeFile(filePath)) {
    // 2. Fix residual dark page canvas
    updated = updated.replace(/bg-\[#0F131F\]/g, 'bg-[#EEF0F6]');
    updated = updated.replace(/bg-\[#0F1420\]/g, 'bg-[#EEF0F6]');

    // 3. Fix residual dark cards or containers
    updated = updated.replace(/bg-\[#171D2E\]/g, 'bg-white');

    // 4. In EmergencyIntercomModal, fix dark container to white
    if (filePath.includes('EmergencyIntercomModal.tsx')) {
      updated = updated.replace(/bg-\[#1B2236\]\s+border\s+border-\[#2C3656\]\s+rounded-\[8px\]\s+shadow-2xl\s+max-w-md\s+w-full\s+p-6\s+text-white/, 'bg-white border border-[#DCDFEA] rounded-[8px] shadow-2xl max-w-md w-full p-6 text-[#1E2232]');
      updated = updated.replace(/border-b\s+border-\[#2C3656\]/g, 'border-b border-[#DCDFEA]');
      updated = updated.replace(/text-slate-400/g, 'text-[#5D6375]');
      updated = updated.replace(/bg-\[#121726\]/g, 'bg-[#EEF0F6]');
      updated = updated.replace(/border-\[#2C3656\]/g, 'border-[#DCDFEA]');
      updated = updated.replace(/text-slate-200/g, 'text-[#1E2232]');
    }

    // 5. In ElevatorShaftVisualizer, keep the car roof dark (#1B2236) and facade (#F8F5EC), clean the rest
    if (filePath.includes('ElevatorShaftVisualizer.tsx')) {
      updated = updated.replace(/bg-\[#1A2133\]/g, 'bg-[#F8F5EC]');
    }

    // 6. Generic cleanup of #121726 (almost always an inner box, input bg or chip in dark mode)
    // In inputs, change bg-[#121726] to bg-white
    updated = updated.replace(/bg-\[#121726\]/g, (match, offset, str) => {
      // If preceding context has "input" or "select" or "textarea", make it bg-white, else bg-[#EEF0F6]
      const before = str.slice(Math.max(0, offset - 100), offset);
      if (before.includes('<input') || before.includes('<select') || before.includes('<textarea')) {
        return 'bg-white';
      }
      return 'bg-[#EEF0F6]';
    });

    // 7. Clean residual dark borders
    updated = updated.replace(/border-\[#262F48\]/g, 'border-[#DCDFEA]');
    updated = updated.replace(/border-\[#2C3656\]/g, 'border-[#DCDFEA]');
    updated = updated.replace(/divide-\[#262F48\]/g, 'divide-[#DCDFEA]');
    updated = updated.replace(/divide-\[#2C3656\]/g, 'divide-[#DCDFEA]');

    // 8. Clean residual dark text styles if bare
    updated = updated.replace(/text-\[#E1E6F0\]/g, 'text-[#1E2232]');
    updated = updated.replace(/text-\[#8F97AB\]/g, 'text-[#5D6375]');
  }

  return updated;
}

function processDirectory(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name === '.next' || entry.name === '.git') continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      processDirectory(fullPath);
    } else if (/\.(tsx|ts)$/.test(entry.name)) {
      const original = fs.readFileSync(fullPath, 'utf8');
      const cleaned = cleanFileContent(fullPath, original);
      if (cleaned !== original) {
        fs.writeFileSync(fullPath, cleaned, 'utf8');
        console.log(`Cleaned: ${path.relative('.', fullPath)}`);
      }
    }
  }
}

console.log('Starting light theme purification...');
processDirectory(path.resolve('apps/web'));
console.log('Light theme purification completed.');
