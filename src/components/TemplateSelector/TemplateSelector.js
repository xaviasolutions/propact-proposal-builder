import React, { useState } from 'react';
import styled from 'styled-components';
import { FiX, FiCheck, FiPlus, FiFileText, FiUser, FiSearch, FiImage } from 'react-icons/fi';
import { useSelector, useDispatch } from 'react-redux';
import { addClient } from '../../store/slices/clientsSlice';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  max-width: 800px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e0e0e0;
`;

const ModalTitle = styled.h2`
  margin: 0;
  color: #333;
  font-size: 24px;
  font-weight: 600;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  color: #666;
  transition: all 0.2s ease;

  &:hover {
    background: #f5f5f5;
    color: #333;
  }
`;

const StepIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e0e0e0;
`;

const Step = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: ${props => props.active ? '#007bff' : props.completed ? '#28a745' : '#666'};
  font-weight: ${props => props.active ? '600' : '400'};
`;

const StepNumber = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${props => props.active ? '#007bff' : props.completed ? '#28a745' : '#e0e0e0'};
  color: ${props => props.active || props.completed ? 'white' : '#666'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
`;

const StepDivider = styled.div`
  width: 40px;
  height: 2px;
  background: ${props => props.completed ? '#28a745' : '#e0e0e0'};
`;

const SectionTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SearchContainer = styled.div`
  position: relative;
  margin-bottom: 20px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px 16px 12px 40px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  background: #f8f9fa;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #007bff;
    background: white;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
  }

  &::placeholder {
    color: #6c757d;
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
  pointer-events: none;
`;

const TemplateGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
`;

const TemplateCard = styled.div`
  background: white;
  border: 2px solid ${props => props.selected ? '#007bff' : '#e0e0e0'};
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;

  &:hover {
    border-color: ${props => props.selected ? '#007bff' : '#007bff'};
    box-shadow: 0 4px 12px rgba(0, 123, 255, 0.15);
  }
`;

const TemplateHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const TemplateName = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
`;

const SelectedBadge = styled.div`
  background: #007bff;
  color: white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
`;

const TemplatePreview = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
`;

const LogoPreview = styled.div`
  width: 32px;
  height: 32px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`;

const ColorSwatch = styled.div`
  width: 20px;
  height: 20px;
  border-radius: 4px;
  background: ${props => props.color};
  border: 1px solid #e0e0e0;
`;

const TemplateInfo = styled.div`
  font-size: 12px;
  color: #666;
`;

const DefaultTemplateCard = styled(TemplateCard)`
  border-style: dashed;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 120px;
  text-align: center;
`;

const DefaultTemplateText = styled.div`
  color: #666;
  font-size: 14px;
  margin-top: 8px;
`;

const ClientSelectionSection = styled.div`
  margin-bottom: 24px;
`;

const ClientGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
  max-height: 300px;
  overflow-y: auto;
`;

const ClientCard = styled.div`
  background: white;
  border: 2px solid ${props => props.selected ? '#007bff' : '#e0e0e0'};
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;

  &:hover {
    border-color: ${props => props.selected ? '#007bff' : '#007bff'};
    box-shadow: 0 4px 12px rgba(0, 123, 255, 0.15);
  }
`;

const ClientName = styled.h4`
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
`;

const ClientCompany = styled.div`
  font-size: 14px;
  color: #666;
  margin-bottom: 4px;
`;

const ClientEmail = styled.div`
  font-size: 12px;
  color: #888;
`;

const NewClientButton = styled.button`
  width: 100%;
  padding: 16px;
  border: 2px dashed #e0e0e0;
  background: #f8f9fa;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: #666;
  margin-bottom: 16px;

  &:hover {
    border-color: #007bff;
    background: #f0f8ff;
    color: #007bff;
  }
`;

const ClientFormModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1001;
`;

const ClientFormContent = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  font-weight: 500;
  color: #333;
  margin-bottom: 6px;
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

const TextArea = styled.textarea`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 14px;
  outline: none;
  resize: vertical;
  min-height: 80px;
  transition: border-color 0.2s ease;

  &:focus {
    border-color: #007bff;
  }
`;

const FormActions = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 20px;
`;

