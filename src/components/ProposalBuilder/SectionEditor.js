import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { FiSave, FiType, FiFileText, FiUsers, FiBriefcase, FiTable, FiStar, FiMinus } from 'react-icons/fi';
import { useSelector } from 'react-redux';

const EditorContainer = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const EditorHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e0e0e0;
`;

const EditorTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: #333;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const SaveButton = styled.button`
  padding: 8px 16px;
  border: none;
  background: #007bff;
  color: white;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;

  &:hover {
    background: #0056b3;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;
  font-size: 14px;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s ease;

  &:focus {
    border-color: #007bff;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 14px;
  outline: none;
  background: white;
  transition: border-color 0.2s ease;

  &:focus {
    border-color: #007bff;
  }
`;

const QuillContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 400px;
  max-height: 400px;
  
  .ql-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    height: 100%;
  }
  
  .ql-editor {
    flex: 1;
    min-height: 300px;
    max-height: 350px;
    overflow-y: auto;
    word-wrap: break-word;
    word-break: break-word;
    white-space: pre-wrap;
    line-height: 1.6;
  }
  
  .ql-toolbar {
    border-bottom: 1px solid #e0e0e0;
    flex-shrink: 0;
  }
`;

const SelectorContainer = styled.div`
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 20px;
  background: #f8f9fa;
  margin-bottom: 20px;
`;

const SelectorTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ItemGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
`;

const ItemCard = styled.div`
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #007bff;
    background: #f0f8ff;
  }
  
  &.selected {
    border-color: #007bff;
    background: #e3f2fd;
  }
`;

const ItemTitle = styled.div`
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
`;

const ItemSubtitle = styled.div`
  font-size: 12px;
  color: #666;
  margin-bottom: 8px;
`;

const ItemPreview = styled.div`
  font-size: 12px;
  color: #666;
  line-height: 1.4;
  max-height: 60px;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const TableToolbar = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 4px;
`;

const TableButton = styled.button`
  padding: 6px 12px;
  border: 1px solid #007bff;
  background: white;
  color: #007bff;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #007bff;
    color: white;
  }
`;

const ClientInfoContainer = styled.div`
  background: #e8f4fd;
  border: 1px solid #b3d9ff;
  border-radius: 4px;
  padding: 16px;
  margin-bottom: 20px;
`;

const ClientInfoTitle = styled.h4`
  font-size: 14px;
  font-weight: 600;
  color: #0056b3;
  margin-bottom: 12px;
`;

const ClientInfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
`;

const ClientInfoItem = styled.div`
  font-size: 12px;
  color: #333;
  
  .label {
    font-weight: 500;
    color: #0056b3;
  }
  
  .value {
    margin-top: 2px;
  }
`;

