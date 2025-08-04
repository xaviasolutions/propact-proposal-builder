// Clear localStorage script
// Run this in browser console to clear persisted data and force app to create new sample content

console.log('=== CLEARING STORAGE ===');

// Clear all localStorage
console.log('Clearing localStorage...');
localStorage.clear();

// Clear sessionStorage too
console.log('Clearing sessionStorage...');
sessionStorage.clear();

// Clear any IndexedDB if used
console.log('Clearing IndexedDB...');
if (window.indexedDB) {
  indexedDB.databases().then(databases => {
    databases.forEach(db => {
      console.log('Deleting database:', db.name);
      indexedDB.deleteDatabase(db.name);
    });
  }).catch(err => {
    console.log('Error clearing IndexedDB:', err);
  });
}

console.log('=== STORAGE CLEARED ===');
console.log('Please refresh the page to load new sample content.');

// Auto-refresh after 2 seconds
setTimeout(() => {
  console.log('Auto-refreshing page...');
  window.location.reload();
}, 2000);