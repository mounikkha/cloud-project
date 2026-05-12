// GET /api/matches — Find matching carpool users (protected)
import { app } from '@azure/functions';
import { getContainer } from '../../lib/cosmosClient.js';
import { authenticateRequest } from '../../lib/auth.js';

app.http('getMatches', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'matches',
  handler: async (request) => {
    try {
      const user = authenticateRequest(request);
      if (!user) {
        return { status: 401, jsonBody: { error: 'Authentication required.' } };
      }

      const url = new URL(request.url);
      const source = url.searchParams.get('source');
      const destination = url.searchParams.get('destination');
      const timeSlot = url.searchParams.get('timeSlot');

      if (!source || !destination) {
        return { status: 400, jsonBody: { error: 'Source and destination are required.' } };
      }

      let query = 'SELECT * FROM c WHERE c.source = @source AND c.destination = @destination AND c.userId != @uid';
      const params = [
        { name: '@source', value: source.trim().toLowerCase() },
        { name: '@destination', value: destination.trim().toLowerCase() },
        { name: '@uid', value: user.userId },
      ];

      if (timeSlot) {
        query += ' AND c.timeSlot = @timeSlot';
        params.push({ name: '@timeSlot', value: timeSlot });
      }

      query += ' ORDER BY c.createdAt DESC';

      const container = await getContainer('travelPlans');
      const { resources } = await container.items
        .query({ query, parameters: params })
        .fetchAll();

      return {
        jsonBody: {
          matches: resources,
          count: resources.length,
          query: { source: source.trim().toLowerCase(), destination: destination.trim().toLowerCase(), timeSlot: timeSlot || 'any' },
        },
      };
    } catch (err) {
      return { status: 500, jsonBody: { error: 'Server error: ' + err.message } };
    }
  },
});
