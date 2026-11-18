import http from 'http';

interface RouteCheck {
  name: string;
  url: string;
  expectedStatus: number;
}

const routesToAudit: RouteCheck[] = [
  // Web Application Core
  { name: 'Root Redirect / Landing', url: 'http://127.0.0.1:3000/', expectedStatus: 200 },
  { name: 'Auth Portal & Persona Switcher', url: 'http://127.0.0.1:3000/login', expectedStatus: 200 },
  { name: 'Auth Password Recovery', url: 'http://127.0.0.1:3000/forgot-password', expectedStatus: 200 },
  
  // SuperAdmin Platform
  { name: 'SuperAdmin Platform Dashboard', url: 'http://127.0.0.1:3000/admin/dashboard', expectedStatus: 200 },
  { name: 'SuperAdmin Organisations Registry', url: 'http://127.0.0.1:3000/admin/organisations', expectedStatus: 200 },
  { name: 'SuperAdmin Gateways Registry', url: 'http://127.0.0.1:3000/admin/gateways', expectedStatus: 200 },
  { name: 'SuperAdmin Users & Permissions', url: 'http://127.0.0.1:3000/admin/users', expectedStatus: 200 },
  
  // OrgAdmin Tenant
  { name: 'OrgAdmin Tenant Dashboard', url: 'http://127.0.0.1:3000/org/dashboard', expectedStatus: 200 },
  { name: 'OrgAdmin Buildings Directory', url: 'http://127.0.0.1:3000/org/buildings', expectedStatus: 200 },
  { name: 'OrgAdmin Fleet Inventory', url: 'http://127.0.0.1:3000/org/elevators', expectedStatus: 200 },
  
  // Facility & Monitoring Cockpit
  { name: 'BuildingManager Scoped Dashboard', url: 'http://127.0.0.1:3000/buildings/bldg-apex-tower/dashboard', expectedStatus: 200 },
  { name: 'Security Control Room Multi-Car Grid', url: 'http://127.0.0.1:3000/control-room/grid', expectedStatus: 200 },
  { name: 'Live 2D Shaft Visualizer & Cockpit', url: 'http://127.0.0.1:3000/elevators/elv-a-01/live', expectedStatus: 200 },
  
  // Operations
  { name: 'Operations: Service Bookings', url: 'http://127.0.0.1:3000/operations/bookings', expectedStatus: 200 },
  { name: 'Operations: Elevator Calls Log', url: 'http://127.0.0.1:3000/operations/calls', expectedStatus: 200 },
  { name: 'Operations: Floor Access Matrix', url: 'http://127.0.0.1:3000/operations/floor-access', expectedStatus: 200 },
  { name: 'Operations: Dispatch Simulator', url: 'http://127.0.0.1:3000/operations/dispatch-simulator', expectedStatus: 200 },
  { name: 'Access Policies Route Alias', url: 'http://127.0.0.1:3000/access/policies', expectedStatus: 200 },
  
  // Maintenance & Field Service
  { name: 'Maintenance: Work Orders & SLA', url: 'http://127.0.0.1:3000/maintenance/work-orders', expectedStatus: 200 },
  { name: 'Technician: Mobile Job Checklist', url: 'http://127.0.0.1:3000/technician/dashboard', expectedStatus: 200 },
  
  // Resident & Safety
  { name: 'Resident: Touchless Hall Calls', url: 'http://127.0.0.1:3000/resident/dashboard', expectedStatus: 200 },
  { name: 'Safety: Active Alarms Console', url: 'http://127.0.0.1:3000/safety/alarms', expectedStatus: 200 },
  { name: 'Safety: Emergency Incidents Room', url: 'http://127.0.0.1:3000/safety/incidents', expectedStatus: 200 },
  
  // Analytics & Audits
  { name: 'Analytics: Fleet Availability Trends', url: 'http://127.0.0.1:3000/analytics/fleet', expectedStatus: 200 },
  { name: 'Analytics: Predictive Health & FFT Harmonics', url: 'http://127.0.0.1:3000/analytics/predictive', expectedStatus: 200 },
  { name: 'Audit: Immutable Compliance Logs', url: 'http://127.0.0.1:3000/audit/logs', expectedStatus: 200 },
  
  // API & Swagger
  { name: 'NestJS REST API Docs (Swagger)', url: 'http://127.0.0.1:4000/api/docs/', expectedStatus: 200 },
];

function checkUrl(item: RouteCheck): Promise<{ name: string; url: string; status: number; ok: boolean; latencyMs: number; error?: string }> {
  return new Promise((resolve) => {
    const start = Date.now();
    const req = http.get(item.url, { timeout: 3000 }, (res) => {
      const latencyMs = Date.now() - start;
      const ok = res.statusCode === item.expectedStatus || (res.statusCode && res.statusCode >= 200 && res.statusCode < 400);
      resolve({ name: item.name, url: item.url, status: res.statusCode || 0, ok: Boolean(ok), latencyMs });
    });

    req.on('error', (err) => {
      resolve({ name: item.name, url: item.url, status: 0, ok: false, latencyMs: Date.now() - start, error: err.message });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({ name: item.name, url: item.url, status: 0, ok: false, latencyMs: 3000, error: 'Timed out' });
    });
  });
}

async function runAudit() {
  console.log('========================================================================');
  console.log(' ElevateOS End-to-End Live Service & Route Health Audit');
  console.log('========================================================================\n');

  let passed = 0;
  let failed = 0;

  for (const item of routesToAudit) {
    const result = await checkUrl(item);
    if (result.ok) {
      passed++;
      console.log(`[PASS] ${result.status} | ${result.latencyMs}ms | ${result.name} (${result.url})`);
    } else {
      failed++;
      console.log(`[FAIL] ${result.status} | ${result.name} - ${result.error || 'Unexpected status'}`);
    }
  }

  console.log('\n------------------------------------------------------------------------');
  console.log(`Audit Complete: ${passed}/${routesToAudit.length} Endpoints Healthy | Failed: ${failed}`);
  console.log('========================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runAudit();
