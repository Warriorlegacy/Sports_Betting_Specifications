/**
 * Multi-Tier Sports Betting Exchange - Automated Deployment Healthcheck
 */

const http = require('http');
const https = require('https');

const API_BASE = process.env.HEALTHCHECK_HOST || 'https://sports-exchange-backend-j1aj.onrender.com';

function checkEndpoint(path) {
  return new Promise((resolve, reject) => {
    const url = `${API_BASE}${path}`;
    const client = url.startsWith('https:') ? https : http;
    client.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

async function runHealthchecks() {
  console.log(`Starting automated healthcheck against ${API_BASE}...`);
  let allPassed = true;

  // 1. Check API Health
  try {
    const res = await checkEndpoint('/api/health');
    if (res.status === 200 && res.data.status === 'OK') {
      console.log('✅ API Health Endpoint: ONLINE (200 OK)');
    } else {
      console.error('❌ API Health Endpoint returned unexpected response:', res);
      allPassed = false;
    }
  } catch (err) {
    console.error('❌ API Health Endpoint connection failed:', err.message);
    allPassed = false;
  }

  // 2. Check Markets Endpoint
  try {
    const res = await checkEndpoint('/api/markets');
    if (res.status === 200 && Array.isArray(res.data.markets)) {
      console.log(`✅ Markets Endpoint: ONLINE (${res.data.markets.length} active markets loaded)`);
    } else {
      console.error('❌ Markets Endpoint returned unexpected response:', res);
      allPassed = false;
    }
  } catch (err) {
    console.error('❌ Markets Endpoint connection failed:', err.message);
    allPassed = false;
  }

  if (allPassed) {
    console.log('\n🌟 ALL DEPLOYMENT HEALTHCHECKS PASSED!');
    process.exit(0);
  } else {
    console.warn('\n⚠️ SOME HEALTHCHECKS FAILED. Check backend container logs.');
    process.exit(1);
  }
}

runHealthchecks();