const CoverSelectionSection = styled.div`
  margin-bottom: 24px;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid #e0e0e0;
`;

const Button = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  ${props => props.primary ? `
    background: #007bff;
    color: white;
    
    &:hover {
      background: #0056b3;
    }
  ` : `
    background: #f8f9fa;
    color: #333;
    border: 1px solid #e0e0e0;
    
    &:hover {
      background: #e9ecef;
    }
  `}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

// Cover selection styled components
const CoverGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
`;

const CoverCard = styled.div`
  border: 2px solid ${props => props.selected ? '#007bff' : '#e0e0e0'};
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${props => props.selected ? '#f8f9fa' : 'white'};

  &:hover {
    border-color: #007bff;
    box-shadow: 0 4px 12px rgba(0, 123, 255, 0.1);
  }
`;

const CoverName = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
`;

const CoverCategory = styled.div`
  font-size: 12px;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 12px;
`;

const CoverPreview = styled.div`
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 12px;
  margin-bottom: 12px;
  min-height: 80px;
`;

const PreviewHeader = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: #007bff;
  margin-bottom: 6px;
  text-align: center;
`;

const PreviewContent = styled.div`
  font-size: 11px;
  color: #666;
  line-height: 1.3;
  max-height: 40px;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const PreviewFooter = styled.div`
  font-size: 11px;
  color: #666;
  margin-top: 6px;
  text-align: center;
  font-style: italic;
`;

const LogoIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: ${props => props.hasLogo ? '#28a745' : '#666'};
`;

const TemplateSelector = ({ isOpen, onClose, onSelect, mode = 'create' }) => {
  const dispatch = useDispatch();
  const { brandingTemplates } = useSelector(state => state.branding);
  const { clients } = useSelector(state => state.clients);
  const { covers } = useSelector(state => state.covers);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedCover, setSelectedCover] = useState(null);
  const [showClientForm, setShowClientForm] = useState(false);
  const [templateSearchTerm, setTemplateSearchTerm] = useState('');
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  const [coverSearchTerm, setCoverSearchTerm] = useState('');
  const [clientFormData, setClientFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    address: '',
    notes: ''
  });

  if (!isOpen) return null;

  // Filter templates based on search term
  const filteredTemplates = brandingTemplates.filter(template =>
    template.name.toLowerCase().includes(templateSearchTerm.toLowerCase())
  );

  // Filter clients based on search term
  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
    client.company.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(clientSearchTerm.toLowerCase())
  );

  // Filter covers based on search term
  const filteredCovers = covers.filter(cover =>
    cover.name.toLowerCase().includes(coverSearchTerm.toLowerCase()) ||
    cover.category.toLowerCase().includes(coverSearchTerm.toLowerCase()) ||
    (cover.content && cover.content.toLowerCase().includes(coverSearchTerm.toLowerCase())) ||
    (cover.header && cover.header.toLowerCase().includes(coverSearchTerm.toLowerCase())) ||
    (cover.footer && cover.footer.toLowerCase().includes(coverSearchTerm.toLowerCase()))
  );

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
  };

  const handleNextStep = () => {
    if (currentStep === 1 && selectedTemplate) {
      // Skip client and cover selection for template change mode
      if (mode === 'change') {
        handleConfirm();
      } else {
        setCurrentStep(2);
      }
    } else if (currentStep === 2 && selectedClient) {
      setCurrentStep(3);
    }
  };

  const handlePrevStep = () => {
    if (currentStep === 3) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setCurrentStep(1);
    }
  };

  const handleClientSelect = (client) => {
    setSelectedClient(client);
  };

  const handleCoverSelect = (cover) => {
    setSelectedCover(cover);
  };

  const handleNewClientSubmit = (e) => {
    e.preventDefault();
    const newClient = dispatch(addClient(clientFormData));
    setSelectedClient(newClient.payload);
    setShowClientForm(false);
    setClientFormData({
      name: '',
      company: '',
      email: '',
      phone: '',
      address: '',
      notes: ''
    });
  };

  const handleClientFormChange = (e) => {
    setClientFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleConfirm = () => {
    onSelect({
      template: selectedTemplate,
      client: selectedClient,
      cover: selectedCover
    });
    onClose();
  };

  const handleClose = () => {
    setCurrentStep(1);
    setSelectedTemplate(null);
    setSelectedClient(null);
    setSelectedCover(null);
    setShowClientForm(false);
    setTemplateSearchTerm('');
    setClientSearchTerm('');
    setCoverSearchTerm('');
    setClientFormData({
      name: '',
      company: '',
      email: '',
      phone: '',
      address: '',
      notes: ''
    });
    onClose();
  };

  const defaultTemplate = {
    id: 'default',
    name: 'Default Template',
    colors: {
      primary: '#007bff',
      secondary: '#6c757d',
      accent: '#28a745'
    },
    fonts: {
      primary: 'Arial, sans-serif',
      secondary: 'Georgia, serif'
    },
    logo: null,
    // watermark: null,
    headerText: '',
    footerText: ''
  };

  return (
    <>
      <ModalOverlay onClick={handleClose}>
        <ModalContent onClick={(e) => e.stopPropagation()}>
          <ModalHeader>
            <ModalTitle>
              {mode === 'change' ? 'Change Template' : 'Create New Proposal'}
            </ModalTitle>
            <CloseButton onClick={handleClose}>
              <FiX size={20} />
            </CloseButton>
          </ModalHeader>

          {mode !== 'change' && (
            <StepIndicator>
              <Step active={currentStep === 1} completed={currentStep > 1}>
                <StepNumber active={currentStep === 1} completed={currentStep > 1}>
                  {currentStep > 1 ? <FiCheck size={12} /> : '1'}
                </StepNumber>
                Branding Template
              </Step>
              <StepDivider completed={currentStep > 1} />
              <Step active={currentStep === 2} completed={currentStep > 2}>
                <StepNumber active={currentStep === 2} completed={currentStep > 2}>
                  {currentStep > 2 ? <FiCheck size={12} /> : '2'}
                </StepNumber>
                Select Client
              </Step>
              <StepDivider completed={currentStep > 2} />
              <Step active={currentStep === 3}>
                <StepNumber active={currentStep === 3}>
                  3
                </StepNumber>
                Cover Template (Optional)
              </Step>
            </StepIndicator>
          )}

          {currentStep === 1 && (
            <>
              <SectionTitle>Choose a Branding Template</SectionTitle>
              
              <SearchContainer>
                <SearchIcon>
                  <FiSearch size={16} />
                </SearchIcon>
                <SearchInput
                  type="text"
                  placeholder="Search templates..."
                  value={templateSearchTerm}
                  onChange={(e) => setTemplateSearchTerm(e.target.value)}
                />
              </SearchContainer>
              
              <TemplateGrid>
                {/* Default Template */}
                <DefaultTemplateCard
                  selected={selectedTemplate?.id === 'default'}
                  onClick={() => handleTemplateSelect(defaultTemplate)}
                >
                  {selectedTemplate?.id === 'default' && (
                    <SelectedBadge>
                      <FiCheck size={12} />
                    </SelectedBadge>
                  )}
                  <FiPlus size={24} color="#666" />
                  <DefaultTemplateText>
                    <strong>Default Template</strong><br />
                    Start with basic branding
                  </DefaultTemplateText>
                </DefaultTemplateCard>

                {/* Saved Templates */}
                {filteredTemplates.map(template => (
                  <TemplateCard
                    key={template.id}
                    selected={selectedTemplate?.id === template.id}
                    onClick={() => handleTemplateSelect(template)}
                  >
                    <TemplateHeader>
                      <TemplateName>{template.name}</TemplateName>
                      {selectedTemplate?.id === template.id && (
                        <SelectedBadge>
                          <FiCheck size={12} />
                        </SelectedBadge>
                      )}
                    </TemplateHeader>
                    
                    <TemplatePreview>
                      {template.logo && (
                        <LogoPreview>
                          <img src={template.logo} alt="Logo" />
                        </LogoPreview>
                      )}
                      <ColorSwatch color={template.colors?.primary || '#007bff'} />
                      <ColorSwatch color={template.colors?.secondary || '#6c757d'} />
                      <ColorSwatch color={template.colors?.accent || '#28a745'} />
                    </TemplatePreview>
                    
                    <TemplateInfo>
                      Font: {template.fonts?.primary?.split(',')[0] || 'Arial'}
                    </TemplateInfo>
                  </TemplateCard>
                ))}
              </TemplateGrid>

              {filteredTemplates.length === 0 && brandingTemplates.length > 0 && templateSearchTerm && (
                <div style={{ 
                  textAlign: 'center', 
                  color: '#666', 
                  padding: '20px',
                  background: '#f8f9fa',
                  borderRadius: '8px',
                  marginBottom: '24px'
                }}>
                  <p>No templates found matching "{templateSearchTerm}". Try a different search term.</p>
                </div>
              )}

              {brandingTemplates.length === 0 && (
                <div style={{ 
                  textAlign: 'center', 
                  color: '#666', 
                  padding: '20px',
                  background: '#f8f9fa',
                  borderRadius: '8px',
                  marginBottom: '24px'
                }}>
                  <p>No custom templates found. You can:</p>
                  <ul style={{ textAlign: 'left', display: 'inline-block' }}>
                    <li>Use the default template to get started</li>
                    <li>Create custom templates in the "Branding & Templates" tab</li>
                  </ul>
                </div>
              )}
            </>
          )}

          {currentStep === 2 && (
            <>
              <SectionTitle>
                <FiUser size={18} />
                Select a Client
              </SectionTitle>
              
              <SearchContainer>
                <SearchIcon>
                  <FiSearch size={16} />
                </SearchIcon>
                <SearchInput
                  type="text"
                  placeholder="Search clients by name, company, or email..."
                  value={clientSearchTerm}
                  onChange={(e) => setClientSearchTerm(e.target.value)}
                />
              </SearchContainer>
              
              <ClientSelectionSection>
                <NewClientButton onClick={() => setShowClientForm(true)}>
                  <FiPlus size={24} />
                  <div>Create New Client</div>
                  <div style={{ fontSize: '12px', opacity: 0.7 }}>
                    Add a new client to your database
                  </div>
                </NewClientButton>

                {filteredClients.length > 0 ? (
                  <ClientGrid>
                    {filteredClients.map(client => (
                      <ClientCard
                        key={client.id}
                        selected={selectedClient?.id === client.id}
                        onClick={() => handleClientSelect(client)}
                      >
                        {selectedClient?.id === client.id && (
                          <SelectedBadge>
                            <FiCheck size={12} />
                          </SelectedBadge>
                        )}
                        <ClientName>{client.name}</ClientName>
                        <ClientCompany>{client.company}</ClientCompany>
                        <ClientEmail>{client.email}</ClientEmail>
                      </ClientCard>
                    ))}
                  </ClientGrid>
                ) : (
                  <div style={{ 
                    textAlign: 'center', 
                    color: '#666', 
                    padding: '20px',
                    background: '#f8f9fa',
                    borderRadius: '8px',
                    marginBottom: '24px'
                  }}>
                    <p>
                      {clientSearchTerm 
                        ? `No clients found matching "${clientSearchTerm}". Try a different search term or create a new client.`
                        : 'No clients found. Create your first client to continue.'
                      }
                    </p>
                  </div>
                )}
              </ClientSelectionSection>
            </>
          )}

          {currentStep === 3 && (
            <>
              <SectionTitle>
                <FiFileText size={18} />
                Choose a Cover Template (Optional)
              </SectionTitle>
              
              <CoverSelectionSection>
                {covers.length === 0 ? (
                  <div style={{ 
                    textAlign: 'center', 
                    color: '#666', 
                    padding: '40px 20px',
                    background: '#f8f9fa',
                    borderRadius: '8px',
                    border: '2px dashed #e0e0e0'
                  }}>
                    No cover templates available. Create cover templates in the Content Manager first.
                  </div>
                ) : (
                  <>
                    <SearchContainer>
                      <SearchIcon>
                        <FiSearch size={16} />
                      </SearchIcon>
                      <SearchInput
                        type="text"
                        placeholder="Search covers by name, category, or content..."
                        value={coverSearchTerm}
                        onChange={(e) => setCoverSearchTerm(e.target.value)}
                      />
                    </SearchContainer>
                    
                    {filteredCovers.length === 0 ? (
                      <div style={{ 
                        textAlign: 'center', 
                        color: '#666', 
                        padding: '20px',
                        background: '#f8f9fa',
                        borderRadius: '8px'
                      }}>
                        No covers found matching "{coverSearchTerm}". Try a different search term.
                      </div>
                    ) : (
                      <CoverGrid>
                        {filteredCovers.map(cover => (
                          <CoverCard
                            key={cover.id}
                            selected={selectedCover?.id === cover.id}
                            onClick={() => handleCoverSelect(cover)}
                          >
                            <CoverName>{cover.name}</CoverName>
                            <CoverCategory>{cover.category}</CoverCategory>

                            <LogoIndicator hasLogo={!!cover.logo}>
                              <FiImage size={12} />
                              {cover.logo ? 'Logo included' : 'No logo'}
                            </LogoIndicator>

                            <CoverPreview>
                              {cover.header && <PreviewHeader>{cover.header}</PreviewHeader>}
                              <PreviewContent>
                                {cover.content.substring(0, 100)}
                                {cover.content.length > 100 && '...'}
                              </PreviewContent>
                              {cover.footer && <PreviewFooter>{cover.footer}</PreviewFooter>}
                            </CoverPreview>
                          </CoverCard>
                        ))}
                      </CoverGrid>
                    )}
                  </>
                )}
              </CoverSelectionSection>
            </>
          )}

          <ButtonContainer>
            <div>
              {(currentStep === 2 || currentStep === 3) && (
                <Button onClick={handlePrevStep}>
                  Back
                </Button>
              )}
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <Button onClick={handleClose}>
                Cancel
              </Button>
              {currentStep === 1 ? (
                <Button 
                  primary 
                  onClick={handleNextStep}
                  disabled={!selectedTemplate}
                >
                  {mode === 'change' ? 'Change Template' : 'Next: Select Client'}
                </Button>
              ) : currentStep === 2 ? (
                <Button 
                  primary 
                  onClick={handleNextStep}
                  disabled={!selectedClient}
                >
                  Next: Cover Template
                </Button>
              ) : (
                <Button 
                  primary 
                  onClick={handleConfirm}
                  disabled={!selectedTemplate || !selectedClient}
                >
                  Create Proposal
                </Button>
              )}
            </div>
          </ButtonContainer>
        </ModalContent>
      </ModalOverlay>



      {showClientForm && (
        <ClientFormModal onClick={() => setShowClientForm(false)}>
          <ClientFormContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>Add New Client</ModalTitle>
              <CloseButton onClick={() => setShowClientForm(false)}>
                <FiX size={20} />
              </CloseButton>
            </ModalHeader>

            <form onSubmit={handleNewClientSubmit}>
              <FormGroup>
                <Label>Client Name *</Label>
                <Input
                  type="text"
                  name="name"
                  value={clientFormData.name}
                  onChange={handleClientFormChange}
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label>Company</Label>
                <Input
                  type="text"
                  name="company"
                  value={clientFormData.company}
                  onChange={handleClientFormChange}
                />
              </FormGroup>

              <FormGroup>
                <Label>Email</Label>
                <Input
                  type="email"
                  name="email"
                  value={clientFormData.email}
                  onChange={handleClientFormChange}
                />
              </FormGroup>

              <FormGroup>
                <Label>Phone</Label>
                <Input
                  type="tel"
                  name="phone"
                  value={clientFormData.phone}
                  onChange={handleClientFormChange}
                />
              </FormGroup>

              <FormGroup>
                <Label>Address</Label>
                <TextArea
                  name="address"
                  value={clientFormData.address}
                  onChange={handleClientFormChange}
                />
              </FormGroup>

              <FormGroup>
                <Label>Notes</Label>
                <TextArea
                  name="notes"
                  value={clientFormData.notes}
                  onChange={handleClientFormChange}
                />
              </FormGroup>

              <FormActions>
                <Button type="button" onClick={() => setShowClientForm(false)}>
                  Cancel
                </Button>
                <Button type="submit" primary disabled={!clientFormData.name}>
                  Add Client
                </Button>
              </FormActions>
            </form>
          </ClientFormContent>
        </ClientFormModal>
      )}
    </>
  );
};

export default TemplateSelector;