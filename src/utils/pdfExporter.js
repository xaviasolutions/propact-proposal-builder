import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import store from '../store';

export const exportToPDF = async (filename = 'proposal.pdf') => {
  try {
    const element = document.querySelector('[data-testid="proposal-preview"]');
    
    if (!element) {
      throw new Error('Proposal preview element not found');
    }

    // Store original styles
    const originalStyles = {
      overflow: element.style.overflow,
      height: element.style.height,
      maxHeight: element.style.maxHeight,
      position: element.style.position,
      transform: element.style.transform
    };
    
    // Prepare element for capture
    element.style.overflow = 'visible';
    element.style.height = 'auto';
    element.style.maxHeight = 'none';
    element.style.position = 'static';
    element.style.transform = 'none';

    // Wait for layout to settle
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Before capture: replace placeholders in-clone using Redux branding
    const stateBranding = store.getState()?.branding?.currentBranding || {};
    const address = (stateBranding?.address || '').trim();
    const companyAddress = (stateBranding?.companyAddress || '').trim();

    // Try multiple canvas generation approaches
    let canvas = null;
    let imgData = null;

    // Approach 1: Standard html2canvas
    try {
      canvas = await html2canvas(element, {
        scale: 1,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: true,
        width: element.offsetWidth,
        height: element.offsetHeight,
        scrollX: 0,
        scrollY: 0,
        foreignObjectRendering: false,
        removeContainer: true,
        imageTimeout: 15000,
        onclone: (clonedDoc) => {
          // Ensure all styles are applied in the cloned document
          const clonedElement = clonedDoc.querySelector('[data-testid="proposal-preview"]');
          if (clonedElement) {
            clonedElement.style.overflow = 'visible';
            clonedElement.style.height = 'auto';
            clonedElement.style.maxHeight = 'none';
            clonedElement.style.position = 'static';
            clonedElement.style.transform = 'none';

            // Replace placeholders in the cloned DOM to ensure PDF shows correct values
            const walker = clonedDoc.createTreeWalker(clonedElement, NodeFilter.SHOW_TEXT, null);
            const textNodes = [];
            while (walker.nextNode()) {
              textNodes.push(walker.currentNode);
            }
            textNodes.forEach(node => {
              if (node.nodeValue && (node.nodeValue.includes('[Address]') || node.nodeValue.includes('[Company Address]'))) {
                node.nodeValue = node.nodeValue
                  .replace(/\[Address\]/g, address)
                  .replace(/\[Company Address\]/g, companyAddress);
              }
            });

            // Normalize paragraph spacing and alignment similar to DOCX
            const blockEls = clonedElement.querySelectorAll('p, div, li');
            blockEls.forEach(el => {
              const text = (el.textContent || '').trim();
              const isSignOff = /^yours\s+(sincerely|faithfully)/i.test(text);
              el.style.marginTop = '0';
              el.style.marginBottom = isSignOff ? '8px' : '12px';
              el.style.lineHeight = '1.35';
              el.style.textAlign = 'left';
              // Ensure no leading indent and trim leading spaces
              el.style.textIndent = '0';
              // Trim leading whitespace from all text nodes inside this element
              const walker2 = clonedDoc.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
              while (walker2.nextNode()) {
                walker2.currentNode.nodeValue = walker2.currentNode.nodeValue
                  .replace(/\u00A0/g, ' ')
                  .replace(/^\s+/, '');
              }
            });

            // Remove completely empty paragraphs/divs to prevent stray gaps
            clonedElement.querySelectorAll('p, div').forEach(el => {
              if (!el.textContent || el.textContent.trim() === '') {
                el.parentNode && el.parentNode.removeChild(el);
              }
            });
          }
        }
      });

      if (canvas && canvas.width > 0 && canvas.height > 0) {
        imgData = canvas.toDataURL('image/png', 1.0);
        if (imgData && imgData !== 'data:,' && !imgData.startsWith('data:,')) {
          console.log('Canvas generated successfully with approach 1');
        } else {
          canvas = null;
        }
      }
    } catch (error) {
      console.warn('Approach 1 failed:', error);
      canvas = null;
    }

    // Approach 2: Simplified settings if first approach fails
    if (!canvas) {
      try {
        canvas = await html2canvas(element, {
          scale: 0.8,
          useCORS: false,
          allowTaint: true,
          backgroundColor: '#ffffff',
          logging: true,
          foreignObjectRendering: false,
          removeContainer: false,
          imageTimeout: 10000
        });

        if (canvas && canvas.width > 0 && canvas.height > 0) {
          imgData = canvas.toDataURL('image/jpeg', 0.8);
          if (imgData && imgData !== 'data:,' && !imgData.startsWith('data:,')) {
            console.log('Canvas generated successfully with approach 2');
          } else {
            canvas = null;
          }
        }
      } catch (error) {
        console.warn('Approach 2 failed:', error);
        canvas = null;
      }
    }

    // Restore original styles
    Object.keys(originalStyles).forEach(key => {
      if (originalStyles[key] !== undefined) {
        element.style[key] = originalStyles[key];
      }
    });

    if (!canvas || !imgData) {
      throw new Error('Failed to generate image data from element. Please try again or check if the content is properly loaded.');
    }

    // Create PDF with A4 dimensions
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    // Calculate dimensions to fit the content properly
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;
    
    let heightLeft = imgHeight;
    let position = 0;

    // Add first page
    const imageFormat = imgData.includes('data:image/png') ? 'PNG' : 'JPEG';
    pdf.addImage(imgData, imageFormat, 0, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;

    // Add additional pages if content exceeds one page
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, imageFormat, 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
    }

    // Save the PDF
    pdf.save(filename);
    
    return true;
  } catch (error) {
    console.error('PDF export failed:', error);
    throw error;
  }
};