import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Header,
  Footer,
  ImageRun,
  VerticalPositionAlign,
  HorizontalPositionAlign,
  TextWrappingType,
  VerticalAlign,
  TabStopType,
  TabStopPosition,
  LeaderType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  TableLayoutType,
} from 'docx';
import { saveAs } from 'file-saver';

// DEBUG FLAGS - Set to false to disable specific features
const DEBUG_FLAGS = {
  renderHeader: true,
  renderFooter: true,
  renderTitlePage: true,
  renderTableOfContents: true,
  useBuiltInTOC: true, // true = MS Word built-in TOC with page numbers, false = programmatic TOC
  renderSections: true,
  renderCustomFonts: true,
  renderCustomColors: true,
  renderSpacing: true,
  renderImages: true,
  renderLogo: true,
  renderWatermark: true,
};

function getImageBuffer(base64Image) {
  try {
    const base64Data = base64Image.includes(',') ? base64Image.split(',')[1] : base64Image;
    // Validate base64 data
    if (!base64Data || base64Data.length === 0) {
      throw new Error('Invalid base64 data');
    }
    return Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
  } catch (error) {
    console.error('Error processing image buffer:', error);
    throw error;
  }
}

function getImageFormat(base64Image) {
  if (base64Image.startsWith('data:image/png')) return 'png';
  if (base64Image.startsWith('data:image/jpeg') || base64Image.startsWith('data:image/jpg')) return 'jpeg';
  if (base64Image.startsWith('data:image/gif')) return 'gif';
  if (base64Image.startsWith('data:image/webp')) return 'webp';
  // Default to png for MS Word compatibility
  return 'png';
}

function isValidImageData(base64Image) {
  if (!base64Image || typeof base64Image !== 'string') {
    console.log('Invalid image data: not a string or empty', { type: typeof base64Image, length: base64Image?.length });
    return false;
  }

  // Check if it's a valid data URL
  if (base64Image.startsWith('data:image/')) {
    const format = getImageFormat(base64Image);
    const supportedFormats = ['png', 'jpeg', 'jpg'];
    const isSupported = supportedFormats.includes(format);
    console.log('Image format validation:', { format, isSupported, supportedFormats, imageStart: base64Image.substring(0, 50) });
    return isSupported;
  }

  // Check if it's valid base64 (without data URL prefix)
  try {
    const base64Data = base64Image.includes(',') ? base64Image.split(',')[1] : base64Image;
    const isValid = base64Data.length > 0 && /^[A-Za-z0-9+/]*={0,2}$/.test(base64Data);
    console.log('Base64 validation (no data URL):', { hasComma: base64Image.includes(','), dataLength: base64Data.length, isValid, imageStart: base64Image.substring(0, 50) });
    return isValid;
  } catch (error) {
    console.log('Base64 validation error:', error);
    return false;
  }
}

const getImageDimensions = (base64String) => {
  return new Promise((resolve) => {
    // Validate base64 string format
    if (!base64String || typeof base64String !== 'string') {
      resolve({ width: 150, height: 150 });
      return;
    }

    const img = new Image();
    img.onload = () => {
      // Ensure dimensions are valid and not zero
      const width = img.width > 0 ? img.width : 150;
      const height = img.height > 0 ? img.height : 150;
      resolve({ width, height });
    };
    img.onerror = () => {
      console.warn('Failed to load image for dimension calculation');
      resolve({ width: 150, height: 150 });
    };

    try {
      img.src = base64String;
    } catch (error) {
      console.warn('Invalid image source:', error);
      resolve({ width: 150, height: 150 });
    }
  });
};

const calculateContainedDimensions = (originalWidth, originalHeight, containerWidth, containerHeight) => {
  const aspectRatio = originalWidth / originalHeight;
  const containerAspectRatio = containerWidth / containerHeight;

  let finalWidth, finalHeight;
  if (aspectRatio > containerAspectRatio) {
    finalWidth = containerWidth;
    finalHeight = containerWidth / aspectRatio;
  } else {
    finalHeight = containerHeight;
    finalWidth = containerHeight * aspectRatio;
  }

  return { width: Math.round(finalWidth), height: Math.round(finalHeight) };
};

function renderHeader(branding) {
  if (!DEBUG_FLAGS.renderHeader) return undefined;

  // Map alignment values
  const getAlignment = (alignment) => {
    switch (alignment) {
      case 'left': return AlignmentType.LEFT;
      case 'right': return AlignmentType.RIGHT;
      case 'justify': return AlignmentType.JUSTIFIED;
      case 'center':
      default: return AlignmentType.CENTER;
    }
  };

  return new Header({
    children: [
      new Paragraph({
        alignment: getAlignment(branding?.headerAlignment),
        children: [
          new TextRun({
            text: branding?.headerText || '',
            bold: branding?.headerBold !== false, // Default to true
            italics: branding?.headerItalic || false,
            underline: branding?.headerUnderline ? {} : undefined,
            size: parseInt(branding?.headerFontSize || '24') * 2, // Convert pt to half-points
            font: DEBUG_FLAGS.renderCustomFonts ? (branding?.fonts?.primary || 'Arial') : 'Arial',
            color: DEBUG_FLAGS.renderCustomColors ? (branding?.colors?.primary?.replace('#', '') || '000000') : '000000'
          })
        ]
      })
    ]
  });
}

function renderCoverHeader(backgroundImageData) {
  if (!backgroundImageData || !DEBUG_FLAGS.renderImages || !isValidImageData(backgroundImageData)) {
    return null;
  }
  
  try {
    const backgroundImage = createLetterheadBackground(backgroundImageData);
    
    if (backgroundImage) {
      return new Header({
        children: [new Paragraph({ 
          children: [backgroundImage],
          spacing: { after: 0 }
        })]
      });
    }
  } catch (err) {
    console.warn('Cover header background render failed:', err);
  }
  
  return null;
}

