// This script is meant to be run in the browser console to clear IndexedDB cache
// Copy and paste this code into your browser's DevTools Console

(async () => {
  // Clear IndexedDB
  const dbName = 'VocabularyTrainer';
  const request = indexedDB.deleteDatabase(dbName);
  
  request.onsuccess = () => {
    console.log('✅ IndexedDB cleared successfully');
    
    // Also clear localStorage
    localStorage.removeItem('allVocabulary');
    localStorage.removeItem('wordCache.timestamp');
    localStorage.removeItem('wordCache.count');
    localStorage.removeItem('wordSource');
    
    console.log('✅ localStorage cleared');
    console.log('✅ Please refresh the page to reload with fresh data');
    
    // Show a visual indicator
    const div = document.createElement('div');
    div.innerHTML = '✅ Cache cleared! Refreshing page...';
    div.style.cssText = 'position:fixed;top:20px;left:20px;background:#4ade80;color:white;padding:20px;border-radius:8px;font-size:16px;font-weight:bold;z-index:99999;';
    document.body.appendChild(div);
    
    // Refresh after 2 seconds
    setTimeout(() => location.reload(), 2000);
  };
  
  request.onerror = (e) => {
    console.error('❌ Failed to clear IndexedDB:', e);
  };
})();
