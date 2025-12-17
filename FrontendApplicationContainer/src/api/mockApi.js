function delay(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

function randomId() {
  return Math.random().toString(36).slice(2, 10);
}

const MOCK_TOTAL = 137;
const devicesDB = Array.from({ length: MOCK_TOTAL }).map((_, i) => ({
  id: `dev-${i + 1}`,
  name: `Device-${i + 1}`,
  ip: `192.168.1.${(i % 254) + 1}`,
  protocol: ['SNMP', 'WebPA', 'TR-069', 'TR-369'][i % 4],
  status: ['Online', 'Offline', 'Unknown'][i % 3],
  createdAt: new Date(Date.now() - i * 86400000).toISOString(),
}));

// PUBLIC_INTERFACE
export async function mockLogin({ email }) {
  await delay(400);
  return {
    token: `mock.${randomId()}.jwt`,
    user: { email },
  };
}

// PUBLIC_INTERFACE
export async function mockHealth() {
  await delay(250);
  return { status: 'ok', time: new Date().toISOString() };
}

// PUBLIC_INTERFACE
export async function mockListDevices({ page = 1, pageSize = 10, sort }) {
  await delay(350);
  let items = [...devicesDB];
  if (sort) {
    const [field, dir] = sort.split(':');
    items.sort((a, b) => {
      const va = a[field];
      const vb = b[field];
      if (va === vb) return 0;
      const res = va > vb ? 1 : -1;
      return dir === 'desc' ? -res : res;
    });
  }
  const start = (page - 1) * pageSize;
  const paged = items.slice(start, start + pageSize);
  const totalPages = Math.ceil(items.length / pageSize);
  return {
    page,
    pageSize,
    totalPages,
    totalItems: items.length,
    hasNext: page < totalPages,
    hasPrevious: page > 1,
    items: paged,
  };
}