const SectionEditor = ({ section, onUpdate }) => {
  const [title, setTitle] = useState(section.title);
  const [type, setType] = useState(section.type);
  const [content, setContent] = useState(section.content);
  const [selectedCoverId, setSelectedCoverId] = useState(null);
  const [selectedTeamMembers, setSelectedTeamMembers] = useState([]);
  const [selectedCaseStudies, setSelectedCaseStudies] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [hasChanges, setHasChanges] = useState(false);
  
  const covers = useSelector(state => state.covers.covers);
  const teamMembers = useSelector(state => state.teamMembers.teamMembers);
  const caseStudies = useSelector(state => state.caseStudies.caseStudies);
  const services = useSelector(state => state.services.services);
  const clients = useSelector(state => state.clients.clients);
  const currentProposal = useSelector(state => state.proposals.currentProposal);

  useEffect(() => {
    setTitle(section.title);
    setType(section.type);
    setContent(section.content);
    setHasChanges(false);
    
    // Load section-specific data
    if (section.selectedTeamMembers) {
      setSelectedTeamMembers(section.selectedTeamMembers);
    }
    if (section.selectedCaseStudies) {
      setSelectedCaseStudies(section.selectedCaseStudies);
    }
    if (section.selectedServices) {
      setSelectedServices(section.selectedServices);
    }
    if (section.selectedCoverId) {
      setSelectedCoverId(section.selectedCoverId);
    }
    
    // If this is a cover letter section, try to find the selected cover
    if (section.type === 'cover' && section.content) {
      const matchingCover = covers.find(cover => cover.content === section.content);
      if (matchingCover) {
        setSelectedCoverId(matchingCover.id);
      }
    }
  }, [section, covers]);

  const handleSave = () => {
    onUpdate({
      ...section,
      title,
      type,
      content,
      selectedTeamMembers,
      selectedCaseStudies,
      selectedServices,
      selectedCoverId
    });
    setHasChanges(false);
  };

  const insertTable = (rows = 3, cols = 3) => {
    let tableHTML = '<table style="width: 100%; border-collapse: collapse; margin: 16px 0;">';
    tableHTML += '<thead><tr>';
    for (let j = 0; j < cols; j++) {
      tableHTML += '<th style="border: 1px solid #ddd; padding: 8px; background: #f5f5f5;">Header ' + (j + 1) + '</th>';
    }
    tableHTML += '</tr></thead><tbody>';
    
    for (let i = 0; i < rows; i++) {
      tableHTML += '<tr>';
      for (let j = 0; j < cols; j++) {
        tableHTML += '<td style="border: 1px solid #ddd; padding: 8px;">Cell ' + (i + 1) + ',' + (j + 1) + '</td>';
      }
      tableHTML += '</tr>';
    }
    tableHTML += '</tbody></table>';
    
    setContent(content + tableHTML);
    setHasChanges(true);
  };

  const getCurrentClient = () => {
    if (!currentProposal?.clientId) return null;
    return clients.find(client => client.id === currentProposal.clientId);
  };

  const generateTeamContent = () => {
    if (selectedTeamMembers.length === 0) return '';
    
    let teamContent = '<h3>Our Team</h3>';
    selectedTeamMembers.forEach(memberId => {
      const member = teamMembers.find(tm => tm.id === memberId);
      if (member) {
        teamContent += `
          <div style="margin-bottom: 24px; padding: 16px; border: 1px solid #e0e0e0; border-radius: 4px;">
            <h4>${member.name}</h4>
            <p><strong>Position:</strong> ${member.position || 'Team Member'}</p>
            <p><strong>Experience:</strong> ${member.experience || 'Not specified'}</p>
            <p><strong>Skills:</strong> ${member.skills || 'Not specified'}</p>
            ${member.bio ? `<p><strong>Bio:</strong> ${member.bio}</p>` : ''}
          </div>
        `;
      }
    });
    return teamContent;
  };

  const generateCVContent = () => {
    if (selectedTeamMembers.length === 0) return '';
    
    let cvContent = '<h3>Team CVs</h3>';
    selectedTeamMembers.forEach(memberId => {
      const member = teamMembers.find(tm => tm.id === memberId);
      if (member) {
        cvContent += `
          <div style="margin-bottom: 32px; padding: 20px; border: 1px solid #e0e0e0; border-radius: 4px;">
            <h4>${member.name} - CV</h4>
            <p><strong>Position:</strong> ${member.position || 'Team Member'}</p>
            <div style="margin-top: 16px;">
              <strong>Curriculum Vitae:</strong>
              <div style="margin-top: 8px; padding: 12px; background-color: #f9f9f9; border-radius: 4px;">
                ${member.cv || 'CV content not available'}
              </div>
            </div>
          </div>
        `;
      }
    });
    return cvContent;
  };

  const generateCaseStudyContent = () => {
    if (selectedCaseStudies.length === 0) return '';
    
    let caseStudyContent = '<h3>Case Studies</h3>';
    selectedCaseStudies.forEach(caseStudyId => {
      const caseStudy = caseStudies.find(cs => cs.id === caseStudyId);
      if (caseStudy) {
        caseStudyContent += `
          <div style="margin-bottom: 24px; padding: 16px; border: 1px solid #e0e0e0; border-radius: 4px;">
            <h4>${caseStudy.title}</h4>
            <p><strong>Client:</strong> ${caseStudy.client || 'Not specified'}</p>
            <p><strong>Duration:</strong> ${caseStudy.duration || 'Not specified'}</p>
            <div>${caseStudy.description || 'No description available'}</div>
          </div>
        `;
      }
    });
    return caseStudyContent;
  };

  const generateServiceContent = () => {
    if (selectedServices.length === 0) return '';
    
    let serviceContent = '<h3>Our Services</h3>';
    selectedServices.forEach(serviceId => {
      const service = services.find(s => s.id === serviceId);
      if (service) {
        serviceContent += `
          <div style="margin-bottom: 24px; padding: 16px; border: 1px solid #e0e0e0; border-radius: 4px;">
            <h4>${service.name}</h4>
            <p><strong>Category:</strong> ${service.category || 'Not specified'}</p>
            <p><strong>Price:</strong> ${service.price || 'Contact for pricing'}</p>
            <p><strong>Duration:</strong> ${service.duration || 'Not specified'}</p>
            <div style="margin-top: 12px;">${service.description || 'No description available'}</div>
            ${service.deliverables && service.deliverables.length > 0 ? `
              <div style="margin-top: 12px;">
                <strong>Deliverables:</strong>
                <ul style="margin-top: 8px; padding-left: 20px;">
                  ${service.deliverables.map(deliverable => `<li>${deliverable}</li>`).join('')}
                </ul>
              </div>
            ` : ''}
            ${service.features && service.features.length > 0 ? `
              <div style="margin-top: 12px;">
                <strong>Key Features:</strong>
                <ul style="margin-top: 8px; padding-left: 20px;">
                  ${service.features.map(feature => `<li>${feature}</li>`).join('')}
                </ul>
              </div>
            ` : ''}
          </div>
        `;
      }
    });
    return serviceContent;
  };

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
    setHasChanges(true);
  };

  const handleTypeChange = (e) => {
    setType(e.target.value);
    setHasChanges(true);
  };

  const handleContentChange = (value) => {
    setContent(value);
    setHasChanges(true);
  };

  const handleCoverLetterSelect = (cover) => {
    setSelectedCoverId(cover.id);
    setContent(cover.content);
    setHasChanges(true);
  };

  const stripHtmlTags = (html) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  const sectionTypes = [
    { value: 'cover', label: 'Cover Letter' },
    { value: 'scope', label: 'Scope of Work' },
    { value: 'fees', label: 'Fees & Timeline' },
    { value: 'team', label: 'Our Team' },
    { value: 'cvs', label: 'Team CVs' },
    { value: 'case-study', label: 'Case Study' },
    { value: 'services', label: 'Services' },
    { value: 'testimonials', label: 'Testimonials' },
    // { value: 'page-break', label: 'Page Break' },
    { value: 'custom', label: 'Custom Section' }
  ];

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'align': [] }],
      ['link', 'image'],
      [{ 'color': [] }, { 'background': [] }],
      ['clean']
    ]
  };

  const quillFormats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'indent', 'align',
    'link', 'image', 'color', 'background'
  ];

  const currentClient = getCurrentClient();

  return (
    <EditorContainer>
      <EditorHeader>
        <EditorTitle>
          <FiType size={20} />
          Edit Section
        </EditorTitle>
        <SaveButton onClick={handleSave} disabled={!hasChanges}>
          <FiSave size={14} />
          {hasChanges ? 'Save Changes' : 'Saved'}
        </SaveButton>
      </EditorHeader>

      {/* Client Information Display */}
      {currentClient && (
        <ClientInfoContainer>
          <ClientInfoTitle>Client Information</ClientInfoTitle>
          <ClientInfoGrid>
            <ClientInfoItem>
              <div className="label">Company:</div>
              <div className="value">{currentClient.company}</div>
            </ClientInfoItem>
            <ClientInfoItem>
              <div className="label">Contact:</div>
              <div className="value">{currentClient.name}</div>
            </ClientInfoItem>
            <ClientInfoItem>
              <div className="label">Email:</div>
              <div className="value">{currentClient.email}</div>
            </ClientInfoItem>
            <ClientInfoItem>
              <div className="label">Phone:</div>
              <div className="value">{currentClient.phone}</div>
            </ClientInfoItem>
          </ClientInfoGrid>
        </ClientInfoContainer>
      )}

      <FormGroup>
        <Label>Section Title</Label>
        <Input
          type="text"
          value={title}
          onChange={handleTitleChange}
          placeholder="Enter section title"
        />
      </FormGroup>

      <FormGroup>
        <Label>Section Type</Label>
        <Select value={type} onChange={handleTypeChange}>
          {sectionTypes.map(sectionType => (
            <option key={sectionType.value} value={sectionType.value}>
              {sectionType.label}
            </option>
          ))}
        </Select>
      </FormGroup>

      {/* Cover Letter Selection */}
      {type === 'cover' && (
        <SelectorContainer>
          <SelectorTitle>
            <FiFileText />
            Select Cover Letter Template
          </SelectorTitle>
          <ItemGrid>
            {covers.map(cover => (
              <ItemCard
                key={cover.id}
                className={selectedCoverId === cover.id ? 'selected' : ''}
                onClick={() => handleCoverLetterSelect(cover)}
              >
                <ItemTitle>{cover.title}</ItemTitle>
                <ItemSubtitle>Template</ItemSubtitle>
                <ItemPreview>{stripHtmlTags(cover.content).substring(0, 100)}...</ItemPreview>
              </ItemCard>
            ))}
          </ItemGrid>
        </SelectorContainer>
      )}

      {/* Team Member Selection */}
      {(type === 'team' || type === 'cvs') && (
        <SelectorContainer>
          <SelectorTitle>
            <FiUsers />
            Select Team Members
          </SelectorTitle>
          <ItemGrid>
            {teamMembers.map(member => (
              <ItemCard
                key={member.id}
                className={selectedTeamMembers.includes(member.id) ? 'selected' : ''}
                onClick={() => {
                  const newSelection = selectedTeamMembers.includes(member.id)
                    ? selectedTeamMembers.filter(id => id !== member.id)
                    : [...selectedTeamMembers, member.id];
                  setSelectedTeamMembers(newSelection);
                  setHasChanges(true);
                }}
              >
                <ItemTitle>{member.name}</ItemTitle>
                <ItemSubtitle>{member.position || 'Team Member'}</ItemSubtitle>
                <ItemPreview>{member.experience || 'Experience not specified'}</ItemPreview>
              </ItemCard>
            ))}
          </ItemGrid>
          {selectedTeamMembers.length > 0 && (
            <TableButton onClick={() => {
              const contentToInsert = type === 'cvs' ? generateCVContent() : generateTeamContent();
              setContent(content + contentToInsert);
              setHasChanges(true);
            }}>
              {type === 'cvs' ? 'Insert Selected Team CVs' : 'Insert Selected Team Members'}
            </TableButton>
          )}
        </SelectorContainer>
      )}

      {/* Case Study Selection */}
      {type === 'case-study' && (
        <SelectorContainer>
          <SelectorTitle>
            <FiBriefcase />
            Select Case Studies
          </SelectorTitle>
          <ItemGrid>
            {caseStudies.map(caseStudy => (
              <ItemCard
                key={caseStudy.id}
                className={selectedCaseStudies.includes(caseStudy.id) ? 'selected' : ''}
                onClick={() => {
                  const newSelection = selectedCaseStudies.includes(caseStudy.id)
                    ? selectedCaseStudies.filter(id => id !== caseStudy.id)
                    : [...selectedCaseStudies, caseStudy.id];
                  setSelectedCaseStudies(newSelection);
                  setHasChanges(true);
                }}
              >
                <ItemTitle>{caseStudy.title}</ItemTitle>
                <ItemSubtitle>{caseStudy.client || 'Client not specified'}</ItemSubtitle>
                <ItemPreview>{stripHtmlTags(caseStudy.description || '').substring(0, 100)}...</ItemPreview>
              </ItemCard>
            ))}
          </ItemGrid>
          {selectedCaseStudies.length > 0 && (
            <TableButton onClick={() => {
              const caseStudyContent = generateCaseStudyContent();
              setContent(content + caseStudyContent);
              setHasChanges(true);
            }}>
              Insert Selected Case Studies
            </TableButton>
          )}
        </SelectorContainer>
      )}

      {/* Service Selection */}
      {type === 'services' && (
        <SelectorContainer>
          <SelectorTitle>
            <FiStar />
            Select Services
          </SelectorTitle>
          <ItemGrid>
            {services.map(service => (
              <ItemCard
                key={service.id}
                className={selectedServices.includes(service.id) ? 'selected' : ''}
                onClick={() => {
                  const newSelection = selectedServices.includes(service.id)
                    ? selectedServices.filter(id => id !== service.id)
                    : [...selectedServices, service.id];
                  setSelectedServices(newSelection);
                  setHasChanges(true);
                }}
              >
                <ItemTitle>{service.name}</ItemTitle>
                <ItemSubtitle>{service.category || 'Service'}</ItemSubtitle>
                <ItemPreview>{stripHtmlTags(service.description || '').substring(0, 100)}...</ItemPreview>
              </ItemCard>
            ))}
          </ItemGrid>
          {selectedServices.length > 0 && (
            <TableButton onClick={() => {
              const serviceContent = generateServiceContent();
              setContent(content + serviceContent);
              setHasChanges(true);
            }}>
              Insert Selected Services
            </TableButton>
          )}
        </SelectorContainer>
      )}

      {/* Page Break Section */}
      {type === 'page-break' && (
        <SelectorContainer>
          <SelectorTitle>
            <FiMinus />
            Page Break
          </SelectorTitle>
          <div style={{ 
            padding: '20px', 
            textAlign: 'center', 
            backgroundColor: '#f8f9fa', 
            border: '2px dashed #dee2e6', 
            borderRadius: '8px',
            margin: '10px 0'
          }}>
            <p style={{ margin: '0 0 15px 0', color: '#6c757d', fontSize: '14px' }}>
              This section will create a page break in your proposal when exported to PDF.
            </p>
            <TableButton onClick={() => {
              const pageBreakContent = '<div style="page-break-before: always; height: 1px; visibility: hidden;"><!-- Page Break --></div>';
              setContent(pageBreakContent);
              setHasChanges(true);
            }}>
              Insert Page Break
            </TableButton>
          </div>
        </SelectorContainer>
      )}

      {/* Table Functionality for Fees & Timeline */}
      {type === 'fees' && (
        <SelectorContainer>
          <SelectorTitle>
            <FiTable />
            Table Tools
          </SelectorTitle>
          <TableToolbar>
            <TableButton onClick={() => insertTable(3, 3)}>
              Insert 3x3 Table
            </TableButton>
            <TableButton onClick={() => insertTable(5, 4)}>
              Insert 5x4 Table
            </TableButton>
            <TableButton onClick={() => insertTable(2, 6)}>
              Insert 2x6 Table
            </TableButton>
          </TableToolbar>
        </SelectorContainer>
      )}

      {/* Content Editor - Hidden for page break sections */}
      {type !== 'page-break' && (
        <FormGroup>
          <Label>Content</Label>
          <QuillContainer>
            <ReactQuill
              theme="snow"
              value={content}
              onChange={handleContentChange}
              modules={quillModules}
              formats={quillFormats}
              placeholder="Start writing your section content..."
            />
          </QuillContainer>
        </FormGroup>
      )}
    </EditorContainer>
  );
};

export default SectionEditor;