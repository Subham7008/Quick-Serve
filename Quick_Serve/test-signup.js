const axios = require('axios');

async function testSignup() {
  try {
    const response = await axios.post('http://127.0.0.1:3336/users/signup', {
      user_name: 'sss',
      first_name: 'Test',
      last_name: 'User',
      business_name: 'Test Business',
      email: 'test@example.com',
      password: 'Subham@2002'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    console.log('Registration successful:', response.data);
  } catch (error) {
    console.error('Registration failed:', error.response?.data || error.message);
  }
}

testSignup();