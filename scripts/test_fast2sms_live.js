async function testFast2SMS() {
  const apiKey = 'mukbFXT9zCOcWs3UypIPehV4jftKdN8i2la6GZMQAgqwH0vnEBB5CxlPSvmzkO4wUeTGKW2Mfr8bVNuI';
  console.log('Testing Fast2SMS Quick Route (route: "q")...');

  const res = await fetch('https://www.fast2sms.com/dev/bulkV2', {
    method: 'POST',
    headers: {
      authorization: apiKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      route: 'q',
      message: 'Your NexusVIP verification code is 849201. Valid for 5 mins.',
      language: 'english',
      numbers: '9876543210'
    })
  });

  const data = await res.json().catch(() => ({}));
  console.log('Fast2SMS Quick SMS Status:', res.status);
  console.log('Fast2SMS Quick SMS Data:', data);
}

testFast2SMS().catch(console.error);
