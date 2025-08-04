import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const exportToPdf = async (proposal) => {
  try {
    console.log('=== PDF EXPORT START ===');
    console.log('Proposal:', proposal.name);
    
    // Ensure we're in preview mode first
    await ensurePreviewMode();
    
    // Find the preview container
    const previewContainer = await findPreviewContainer(proposal);
    
    if (!previewContainer) {
      throw new Error('Could not find the proposal preview. Please switch to preview mode and try again.');
    }

    console.log('Found preview container, starting export...');
    
    // Use a simpler approach - capture the element directly without cloning
    const canvas = await html2canvas(previewContainer, {
      scale: 1,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      removeContainer: false,
      foreignObjectRendering: false,
      imageTimeout: 0,
      onclone: (clonedDoc) => {
        // Apply print styles to the cloned document
        const style = clonedDoc.createElement('style');
        style.textContent = `
          * {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body {
            margin: 0 !important;
            padding: 0 !important;
          }
        `;
        clonedDoc.head.appendChild(style);
      }
    });

    console.log('Canvas created:', { width: canvas.width, height: canvas.height });

    if (canvas.width === 0 || canvas.height === 0) {
      throw new Error('Canvas has zero dimensions. Please ensure the preview is visible.');
    }

    // Create PDF with proper sizing
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const margin = 10;
    const imgWidth = pageWidth - (margin * 2);
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    const imgData = canvas.toDataURL('image/jpeg', 0.95); // Use JPEG for better compression
    
    let heightLeft = imgHeight;
    let position = 0;

    // Add first page
    pdf.addImage(imgData, 'JPEG', margin, margin, imgWidth, imgHeight);
    heightLeft -= (pageHeight - margin * 2);

    // Add additional pages if needed
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', margin, position + margin, imgWidth, imgHeight);
      heightLeft -= (pageHeight - margin * 2);
    }

    // Save the PDF
    const fileName = `${(proposal.name || 'proposal').replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
    pdf.save(fileName);

    console.log('PDF exported successfully:', fileName);
    return true;
  } catch (error) {
    console.error('PDF export failed:', error);
    alert(`PDF export failed: ${error.message}`);
    throw error;
  }
};

// Helper function to ensure we're in preview mode
async function ensurePreviewMode() {
  console.log('Checking current mode...');
  
  let previewContainer = document.querySelector('[data-testid="proposal-preview"]');
  
  if (!previewContainer) {
    console.log('Not in preview mode, looking for preview button...');
    
    const buttons = Array.from(document.querySelectorAll('button'));
    const previewButton = buttons.find(btn => {
      const text = btn.textContent.toLowerCase().trim();
      return text.includes('preview') && !text.includes('edit');
    });
    
    if (previewButton) {
      console.log('Clicking preview button...');
      previewButton.click();
      
      // Wait for the mode switch
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Check again
      previewContainer = document.querySelector('[data-testid="proposal-preview"]');
      
      if (!previewContainer) {
        console.log('Still not in preview mode after clicking button');
      }
    } else {
      console.log('No preview button found');
    }
  }
  
  return !!previewContainer;
}

// Helper function to find the preview container
async function findPreviewContainer(proposal) {
  console.log('Looking for preview container...');
  
  // Try the main selector first
  let container = document.querySelector('[data-testid="proposal-preview"]');
  
  if (container) {
    console.log('Found container with data-testid');
    return container;
  }
  
  // Try styled-components class names
  const styledContainers = document.querySelectorAll('[class*="PreviewContainer"]');
  if (styledContainers.length > 0) {
    console.log('Found styled PreviewContainer');
    return styledContainers[0];
  }
  
  // Look for any container with substantial content
  const allDivs = document.querySelectorAll('div');
  for (let div of allDivs) {
    const text = div.textContent || '';
    if (text.length > 500 && (
      text.includes(proposal.name) ||
      text.includes('Cover Letter') ||
      text.includes('Scope of Work') ||
      text.includes('Table of Contents')
    )) {
      console.log('Found content container by text matching');
      return div;
    }
  }
  
  console.log('No suitable container found');
  return null;
}