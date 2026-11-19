export const MOCK_ORGANISATIONS = [
  {
    id: 'org-apex-01',
    name: 'Apex Commercial Properties',
    slug: 'apex-commercial',
    status: 'ACTIVE',
    contactEmail: 'operations@apexproperties.com',
    createdAt: new Date('2026-01-01').toISOString(),
    subscriptions: [
      {
        id: 'sub-apex-01',
        plan: 'ENTERPRISE',
        maxBuildings: 20,
        maxElevators: 100,
        status: 'ACTIVE',
      },
    ],
    _count: {
      buildings: 3,
      elevators: 13,
      users: 18,
    },
  },
  {
    id: 'org-skyline-02',
    name: 'Skyline Luxury Residences',
    slug: 'skyline-residences',
    status: 'ACTIVE',
    contactEmail: 'management@skyline.org',
    createdAt: new Date('2026-01-15').toISOString(),
    subscriptions: [
      {
        id: 'sub-skyline-01',
        plan: 'PROFESSIONAL',
        maxBuildings: 5,
        maxElevators: 25,
        status: 'ACTIVE',
      },
    ],
    _count: {
      buildings: 2,
      elevators: 6,
      users: 8,
    },
  },
  {
    id: 'org-metro-03',
    name: 'Metro Healthcare Network',
    slug: 'metro-health',
    status: 'ACTIVE',
    contactEmail: 'facilities@metrohealth.med',
    createdAt: new Date('2026-02-01').toISOString(),
    subscriptions: [
      {
        id: 'sub-metro-01',
        plan: 'ENTERPRISE',
        maxBuildings: 10,
        maxElevators: 60,
        status: 'ACTIVE',
      },
    ],
    _count: {
      buildings: 4,
      elevators: 16,
      users: 24,
    },
  },
];

export const MOCK_BUILDINGS = [
  {
    id: 'bldg-apex-twr-a',
    organisationId: 'org-apex-01',
    code: 'APX-TWR-A',
    name: 'Apex Financial Tower A',
    address: 'Plot 42, Bandra Kurla Complex, Mumbai',
    status: 'ACTIVE',
    floorsCount: 22,
    wings: [
      { id: 'wing-north', name: 'North Core', code: 'W-N' },
      { id: 'wing-east', name: 'East Executive Core', code: 'W-E' },
    ],
    elevators: [
      { id: 'elv-a-01', name: 'High-Speed North', assetCode: 'ELV-A-01', status: 'RUNNING', currentFloor: 4, currentDirection: 'UP' },
      { id: 'elv-a-02', name: 'Standard North', assetCode: 'ELV-A-02', status: 'IDLE', currentFloor: 1, currentDirection: 'STATIONARY' },
      { id: 'elv-a-03', name: 'Freight & Service', assetCode: 'ELV-A-03', status: 'RUNNING', currentFloor: 3, currentDirection: 'DOWN' },
      { id: 'elv-a-04', name: 'Emergency & Fire', assetCode: 'ELV-A-04', status: 'IDLE', currentFloor: 1, currentDirection: 'STATIONARY' },
    ],
    _count: {
      floors: 22,
      elevators: 4,
    },
  },
];

export const MOCK_ELEVATORS = [
  {
    id: 'elv-a-01',
    organisationId: 'org-apex-01',
    buildingId: 'bldg-apex-twr-a',
    name: 'High-Speed North',
    assetCode: 'ELV-A-01',
    status: 'RUNNING',
    ratedSpeedMps: 2.5,
    ratedLoadKg: 1000,
    currentFloor: 4,
    currentDirection: 'UP',
    doorState: 'CLOSED',
    safetyChainClosed: true,
    building: { id: 'bldg-apex-twr-a', name: 'Apex Financial Tower A', code: 'APX-TWR-A' },
    controller: {
      brand: 'KONE',
      model: 'MonoSpace 700 DX',
      gateway: { id: 'gw-apex-01', status: 'ONLINE', protocol: 'MQTT_TLS' },
    },
    capabilities: [
      { capability: 'LANDING_CALL', level: 'SUPPORTED' },
      { capability: 'DOOR_HOLD', level: 'SUPPORTED' },
      { capability: 'PHASE_1_RECALL', level: 'SUPPORTED' },
      { capability: 'ENERGY_REGENERATION', level: 'SUPPORTED' },
    ],
  },
  {
    id: 'elv-a-02',
    organisationId: 'org-apex-01',
    buildingId: 'bldg-apex-twr-a',
    name: 'Standard North',
    assetCode: 'ELV-A-02',
    status: 'IDLE',
    ratedSpeedMps: 1.75,
    ratedLoadKg: 1000,
    currentFloor: 1,
    currentDirection: 'STATIONARY',
    doorState: 'OPEN',
    safetyChainClosed: true,
    building: { id: 'bldg-apex-twr-a', name: 'Apex Financial Tower A', code: 'APX-TWR-A' },
    controller: {
      brand: 'Otis',
      model: 'Gen2 Life',
      gateway: { id: 'gw-apex-01', status: 'ONLINE', protocol: 'MQTT_TLS' },
    },
    capabilities: [
      { capability: 'LANDING_CALL', level: 'SUPPORTED' },
      { capability: 'DOOR_HOLD', level: 'SUPPORTED' },
      { capability: 'PHASE_1_RECALL', level: 'SUPPORTED' },
    ],
  },
];
