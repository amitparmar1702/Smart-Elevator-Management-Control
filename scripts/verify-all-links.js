const http = require('http');

const urls = [
  '/',
  '/login',
  '/forgot-password',
  '/admin/dashboard',
  '/admin/organisations',
  '/admin/gateways',
  '/admin/users',
  '/org/dashboard',
  '/org/buildings',
  '/org/elevators',
  '/buildings/bldg-apex-tower/dashboard',
  '/resident/dashboard',
  '/technician/dashboard',
  '/maintenance/work-orders',
  '/control-room/grid',
  '/elevators/elv-a-01/live',
  '/elevators/demo-elv-01/live',
  '/operations/calls',
  '/operations/bookings',
  '/operations/floor-access',
  '/operations/parking',
  '/operations/dispatch-simulator',
  '/access/policies',
  '/safety/alarms',
  '/safety/incidents',
  '/analytics/predictive',
  '/analytics/fleet',
  '/audit/logs',
];

async function checkUrl(path) {
  return new Promise((resolve) => {
    const start = Date.now();
    const req = http.get(`http://localhost:3000${path}`, (res) => {
      const elapsed = Date.now() - start;
      resolve({ path, status: res.statusCode, time: elapsed });
    });
    req.on('error', (err) => {
      resolve({ path, status: 'ERROR', error: err.message });
    });
    req.setTimeout(5000, () => {
      req.destroy();
      resolve({ path, status: 'TIMEOUT' });
    });
  });
}

async function run() {
  console.log(`Starting link verification across ${urls.length} URLs...\n`);
  let passed = 0;
  let failed = 0;

  for (const path of urls) {
    const res = await checkUrl(path);
    if (res.status === 200) {
      console.log(`[PASS] ${res.status} (${res.time}ms) -> http://localhost:3000${path}`);
      passed++;
    } else {
      console.error(`[FAIL] ${res.status} -> http://localhost:3000${path} ${res.error || ''}`);
      failed++;
    }
  }

  console.log(`\n========================================`);
  console.log(`Results: ${passed}/${urls.length} Passed, ${failed} Failed`);
  console.log(`========================================`);
}

run();