function renderFooter(branding) {
  if (!DEBUG_FLAGS.renderFooter) return undefined;

  // Map alignment values
  const getAlignment = (alignment) => {
    switch (alignment) {
      case 'left': return AlignmentType.LEFT;
      case 'right': return AlignmentType.RIGHT;
      case 'justify': return AlignmentType.JUSTIFIED;
      case 'center':
      default: return AlignmentType.CENTER;
    }
  };

  return new Footer({
    children: [
      new Paragraph({
        alignment: getAlignment(branding?.footerAlignment),
        children: [
          new TextRun({
            text: branding?.footerText || '',
            bold: branding?.footerBold || false,
            italics: branding?.footerItalic !== false, // Default to true
            underline: branding?.footerUnderline ? {} : undefined,
            size: parseInt(branding?.footerFontSize || '20') * 2, // Convert pt to half-points
            font: DEBUG_FLAGS.renderCustomFonts ? (branding?.fonts?.primary || 'Arial') : 'Arial',
            color: DEBUG_FLAGS.renderCustomColors ? (branding?.colors?.secondary?.replace('#', '') || '888888') : '888888'
          })
        ]
      })
    ]
  });
}

async function renderWatermarkImage(branding) {

  if (!DEBUG_FLAGS.renderWatermark || !DEBUG_FLAGS.renderImages) {
    return [];
  }

  const watermark = branding?.watermark;
  const image = watermark?.processedImage || watermark?.image;

  if (!image || !isValidImageData(image)) {
    console.warn('Invalid or missing watermark image data');
    return [];
  }

  try {
    const dimensions = await getImageDimensions(image);
    const contained = calculateContainedDimensions(dimensions.width, dimensions.height, 400, 400);

    // Ensure minimum dimensions for MS Word compatibility
    const safeWidth = Math.max(contained.width, 50);
    const safeHeight = Math.max(contained.height, 50);

    // Get rotation angle (default to 0 if not specified)
    const rotation = watermark?.rotation || 0;

    // FIXED: Use processed image with correct transparency applied
    // The processedImage already has the correct transparency from the brand manager
    const watermarkImage = new ImageRun({
      data: getImageBuffer(image),
      transformation: {
        width: safeWidth,
        height: safeHeight,
        rotation: rotation // Add rotation support
      },
      type: getImageFormat(image),
      floating: {
        horizontalPosition: {
          align: HorizontalPositionAlign.CENTER,
          relative: 'page'
        },
        verticalPosition: {
          align: VerticalPositionAlign.CENTER,
          relative: 'page'
        },
        wrap: {
          type: TextWrappingType.NONE
        },
        behindDocument: true,
        allowOverlap: true
      }
    });

    return [new Paragraph({ children: [watermarkImage] })];
  } catch (err) {
    console.warn('Watermark image render failed:', err);
    return [];
  }
}

// Function to convert text to PNG image
function createTextWatermarkImage(text, options = {}) {

  const {
    fontSize = 48,
    color = '#CCCCCC',
    transparency = 0.3,
    rotation = 0,
    fontFamily = 'Arial',
    bold = true,
    italics = false
  } = options;

  try {
    // Create a canvas element
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // Set canvas size (large enough for rotated text)
    const canvasSize = 800;
    canvas.width = canvasSize;
    canvas.height = canvasSize;

    // FIXED: Calculate opacity from transparency (transparency is 0-1, where 0 = transparent, 1 = opaque)
    // For 75% opacity, transparency should be 0.25 (25% transparent, 75% opaque)
    // The transparency value from brand manager is already the correct opacity value
    const opacity = Math.max(0.05, Math.min(0.95, transparency));

    // Set font properties
    let fontStyle = '';
    if (italics) fontStyle += 'italic ';
    if (bold) fontStyle += 'bold ';
    fontStyle += `${fontSize}px ${fontFamily}`;

    ctx.font = fontStyle;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Convert hex color to rgba
    const hexColor = color.startsWith('#') ? color : `#${color}`;
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;

    // Save context for rotation
    ctx.save();

    // Move to center and rotate
    ctx.translate(canvasSize / 2, canvasSize / 2);
    ctx.rotate((rotation * Math.PI) / 180);

    // Draw the text (preserve original case - don't force uppercase)
    ctx.fillText(text, 0, 0);

    // Restore context
    ctx.restore();

    // Convert canvas to data URL
    const dataUrl = canvas.toDataURL('image/png');

    return dataUrl;
  } catch (err) {
    console.error('Failed to create text watermark image:', err);
    return null;
  }
}

async function renderWatermarkText(branding) {

  if (!DEBUG_FLAGS.renderWatermark || !DEBUG_FLAGS.renderImages) {
    return [];
  }

  const watermark = branding?.watermark;
  const text = watermark?.text;

  if (!text || typeof text !== 'string' || text.trim() === '') {
    return [];
  }

  try {
    // Get watermark properties with defaults
    // FIXED: Transparency and rotation values now properly used from brand manager
    const fontSize = watermark?.fontSize || 48;
    const color = watermark?.color || branding?.colors?.primary || '#CCCCCC';
    const transparency = watermark?.transparency || 0.3;
    const rotation = watermark?.rotation || 0;
    const fontFamily = branding?.fonts?.primary || 'Arial';

    // Create PNG image from text with correct transparency and rotation
    const textImageDataUrl = createTextWatermarkImage(text, {
      fontSize,
      color,
      transparency,
      rotation,
      fontFamily,
      bold: true,
      italics: watermark?.italics || false
    });

    if (!textImageDataUrl) {
      console.warn('Failed to create text watermark image');
      return [];
    }

    // Convert data URL to Uint8Array (browser-compatible)
    const base64Data = textImageDataUrl.split(',')[1];
    const binaryString = atob(base64Data);
    const imageBuffer = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      imageBuffer[i] = binaryString.charCodeAt(i);
    }

    // Create watermark image using the same approach as image watermarks
    const watermarkImage = new ImageRun({
      data: imageBuffer,
      transformation: {
        width: 400,
        height: 400
      },
      type: 'png',
      floating: {
        horizontalPosition: {
          align: HorizontalPositionAlign.CENTER,
          relative: 'page'
        },
        verticalPosition: {
          align: VerticalPositionAlign.CENTER,
          relative: 'page'
        },
        wrap: {
          type: TextWrappingType.NONE
        },
        behindDocument: true,
        allowOverlap: true
      }
    });

    return [new Paragraph({ children: [watermarkImage] })];
  } catch (err) {
    console.warn('Watermark text render failed:', err);
    return [];
  }
}

async function renderWatermark(branding) {
  const watermark = branding?.watermark;

  if (!watermark) {
    return [];
  }

  // Check watermark type and content
  // FIXED: Watermark transparency and rotation now properly applied from brand manager settings
  if (watermark.type === 'image' && watermark.image) {
    return await renderWatermarkImage(branding);
  } else if (watermark.type === 'text' && watermark.text && watermark.text.trim() !== '') {
    return renderWatermarkText(branding);
  }

  return []; // No watermark
}

