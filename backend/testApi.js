const http = require('http');

const data = JSON.stringify({
  title: "test",
  description: "test",
  category: "OTHER",
  priority: "LOW",
  contactDetails: "123",
  attachments: []
});

const options = {
  hostname: 'localhost',
  port: 8080,
  path: '/api/tickets',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
    // omitting authorization to see if we get 401 or 302
  }
};

const req = http.request(options, res => {
  console.log(`statusCode: ${res.statusCode}`);
  let responseData = '';

  res.on('data', d => {
    responseData += d;
  });

  res.on('end', () => {
    console.log('Response:', responseData);
    console.log('Headers:', res.headers);
  });
});

req.on('error', error => {
  console.error('Error:', error);
});

req.write(data);
req.end();
