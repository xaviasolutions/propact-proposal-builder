// Browser console test script for export functionality
// Copy and paste this into the browser console to test exports

console.log('=== TESTING EXPORT FUNCTIONALITY ===');

// Test 1: Check if proposal preview is visible
console.log('1. Checking for proposal preview element...');
const previewElement = document.querySelector('[data-testid="proposal-preview"]');
console.log('Preview element found:', !!previewElement);
if (previewElement) {
  console.log('Preview element content length:', previewElement.textContent.length);
  console.log('Preview element HTML length:', previewElement.innerHTML.length);
}

// Test 2: Check current view mode
console.log('2. Checking current view mode...');
const previewButton = Array.from(document.querySelectorAll('button')).find(btn => 
  btn.textContent.includes('Preview') || btn.textContent.includes('Edit')
);
console.log('View toggle button found:', !!previewButton);
if (previewButton) {
  console.log('Button text:', previewButton.textContent);
}

// Test 3: Check for export buttons
console.log('3. Checking for export buttons...');
const exportButtons = Array.from(document.querySelectorAll('button')).filter(btn => 
  btn.textContent.includes('Export') || btn.textContent.includes('PDF') || btn.textContent.includes('DOCX')
);
console.log('Export buttons found:', exportButtons.length);
exportButtons.forEach((btn, index) => {
  console.log(`Export button ${index + 1}:`, btn.textContent);
});

// Test 4: Check Redux state
console.log('4. Checking Redux state...');
try {
  const state = window.__REDUX_DEVTOOLS_EXTENSION__ ? 
    window.__REDUX_DEVTOOLS_EXTENSION__.getState() : null;
  if (state) {
    console.log('Current proposal:', state.proposals?.currentProposal?.name);
    console.log('Number of sections:', state.proposals?.currentProposal?.sections?.length);
    state.proposals?.currentProposal?.sections?.forEach((section, index) => {
      console.log(`Section ${index + 1}: ${section.title} (${section.content.length} chars)`);
    });
  } else {
    console.log('Redux DevTools not available');
  }
} catch (error) {
  console.log('Error accessing Redux state:', error);
}

// Test 5: Simulate PDF export
console.log('5. Testing PDF export...');
if (window.exportToPdf) {
  console.log('PDF export function available, testing...');
  // Don't actually call it, just check if it exists
} else {
  console.log('PDF export function not found in window object');
}

// Test 6: Simulate DOCX export
console.log('6. Testing DOCX export...');
if (window.exportToDocx) {
  console.log('DOCX export function available, testing...');
  // Don't actually call it, just check if it exists
} else {
  console.log('DOCX export function not found in window object');
}

console.log('=== TEST COMPLETE ===');
console.log('To test actual export, click the export buttons in the sidebar and watch the console for debugging output.');