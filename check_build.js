const { execSync } = require('child_process');
try {
  console.log('Running tsc and vite build in player-portal...');
  const out = execSync('npm run build', { cwd: 'services/player-portal', encoding: 'utf-8' });
  console.log('BUILD SUCCESS:');
  console.log(out);
} catch (e) {
  console.error('BUILD ERROR:');
  console.error(e.stdout ? e.stdout.toString() : '');
  console.error(e.stderr ? e.stderr.toString() : '');
  console.error(e.message);
}