// Helper function to create letterhead Letterhead
function createLetterheadBackground(backgroundImageData) {
  try {
    // A4 dimensions in points (1 point = 1/72 inch)
    // A4 = 8.27 × 11.69 inches = 595 × 843 points
    const pageWidth = 595;
    const pageHeight = 843;
    
    return new ImageRun({
      data: getImageBuffer(backgroundImageData),
      transformation: {
        width: pageWidth,
        height: pageHeight
      },
      type: getImageFormat(backgroundImageData),
      floating: {
        horizontalPosition: {
          align: HorizontalPositionAlign.CENTER,
          relative: 'page'
        },
        verticalPosition: {
          align: VerticalPositionAlign.CENTER,
          relative: 'page'
        },
        wrap: {
          type: TextWrappingType.BEHIND
        },
        behindDocument: true,
        allowOverlap: true,
        margins: {
          top: 0,
          bottom: 0,
          left: 0,
          right: 0
        }
      }
    });
  } catch (err) {
    console.warn('Failed to create letterhead background:', err);
    return null;
  }
}

function createCoverLetterContent(coverTemplate, proposalTitle, branding) {
  const paragraphs = [];
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Debug logging
  console.log('Cover template data:', coverTemplate);
  console.log('Right side text:', coverTemplate?.rightSideText);

  // Add right-side text if provided
  if (coverTemplate?.rightSideText) {
    console.log('Adding right side text:', coverTemplate.rightSideText);
    paragraphs.push(new Paragraph({
      alignment: AlignmentType.RIGHT,
      spacing: { after: 200 },
      children: [new TextRun({
        text: coverTemplate.rightSideText,
        font: DEBUG_FLAGS.renderCustomFonts ? (branding?.fonts?.primary || 'Arial') : 'Arial',
        size: 24,
        bold: true
      })]
    }));
  } else {
    console.log('No right side text found in cover template');
  }

  // Add date (right-aligned)
  paragraphs.push(new Paragraph({
    alignment: AlignmentType.RIGHT,
    spacing: { after: 400 },
    children: [new TextRun({
      text: currentDate,
      font: DEBUG_FLAGS.renderCustomFonts ? (branding?.fonts?.primary || 'Arial') : 'Arial',
      size: 22
    })]
  }));

  // Add address fields from branding data
  // FIXED: Now dynamically injects actual address values instead of placeholders
  if (branding?.address) {
    paragraphs.push(new Paragraph({
      spacing: { after: 200 },
      children: [new TextRun({ 
        text: branding.address,
        font: DEBUG_FLAGS.renderCustomFonts ? (branding?.fonts?.primary || 'Arial') : 'Arial',
        size: 22
      })]
    }));
  }
  
  if (branding?.companyAddress) {
    paragraphs.push(new Paragraph({
      spacing: { after: 400 },
      children: [new TextRun({ 
        text: branding.companyAddress,
        font: DEBUG_FLAGS.renderCustomFonts ? (branding?.fonts?.primary || 'Arial') : 'Arial',
        size: 22
      })]
    }));
  }

  // Add subject line with proposal title
  if (proposalTitle) {
    paragraphs.push(new Paragraph({
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: 'Subject: ',
          font: DEBUG_FLAGS.renderCustomFonts ? (branding?.fonts?.primary || 'Arial') : 'Arial',
          size: 22,
          bold: true
        }),
        new TextRun({
          text: `\t\t${proposalTitle}`,
          font: DEBUG_FLAGS.renderCustomFonts ? (branding?.fonts?.primary || 'Arial') : 'Arial',
          size: 22
        })
      ]
    }));
  }

  // Add cover content if provided
  if (coverTemplate.content) {
    // FIXED: Replace placeholders in cover content with actual branding values
    let processedContent = coverTemplate.content;
    
    // Replace company name placeholder
    if (branding?.companyName) {
      processedContent = processedContent.replace(/\[Your Company Name\]/g, branding.companyName);
    }
    
    // Replace address placeholders
    if (branding?.address) {
      processedContent = processedContent.replace(/\[Address\]/g, branding.address);
    }
    
    if (branding?.companyAddress) {
      processedContent = processedContent.replace(/\[Company Address\]/g, branding.companyAddress);
    }
    
    const htmlParagraphs = convertHtmlToDocxParagraphs(processedContent, branding);
    paragraphs.push(...htmlParagraphs);
  }

  return paragraphs;
}

function convertHtmlToDocxParagraphs(html, branding) {

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const body = doc.body;

  // Check for tables in the entire document
  const allTables = doc.querySelectorAll('table');

  if (allTables.length > 0) {
    allTables.forEach((table, index) => {
      console.log(`📊 Table ${index + 1}:`, table.outerHTML.substring(0, 100) + '...');
    });
  }

  const elements = [];

  // STEP 1: Create a map of content with position markers
  const contentMap = [];
  let elementIndex = 0;

  // STEP 2: Process each child node and mark table positions
  function mapContent(parentNode) {

    Array.from(parentNode.childNodes).forEach((node, nodeIndex) => {

      if (node.nodeType === Node.ELEMENT_NODE) {
        const tag = node.tagName?.toLowerCase();

        if (tag === 'table') {
          // Mark table position
          contentMap.push({
            type: 'table',
            index: elementIndex++,
            node: node,
            processed: false
          });
        } else {
          // Check if this element contains tables
          const nestedTables = node.querySelectorAll('table');
          if (nestedTables.length > 0) {
            // Process nested content recursively
            mapContent(node);
          } else {
            // Mark non-table content position
            contentMap.push({
              type: 'content',
              index: elementIndex++,
              node: node,
              processed: false
            });
          }
        }
      } else if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) {
        // Mark text content position
        contentMap.push({
          type: 'text',
          index: elementIndex++,
          node: node,
          processed: false
        });
      }
    });
  }

  mapContent(body);

  // STEP 3: Process content in sequence
  contentMap.forEach((item) => {
    if (item.type === 'table') {
      const table = createDocxTable(item.node, branding);
      if (table) {
        elements.push(table);
      } else {
        // Add fallback text
        const textContent = item.node.textContent?.trim();
        if (textContent) {
          elements.push(new Paragraph({
            children: [new TextRun({ text: `[Table: ${textContent.substring(0, 50)}...]` })],
            spacing: { after: 200 }
          }));
        }
      }
    } else if (item.type === 'content') {
      const contentElements = processNonTableContent(item.node, branding);
      elements.push(...contentElements);
    } else if (item.type === 'text') {
      const text = item.node.textContent?.trim();
      if (text) {
        elements.push(new Paragraph({
          children: [new TextRun({
            text,
            font: DEBUG_FLAGS.renderCustomFonts ? (branding?.fonts?.primary || 'Arial') : 'Arial',
            color: DEBUG_FLAGS.renderCustomColors ? (branding?.colors?.primary?.replace('#', '') || '000000') : '000000'
          })],
          spacing: DEBUG_FLAGS.renderSpacing ? { after: 200 } : undefined
        }));
      }
    }
  });

  return elements;
}

