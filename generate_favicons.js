import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the json data returned by chrome-devtools-mcp
const outputFile = path.join('C:', 'Users', 'Piyush', '.gemini', 'antigravity-ide', 'brain', 'a0f953b7-936a-4bea-9134-c3c282b100fc', '.system_generated', 'steps', '431', 'output.txt');

const raw = fs.readFileSync(outputFile, 'utf8');
const jsonStart = raw.indexOf('{');
const jsonEnd = raw.lastIndexOf('}');
const jsonStr = raw.substring(jsonStart, jsonEnd + 1);
const data = JSON.parse(jsonStr);

const buf512 = Buffer.from(data.png512.replace(/^data:image\/png;base64,/, ''), 'base64');
const buf192 = Buffer.from(data.png192.replace(/^data:image\/png;base64,/, ''), 'base64');
const buf32 = Buffer.from(data.png32.replace(/^data:image\/png;base64,/, ''), 'base64');

const playerPublic = path.join(__dirname, 'services', 'player-portal', 'public');
const agentPublic = path.join(__dirname, 'services', 'agent-portal', 'public');

if (!fs.existsSync(agentPublic)) {
  fs.mkdirSync(agentPublic, { recursive: true });
}

// Write for player-portal
fs.writeFileSync(path.join(playerPublic, 'favicon.png'), buf32);
fs.writeFileSync(path.join(playerPublic, 'favicon-32x32.png'), buf32);
fs.writeFileSync(path.join(playerPublic, 'favicon-192x192.png'), buf192);
fs.writeFileSync(path.join(playerPublic, 'favicon-512x512.png'), buf512);
fs.writeFileSync(path.join(playerPublic, 'apple-touch-icon.png'), buf192);

// Also write /public/assets/fairplayvip8252.png with the new high-res icon so all legacy references show the new NexusVIP icon
const playerAssets = path.join(playerPublic, 'assets');
if (fs.existsSync(playerAssets)) {
  fs.writeFileSync(path.join(playerAssets, 'fairplayvip8252.png'), buf512);
}

// Write for agent-portal
fs.writeFileSync(path.join(agentPublic, 'favicon.png'), buf32);
fs.writeFileSync(path.join(agentPublic, 'favicon-32x32.png'), buf32);
fs.writeFileSync(path.join(agentPublic, 'favicon-192x192.png'), buf192);
fs.writeFileSync(path.join(agentPublic, 'favicon-512x512.png'), buf512);
fs.writeFileSync(path.join(agentPublic, 'apple-touch-icon.png'), buf192);

console.log('Successfully written crisp multi-size favicons for player-portal and agent-portal!');
