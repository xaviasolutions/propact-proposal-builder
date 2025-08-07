// Test script for text watermark functionality
// Run this in the browser console after navigating to the app

console.log('Testing text watermark functionality...');

// Test data
const testProposal = {
  id: 'test-proposal',
  name: 'Test Proposal',
  sections: [
    {
      title: 'Introduction',
      content: '<p>This is a test section with some content.</p>'
    }
  ]
};

const testBranding = {
  watermark: {
    type: 'text',
    text: 'CONFIDENTIAL',
    transparency: 0.5,
    rotation: 45,
    fontSize: 48,
    color: '#FF0000'
  },
  colors: {
    primary: '#007bff',
    secondary: '#6c757d',
    accent: '#28a745'
  },
  fonts: {
    primary: 'Arial'
  }
};

console.log('Test proposal:', testProposal);
console.log('Test branding:', testBranding);

// Test the export function if available
if (window.exportToDocx) {
  console.log('exportToDocx function is available');
  console.log('Testing text watermark export...');
  
  window.exportToDocx(testProposal, testBranding)
    .then(() => {
      console.log('Export completed successfully');
    })
    .catch((error) => {
      console.error('Export failed:', error);
    });
} else {
  console.log('exportToDocx function is not available on window object');
}