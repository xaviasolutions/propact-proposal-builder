import mammoth from 'mammoth';

/**
 * Parse a .docx file and extract its content as HTML
 * @param {File} file - The .docx file to parse
 * @returns {Promise<string>} - Promise that resolves to HTML content
 */
export const parseDocxFile = async (file) => {
  try {
    // Validate file type
    if (!file.name.toLowerCase().endsWith('.docx')) {
      throw new Error('Please select a .docx file');
    }

    // Convert file to array buffer
    const arrayBuffer = await file.arrayBuffer();

    // Parse the docx file using mammoth
    const result = await mammoth.convertToHtml({ arrayBuffer });

    // Check for any warnings
    if (result.messages && result.messages.length > 0) {
      console.warn('DOCX parsing warnings:', result.messages);
    }

    // Return the HTML content
    return result.value;
  } catch (error) {
    console.error('Error parsing DOCX file:', error);
    throw new Error(`Failed to parse DOCX file: ${error.message}`);
  }
};

/**
 * Parse a .docx file and extract its content as plain text
 * @param {File} file - The .docx file to parse
 * @returns {Promise<string>} - Promise that resolves to plain text content
 */
export const parseDocxFileAsText = async (file) => {
  try {
    // Validate file type
    if (!file.name.toLowerCase().endsWith('.docx')) {
      throw new Error('Please select a .docx file');
    }

    // Convert file to array buffer
    const arrayBuffer = await file.arrayBuffer();

    // Parse the docx file using mammoth
    const result = await mammoth.extractRawText({ arrayBuffer });

    // Check for any warnings
    if (result.messages && result.messages.length > 0) {
      console.warn('DOCX parsing warnings:', result.messages);
    }

    // Return the plain text content
    return result.value;
  } catch (error) {
    console.error('Error parsing DOCX file:', error);
    throw new Error(`Failed to parse DOCX file: ${error.message}`);
  }
};

/**
 * Validate if a file is a valid .docx file
 * @param {File} file - The file to validate
 * @returns {boolean} - True if valid .docx file
 */
export const isValidDocxFile = (file) => {
  if (!file) return false;
  
  // Check file extension
  const hasValidExtension = file.name.toLowerCase().endsWith('.docx');
  
  // Check MIME type (optional, as some browsers may not set it correctly)
  const hasValidMimeType = file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
                          file.type === 'application/octet-stream' || 
                          file.type === '';
  
  return hasValidExtension;
};