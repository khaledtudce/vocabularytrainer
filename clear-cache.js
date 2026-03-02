const { createClient } = require('redis');

async function clearVocabularyCache() {
  const url = process.env.REDIS_URL;
  
  if (!url) {
    console.log('❌ No REDIS_URL configured');
    process.exit(1);
  }

  const client = createClient({ url });
  
  try {
    await client.connect();
    console.log('✅ Connected to Redis');
    
    // Delete the vocabulary cache
    const deleted = await client.del('vocabulary:master');
    console.log(`✅ Deleted vocabulary:master (${deleted} keys removed)`);
    
    await client.disconnect();
    console.log('✅ Disconnected from Redis');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

clearVocabularyCache();
