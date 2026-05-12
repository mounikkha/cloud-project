const crypto = require('crypto');
// ============================================
// Azure Cosmos DB Client — Lazy Initialization
// ============================================
// Auto-creates the database and containers on first access.

import { CosmosClient } from '@azure/cosmos';

const DB_NAME = 'carpoolDB';

const CONTAINERS = {
  users: { id: 'users', partitionKey: '/email' },
  travelPlans: { id: 'travelPlans', partitionKey: '/userId' },
};

let client = null;
let database = null;
const containerCache = {};

function getClient() {
  if (!client) {
    const endpoint = process.env.COSMOS_ENDPOINT;
    const key = process.env.COSMOS_KEY;
    if (!endpoint || !key || endpoint === 'YOUR_VALUE') {
      throw new Error('COSMOS_ENDPOINT and COSMOS_KEY must be set in environment / local.settings.json');
    }
    client = new CosmosClient({ endpoint, key });
  }
  return client;
}

async function getDatabase() {
  if (!database) {
    const c = getClient();
    const { database: db } = await c.databases.createIfNotExists({ id: DB_NAME });
    database = db;
  }
  return database;
}

export async function getContainer(name) {
  if (containerCache[name]) return containerCache[name];
  const db = await getDatabase();
  const spec = CONTAINERS[name];
  if (!spec) throw new Error(`Unknown container: ${name}`);
  const { container } = await db.containers.createIfNotExists({
    id: spec.id,
    partitionKey: { paths: [spec.partitionKey] },
  });
  containerCache[name] = container;
  return container;
}
