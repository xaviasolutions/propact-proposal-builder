import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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