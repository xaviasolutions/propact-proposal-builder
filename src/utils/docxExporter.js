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
  convertMillimetersToTwip
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
const base64ToBuffer = async (base64String) => {
  try {
    // Handle data URL format
    let dataUrl = base64String;
    if (!base64String.startsWith('data:')) {
      // Assume it's PNG if no data URL prefix
      dataUrl = `data:image/png;base64,${base64String}`;
    }
    
    // Use fetch to convert data URL to blob, then to array buffer
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();
    return new Uint8Array(arrayBuffer);
  } catch (error) {
    console.error('Error converting base64 to buffer:', error);
    return null;
  }
};

// Helper function to get image extension from base64 data URL
const getImageExtension = (base64String) => {
  const match = base64String.match(/^data:image\/([a-z]+);base64,/);
  return match ? match[1] : 'png';
};

// Helper function to parse HTML content and convert to docx elements
const parseHtmlContent = (htmlContent, primaryColor) => {
  if (!htmlContent) return [];
  
  // Remove HTML tags and convert to plain text with basic formatting
  const textContent = htmlContent
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<p[^>]*>/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();

  if (!textContent) return [];

  const paragraphs = textContent.split('\n').filter(p => p.trim());
  
  return paragraphs.map(text => 
    new Paragraph({
      children: [
        new TextRun({
          text: text.trim(),
          size: 24, // 12pt
          font: "Arial"
        })
      ],
      spacing: {
        after: 200
      }
    })
  );
};

// Helper function to create team member content
const createTeamMemberContent = (teamMembers, primaryColor) => {
  if (!teamMembers || teamMembers.length === 0) {
    return [
      new Paragraph({
        children: [
          new TextRun({
            text: "No team members added yet. Add team members in the Content Manager.",
            italics: true,
            color: "666666",
            size: 24
          })
        ]
      })
    ];
  }

  const content = [];
  teamMembers.forEach((member, index) => {
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
            text: member.position,
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
    // Get dynamic data from Redux store
    const state = window.__REDUX_STORE__?.getState();
    const services = state?.services?.services || [];
    const teamMembers = state?.teamMembers?.teamMembers || [];
    const caseStudies = state?.caseStudies?.caseStudies || [];
    const currentBranding = state?.branding?.currentBranding || {};

    // Merge branding data (proposal branding takes precedence)
    const finalBranding = { ...currentBranding, ...branding };

    // Extract branding colors
    const primaryColor = finalBranding?.colors?.primary || '#007bff';
    const secondaryColor = finalBranding?.colors?.secondary || '#6c757d';
    const accentColor = finalBranding?.colors?.accent || '#28a745';
    const fontFamily = finalBranding?.fonts?.primary || 'Arial';

    // Convert colors for docx
    const primaryRgb = hexToRgb(primaryColor);
    const secondaryRgb = hexToRgb(secondaryColor);

    // Sort sections by order
    const sortedSections = [...proposal.sections].sort((a, b) => a.order - b.order);

    // Create document sections
    const children = [];

    // Handle logo if available
    let logoImageRun = null;
    if (finalBranding?.logo) {
      try {
        const logoBuffer = await base64ToBuffer(finalBranding.logo);
        const logoExtension = getImageExtension(finalBranding.logo);
        
        if (logoBuffer) {
          logoImageRun = new ImageRun({
            data: logoBuffer,
            transformation: {
              width: 200,
              height: 100,
            },
          });
        }
      } catch (error) {
        console.warn('Could not process logo image:', error);
      }
    }

    // Cover Page - Add logo first if available
    if (logoImageRun) {
      children.push(
        new Paragraph({
          children: [logoImageRun],
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 }
        })
      );
    }

    children.push(
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
      }),
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

    if (branding?.headerText) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: branding.headerText,
              size: 24,
              color: secondaryColor.replace('#', ''),
              font: fontFamily
            })
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 }
        })
      );
    }

    // Add company info and date
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `Prepared by: ${branding?.footerText || 'Your Company Name'}`,
            bold: true,
            size: 28,
            color: primaryColor.replace('#', '')
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
            color: secondaryColor.replace('#', '')
          })
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 }
      }),
      new PageBreak()
    );

    // Table of Contents
    children.push(
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
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${index + 1}. ${section.title}`,
              size: 28,
              color: primaryColor.replace('#', '')
            })
          ],
          spacing: { after: 200 }
        })
      );
    });

    children.push(new PageBreak());

    // Proposal Sections
    sortedSections.forEach((section, sectionIndex) => {
      // Section Title
      children.push(
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
        case 'cvs':
          sectionContent = [
            ...parseHtmlContent(section.content, primaryColor),
            ...createTeamMemberContent(teamMembers, primaryColor)
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

      children.push(...sectionContent);

      // Add page break between sections (except for the last one)
      if (sectionIndex < sortedSections.length - 1) {
        children.push(new PageBreak());
      }
    });

    // Add footer if available
    if (branding?.footerText) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: branding.footerText,
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

    // Handle watermark if available - add as background on first page
    if (finalBranding?.watermark) {
      try {
        const watermarkBuffer = await base64ToBuffer(finalBranding.watermark);
        const watermarkExtension = getImageExtension(finalBranding.watermark);
        
        if (watermarkBuffer) {
          const watermarkImageRun = new ImageRun({
            data: watermarkBuffer,
            transformation: {
              width: 300,
              height: 200,
            },
          });
          
          // Add watermark as first element with reduced opacity effect
          children.unshift(
            new Paragraph({
              children: [watermarkImageRun],
              alignment: AlignmentType.CENTER,
              spacing: { after: 200 }
            })
          );
        }
      } catch (error) {
        console.warn('Could not process watermark image:', error);
      }
    }

    // Create the document
    const doc = new Document({
      sections: [{
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(1),
              right: convertInchesToTwip(1),
              bottom: convertInchesToTwip(1),
              left: convertInchesToTwip(1)
            }
          }
        },
        children: children
      }]
    });

    // Generate and save the document
    const buffer = await Packer.toBlob(doc);
    const fileName = `${(proposal.name || 'proposal').replace(/[^a-z0-9]/gi, '_').toLowerCase()}.docx`;
    saveAs(buffer, fileName);

    return true;
  } catch (error) {
    console.error('DOCX export failed:', error);
    alert(`DOCX export failed: ${error.message}`);
    throw error;
  }
};