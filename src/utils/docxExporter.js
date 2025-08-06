import { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  HeadingLevel, 
  AlignmentType, 
  PageBreak,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  ShadingType,
  Header,
  Footer,
  ImageRun,
  convertInchesToTwip,
  convertMillimetersToTwip,
  HorizontalPositionAlign,
  VerticalPositionAlign,
  TextWrappingType,
  LevelFormat,
  AlignmentType as NumberingAlignment
} from 'docx';
import { saveAs } from 'file-saver';

// Helper function to convert hex color to RGB
const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 123, b: 255 }; // Default blue
};

// Helper function to convert base64 to buffer (browser-compatible)
const base64ToBuffer = (base64String) => {
  try {
    // Handle data URL format
    let base64Data = base64String;
    if (base64String.startsWith('data:')) {
      // Extract base64 data from data URL
      base64Data = base64String.split(',')[1];
    }
    
    // Convert base64 to binary string
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    return bytes;
  } catch (error) {
    console.error('Error converting base64 to buffer:', error);
    return null;
  }
};

// Helper function to get image dimensions from base64 data URL
const getImageDimensions = (base64String) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = () => {
      resolve({ width: 150, height: 150 }); // Default fallback
    };
    img.src = base64String;
  });
};

// Helper function to calculate contained dimensions (like resizeMode: contain)
const calculateContainedDimensions = (originalWidth, originalHeight, containerWidth, containerHeight) => {
  const aspectRatio = originalWidth / originalHeight;
  const containerAspectRatio = containerWidth / containerHeight;
  
  let finalWidth, finalHeight;
  
  if (aspectRatio > containerAspectRatio) {
    // Image is wider than container - fit to width
    finalWidth = containerWidth;
    finalHeight = containerWidth / aspectRatio;
  } else {
    // Image is taller than container - fit to height
    finalHeight = containerHeight;
    finalWidth = containerHeight * aspectRatio;
  }
  
  return { width: Math.round(finalWidth), height: Math.round(finalHeight) };
};

// Helper function to get image extension from base64 data URL
const getImageExtension = (base64String) => {
  const match = base64String.match(/^data:image\/([a-z]+);base64,/);
  return match ? match[1] : 'png';
};

// Helper function to decode HTML entities
const decodeHtmlEntities = (text) => {
  const entities = {
    '&nbsp;': ' ',
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&apos;': "'",
    '&cent;': '¢',
    '&pound;': '£',
    '&yen;': '¥',
    '&euro;': '€',
    '&copy;': '©',
    '&reg;': '®'
  };
  
  return text.replace(/&[a-zA-Z0-9#]+;/g, (entity) => {
    return entities[entity] || entity;
  });
};

// Helper function to extract images from HTML content
const extractImagesFromHtml = (htmlContent) => {
  const images = [];
  const imgRegex = /<img[^>]+src="([^"]+)"[^>]*>/gi;
  let match;
  
  while ((match = imgRegex.exec(htmlContent)) !== null) {
    const src = match[1];
    if (src.startsWith('data:image/')) {
      images.push({
        src: src,
        width: 400, // Default width
        height: 300  // Default height
      });
    }
  }
  
  return images;
};

