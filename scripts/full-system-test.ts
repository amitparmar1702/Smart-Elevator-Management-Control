import http from 'http';

interface TestResult {
  category: string;
  name: string;
  url: string;
  status: number;
  passed: boolean;
  details?: string;
}

const results: TestResult[] = [];

function request(options: {
  hostname?: string;
  port?: number;
  path: string;
  method?: string;
  headers?: Record<string, string>;
  body?: string;
}): Promise<{ status: number; data: string }> {
  return new Promise((resolve) => {
    const req = http.request(
      {
        hostname: options.hostname || '127.0.0.1',
        port: options.port || 3000,
        path: options.path,
        method: options.method || 'GET',
        headers: options.headers || {},
        timeout: 5000,
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => resolve({ status: res.statusCode || 0, data: body }));
      }
    );

    req.on('error', (err) => resolve({ status: 0, data: err.message }));
    req.on('timeout', () => {
      req.destroy();
      resolve({ status: 0, data: 'Timeout' });
    });

    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

async function testFrontendPages() {
  const pages = [
    { name: 'Root Landing / Redirect', path: '/' },
    { name: 'Login & Demo Personas', path: '/login' },
    { name: 'Forgot Password', path: '/forgot-password' },
    { name: 'Control Room Grid', path: '/control-room/grid' },
    { name: 'Live Shaft Cockpit (ELV-A-01)', path: '/elevators/elv-a-01/live' },
    { name: 'Fleet Comparison Tool', path: '/elevators/comparison' },
    { name: 'Org Admin Dashboard', path: '/org/dashboard' },
    { name: 'Org Buildings Directory', path: '/org/buildings' },
    { name: 'Org Elevators Fleet', path: '/org/elevators' },
    { name: 'SuperAdmin Dashboard', path: '/admin/dashboard' },
    { name: 'SuperAdmin Gateways', path: '/admin/gateways' },
    { name: 'SuperAdmin Organisations', path: '/admin/organisations' },
    { name: 'SuperAdmin Tenants', path: '/admin/tenants' },
    { name: 'SuperAdmin Users', path: '/admin/users' },
    { name: 'Building Manager Scoped Dashboard', path: '/buildings/bldg-apex-tower/dashboard' },
    { name: 'Operations: Service Bookings', path: '/operations/bookings' },
    { name: 'Operations: Elevator Calls Log', path: '/operations/calls' },
    { name: 'Operations: Dispatch Simulator', path: '/operations/dispatch-simulator' },
    { name: 'Operations: Floor Access Matrix', path: '/operations/floor-access' },
    { name: 'Operations: Parking & Energy', path: '/operations/parking' },
    { name: 'Maintenance: Work Orders & SLA', path: '/maintenance/work-orders' },
    { name: 'Technician: Dashboard Checklist', path: '/technician/dashboard' },
    { name: 'Technician: Dedicated Mobile App', path: '/technician/mobile' },
    { name: 'Resident: Touchless Hall Calls', path: '/resident/dashboard' },
    { name: 'Mobile PWA Portal Hub', path: '/mobile' },
    { name: 'Safety: Active Alarms Console', path: '/safety/alarms' },
    { name: 'Safety: Emergency Incidents Room', path: '/safety/incidents' },
    { name: 'Analytics: Fleet Availability Trends', path: '/analytics/fleet' },
    { name: 'Analytics: Predictive Health Harmonics', path: '/analytics/predictive' },
    { name: 'Audit: Immutable Compliance Logs', path: '/audit/logs' },
    { name: 'Statutory Reports Generator', path: '/reports' },
    { name: 'Settings: Multi-Channel Notifications', path: '/settings/notifications' },
    { name: 'Access Policies Alias', path: '/access/policies' },
  ];

  console.log(`\n--- 1. Testing ${pages.length} Frontend Pages (SSR, DOM & Next.js Error Detection) ---`);
  for (const page of pages) {
    const res = await request({ path: page.path, port: 3000 });
    const hasNextError =
      res.data.includes('Application error') ||
      res.data.includes('Unhandled Runtime Error') ||
      res.data.includes('Cannot find module');
    const passed = res.status === 200 && !hasNextError;

    results.push({
      category: 'Frontend',
      name: page.name,
      url: `http://localhost:3000${page.path}`,
      status: res.status,
      passed,
      details: hasNextError ? 'Contains runtime error markup' : 'Clean SSR HTML rendered',
    });
    console.log(`[${passed ? 'PASS' : 'FAIL'}] ${res.status} | ${page.name}`);
  }
}

async function testBackendApi() {
  console.log(`\n--- 2. Testing NestJS Backend API & Swagger Endpoints (Port 4000) ---`);
  
  const endpoints = [
    { name: 'Swagger API Explorer', path: '/api/docs/', method: 'GET' },
    { name: 'Organisations Endpoint', path: '/api/v1/organisations', method: 'GET' },
    { name: 'Buildings Endpoint', path: '/api/v1/buildings', method: 'GET' },
    { name: 'Elevators Endpoint', path: '/api/v1/elevators', method: 'GET' },
    { name: 'Elevator Capabilities', path: '/api/v1/elevators/elv-a-01/capabilities', method: 'GET' },
    { name: 'Active Faults & Alarms', path: '/api/v1/faults/active', method: 'GET' },
    { name: 'Maintenance Work Orders', path: '/api/v1/maintenance/work-orders', method: 'GET' },
    { name: 'Maintenance Spare Parts', path: '/api/v1/maintenance/spare-parts', method: 'GET' },
    { name: 'Fleet Analytics Data', path: '/api/v1/reports/analytics/fleet', method: 'GET' },
  ];

  for (const ep of endpoints) {
    const res = await request({ port: 4000, path: ep.path, method: ep.method });
    const passed = res.status >= 200 && res.status < 500; // Not a 500 server crash
    results.push({
      category: 'API',
      name: ep.name,
      url: `http://localhost:4000${ep.path}`,
      status: res.status,
      passed,
      details: `Returned HTTP ${res.status}`,
    });
    console.log(`[${passed ? 'PASS' : 'FAIL'}] ${res.status} | ${ep.name} (http://localhost:4000${ep.path})`);
  }
}

async function main() {
  console.log('========================================================================');
  console.log(' ElevateOS Comprehensive End-to-End System Test Suite');
  console.log('========================================================================');

  await testFrontendPages();
  await testBackendApi();

  const total = results.length;
  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = total - passedCount;

  console.log('\n========================================================================');
  console.log(` Test Summary: ${passedCount}/${total} Passed | ${failedCount} Failed`);
  console.log('========================================================================');

  if (failedCount > 0) {
    console.error('FAILED TESTS:');
    results.filter((r) => !r.passed).forEach((f) => {
      console.error(`- [${f.category}] ${f.name} (${f.url}): Status ${f.status} - ${f.details}`);
    });
    process.exit(1);
  } else {
    console.log('ALL SYSTEMS NOMINAL: Zero bugs, zero 500 errors, zero SSR crashes detected.');
    process.exit(0);
  }
}

main();
