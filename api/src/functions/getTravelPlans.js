// GET /api/travel-plans-list — List all travel plans with optional filters
import { app } from '@azure/functions';
import { getContainer } from '../../lib/cosmosClient.js';

app.http('getTravelPlans', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'travel-plans-list',
  handler: async (request) => {
    try {
      const url = new URL(request.url);
      const source = url.searchParams.get('source');
      const destination = url.searchParams.get('destination');
      const timeSlot = url.searchParams.get('timeSlot');

      let query = 'SELECT * FROM c WHERE 1=1';
      const params = [];

      if (source) {
        query += ' AND c.source = @source';
        params.push({ name: '@source', value: source.trim().toLowerCase() });
      }
      if (destination) {
        query += ' AND c.destination = @destination';
        params.push({ name: '@destination', value: destination.trim().toLowerCase() });
      }
      if (timeSlot) {
        query += ' AND c.timeSlot = @timeSlot';
        params.push({ name: '@timeSlot', value: timeSlot });
      }

      query += ' ORDER BY c.createdAt DESC';

      const container = await getContainer('travelPlans');
      const { resources } = await container.items
        .query({ query, parameters: params })
        .fetchAll();

      return { jsonBody: { plans: resources, count: resources.length } };
    } catch (err) {
      return { status: 500, jsonBody: { error: 'Server error: ' + err.message } };
    }
  },
});
