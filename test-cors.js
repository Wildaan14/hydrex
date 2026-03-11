const https = require('https');

const options = {
  hostname: 'hydrex.vercel.app',
  port: 443,
  path: '/api/auth/register',
  method: 'OPTIONS',
  headers: {
    'Origin': 'https://hydrex-web.vercel.app',
    'Access-Control-Request-Method': 'POST',
    'Access-Control-Request-Headers': 'content-type'
  }
};

const req = https.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  console.log('HEADERS:', JSON.stringify(res.headers, null, 2));
});

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
});

req.end();
