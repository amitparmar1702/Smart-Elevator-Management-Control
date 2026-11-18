const { spawn } = require('child_process');
const path = require('path');

const nextBin = path.resolve(__dirname, '../node_modules/next/dist/bin/next');
const webDir = path.resolve(__dirname, '../apps/web');

const fs = require('fs');

function mirror(src, dest) {
  if (!fs.existsSync(src)) return;
  try {
    fs.mkdirSync(dest, { recursive: true });
  } catch (_) {}
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      mirror(path.join(src, entry.name), path.join(dest, entry.name));
    }
  }
}

const appSrc = path.join(webDir, 'app');
mirror(appSrc, path.join(webDir, '.next/types/app'));
mirror(appSrc, path.join(webDir, '.next/server/app'));
mirror(appSrc, path.join(webDir, '.next/static/chunks/app'));

console.log('Next.js bin:', nextBin);
console.log('Web dir:', webDir);

process.stdout.on('error', (err) => {
  if (err.code === 'EPIPE' || err.code === 'UNKNOWN') return;
});
process.stderr.on('error', (err) => {
  if (err.code === 'EPIPE' || err.code === 'UNKNOWN') return;
});

const child = spawn(process.execPath, [nextBin, 'build', webDir, '--no-lint'], {
  env: {
    ...process.env,
    NEXT_TELEMETRY_DISABLED: '1',
    NODE_ENV: 'production',
  },
  stdio: ['ignore', 'pipe', 'pipe'],
});

child.stdout.on('data', (data) => {
  try {
    process.stdout.write(data);
  } catch (_) {}
});

child.stderr.on('data', (data) => {
  try {
    process.stderr.write(data);
  } catch (_) {}
});

child.on('exit', (code, signal) => {
  console.log(`Child process exited with code ${code} and signal ${signal}`);
  process.exit(code || 0);
});

child.on('error', (err) => {
  console.error('Child process error:', err);
  process.exit(1);
});
