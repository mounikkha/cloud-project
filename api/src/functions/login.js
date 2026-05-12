// POST /api/login — Authenticate user
import { app } from '@azure/functions';
import { getContainer } from '../../lib/cosmosClient.js';
import { comparePassword, generateToken } from '../../lib/auth.js';

app.http('login', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'login',
  handler: async (request) => {
    try {
      const { email, password } = await request.json();

      if (!email || !password) {
        return { status: 400, jsonBody: { error: 'Email and password are required.' } };
      }

      const container = await getContainer('users');
      const { resources } = await container.items
        .query({ query: 'SELECT * FROM c WHERE c.email = @email', parameters: [{ name: '@email', value: email.toLowerCase() }] })
        .fetchAll();

      if (resources.length === 0) {
        return { status: 401, jsonBody: { error: 'Invalid email or password.' } };
      }

      const user = resources[0];
      const valid = await comparePassword(password, user.password);
      if (!valid) {
        return { status: 401, jsonBody: { error: 'Invalid email or password.' } };
      }

      const token = generateToken({ userId: user.id, name: user.name, email: user.email });

      return { jsonBody: { token, user: { id: user.id, name: user.name, email: user.email, phone: user.phone || '' } } };
    } catch (err) {
      return { status: 500, jsonBody: { error: 'Server error: ' + err.message } };
    }
  },
});