function createDocxTable(tableNode, branding) {
  try {
    const tableRows = tableNode.querySelectorAll('tr');
    if (tableRows.length === 0) return null;

    // Determine number of columns (from first row that has cells)
    const firstRow = Array.from(tableRows).find(row => row.querySelectorAll('td, th').length > 0);
    const columnCount = firstRow ? firstRow.querySelectorAll('td, th').length : 1;
    const columnWidth = Math.floor(12240 / columnCount); // Full page width divided by columns

    const rows = Array.from(tableRows).map((rowNode, rowIndex) => {
      const cellNodes = rowNode.querySelectorAll('td, th');
      if (cellNodes.length === 0) return null;

      const isHeaderRow =
        rowNode.closest('thead') !== null ||
        cellNodes[0].tagName.toLowerCase() === 'th' ||
        (rowIndex === 0 && !rowNode.closest('tbody'));

      const cells = Array.from(cellNodes).map(cellNode => {
        const cellText = cellNode.textContent?.trim() || ' ';
        return new TableCell({
          width: {
            size: columnWidth,
            type: WidthType.DXA
          },
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: cellText,
                  bold: isHeaderRow,
                  font: branding?.fonts?.primary || 'Arial',
                  color: branding?.colors?.primary?.replace('#', '') || '000000',
                  size: 20, // 10pt
                })
              ],
              alignment: AlignmentType.LEFT,
              spacing: { after: 100 },
            })
          ],
          margins: {
            top: 100,
            bottom: 100,
            left: 100,
            right: 100
          },
          shading: isHeaderRow ? {
            fill: branding?.colors?.accent?.replace('#', '') || 'f0f0f0'
          } : undefined,
          borders: {
            top: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
            bottom: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
            left: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
            right: { style: BorderStyle.SINGLE, size: 1, color: '000000' }
          }
        });
      });

      return new TableRow({ children: cells });
    }).filter(Boolean); // remove nulls

    return new Table({
      rows,
      width: {
        size: 12240,
        type: WidthType.DXA
      },
      layout: TableLayoutType.FIXED,
      margins: {
        top: 300,
        bottom: 300
      },
      tableLook: {
        firstRow: true,
        noHBand: true,
        noVBand: true
      }
    });

  } catch (error) {
    console.error('💥 Error generating DOCX table:', error);
    return null;
  }
}

// SEPARATE NON-TABLE CONTENT PROCESSING
function processNonTableContent(node, branding) {
  const elements = [];
  const tag = node.tagName?.toLowerCase();

  if (/^h[1-6]$/.test(tag)) {
    elements.push(new Paragraph({
      heading: HeadingLevel[`HEADING_${tag[1]}`],
      children: parseTextContent(node, branding),
      spacing: DEBUG_FLAGS.renderSpacing ? { after: 200 } : undefined
    }));
  } else if (tag === 'p') {
    elements.push(new Paragraph({
      children: parseTextContent(node, branding),
      spacing: DEBUG_FLAGS.renderSpacing ? { after: 200 } : undefined
    }));
  } else if (tag === 'br') {
    elements.push(new Paragraph({ children: [] }));
  } else if (tag === 'ul' || tag === 'ol') {
    const listItems = node.querySelectorAll('li');
    listItems.forEach((li, index) => {
      const bullet = tag === 'ul' ? '• ' : `${index + 1}. `;
      elements.push(new Paragraph({
        children: [
          new TextRun({ text: bullet }),
          ...parseTextContent(li, branding)
        ],
        spacing: DEBUG_FLAGS.renderSpacing ? { after: 100 } : undefined
      }));
    });
  } else if (tag === 'div') {
    // Process div contents recursively, but skip tables
    const hasBlockElements = Array.from(node.children).some(child => {
      const childTag = child.tagName?.toLowerCase();
      return ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'div'].includes(childTag);
    });
    
    if (hasBlockElements) {
      // If div contains block elements, process them recursively
      Array.from(node.childNodes).forEach((child) => {
        if (child.nodeType === Node.ELEMENT_NODE && child.tagName?.toLowerCase() !== 'table') {
          elements.push(...processNonTableContent(child, branding));
        }
      });
    } else {
      // If div only contains inline content, treat it as a paragraph
      const textContent = parseTextContent(node, branding);
      if (textContent.length > 0) {
        elements.push(new Paragraph({
          children: textContent,
          spacing: DEBUG_FLAGS.renderSpacing ? { after: 200 } : undefined
        }));
      }
    }
  } else {
    // For other elements, extract text content
    const textContent = node.textContent?.trim();
    if (textContent) {
      elements.push(new Paragraph({
        children: parseTextContent(node, branding),
        spacing: DEBUG_FLAGS.renderSpacing ? { after: 200 } : undefined
      }));
    }
  }

  return elements;
}

