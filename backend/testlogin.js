const axios = require('axios');

async function test() {
  try {
    const res = await axios.post('http://localhost:5000/api/auth/send-login-otp', {
      username: 'testing_00',
      password: 'password123' // I'll assume they used something else, but this will test if we get "Invalid" or "Certificate" error
    });
    console.log("Success:", res.data);
  } catch (err) {
    console.log("Error:", err.response ? err.response.data : err.message);
  }
}

test();
