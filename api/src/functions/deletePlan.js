// DELETE /api/travel-plans/{id} — Delete user's own travel plan (protected)
import { app } from '@azure/functions';
import { getContainer } from '../../lib/cosmosClient.js';
import { authenticateRequest } from '../../lib/auth.js';

app.http('deletePlan', {
  methods: ['DELETE'],
  authLevel: 'anonymous',
  route: 'travel-plans/{id}',
  handler: async (request) => {
    try {
      const user = authenticateRequest(request);
      if (!user) {
        return { status: 401, jsonBody: { error: 'Authentication required.' } };
      }

      const planId = request.params.id;
      const container = await getContainer('travelPlans');

      // Read the plan first to verify ownership
      const { resources } = await container.items
        .query({
          query: 'SELECT * FROM c WHERE c.id = @id',
          parameters: [{ name: '@id', value: planId }],
        })
        .fetchAll();

      if (resources.length === 0) {
        return { status: 404, jsonBody: { error: 'Plan not found.' } };
      }

      const plan = resources[0];
      if (plan.userId !== user.userId) {
        return { status: 403, jsonBody: { error: 'You can only delete your own plans.' } };
      }

      await container.item(planId, plan.userId).delete();

      return { jsonBody: { message: 'Plan deleted successfully.' } };
    } catch (err) {
      return { status: 500, jsonBody: { error: 'Server error: ' + err.message } };
    }
  },
});
