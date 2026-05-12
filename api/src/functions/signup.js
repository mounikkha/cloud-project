// POST /api/signup — Register a new user
import { app } from '@azure/functions';
import { getContainer } from '../../lib/cosmosClient.js';
import { hashPassword, generateToken } from '../../lib/auth.js';

app.http('signup', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'signup',
  handler: async (request) => {
    try {
      const { name, email, password, phone } = await request.json();

      if (!name || !email || !password) {
        return { status: 400, jsonBody: { error: 'Name, email and password are required.' } };
      }

      const container = await getContainer('users');

      // Check if email already exists
      const { resources } = await container.items
        .query({ query: 'SELECT * FROM c WHERE c.email = @email', parameters: [{ name: '@email', value: email.toLowerCase() }] })
        .fetchAll();

      if (resources.length > 0) {
        return { status: 409, jsonBody: { error: 'Email already registered.' } };
      }

      const hashedPw = await hashPassword(password);
      const user = {
        id: crypto.randomUUID(),
        name,
        email: email.toLowerCase(),
        phone: phone || '',
        password: hashedPw,
        createdAt: new Date().toISOString(),
      };

      await container.items.create(user);

      const token = generateToken({ userId: user.id, name: user.name, email: user.email });

      return { status: 201, jsonBody: { token, user: { id: user.id, name: user.name, email: user.email, phone: user.phone } } };
    } catch (err) {
      return { status: 500, jsonBody: { error: 'Server error: ' + err.message } };
    }
  },
});