// Helper function to parse inline formatting
const parseInlineFormatting = (htmlText, primaryColor) => {
  const runs = [];
  
  if (!htmlText || !htmlText.trim()) return runs;
  
  // Split text by formatting tags while preserving the tags
  const parts = htmlText.split(/(<\/?(?:strong|b|em|i|u|strike|s|span)[^>]*>)/gi);
  
  let currentFormat = {
    bold: false,
    italics: false,
    underline: false,
    strike: false,
    color: null
  };
  
  const formatStack = [];
  
  for (let part of parts) {
    if (!part) continue;
    
    // Check if this is a formatting tag
    if (part.match(/^<(strong|b)(\s[^>]*)?>$/i)) {
      formatStack.push({ ...currentFormat });
      currentFormat.bold = true;
    } else if (part.match(/^<\/(strong|b)>$/i)) {
      currentFormat = formatStack.pop() || { ...currentFormat, bold: false };
    } else if (part.match(/^<(em|i)(\s[^>]*)?>$/i)) {
      formatStack.push({ ...currentFormat });
      currentFormat.italics = true;
    } else if (part.match(/^<\/(em|i)>$/i)) {
      currentFormat = formatStack.pop() || { ...currentFormat, italics: false };
    } else if (part.match(/^<u(\s[^>]*)?>$/i)) {
      formatStack.push({ ...currentFormat });
      currentFormat.underline = true;
    } else if (part.match(/^<\/u>$/i)) {
      currentFormat = formatStack.pop() || { ...currentFormat, underline: false };
    } else if (part.match(/^<(strike|s)(\s[^>]*)?>$/i)) {
      formatStack.push({ ...currentFormat });
      currentFormat.strike = true;
    } else if (part.match(/^<\/(strike|s)>$/i)) {
      currentFormat = formatStack.pop() || { ...currentFormat, strike: false };
    } else if (part.match(/^<span[^>]*style="[^"]*color:\s*([^;"]+)[^"]*"[^>]*>$/i)) {
      formatStack.push({ ...currentFormat });
      const colorMatch = part.match(/color:\s*([^;"]+)/i);
      if (colorMatch) {
        currentFormat.color = colorMatch[1].trim();
      }
    } else if (part.match(/^<\/span>$/i)) {
      currentFormat = formatStack.pop() || { ...currentFormat, color: null };
    } else if (!part.match(/^<[^>]*>$/)) {
      // This is actual text content
      const cleanText = decodeHtmlEntities(part.trim());
      if (cleanText) {
        const runOptions = {
          text: cleanText,
          size: 24,
          font: "Arial"
        };
        
        if (currentFormat.bold) runOptions.bold = true;
        if (currentFormat.italics) runOptions.italics = true;
        if (currentFormat.underline) runOptions.underline = {};
        if (currentFormat.strike) runOptions.strike = true;
        if (currentFormat.color) {
          // Handle color - remove # if present and validate
          let color = currentFormat.color.replace('#', '');
          if (color.length === 6 && /^[0-9A-Fa-f]+$/.test(color)) {
            runOptions.color = color;
          }
        }
        
        runs.push(new TextRun(runOptions));
      }
    }
  }
  
  // If no runs were created, create a basic one with the cleaned text
  if (runs.length === 0) {
    const cleanText = htmlText.replace(/<[^>]*>/g, '').trim();
    if (cleanText) {
      runs.push(new TextRun({
        text: decodeHtmlEntities(cleanText),
        size: 24,
        font: "Arial"
      }));
    }
  }
  
  return runs;
};

// Helper function to parse HTML content and convert to docx elements
const parseHtmlContent = (htmlContent, primaryColor) => {
  try {
    if (!htmlContent || typeof htmlContent !== 'string') return [];
    
    const elements = [];
    
    // Extract and handle images first
    const images = extractImagesFromHtml(htmlContent);
    
    // Remove images from content for text processing
    let textContent = htmlContent.replace(/<img[^>]*>/gi, '');
    
    // Split content by block elements
    const blockElements = textContent.split(/(<\/?(h[1-6]|p|div|ul|ol|li|table|tr|td|th|blockquote)[^>]*>)/gi);
    
    let currentElement = '';
    let inList = false;
    let listItems = [];
    let listType = 'bullet'; // 'bullet' or 'ordered'
    
    for (let i = 0; i < blockElements.length; i++) {
      const block = blockElements[i];
      
      if (!block || !block.trim()) continue;
      
      // Handle headers
      if (block.match(/<h([1-6])[^>]*>/i)) {
        const level = parseInt(block.match(/<h([1-6])[^>]*>/i)[1]);
        const headerText = blockElements[i + 1] || '';
        
        if (headerText.trim()) {
          const runs = parseInlineFormatting(headerText, primaryColor);
          if (runs.length > 0) {
            elements.push(new Paragraph({
              children: runs.map(run => new TextRun({
                ...run.options,
                bold: true,
                size: level === 1 ? 32 : level === 2 ? 28 : 26,
                color: primaryColor.replace('#', '')
              })),
              spacing: { before: 300, after: 200 }
            }));
          }
        }
        i++; // Skip the text content as we've processed it
        continue;
      }
      
      // Handle list start
      if (block.match(/<(ul|ol)[^>]*>/i)) {
        inList = true;
        listType = block.match(/<ul[^>]*>/i) ? 'bullet' : 'ordered';
        listItems = [];
        continue;
      }
      
      // Handle list end
       if (block.match(/<\/(ul|ol)>/i)) {
         inList = false;
         // Add list items to elements
         listItems.forEach((item, index) => {
           if (listType === 'bullet') {
             elements.push(new Paragraph({
               children: item,
               bullet: { level: 0 },
               spacing: { after: 100 }
             }));
           } else {
             // For ordered lists, add numbers manually
             const numberedRuns = [
               new TextRun({
                 text: `${index + 1}. `,
                 bold: true,
                 size: 24,
                 font: "Arial"
               }),
               ...item
             ];
             elements.push(new Paragraph({
               children: numberedRuns,
               spacing: { after: 100 }
             }));
           }
         });
         listItems = [];
         continue;
       }
      
      // Handle list items
      if (block.match(/<li[^>]*>/i)) {
        const itemText = blockElements[i + 1] || '';
        if (itemText.trim()) {
          const runs = parseInlineFormatting(itemText, primaryColor);
          if (runs.length > 0) {
            listItems.push(runs);
          }
        }
        i++; // Skip the text content
        continue;
      }
      
      // Handle paragraphs and other text
      if (!block.match(/<[^>]*>/)) {
        const cleanText = block.trim();
        if (cleanText && !inList) {
          const runs = parseInlineFormatting(cleanText, primaryColor);
          if (runs.length > 0) {
            elements.push(new Paragraph({
              children: runs,
              spacing: { after: 200 }
            }));
          }
        }
      }
    }
    
    // Add images at the end
    images.forEach(image => {
      try {
        const imageBuffer = base64ToBuffer(image.src);
        const extension = getImageExtension(image.src);
        
        elements.push(new Paragraph({
          children: [
            new ImageRun({
              data: imageBuffer,
              transformation: {
                width: Math.min(image.width, 400),
                height: Math.min(image.height, 300)
              },
              type: extension === 'png' ? 'png' : 'jpg'
            })
          ],
          alignment: AlignmentType.CENTER,
          spacing: { before: 200, after: 200 }
        }));
      } catch (error) {
        console.warn('Error processing image:', error);
        elements.push(new Paragraph({
          children: [
            new TextRun({
              text: "[Image could not be processed]",
              italics: true,
              color: "666666",
              size: 22
            })
          ],
          spacing: { after: 200 }
        }));
      }
    });
    
    // If no elements were created, return a default paragraph
    if (elements.length === 0) {
      const plainText = htmlContent.replace(/<[^>]*>/g, '').trim();
      if (plainText) {
        elements.push(new Paragraph({
          children: [
            new TextRun({
              text: decodeHtmlEntities(plainText),
              size: 24,
              font: "Arial"
            })
          ],
          spacing: { after: 200 }
        }));
      }
    }
    
    return elements;
    
  } catch (error) {
    console.warn('Error parsing HTML content:', error);
    return [
      new Paragraph({
        children: [
          new TextRun({
            text: "Content could not be processed.",
            italics: true,
            color: "666666",
            size: 24
          })
        ]
      })
    ];
  }
};

// Helper function to create team member content (for team section - no CVs)
const createTeamMemberContent = (selectedTeamMembers, allTeamMembers, primaryColor) => {
  if (!selectedTeamMembers || selectedTeamMembers.length === 0) {
    return [
      new Paragraph({
        children: [
          new TextRun({
            text: "No team members selected for this section.",
            italics: true,
            color: "666666",
            size: 24
          })
        ]
      })
    ];
  }

  const content = [];
  selectedTeamMembers.forEach((memberId, index) => {
    const member = allTeamMembers.find(tm => tm.id === memberId);
    if (!member) return;

    if (index > 0) {
      content.push(new Paragraph({ children: [new TextRun({ text: "" })] })); // Spacing
    }
    
    content.push(
      new Paragraph({
        children: [
          new TextRun({
            text: member.name,
            bold: true,
            size: 28,
            color: primaryColor.replace('#', '')
          })
        ]
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: member.position || 'Team Member',
            size: 24,
            color: "666666"
          })
        ]
      })
    );

    if (member.skills) {
      content.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `Skills: ${member.skills}`,
              size: 22,
              color: "666666"
            })
          ]
        })
      );
    }

    if (member.bio) {
      content.push(
        new Paragraph({
          children: [
            new TextRun({
              text: member.bio,
              size: 24
            })
          ],
          spacing: { after: 200 }
        })
      );
    }
  });

  return content;
};

