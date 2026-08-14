/**
 * Render Inactivity Sleep Cron Script
 * 
 * Usage:
 * node scripts/render_inactivity_cron.js
 * 
 * Can be run via cron (e.g. every minute) to check the backend status
 * and put Render service to sleep if no activity in the past 1 minute.
 */

const BACKEND_URL = process.env.BACKEND_URL || 'https://sports-exchange-backend-j1aj.onrender.com';
const RENDER_API_KEY = process.env.RENDER_API_KEY || 'rnd_09x1C0VulSvph8tXNHdZY2g87KJN';
const RENDER_SERVICE_ID = process.env.RENDER_SERVICE_ID || '';

async function checkAndSleep() {
  console.log(`[Cron] Checking inactivity status on ${BACKEND_URL}...`);
  try {
    const res = await fetch(`${BACKEND_URL}/api/inactivity/status`, {
      signal: AbortSignal.timeout(10000)
    });

    if (!res.ok) {
      console.log(`[Cron] Backend returned status ${res.status}`);
      return;
    }

    const status = await res.json();
    console.log('[Cron] Current status:', JSON.stringify(status, null, 2));

    if (status.idleSeconds >= (status.timeoutSeconds || 60) && status.connectedSockets === 0) {
      console.log(`[Cron] Inactive for ${status.idleSeconds}s (threshold: ${status.timeoutSeconds}s). Triggering sleep...`);
      
      // Trigger sleep on the backend
      await fetch(`${BACKEND_URL}/api/inactivity/sleep`, { method: 'POST' }).catch(() => {});

      // If Render service ID is provided, suspend via Render API
      if (RENDER_API_KEY && RENDER_SERVICE_ID) {
        console.log(`[Cron] Calling Render API to suspend service ${RENDER_SERVICE_ID}...`);
        const renderRes = await fetch(`https://api.render.com/v1/services/${RENDER_SERVICE_ID}/suspend`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RENDER_API_KEY}`,
            'Accept': 'application/json'
          }
        });
        console.log(`[Cron] Render suspend response code: ${renderRes.status}`);
      }
    } else {
      console.log(`[Cron] Backend is active (${status.idleSeconds}s idle, ${status.connectedSockets} sockets). No sleep required.`);
    }
  } catch (err) {
    console.log(`[Cron] Could not contact backend (may already be asleep or spinning down): ${err.message}`);
  }
}

checkAndSleep();
