(async () => {
  try {
    const res = await fetch('http://localhost:3001/api/words', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ word: 'zztestword', bangla: 'টেস্ট', english: 'test', synonym: '', example: '' }),
    });
    const text = await res.text();
    console.log('Status:', res.status);
    console.log(text);
  } catch (err) {
    console.error('Error:', err);
  }
})();
