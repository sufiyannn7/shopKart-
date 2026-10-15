const axios = require('axios');

async function testAuth() {
  try {
    const api = axios.create({ baseURL: 'http://localhost:5000' });
    console.log('Registering...');
    const regRes = await api.post('/customers/register', {
      fullName: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      phone: '1234567890'
    });
    console.log('Register success:', regRes.data);

    console.log('Logging in...');
    const loginRes = await api.post('/customers/login', {
      email: 'test@example.com',
      password: 'password123'
    });
    console.log('Login success:', loginRes.data);
  } catch (err) {
    console.error('Error:', err.response ? err.response.data : err.message);
  }
}

testAuth();
