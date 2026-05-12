// GET /api/my-plans — List current user's travel plans (protected)
import { app } from '@azure/functions';
import { getContainer } from '../../lib/cosmosClient.js';
import { authenticateRequest } from '../../lib/auth.js';

app.http('getMyPlans', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'my-plans',
  handler: async (request) => {
    try {
      const user = authenticateRequest(request);
      if (!user) {
        return { status: 401, jsonBody: { error: 'Authentication required.' } };
      }

      const container = await getContainer('travelPlans');
      const { resources } = await container.items
        .query({
          query: 'SELECT * FROM c WHERE c.userId = @uid ORDER BY c.createdAt DESC',
          parameters: [{ name: '@uid', value: user.userId }],
        })
        .fetchAll();

      return { jsonBody: { plans: resources } };
    } catch (err) {
      return { status: 500, jsonBody: { error: 'Server error: ' + err.message } };
    }
  },
});
