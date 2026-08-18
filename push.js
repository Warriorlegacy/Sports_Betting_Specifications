const { execSync } = require('child_process');
try {
  console.log('Adding files...');
  execSync('git add -A', { stdio: 'inherit' });
  console.log('Committing...');
  execSync('git commit -m "feat: implement exact Fairplay VIP design replica and 6-odds column matrix"', { stdio: 'inherit' });
  console.log('Pushing to main...');
  execSync('git push origin main', { stdio: 'inherit' });
  console.log('SUCCESS');
} catch (e) {
  console.error('Git error:', e.message);
}