// HELPER FUNCTION FOR TEXT PARSING
function parseTextContent(node, branding, styles = {}) {
  const children = [];

  node.childNodes.forEach((child) => {
    if (child.nodeType === Node.TEXT_NODE) {
      const text = child.textContent;
      if (text.trim()) {
        children.push(new TextRun({
          text,
          bold: styles.bold,
          italics: styles.italics,
          underline: styles.underline,
          color: DEBUG_FLAGS.renderCustomColors ? (styles.color || branding?.colors?.primary?.replace('#', '') || '000000') : '000000',
          font: DEBUG_FLAGS.renderCustomFonts ? (branding?.fonts?.primary || 'Arial') : 'Arial'
        }));
      }
    }

    if (child.nodeType === Node.ELEMENT_NODE) {
      const tag = child.tagName.toLowerCase();
      const childStyles = { ...styles };

      if (tag === 'strong' || tag === 'b') childStyles.bold = true;
      if (tag === 'em' || tag === 'i') childStyles.italics = true;
      if (tag === 'u') childStyles.underline = {};
      
      // Handle span elements with inline styles
      if (tag === 'span') {
        if (child.style.color) {
          childStyles.color = child.style.color.replace('#', '');
        }
        if (child.style.fontWeight === 'bold' || child.style.fontWeight >= 700) {
          childStyles.bold = true;
        }
        if (child.style.fontStyle === 'italic') {
          childStyles.italics = true;
        }
        if (child.style.textDecoration && child.style.textDecoration.includes('underline')) {
          childStyles.underline = {};
        }
      }

      children.push(...parseTextContent(child, branding, childStyles));
    }
  });

  return children;
}