// Helper function to create CV content (for CVs section)
const createCVContent = (selectedTeamMembers, allTeamMembers, primaryColor) => {
  if (!selectedTeamMembers || selectedTeamMembers.length === 0) {
    return [
      new Paragraph({
        children: [
          new TextRun({
            text: "No team members selected for CVs section.",
            italics: true,
            color: "666666",
            size: 24
          })
        ]
      })
    ];
  }

  const content = [];
  selectedTeamMembers.forEach((memberId, index) => {
    const member = allTeamMembers.find(tm => tm.id === memberId);
    if (!member) return;

    if (index > 0) {
      content.push(new Paragraph({ children: [new TextRun({ text: "" })] })); // Spacing
    }
    
    content.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `${member.name} - CV`,
            bold: true,
            size: 28,
            color: primaryColor.replace('#', '')
          })
        ]
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: member.position || 'Team Member',
            size: 24,
            color: "666666"
          })
        ]
      })
    );

    if (member.cv) {
      content.push(
        new Paragraph({
          children: [
            new TextRun({
              text: "Curriculum Vitae:",
              bold: true,
              size: 24,
              color: primaryColor.replace('#', '')
            })
          ],
          spacing: { before: 200 }
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: member.cv,
              size: 22
            })
          ],
          spacing: { after: 400 }
        })
      );
    } else {
      content.push(
        new Paragraph({
          children: [
            new TextRun({
              text: "CV content not available",
              italics: true,
              size: 22,
              color: "666666"
            })
          ],
          spacing: { after: 400 }
        })
      );
    }
  });

  return content;
};

