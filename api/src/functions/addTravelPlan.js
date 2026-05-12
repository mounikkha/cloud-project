// POST /api/travel-plans — Create a travel plan (protected)
import { app } from '@azure/functions';
import { getContainer } from '../../lib/cosmosClient.js';
import { authenticateRequest } from '../../lib/auth.js';

app.http('addTravelPlan', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'travel-plans',
  handler: async (request) => {
    try {
      const user = authenticateRequest(request);
      if (!user) {
        return { status: 401, jsonBody: { error: 'Authentication required.' } };
      }

      const { source, destination, timeSlot } = await request.json();

      if (!source || !destination || !timeSlot) {
        return { status: 400, jsonBody: { error: 'Source, destination and timeSlot are required.' } };
      }

      const plan = {
        id: crypto.randomUUID(),
        userId: user.userId,
        userName: user.name,
        userEmail: user.email,
        source: source.trim().toLowerCase(),
        destination: destination.trim().toLowerCase(),
        timeSlot,
        createdAt: new Date().toISOString(),
      };

      const container = await getContainer('travelPlans');
      await container.items.create(plan);

      return { status: 201, jsonBody: { plan } };
    } catch (err) {
      return { status: 500, jsonBody: { error: 'Server error: ' + err.message } };
    }
  },
});