export const exportToDocx = async (proposal, branding = {}) => {
  // Expose to window for testing
  if (typeof window !== 'undefined') {
    window.exportToDocx = exportToDocx;
  }

  const sections = [];

  // Title Page
  if (DEBUG_FLAGS.renderTitlePage) {
    const titleChildren = [];

    // FIXED: Title page content now perfectly centered both horizontally and vertically
    // Calculate dynamic spacing based on content to ensure perfect centering
    const hasLogo = DEBUG_FLAGS.renderLogo && DEBUG_FLAGS.renderImages && branding?.logo && isValidImageData(branding.logo);
    
    // Perfect center alignment for both logo + title and title only scenarios
    const topSpacing = hasLogo ? 4000 : 5000; // Increased spacing to push content lower
    
    titleChildren.push(new Paragraph({
      children: [],
      spacing: { before: topSpacing } // Balanced top margin for perfect centering
    }));

    // Logo (if present)
    if (hasLogo) {
      try {
        const dimensions = await getImageDimensions(branding.logo);
        const contained = calculateContainedDimensions(dimensions.width, dimensions.height, 500, 200);

        // Ensure minimum dimensions for MS Word compatibility
        const safeWidth = Math.max(contained.width, 50);
        const safeHeight = Math.max(contained.height, 50);

        titleChildren.push(new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: DEBUG_FLAGS.renderSpacing ? { after: 400 } : undefined, // Balanced spacing between logo and title
          children: [new ImageRun({
            data: getImageBuffer(branding.logo),
            transformation: {
              width: safeWidth,
              height: safeHeight
            },
            type: getImageFormat(branding.logo)
          })]
        }));
      } catch (err) {
        console.warn('Logo render failed:', err);
      }
    }

    // Title (always present, positioned under logo if logo exists)
    titleChildren.push(new Paragraph({
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: DEBUG_FLAGS.renderSpacing ? { after: 400 } : undefined,
      children: [new TextRun({
        text: proposal.name,
        bold: true,
        size: 48,
        font: DEBUG_FLAGS.renderCustomFonts ? (branding?.fonts?.primary || 'Arial') : 'Arial',
        color: DEBUG_FLAGS.renderCustomColors ? (branding?.colors?.accent?.replace('#', '') || '000000') : '000000'
      })]
    }));

    // Balanced bottom spacing to complete the centering
    const bottomSpacing = hasLogo ? 3000 : 4000; // Balanced bottom space for perfect centering
    
    titleChildren.push(new Paragraph({
      children: [],
      spacing: { after: bottomSpacing } // Large bottom margin to complete centering
    }));

    // Title Page (No header/footer) with enhanced centering
    sections.push({
      properties: {
        page: {
          verticalAlign: VerticalAlign.CENTER
        }
      },
      children: [...titleChildren, new Paragraph({ children: [], pageBreakAfter: true })]
    });
  }

  // Table of contents
  if (DEBUG_FLAGS.renderTableOfContents) {
    const tocSettings = branding?.tableOfContents || {};
    const isEnabled = tocSettings.enabled !== false;

    if (isEnabled) {
      // Create manual TOC with proper styling that actually works
      const tocChildren = [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: DEBUG_FLAGS.renderSpacing ? { after: 300 } : undefined,
          children: [
            new TextRun({
              text: 'Table of Contents',
              bold: true,
              size: 32,
              font: DEBUG_FLAGS.renderCustomFonts ? (branding?.fonts?.primary || 'Arial') : 'Arial',
              color: DEBUG_FLAGS.renderCustomColors ? (branding?.colors?.accent?.replace('#', '') || '000000') : '000000'
            })
          ]
        })
      ];

      // Generate manual TOC entries based on proposal sections
      proposal.sections.forEach((section, index) => {
        const pageNumber = index + 3; // Assuming title page + TOC page + content starts at page 3

        // Create TOC entry with proper styling
        const tocEntryChildren = [
          new TextRun({
            text: `${index + 1}. ${section.title}`,
            font: DEBUG_FLAGS.renderCustomFonts ? (branding?.fonts?.primary || 'Arial') : 'Arial',
            color: DEBUG_FLAGS.renderCustomColors ? (branding?.colors?.primary?.replace('#', '') || '000000') : '000000'
          })
        ];

        // Add leaders (dots) and page numbers if enabled
        if (tocSettings.showPageNumbers !== false) {
          // Add tab with leader dots
          tocEntryChildren.push(new TextRun({
            text: '\t',
            font: DEBUG_FLAGS.renderCustomFonts ? (branding?.fonts?.primary || 'Arial') : 'Arial'
          }));

          tocEntryChildren.push(new TextRun({
            text: pageNumber.toString(),
            font: DEBUG_FLAGS.renderCustomFonts ? (branding?.fonts?.primary || 'Arial') : 'Arial',
            color: DEBUG_FLAGS.renderCustomColors ? (branding?.colors?.primary?.replace('#', '') || '000000') : '000000'
          }));
        }

        tocChildren.push(new Paragraph({
          spacing: DEBUG_FLAGS.renderSpacing ? { after: 100 } : undefined,
          tabStops: tocSettings.showPageNumbers !== false ? [
            {
              type: TabStopType.RIGHT,
              position: TabStopPosition.MAX,
              leader: LeaderType.DOT
            }
          ] : undefined,
          children: tocEntryChildren
        }));
      });

      tocChildren.push(new Paragraph({ children: [], pageBreakAfter: true }));

      sections.push({
        properties: {},
        children: tocChildren
      });
    }
  }

  // Content Pages
  if (DEBUG_FLAGS.renderSections) {
    for (const section of proposal.sections) {

      // Only add watermark to non-cover sections (cover sections use letterhead backgrounds instead)
      // FIXED: Watermark transparency and rotation now properly applied from brand manager settings
      // FIXED: Address fields now dynamically injected from branding data instead of placeholders
      const watermark = section.type === 'cover' ? [] : await renderWatermark(branding);
      const contentChildren = [...watermark];

      // FIXED: Section title disabled - using empty string instead of section.title
      // This prevents section titles from appearing in the generated document/PDF
      contentChildren.push(new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: DEBUG_FLAGS.renderSpacing ? { after: 300 } : undefined,
        children: [new TextRun({
          text: '', // Empty string - section titles are now disabled
          bold: true,
          size: 32,
          font: DEBUG_FLAGS.renderCustomFonts ? (branding?.fonts?.primary || 'Arial') : 'Arial',
          color: DEBUG_FLAGS.renderCustomColors ? (branding?.colors?.accent?.replace('#', '') || '000000') : '000000'
        })]
      }));

      // Handle table sections with structured data
      if (section.type === 'table' && section.tableData) {

        // Add table title if provided
        if (section.tableTitle) {
          contentChildren.push(new Paragraph({
            heading: HeadingLevel.HEADING_3,
            spacing: DEBUG_FLAGS.renderSpacing ? { before: 200, after: 100 } : undefined,
            children: [new TextRun({
              text: section.tableTitle,
              bold: true,
              font: DEBUG_FLAGS.renderCustomFonts ? (branding?.fonts?.primary || 'Arial') : 'Arial',
              color: DEBUG_FLAGS.renderCustomColors ? (branding?.colors?.primary?.replace('#', '') || '000000') : '000000'
            })]
          }));
        }

        // Add table introduction if provided (ReactQuill content)
        if (section.tableDescription) {
          // Convert ReactQuill HTML to plain text for DOCX
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = section.tableDescription;
          const plainText = tempDiv.textContent || tempDiv.innerText || '';

          if (plainText.trim()) {
            contentChildren.push(new Paragraph({
              spacing: DEBUG_FLAGS.renderSpacing ? { before: 100, after: 200 } : undefined,
              children: [new TextRun({
                text: plainText,
                font: DEBUG_FLAGS.renderCustomFonts ? (branding?.fonts?.primary || 'Arial') : 'Arial',
                color: DEBUG_FLAGS.renderCustomColors ? (branding?.colors?.primary?.replace('#', '') || '000000') : '000000'
              })]
            }));
          }
        }

        // Create table from structured data
        const tableRows = section.tableData.map((row, rowIndex) => {
          return new TableRow({
            children: row.map((cell, cellIndex) => {
              return new TableCell({
                children: [
                  new Paragraph({
                    children: [new TextRun({
                      text: cell || '',
                      bold: rowIndex === 0,
                      font: DEBUG_FLAGS.renderCustomFonts ? (branding?.fonts?.primary || 'Arial') : 'Arial',
                      color: DEBUG_FLAGS.renderCustomColors ? (branding?.colors?.primary?.replace('#', '') || '000000') : '000000'
                    })]
                  })
                ],
                shading: rowIndex === 0 ? {
                  fill: branding?.colors?.accent?.replace('#', '') || 'F5F5F5'
                } : undefined,
                borders: {
                  top: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
                  bottom: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
                  left: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
                  right: { style: BorderStyle.SINGLE, size: 1, color: '000000' }
                }
              });
            })
          });
        });

        const table = new Table({
          rows: tableRows,
          width: {
            size: 100,
            type: WidthType.PERCENTAGE
          },
          margins: {
            top: 300,
            bottom: 300
          }
        });

        contentChildren.push(table);

        // Add table summary if provided (renders after table) - ReactQuill content
        if (section.tableNote) {
          // Convert ReactQuill HTML to plain text for DOCX
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = section.tableNote;
          const plainText = tempDiv.textContent || tempDiv.innerText || '';

          if (plainText.trim()) {
            contentChildren.push(new Paragraph({
              spacing: DEBUG_FLAGS.renderSpacing ? { before: 200, after: 200 } : undefined,
              children: [new TextRun({
                text: plainText,
                font: DEBUG_FLAGS.renderCustomFonts ? (branding?.fonts?.primary || 'Arial') : 'Arial',
                color: DEBUG_FLAGS.renderCustomColors ? (branding?.colors?.primary?.replace('#', '') || '000000') : '000000'
              })]
            }));
          }
        }

        // Add page break if enabled
        if (section.tablePageBreak !== false) {
          contentChildren.push(new Paragraph({
            children: [],
            pageBreakAfter: true
          }));
        } else {
          // Add spacing after table if no page break
          contentChildren.push(new Paragraph({
            children: [],
            spacing: DEBUG_FLAGS.renderSpacing ? { after: 200 } : undefined
          }));
        }
      }
      // Handle fees sections with comprehensive legal fee structure
      else if (section.type === 'fees') {
        const currency = section.currency || 'OMR';
        
        // Add fee structure heading
        const feeTypeLabel = {
          'capped': 'Capped Fees',
          'fixed': 'Fixed Fees', 
          'hourly': 'Hourly Billing Without Caps'
        }[section.feeType] || 'Fee Structure';
        
        contentChildren.push(new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: DEBUG_FLAGS.renderSpacing ? { before: 200, after: 200 } : undefined,
          children: [new TextRun({
            text: feeTypeLabel,
            bold: true,
            font: DEBUG_FLAGS.renderCustomFonts ? (branding?.fonts?.primary || 'Arial') : 'Arial',
            color: DEBUG_FLAGS.renderCustomColors ? (branding?.colors?.primary?.replace('#', '') || '000000') : '000000'
          })]
        }));
        
        // Add Additional Details section BEFORE pricing components
        if (section.feeType && section[`${section.feeType}FeeContent`]) {
          const feeContent = section[`${section.feeType}FeeContent`];
          if (feeContent && feeContent.trim()) {
            contentChildren.push(new Paragraph({
              heading: HeadingLevel.HEADING_3,
              spacing: DEBUG_FLAGS.renderSpacing ? { before: 300, after: 100 } : undefined,
              children: [new TextRun({
                text: section.additionalDetailsTitle || 'Additional Details',
                bold: true,
                font: DEBUG_FLAGS.renderCustomFonts ? (branding?.fonts?.primary || 'Arial') : 'Arial',
                color: DEBUG_FLAGS.renderCustomColors ? (branding?.colors?.primary?.replace('#', '') || '000000') : '000000'
              })]
            }));
            
            const feeParagraphs = convertHtmlToDocxParagraphs(feeContent, branding);
            contentChildren.push(...feeParagraphs);
          }
        }
        
        // Add hourly rates table if hourly rates exist and fee type is hourly
        if (section.feeType === 'hourly' && section.hourlyRates && section.hourlyRates.length > 0) {
          contentChildren.push(new Paragraph({
            heading: HeadingLevel.HEADING_3,
            spacing: DEBUG_FLAGS.renderSpacing ? { before: 200, after: 100 } : undefined,
            children: [new TextRun({
              text: 'Hourly Rates',
              bold: true,
              font: DEBUG_FLAGS.renderCustomFonts ? (branding?.fonts?.primary || 'Arial') : 'Arial',
              color: DEBUG_FLAGS.renderCustomColors ? (branding?.colors?.primary?.replace('#', '') || '000000') : '000000'
            })]
          }));
          
          // Create hourly rates table
          const ratesTableRows = [];
          
          // Header row
          const headerCells = [
            new TableCell({
              children: [new Paragraph({
                children: [new TextRun({ text: section.positionHeader || 'Position', bold: true, color: 'FFFFFF' })],
                alignment: AlignmentType.CENTER
              })],
              shading: { fill: branding?.colors?.accent?.replace('#', '') || '007bff' }
            }),
            new TableCell({
              children: [new Paragraph({
                children: [new TextRun({ text: `${section.standardRateHeader || 'Standard Rate'} (${currency})`, bold: true, color: 'FFFFFF' })],
                alignment: AlignmentType.CENTER
              })],
              shading: { fill: branding?.colors?.accent?.replace('#', '') || '007bff' }
            })
          ];
          
          if (section.includeDiscountedRates) {
            headerCells.push(new TableCell({
              children: [new Paragraph({
                children: [new TextRun({ text: `Discounted Rate (${currency})`, bold: true, color: 'FFFFFF' })],
                alignment: AlignmentType.CENTER
              })],
              shading: { fill: branding?.colors?.accent?.replace('#', '') || '007bff' }
            }));
          }
          
          ratesTableRows.push(new TableRow({ children: headerCells }));
          
          // Data rows
          section.hourlyRates.forEach(rate => {
            const dataCells = [
              new TableCell({
                children: [new Paragraph({
                  children: [new TextRun({ text: rate.position || '' })],
                  alignment: AlignmentType.LEFT
                })]
              }),
              new TableCell({
                children: [new Paragraph({
                  children: [new TextRun({ text: rate.standardRate || '' })],
                  alignment: AlignmentType.RIGHT
                })]
              })
            ];
            
            if (section.includeDiscountedRates) {
              dataCells.push(new TableCell({
                children: [new Paragraph({
                  children: [new TextRun({ text: rate.discountedRate || '' })],
                  alignment: AlignmentType.RIGHT
                })]
              }));
            }
            
            ratesTableRows.push(new TableRow({ children: dataCells }));
          });
          
          const ratesTable = new Table({
            rows: ratesTableRows,
            width: { size: 100, type: WidthType.PERCENTAGE },
            margins: { top: 100, bottom: 100, left: 100, right: 100 }
          });
          
          contentChildren.push(ratesTable);
        }
        
        // Add workstreams if they exist and fee type is hourly or capped
        if ((section.feeType === 'hourly' || section.feeType === 'capped') && section.workstreams && section.workstreams.length > 0) {
          contentChildren.push(new Paragraph({
            heading: HeadingLevel.HEADING_3,
            spacing: DEBUG_FLAGS.renderSpacing ? { before: 300, after: 100 } : undefined,
            children: [new TextRun({
              text: 'Workstreams',
              bold: true,
              font: DEBUG_FLAGS.renderCustomFonts ? (branding?.fonts?.primary || 'Arial') : 'Arial',
              color: DEBUG_FLAGS.renderCustomColors ? (branding?.colors?.primary?.replace('#', '') || '000000') : '000000'
            })]
          }));
          
          section.workstreams.forEach((workstream, index) => {
            contentChildren.push(new Paragraph({
              spacing: DEBUG_FLAGS.renderSpacing ? { before: 100, after: 50 } : undefined,
              children: [new TextRun({
                text: `${index + 1}. ${workstream.name || 'Workstream'}`,
                bold: true,
                font: DEBUG_FLAGS.renderCustomFonts ? (branding?.fonts?.primary || 'Arial') : 'Arial'
              })]
            }));
            
            if (workstream.amount && section.feeType !== 'hourly') {
              const amountLabel = section.feeType === 'capped' ? 'Cap Amount' : 'Fixed Amount';
              contentChildren.push(new Paragraph({
                spacing: DEBUG_FLAGS.renderSpacing ? { after: 50 } : undefined,
                children: [new TextRun({
                  text: `${amountLabel}: ${currency} ${workstream.amount}`,
                  font: DEBUG_FLAGS.renderCustomFonts ? (branding?.fonts?.primary || 'Arial') : 'Arial'
                })]
              }));
            }
            
            if (workstream.description) {
              contentChildren.push(new Paragraph({
                spacing: DEBUG_FLAGS.renderSpacing ? { after: 100 } : undefined,
                children: [new TextRun({
                  text: workstream.description,
                  font: DEBUG_FLAGS.renderCustomFonts ? (branding?.fonts?.primary || 'Arial') : 'Arial'
                })]
              }));
            }
          });
        }
        
        // Add additional charges section
        if (section.includeTranslation || section.vatRate) {
          contentChildren.push(new Paragraph({
            heading: HeadingLevel.HEADING_3,
            spacing: DEBUG_FLAGS.renderSpacing ? { before: 300, after: 100 } : undefined,
            children: [new TextRun({
              text: 'Additional Charges',
              bold: true,
              font: DEBUG_FLAGS.renderCustomFonts ? (branding?.fonts?.primary || 'Arial') : 'Arial',
              color: DEBUG_FLAGS.renderCustomColors ? (branding?.colors?.primary?.replace('#', '') || '000000') : '000000'
            })]
          }));
          
          if (section.includeTranslation && section.translationContent) {
            // Convert HTML content to plain text for DOCX
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = section.translationContent;
            const plainText = tempDiv.textContent || tempDiv.innerText || '';
            
            if (plainText.trim()) {
              contentChildren.push(new Paragraph({
                spacing: DEBUG_FLAGS.renderSpacing ? { after: 50 } : undefined,
                children: [new TextRun({
                  text: plainText,
                  font: DEBUG_FLAGS.renderCustomFonts ? (branding?.fonts?.primary || 'Arial') : 'Arial'
                })]
              }));
            }
          }
          
          if (section.includeTaxes && section.taxContent) {
            // Convert HTML content to plain text for DOCX
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = section.taxContent;
            const plainText = tempDiv.textContent || tempDiv.innerText || '';
            
            if (plainText.trim()) {
              contentChildren.push(new Paragraph({
                spacing: DEBUG_FLAGS.renderSpacing ? { after: 50 } : undefined,
                children: [new TextRun({
                  text: plainText,
                  font: DEBUG_FLAGS.renderCustomFonts ? (branding?.fonts?.primary || 'Arial') : 'Arial'
                })]
              }));
            }
          }
          
          if (section.vatRate) {
            contentChildren.push(new Paragraph({
              spacing: DEBUG_FLAGS.renderSpacing ? { after: 100 } : undefined,
              children: [new TextRun({
                text: `VAT: ${section.vatRate}% will be calculated on the invoice.`,
                font: DEBUG_FLAGS.renderCustomFonts ? (branding?.fonts?.primary || 'Arial') : 'Arial'
              })]
            }));
          }
        }
        
        // Add scope limitations
        if (section.maxRevisions || section.maxHours) {
          contentChildren.push(new Paragraph({
            heading: HeadingLevel.HEADING_3,
            spacing: DEBUG_FLAGS.renderSpacing ? { before: 300, after: 100 } : undefined,
            children: [new TextRun({
              text: 'Scope Limitations',
              bold: true,
              font: DEBUG_FLAGS.renderCustomFonts ? (branding?.fonts?.primary || 'Arial') : 'Arial',
              color: DEBUG_FLAGS.renderCustomColors ? (branding?.colors?.primary?.replace('#', '') || '000000') : '000000'
            })]
          }));
          
          if (section.maxRevisions) {
            contentChildren.push(new Paragraph({
              spacing: DEBUG_FLAGS.renderSpacing ? { after: 50 } : undefined,
              children: [new TextRun({
                text: `Maximum revisions: ${section.maxRevisions}`,
                font: DEBUG_FLAGS.renderCustomFonts ? (branding?.fonts?.primary || 'Arial') : 'Arial'
              })]
            }));
          }
          
          if (section.maxHours) {
            contentChildren.push(new Paragraph({
              spacing: DEBUG_FLAGS.renderSpacing ? { after: 100 } : undefined,
              children: [new TextRun({
                text: `Maximum hours: ${section.maxHours}`,
                font: DEBUG_FLAGS.renderCustomFonts ? (branding?.fonts?.primary || 'Arial') : 'Arial'
              })]
            }));
          }
        }
        
        // Add other assumptions
        if (section.assumptions && section.assumptions.length > 0) {
          contentChildren.push(new Paragraph({
            heading: HeadingLevel.HEADING_3,
            spacing: DEBUG_FLAGS.renderSpacing ? { before: 300, after: 100 } : undefined,
            children: [new TextRun({
              text: section.assumptionsTitle || 'Other Assumptions',
              bold: true,
              font: DEBUG_FLAGS.renderCustomFonts ? (branding?.fonts?.primary || 'Arial') : 'Arial',
              color: DEBUG_FLAGS.renderCustomColors ? (branding?.colors?.primary?.replace('#', '') || '000000') : '000000'
            })]
          }));
          
          section.assumptions.forEach(assumption => {
            if (assumption.trim()) {
              contentChildren.push(new Paragraph({
                spacing: DEBUG_FLAGS.renderSpacing ? { after: 50 } : undefined,
                children: [new TextRun({
                  text: `• ${assumption}`,
                  font: DEBUG_FLAGS.renderCustomFonts ? (branding?.fonts?.primary || 'Arial') : 'Arial'
                })]
              }));
            }
          });
        }
        
        // Additional Details section has been moved to the beginning of the fees section
        
        // Add spacing after fees section
        contentChildren.push(new Paragraph({
          children: [],
          spacing: DEBUG_FLAGS.renderSpacing ? { after: 200 } : undefined
        }));
      }
      // Handle cover sections with Letterheads (letterheads)
      else if (section.type === 'cover') {
        // Add cover content with new format
        if (section.coverTemplate) {
          const coverParagraphs = createCoverLetterContent(section.coverTemplate, proposal.name, branding);
          contentChildren.push(...coverParagraphs);
        } else if (section.content) {
          const htmlParagraphs = convertHtmlToDocxParagraphs(section.content, branding);
          contentChildren.push(...htmlParagraphs);
        }
      }
      // Handle regular content sections
      else if (section.content) {
        const htmlParagraphs = convertHtmlToDocxParagraphs(section.content, branding);
        contentChildren.push(...htmlParagraphs);
      }

      // Determine which header to use based on section type and Letterhead
      let sectionHeaders = undefined;
      if (section.type === 'cover' && section.coverTemplate?.backgroundImage) {
        // Use cover header with Letterhead for letterhead
        const coverHeader = renderCoverHeader(section.coverTemplate.backgroundImage);
        sectionHeaders = coverHeader ? { default: coverHeader } : undefined;
      } else if (DEBUG_FLAGS.renderHeader) {
        // Use regular header for other sections
        sectionHeaders = { default: renderHeader(branding) };
      }
      
      sections.push({
        properties: {},
        headers: sectionHeaders,
        footers: DEBUG_FLAGS.renderFooter ? { default: renderFooter(branding) } : undefined,
        children: contentChildren
      });
    }
  }

  // Fallback: if no sections are rendered, create a basic document
  if (sections.length === 0) {
    sections.push({
      properties: {},
      children: [
        new Paragraph({
          children: [new TextRun({
            text: 'All sections disabled by debug flags',
            size: 24
          })]
        })
      ]
    });
  }

  const doc = new Document({ sections });
  const blob = await Packer.toBlob(doc);
  saveAs(blob, proposal.name || 'Proposal.docx');
};