// Helper function to create services content
const createServicesContent = (services, primaryColor, accentColor) => {
  if (!services || services.length === 0) {
    return [
      new Paragraph({
        children: [
          new TextRun({
            text: "No services added yet. Add services in the Content Manager.",
            italics: true,
            color: "666666",
            size: 24
          })
        ]
      })
    ];
  }

  const content = [];
  services.forEach((service, index) => {
    if (index > 0) {
      content.push(new Paragraph({ children: [new TextRun({ text: "" })] })); // Spacing
    }
    
    content.push(
      new Paragraph({
        children: [
          new TextRun({
            text: service.name,
            bold: true,
            size: 28,
            color: primaryColor.replace('#', '')
          })
        ]
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: service.description,
            size: 24,
            color: "666666"
          })
        ]
      })
    );

    if (service.price) {
      content.push(
        new Paragraph({
          children: [
            new TextRun({
              text: service.price,
              bold: true,
              size: 26,
              color: accentColor.replace('#', '')
            })
          ]
        })
      );
    }

    if (service.duration) {
      content.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `Duration: ${service.duration}`,
              size: 24,
              color: "666666"
            })
          ],
          spacing: { after: 200 }
        })
      );
    }
  });

  return content;
};

// Helper function to create case studies content
const createCaseStudiesContent = (caseStudies, primaryColor) => {
  if (!caseStudies || caseStudies.length === 0) {
    return [
      new Paragraph({
        children: [
          new TextRun({
            text: "No case studies added yet. Add case studies in the Content Manager.",
            italics: true,
            color: "666666",
            size: 24
          })
        ]
      })
    ];
  }

  const content = [];
  caseStudies.forEach((caseStudy, index) => {
    if (index > 0) {
      content.push(new Paragraph({ children: [new TextRun({ text: "" })] })); // Spacing
    }
    
    content.push(
      new Paragraph({
        children: [
          new TextRun({
            text: caseStudy.title,
            bold: true,
            size: 28,
            color: primaryColor.replace('#', '')
          })
        ]
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: `Client: ${caseStudy.client}`,
            italics: true,
            size: 24,
            color: "666666"
          })
        ]
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: caseStudy.description,
            size: 24
          })
        ]
      })
    );

    if (caseStudy.results) {
      content.push(
        new Paragraph({
          children: [
            new TextRun({
              text: "Results:",
              bold: true,
              size: 24
            })
          ]
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: caseStudy.results,
              size: 24
            })
          ],
          spacing: { after: 200 }
        })
      );
    }
  });

  return content;
};

