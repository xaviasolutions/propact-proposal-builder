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
} from 'docx';
import { saveAs } from 'file-saver';

// DEBUG FLAGS - Set to false to disable specific features
const DEBUG_FLAGS = {
  renderHeader: true,
  renderFooter: true,
  renderTitlePage: true,
  renderTableOfContents: true,
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
    return false;
  }

  // Check if it's a valid data URL
  if (base64Image.startsWith('data:image/')) {
    const format = getImageFormat(base64Image);
    const supportedFormats = ['png', 'jpeg', 'jpg', 'gif'];
    return supportedFormats.includes(format);
  }

  // Check if it's valid base64 (without data URL prefix)
  try {
    const base64Data = base64Image.includes(',') ? base64Image.split(',')[1] : base64Image;
    return base64Data.length > 0 && /^[A-Za-z0-9+/]*={0,2}$/.test(base64Data);
  } catch {
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

  return new Header({
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text: branding?.headerText || '',
            bold: true,
            size: 24,
            font: DEBUG_FLAGS.renderCustomFonts ? (branding?.fonts?.primary || 'Arial') : 'Arial',
            color: DEBUG_FLAGS.renderCustomColors ? (branding?.colors?.primary?.replace('#', '') || '000000') : '000000'
          })
        ]
      })
    ]
  });
}

function renderFooter(branding) {
  if (!DEBUG_FLAGS.renderFooter) return undefined;

  return new Footer({
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text: branding?.footerText || '',
            italics: true,
            size: 20,
            font: DEBUG_FLAGS.renderCustomFonts ? (branding?.fonts?.primary || 'Arial') : 'Arial',
            color: DEBUG_FLAGS.renderCustomColors ? (branding?.colors?.secondary?.replace('#', '') || '888888') : '888888'
          })
        ]
      })
    ]
  });
}

async function renderWatermarkImage(branding) {
  if (!DEBUG_FLAGS.renderWatermark || !DEBUG_FLAGS.renderImages) return [];

  const image = branding?.watermark?.processedImage || branding?.watermark?.image || branding?.watermark;
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

    const watermarkImage = new ImageRun({
      data: getImageBuffer(image),
      transformation: {
        width: safeWidth,
        height: safeHeight
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
    console.warn('Watermark render failed:', err);
    return [];
  }
}

function convertHtmlToDocxParagraphs(html, branding) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const body = doc.body;
  const paragraphs = [];

  function parseNode(node, styles = {}) {
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
        if (tag === 'span' && child.style.color) childStyles.color = child.style.color.replace('#', '');

        children.push(...parseNode(child, childStyles));
      }
    });

    return children;
  }

  body.childNodes.forEach((node) => {
    const tag = node.tagName?.toLowerCase();

    if (/^h[1-6]$/.test(tag)) {
      paragraphs.push(new Paragraph({
        heading: HeadingLevel[`HEADING_${tag[1]}`],
        children: parseNode(node),
        spacing: DEBUG_FLAGS.renderSpacing ? { after: 200 } : undefined
      }));
    } else if (tag === 'p') {
      paragraphs.push(new Paragraph({
        children: parseNode(node),
        spacing: DEBUG_FLAGS.renderSpacing ? { after: 200 } : undefined
      }));
    } else if (tag === 'br') {
      paragraphs.push(new Paragraph({ children: [] }));
    }
  });

  return paragraphs;
}

export const exportToDocx = async (proposal, branding = {}) => {
  console.log('DEBUG FLAGS:', DEBUG_FLAGS);

  const sections = [];

  // Title Page
  if (DEBUG_FLAGS.renderTitlePage) {
    const titleChildren = [];

    if (DEBUG_FLAGS.renderLogo && DEBUG_FLAGS.renderImages && branding?.logo && isValidImageData(branding.logo)) {
      try {
        const dimensions = await getImageDimensions(branding.logo);
        const contained = calculateContainedDimensions(dimensions.width, dimensions.height, 500, 200);

        // Ensure minimum dimensions for MS Word compatibility
        const safeWidth = Math.max(contained.width, 50);
        const safeHeight = Math.max(contained.height, 50);

        titleChildren.push(new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: DEBUG_FLAGS.renderSpacing ? { after: 400 } : undefined,
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

    // Title Page (No header/footer)
    sections.push({
      properties: {},
      children: [...titleChildren, new Paragraph({ children: [], pageBreakAfter: true })]
    });
  }

  // Table of contents
  if (DEBUG_FLAGS.renderTableOfContents) {
    const tocChildren = [
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
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

    // Loop through sections and add manual TOC entries
    proposal.sections.forEach((section, index) => {
      tocChildren.push(
        new Paragraph({
          spacing: DEBUG_FLAGS.renderSpacing ? { after: 100 } : undefined,
          children: [
            new TextRun({
              text: `${index + 1}. ${section.title}`,
              size: 24,
              font: DEBUG_FLAGS.renderCustomFonts ? (branding?.fonts?.primary || 'Arial') : 'Arial',
              color: DEBUG_FLAGS.renderCustomColors ? (branding?.colors?.primary?.replace('#', '') || '000000') : '000000'
            })
          ]
        })
      );
    });

    tocChildren.push(new Paragraph({ children: [], pageBreakAfter: true }));

    sections.push({
      properties: {},
      children: tocChildren
    });
  }

  // Content Pages
  if (DEBUG_FLAGS.renderSections) {
    for (const section of proposal.sections) {
      const watermark = await renderWatermarkImage(branding);
      const contentChildren = [...watermark];

      contentChildren.push(new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: DEBUG_FLAGS.renderSpacing ? { after: 300 } : undefined,
        children: [new TextRun({
          text: section.title,
          bold: true,
          size: 32,
          font: DEBUG_FLAGS.renderCustomFonts ? (branding?.fonts?.primary || 'Arial') : 'Arial',
          color: DEBUG_FLAGS.renderCustomColors ? (branding?.colors?.accent?.replace('#', '') || '000000') : '000000'
        })]
      }));

      const htmlParagraphs = convertHtmlToDocxParagraphs(section.content, branding);
      contentChildren.push(...htmlParagraphs);

      sections.push({
        properties: {},
        headers: DEBUG_FLAGS.renderHeader ? { default: renderHeader(branding) } : undefined,
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