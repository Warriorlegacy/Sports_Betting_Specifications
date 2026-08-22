async function testTelegramBot() {
  const token = '8674196925:AAEa3kQwbgWTwc1pHn8MHqLJ9jdj705zYQ0';
  console.log('Testing Telegram Bot API getMe...');

  const res = await fetch(`https://api.telegram.org/bot${token}/getMe`);
  const data = await res.json().catch(() => ({}));
  console.log('Telegram Bot Status:', res.status);
  console.log('Telegram Bot Info:', data);
}

testTelegramBot().catch(console.error);