export const exportToDocx = async (proposal, branding = {}) => {
  try {
    // Validate input
    if (!proposal || !proposal.name) {
      throw new Error('Invalid proposal data');
    }

    // Get dynamic data from Redux store
    const state = window.__REDUX_STORE__?.getState();
    const services = state?.services?.services || [];
    const teamMembers = state?.teamMembers?.teamMembers || [];
    const caseStudies = state?.caseStudies?.caseStudies || [];
    const currentBranding = state?.branding?.currentBranding || {};

    // Merge branding data (proposal branding takes precedence)
    const finalBranding = { ...currentBranding, ...branding };

    // Extract branding colors with validation
    const primaryColor = (finalBranding?.colors?.primary && finalBranding.colors.primary.match(/^#[0-9A-F]{6}$/i)) 
      ? finalBranding.colors.primary : '#007bff';
    const secondaryColor = (finalBranding?.colors?.secondary && finalBranding.colors.secondary.match(/^#[0-9A-F]{6}$/i)) 
      ? finalBranding.colors.secondary : '#6c757d';
    const accentColor = (finalBranding?.colors?.accent && finalBranding.colors.accent.match(/^#[0-9A-F]{6}$/i)) 
      ? finalBranding.colors.accent : '#28a745';
    const fontFamily = finalBranding?.fonts?.primary || 'Arial';

    // Convert colors for docx
    const primaryRgb = hexToRgb(primaryColor);
    const secondaryRgb = hexToRgb(secondaryColor);

    // Validate and sort sections by order
    const proposalSections = proposal.sections || [];
    const sortedSections = proposalSections
      .filter(section => section && typeof section === 'object' && section.title)
      .sort((a, b) => (a.order || 0) - (b.order || 0));

    // Create document sections
    const children = [];

    // Create Title Page (First Page) - No headers/footers
    const titlePageChildren = [];

    // Add logo if available
    if (finalBranding?.logo) {
      try {
        const logoBuffer = await base64ToBuffer(finalBranding.logo);
        
        if (logoBuffer) {
          // Get original image dimensions with timeout and fallback
          let imageDimensions;
          try {
            imageDimensions = await Promise.race([
              getImageDimensions(finalBranding.logo),
              new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
            ]);
          } catch (error) {
            console.warn('Could not get image dimensions, using fallback:', error);
            imageDimensions = { width: 150, height: 150 };
          }
          
          // Define container size (like a 150x150 box)
          const containerWidth = 150;
          const containerHeight = 150;
          
          // Calculate contained dimensions (resizeMode: contain)
          const containedDimensions = calculateContainedDimensions(
            imageDimensions.width,
            imageDimensions.height,
            containerWidth,
            containerHeight
          );
          
          // Ensure dimensions are valid numbers
          const finalWidth = Math.max(50, Math.min(300, containedDimensions.width));
          const finalHeight = Math.max(50, Math.min(300, containedDimensions.height));
          
          const logoImageRun = new ImageRun({
            data: logoBuffer,
            transformation: {
              width: finalWidth,
              height: finalHeight,
            },
          });
          
          titlePageChildren.push(
            new Paragraph({
              children: [logoImageRun],
              alignment: AlignmentType.CENTER,
              spacing: { after: 600 }
            })
          );
        }
      } catch (error) {
        console.warn('Could not process logo image:', error);
        // Continue without logo instead of failing
      }
    }

    // Add proposal title
    titlePageChildren.push(
      new Paragraph({
        children: [
          new TextRun({
            text: proposal.name,
            bold: true,
            size: 72, // 36pt
            color: primaryColor.replace('#', ''),
            font: fontFamily
          })
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 }
      })
    );

    // Add subtitle
    titlePageChildren.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "Professional Business Proposal",
            size: 36, // 18pt
            color: secondaryColor.replace('#', ''),
            font: fontFamily
          })
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 800 }
      })
    );

    // Add selected client name if available
    if (proposal.clientName) {
      titlePageChildren.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `Prepared for: ${proposal.clientName}`,
              size: 32,
              color: primaryColor.replace('#', ''),
              font: fontFamily
            })
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 }
        })
      );
    }

    // Add company name and date
    titlePageChildren.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `Prepared by: ${finalBranding?.companyName || 'Your Company Name'}`,
            bold: true,
            size: 28,
            color: primaryColor.replace('#', ''),
            font: fontFamily
          })
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 }
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: `Date: ${new Date().toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}`,
            size: 24,
            color: secondaryColor.replace('#', ''),
            font: fontFamily
          })
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 }
      })
    );

    // Create Table of Contents Page
    const tocChildren = [];
    
    tocChildren.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "Table of Contents",
            bold: true,
            size: 48,
            color: "FFFFFF"
          })
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
        shading: {
          type: ShadingType.SOLID,
          color: primaryColor.replace('#', '')
        }
      })
    );

    sortedSections.forEach((section, index) => {
      tocChildren.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${index + 1}. ${section.title}`,
              size: 28,
              color: primaryColor.replace('#', ''),
              font: fontFamily
            })
          ],
          spacing: { after: 200 }
        })
      );
    });

    // Create Content Pages
    const contentChildren = [];

    // Proposal Sections
    sortedSections.forEach((section, sectionIndex) => {
      // Handle page break sections differently - no title, just page break
      if (section.type === 'page-break') {
        contentChildren.push(new PageBreak());
        return; // Skip to next section
      }

      // Section Title (for all non-page-break sections)
      contentChildren.push(
        new Paragraph({
          children: [
            new TextRun({
              text: section.title,
              bold: true,
              size: 48,
              color: primaryColor.replace('#', ''),
              font: fontFamily
            })
          ],
          heading: HeadingLevel.HEADING_1,
          spacing: { after: 400 }
        })
      );

      // Section Content based on type
      let sectionContent = [];
      
      switch (section.type) {

        case 'team':
          sectionContent = [
            ...parseHtmlContent(section.content, primaryColor),
            ...createTeamMemberContent(section.selectedTeamMembers || [], teamMembers, primaryColor)
          ];
          break;

        case 'cvs':
          sectionContent = [
            ...parseHtmlContent(section.content, primaryColor),
            ...createCVContent(section.selectedTeamMembers || [], teamMembers, primaryColor)
          ];
          break;

        case 'services':
        case 'scope':
          sectionContent = [
            ...parseHtmlContent(section.content, primaryColor),
            ...createServicesContent(services, primaryColor, accentColor)
          ];
          break;

        case 'case-study':
        case 'case-studies':
        case 'experience':
          sectionContent = [
            ...parseHtmlContent(section.content, primaryColor),
            ...createCaseStudiesContent(caseStudies, primaryColor)
          ];
          break;

        default:
          sectionContent = parseHtmlContent(section.content, primaryColor);
          if (sectionContent.length === 0) {
            sectionContent = [
              new Paragraph({
                children: [
                  new TextRun({
                    text: "No content added yet.",
                    italics: true,
                    color: "666666",
                    size: 24
                  })
                ]
              })
            ];
          }
          break;
      }

      contentChildren.push(...sectionContent);

      // Add page break between sections (except for the last one and page-break sections)
      if (sectionIndex < sortedSections.length - 1 && section.type !== 'page-break') {
        contentChildren.push(new PageBreak());
      }
    });

    // Add footer if available
    if (finalBranding?.footerText) {
      contentChildren.push(
        new Paragraph({
          children: [
            new TextRun({
              text: finalBranding.footerText,
              size: 24,
              color: secondaryColor.replace('#', ''),
              font: fontFamily
            })
          ],
          alignment: AlignmentType.CENTER,
          spacing: { before: 800 }
        })
      );
    }

    // Create watermark header if available
    let watermarkHeader = null;
    // if (finalBranding?.watermark) {
    //   try {
    //     const watermarkBuffer = await base64ToBuffer(finalBranding.watermark);
        
    //     if (watermarkBuffer) {
    //       const watermarkImageRun = new ImageRun({
    //         data: watermarkBuffer,
    //         transformation: {
    //           width: 600,  // Larger size for better coverage
    //           height: 450, // Maintain aspect ratio
    //         },
    //         floating: {
    //           horizontalPosition: {
    //             align: HorizontalPositionAlign.CENTER,
    //           },
    //           verticalPosition: {
    //             align: VerticalPositionAlign.CENTER,
    //           },
    //           wrap: {
    //             type: TextWrappingType.BEHIND_TEXT,
    //           },
    //           margins: {
    //             top: 0,
    //             bottom: 0,
    //             left: 0,
    //             right: 0,
    //           },
    //           // Add properties for better watermark behavior
    //           allowOverlap: true,
    //           lockAnchor: true,
    //         },
    //       });
          
    //       watermarkHeader = {
    //         default: new Header({
    //           children: [
    //             new Paragraph({
    //               children: [watermarkImageRun],
    //               alignment: AlignmentType.CENTER,
    //             })
    //           ],
    //         }),
    //       };
    //     }
    //   } catch (error) {
    //     console.warn('Could not process watermark image:', error);
    //   }
    // }

    // Create the document with separate sections
    const sections = [
      // Title Page Section (no headers/footers)
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(1),
              right: convertInchesToTwip(1),
              bottom: convertInchesToTwip(1),
              left: convertInchesToTwip(1)
            },
            pageBreakBefore: false
          }
        },
        children: titlePageChildren
      },
      // Table of Contents Section
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(1),
              right: convertInchesToTwip(1),
              bottom: convertInchesToTwip(1),
              left: convertInchesToTwip(1)
            },
            pageBreakBefore: true
          }
        },
        // headers: watermarkHeader,
        children: tocChildren
      },
      // Content Section
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(1),
              right: convertInchesToTwip(1),
              bottom: convertInchesToTwip(1),
              left: convertInchesToTwip(1)
            },
            pageBreakBefore: true
          }
        },
        // headers: watermarkHeader,
        children: contentChildren
      }
    ];

    // Validate sections before creating document
    if (!sections || sections.length === 0) {
      throw new Error('No valid sections found for document creation');
    }

    const doc = new Document({
      sections: sections
    });

    // Generate and save the document with timeout
    let buffer;
    try {
      buffer = await Promise.race([
        Packer.toBlob(doc),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Document generation timeout')), 30000)
        )
      ]);
    } catch (packError) {
      console.error('Document packing failed:', packError);
      throw new Error(`Failed to generate document: ${packError.message}`);
    }

    if (!buffer) {
      throw new Error('Failed to generate document buffer');
    }

    // Validate filename
    const safeName = (proposal.name || 'proposal')
      .replace(/[^a-z0-9\s\-_]/gi, '')
      .replace(/\s+/g, '_')
      .toLowerCase();
    const fileName = `${safeName}.docx`;

    try {
      saveAs(buffer, fileName);
    } catch (saveError) {
      console.error('File save failed:', saveError);
      throw new Error(`Failed to save document: ${saveError.message}`);
    }

    return true;
  } catch (error) {
    console.error('DOCX export failed:', error);
    
    // Provide more specific error messages
    let errorMessage = 'DOCX export failed';
    if (error.message.includes('timeout')) {
      errorMessage = 'Export timed out. Please try again with a smaller document.';
    } else if (error.message.includes('Invalid proposal')) {
      errorMessage = 'Invalid proposal data. Please check your proposal content.';
    } else if (error.message.includes('sections')) {
      errorMessage = 'No valid sections found. Please add content to your proposal.';
    } else {
      errorMessage = `Export failed: ${error.message}`;
    }
    
    alert(errorMessage);
    throw error;
  }
};