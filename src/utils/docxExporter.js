import { asBlob } from 'html-docx-js/dist/html-docx';
import { saveAs } from 'file-saver';

export const exportToDocx = async (proposal, branding = {}) => {
  try {
    // Get the ProposalPreview component content
    const previewElement = document.querySelector('[data-testid="proposal-preview"]');
    
    if (!previewElement) {
      throw new Error('Could not find proposal preview content. Please ensure the proposal is visible before exporting.');
    }

    // Get the complete HTML content from ProposalPreview
    const htmlContent = previewElement.innerHTML;

    // Create complete HTML document
    const completeHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>${proposal.name || 'Proposal'}</title>
        </head>
        <body>
          ${htmlContent}
        </body>
      </html>
    `;

    // Convert to DOCX using html-docx-js
    const docxBlob = asBlob(completeHtml);
    
    // Save the file
    const fileName = `${(proposal.name || 'proposal').replace(/[^a-z0-9]/gi, '_').toLowerCase()}.docx`;
    saveAs(docxBlob, fileName);

    return true;
  } catch (error) {
    console.error('DOCX export failed:', error);
    alert(`DOCX export failed: ${error.message}`);
    throw error;
  }
};