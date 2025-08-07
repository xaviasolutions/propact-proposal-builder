import React, { useState, useCallback, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { FiSettings, FiUpload, FiSave, FiTrash2, FiCopy, FiEdit3, FiImage, FiType, FiLayout, FiDroplet, FiRotateCw, FiList } from 'react-icons/fi';
import { useDropzone } from 'react-dropzone';
import { ChromePicker } from 'react-color';
import { useSelector, useDispatch } from 'react-redux';
import { 
  addBrandingTemplate, 
  updateBrandingTemplate,
  deleteBrandingTemplate, 
  setCurrentBranding, 
  updateCurrentBranding 
} from '../../store/slices/brandingSlice';
import { updateProposal } from '../../store/slices/proposalsSlice';
import { processWatermarkImage, saveImageToLocalStorage } from '../../utils/imageProcessor';

const BrandingContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const Title = styled.h2`
  font-size: 24px;
  font-weight: 600;
  color: #333;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const TabContainer = styled.div`
  display: flex;
  border-bottom: 1px solid #e0e0e0;
  margin-bottom: 20px;
`;

const Tab = styled.button`
  padding: 12px 20px;
  border: none;
  background: ${props => props.active ? '#007bff' : 'transparent'};
  color: ${props => props.active ? 'white' : '#666'};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border-radius: 6px 6px 0 0;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    background: ${props => props.active ? '#007bff' : '#f8f9fa'};
  }
`;

const ContentArea = styled.div`
  flex: 1;
  overflow-y: auto;
`;

const TemplateGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const TemplateCard = styled.div`
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  transition: all 0.2s ease;
  cursor: pointer;

  &:hover {
    border-color: #007bff;
    box-shadow: 0 4px 12px rgba(0,123,255,0.1);
  }

  ${props => props.active && `
    border-color: #007bff;
    box-shadow: 0 4px 12px rgba(0,123,255,0.1);
  `}
`;

const TemplateHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
`;

const TemplateName = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #333;
`;

const TemplateActions = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button`
  padding: 4px 8px;
  border: 1px solid ${props => props.danger ? '#dc3545' : '#007bff'};
  background: white;
  color: ${props => props.danger ? '#dc3545' : '#007bff'};
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.danger ? '#dc3545' : '#007bff'};
    color: white;
  }
`;

const TemplatePreview = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
`;

const ColorSwatch = styled.div`
  width: 20px;
  height: 20px;
  border-radius: 4px;
  background: ${props => props.color};
  border: 1px solid #e0e0e0;
`;

const LogoPreview = styled.div`
  width: 40px;
  height: 40px;
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

const TemplateInfo = styled.div`
  font-size: 12px;
  color: #666;
`;

const EditorSection = styled.div`
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 24px;
`;

const SectionTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;
  font-size: 14px;
`;

const Input = styled.input`
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

const TextArea = styled.textarea`
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

const DropzoneArea = styled.div`
  border: 2px dashed #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${props => props.isDragActive ? '#f8f9ff' : '#fafafa'};
  border-color: ${props => props.isDragActive ? '#007bff' : '#e0e0e0'};

  &:hover {
    border-color: #007bff;
    background: #f8f9ff;
  }
`;

const ColorPickerContainer = styled.div`
  position: relative;
`;

const ColorButton = styled.button`
  width: 40px;
  height: 40px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background: ${props => props.color};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: #007bff;
  }
`;

const ColorPickerPopover = styled.div`
  position: absolute;
  top: 50px;
  left: 0;
  z-index: 100;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
`;

const SaveButton = styled.button`
  padding: 12px 20px;
  border: none;
  background: #007bff;
  color: white;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;

  &:hover {
    background: #0056b3;
  }
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: ${props => props.background || '#007bff'};
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;

  &:hover {
    opacity: 0.9;
  }
`;

const SliderContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const SliderLabel = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #666;
`;

const Slider = styled.input`
  width: 100%;
  height: 8px;
  border-radius: 4px;
  background: ${props => {
    const percentage = ((props.value - props.min) / (props.max - props.min)) * 100;
    return `linear-gradient(to right, #007bff 0%, #007bff ${percentage}%, #e0e0e0 ${percentage}%, #e0e0e0 100%)`;
  }};
  outline: none;
  -webkit-appearance: none;
  transition: all 0.1s ease;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #007bff;
    cursor: pointer;
    border: 3px solid white;
    box-shadow: 0 2px 8px rgba(0,123,255,0.3);
    transition: all 0.15s ease;
    
    &:hover {
      transform: scale(1.1);
      box-shadow: 0 4px 12px rgba(0,123,255,0.4);
    }
    
    &:active {
      transform: scale(1.05);
    }
  }

  &::-moz-range-thumb {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #007bff;
    cursor: pointer;
    border: 3px solid white;
    box-shadow: 0 2px 8px rgba(0,123,255,0.3);
    transition: all 0.15s ease;
    
    &:hover {
      transform: scale(1.1);
      box-shadow: 0 4px 12px rgba(0,123,255,0.4);
    }
    
    &:active {
      transform: scale(1.05);
    }
  }

  &:hover {
    background: linear-gradient(to right, #d0d0d0 0%, #0056b3 100%);
  }
`;

const WatermarkPreview = styled.div`
  position: relative;
  width: 100%;
  height: 120px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }
`;

const ProcessingIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #666;
  margin-top: 8px;
`;

const RemoveButton = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  border: none;
  background: rgba(220, 53, 69, 0.9);
  color: white;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(220, 53, 69, 1);
  }
`;

const BrandingTemplates = () => {
  const dispatch = useDispatch();
  const { brandingTemplates, currentBranding } = useSelector(state => state.branding);
  const { currentProposal } = useSelector(state => state.proposals);
  const [activeTab, setActiveTab] = useState('templates');
  const [showColorPicker, setShowColorPicker] = useState({});
  const [templateName, setTemplateName] = useState('');
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [isProcessingWatermark, setIsProcessingWatermark] = useState(false);
  const [localTransparency, setLocalTransparency] = useState(currentBranding.watermark?.transparency || 0.3);
  const debounceTimeoutRef = useRef(null);

  // Sync local transparency with Redux state
  useEffect(() => {
    setLocalTransparency(currentBranding.watermark?.transparency || 0.3);
  }, [currentBranding.watermark?.transparency]);

  // Cleanup debounce timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  const fontOptions = [
    'Arial, sans-serif',
    'Helvetica, sans-serif',
    'Georgia, serif',
    'Times New Roman, serif',
    'Roboto, sans-serif',
    'Open Sans, sans-serif',
    'Lato, sans-serif',
    'Montserrat, sans-serif',
    'Poppins, sans-serif',
    'Inter, sans-serif'
  ];

  const onLogoDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        dispatch(updateCurrentBranding({
          logo: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const onWatermarkDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      setIsProcessingWatermark(true);
      try {
        const reader = new FileReader();
        reader.onload = async () => {
          try {
            const originalImage = reader.result;
            const transparency = currentBranding.watermark?.transparency || 0.3;
            
            // Process the image with current transparency
            const processedImage = await processWatermarkImage(originalImage, transparency);
            
            // Save to local storage
            const storageKey = `watermark_${Date.now()}`;
            saveImageToLocalStorage(storageKey, processedImage);
            
            // Update Redux state
            dispatch(updateCurrentBranding({
              watermark: {
                ...currentBranding.watermark,
                type: 'image',
                image: originalImage,
                transparency: transparency,
                processedImage: processedImage,
                storageKey: storageKey
              }
            }));
            
            // Sync to proposal after a short delay to ensure state is updated
            setTimeout(() => {
              if (currentProposal && currentProposal.id) {
                dispatch(updateProposal({
                  id: currentProposal.id,
                  updates: {
                    branding: {
                      ...currentBranding,
                      watermark: {
                        ...currentBranding.watermark,
                        image: file,
                        transparency: currentBranding.watermark?.transparency || 0.3,
                        processedImage: processedImage,
                        storageKey: storageKey
                      }
                    }
                  }
                }));
              }
            }, 100);
          } catch (error) {
            console.error('Error processing watermark:', error);
            alert('Error processing watermark image. Please try again.');
          } finally {
            setIsProcessingWatermark(false);
          }
        };
        reader.readAsDataURL(file);
      } catch (error) {
        console.error('Error reading file:', error);
        setIsProcessingWatermark(false);
      }
    }
  }, [currentBranding.watermark, dispatch]);

  const { getRootProps: getLogoRootProps, getInputProps: getLogoInputProps, isDragActive: isLogoDragActive } = useDropzone({
    onDrop: onLogoDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.svg']
    },
    multiple: false
  });

  const { getRootProps: getWatermarkRootProps, getInputProps: getWatermarkInputProps, isDragActive: isWatermarkDragActive } = useDropzone({
    onDrop: onWatermarkDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.svg']
    },
    multiple: false
  });

  const handleColorChange = (field, color) => {
    dispatch(updateCurrentBranding({
      colors: {
        ...currentBranding.colors,
        [field]: color.hex
      }
    }));
  };

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      dispatch(updateCurrentBranding({
        [parent]: {
          ...currentBranding[parent],
          [child]: value
        }
      }));
    } else {
      dispatch(updateCurrentBranding({
        [field]: value
      }));
    }
  };

  const handleSaveTemplate = () => {
    if (!templateName.trim()) {
      alert('Please enter a template name');
      return;
    }

    if (editingTemplate) {
      // Update existing template
      const updatedTemplate = {
        ...currentBranding,
        name: templateName,
        id: editingTemplate.id,
        createdAt: editingTemplate.createdAt
      };
      
      dispatch(updateBrandingTemplate({ id: editingTemplate.id, updates: updatedTemplate }));
      setEditingTemplate(null);
      alert('Template updated successfully!');
    } else {
      // Create new template
      const template = {
        ...currentBranding,
        name: templateName,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      };

      dispatch(addBrandingTemplate(template));
      alert('Template saved successfully!');
    }
    
    setTemplateName('');
  };

  const handleLoadTemplate = (template) => {
    dispatch(setCurrentBranding(template));
    setActiveTab('editor');
  };

  const handleEditTemplate = (template) => {
    setEditingTemplate(template);
    setTemplateName(template.name);
    dispatch(setCurrentBranding(template));
    setActiveTab('editor');
  };

  const handleDeleteTemplate = (templateId) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      dispatch(deleteBrandingTemplate(templateId));
    }
  };

  const handleDuplicateTemplate = (template) => {
    const duplicated = {
      ...template,
      name: `${template.name} (Copy)`,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    dispatch(addBrandingTemplate(duplicated));
  };

  const toggleColorPicker = (field) => {
    setShowColorPicker(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const processTransparencyChange = useCallback(async (transparency) => {
    if (!currentBranding.watermark?.image) return;
    
    setIsProcessingWatermark(true);
    try {
      const processedImage = await processWatermarkImage(
        currentBranding.watermark.image, 
        transparency
      );
      
      // Save to local storage
      const storageKey = currentBranding.watermark.storageKey || `watermark_${Date.now()}`;
      saveImageToLocalStorage(storageKey, processedImage);
      
      dispatch(updateCurrentBranding({
        watermark: {
          ...currentBranding.watermark,
          transparency: transparency,
          processedImage: processedImage,
          storageKey: storageKey
        }
      }));
      
      // Sync to proposal after a short delay to ensure state is updated
      setTimeout(() => {
        if (currentProposal && currentProposal.id) {
          dispatch(updateProposal({
            id: currentProposal.id,
            updates: {
              branding: {
                ...currentBranding,
                watermark: {
                  ...currentBranding.watermark,
                  transparency: transparency,
                  processedImage: processedImage,
                  storageKey: storageKey
                }
              }
            }
          }));
        }
      }, 100);
    } catch (error) {
      console.error('Error updating transparency:', error);
      alert('Error updating transparency. Please try again.');
    } finally {
      setIsProcessingWatermark(false);
    }
  }, [currentBranding.watermark, dispatch]);

  const handleTransparencyChange = useCallback((transparency) => {
    // Update local state immediately for smooth slider movement
    setLocalTransparency(transparency);
    
    // Clear existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    // Debounce the actual processing
    debounceTimeoutRef.current = setTimeout(() => {
      processTransparencyChange(transparency);
    }, 300); // 300ms debounce
  }, [processTransparencyChange]);

  const handleRemoveWatermark = () => {
    dispatch(updateCurrentBranding({
      watermark: {
        type: 'image',
        image: null,
        text: '',
        transparency: 0.3,
        rotation: 0,
        processedImage: null,
        storageKey: null
      }
    }));
    
    // Sync to proposal after a short delay to ensure state is updated
    setTimeout(() => {
      if (currentProposal && currentProposal.id) {
        dispatch(updateProposal({
          id: currentProposal.id,
          updates: {
            branding: {
              ...currentBranding,
              watermark: {
                type: 'image',
                image: null,
                text: '',
                transparency: 0.3,
                rotation: 0,
                processedImage: null,
                storageKey: null
              }
            }
          }
        }));
      }
    }, 100);
  };



  return (
    <BrandingContainer>
      <Header>
        <Title>
          <FiSettings size={24} />
          Branding & Templates
        </Title>
      </Header>

      <TabContainer>
        <Tab 
          active={activeTab === 'templates'} 
          onClick={() => {
            setActiveTab('templates');
            setEditingTemplate(null);
            setTemplateName('');
          }}
        >
          <FiLayout size={16} />
          Templates
        </Tab>
        <Tab 
          active={activeTab === 'editor'} 
          onClick={() => {
            setActiveTab('editor');
            if (!editingTemplate) {
              setTemplateName('');
            }
          }}
        >
          <FiEdit3 size={16} />
          Brand Editor
        </Tab>
      </TabContainer>

      <ContentArea>
        {activeTab === 'templates' && (
          <div>
            <SectionTitle>
              <FiLayout size={20} />
              Saved Templates
            </SectionTitle>
            
            {brandingTemplates.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#666', padding: '40px' }}>
                No templates saved yet. Create your first branding template in the Brand Editor!
              </div>
            ) : (
              <TemplateGrid>
                {brandingTemplates.map(template => (
                  <TemplateCard 
                    key={template.id}
                    onClick={() => handleLoadTemplate(template)}
                  >
                    <TemplateHeader>
                      <TemplateName>{template.name}</TemplateName>
                      <TemplateActions>
                        <ActionButton onClick={(e) => {
                          e.stopPropagation();
                          handleEditTemplate(template);
                        }}>
                          <FiEdit3 size={12} />
                        </ActionButton>
                        <ActionButton onClick={(e) => {
                          e.stopPropagation();
                          handleDuplicateTemplate(template);
                        }}>
                          <FiCopy size={12} />
                        </ActionButton>
                        <ActionButton 
                          danger 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteTemplate(template.id);
                          }}
                        >
                          <FiTrash2 size={12} />
                        </ActionButton>
                      </TemplateActions>
                    </TemplateHeader>
                    
                    <TemplatePreview>
                      {template.logo && (
                        <LogoPreview>
                          <img src={template.logo} alt="Logo" />
                        </LogoPreview>
                      )}
                      {template.watermark?.processedImage && (
                        <LogoPreview style={{ opacity: 0.7 }}>
                          <img src={template.watermark.processedImage} alt="Watermark" />
                        </LogoPreview>
                      )}
                      <ColorSwatch color={template.colors?.primary || '#007bff'} />
                      <ColorSwatch color={template.colors?.secondary || '#6c757d'} />
                      <ColorSwatch color={template.colors?.accent || '#28a745'} />
                    </TemplatePreview>
                    
                    <TemplateInfo>
                      Font: {template.fonts?.primary || 'Arial, sans-serif'}
                      {template.watermark?.image && (
                        <div style={{ marginTop: '4px' }}>
                          Watermark: {Math.round((template.watermark.transparency || 0.3) * 100)}% opacity
                        </div>
                      )}
                    </TemplateInfo>
                  </TemplateCard>
                ))}
              </TemplateGrid>
            )}
          </div>
        )}

        {activeTab === 'editor' && (
          <div>
            <EditorSection>
              <SectionTitle>
                <FiImage size={20} />
                Logo & Images
              </SectionTitle>
              
              <FormGrid>
                <FormGroup>
                  <Label>Company Logo</Label>
                  <DropzoneArea {...getLogoRootProps()} isDragActive={isLogoDragActive}>
                    <input {...getLogoInputProps()} />
                    {currentBranding.logo ? (
                      <div>
                        <img 
                          src={currentBranding.logo} 
                          alt="Logo" 
                          style={{ maxWidth: '100px', maxHeight: '60px' }}
                        />
                        <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#666' }}>
                          Click or drag to replace
                        </p>
                      </div>
                    ) : (
                      <div>
                        <FiUpload size={24} style={{ color: '#666', marginBottom: '8px' }} />
                        <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
                          Drop logo here or click to upload
                        </p>
                      </div>
                    )}
                  </DropzoneArea>
                </FormGroup>

                <FormGroup>
                  <Label>Watermark (Optional)</Label>
                  
                  {/* Watermark Type Selection */}
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                      <button
                        type="button"
                        onClick={() => dispatch(updateCurrentBranding({
                          watermark: { ...currentBranding.watermark, type: 'image' }
                        }))}
                        style={{
                          padding: '6px 12px',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          background: currentBranding.watermark?.type === 'image' ? '#007bff' : '#fff',
                          color: currentBranding.watermark?.type === 'image' ? '#fff' : '#333',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        <FiImage size={12} style={{ marginRight: '4px' }} />
                        Image
                      </button>
                      <button
                        type="button"
                        onClick={() => dispatch(updateCurrentBranding({
                          watermark: { ...currentBranding.watermark, type: 'text' }
                        }))}
                        style={{
                          padding: '6px 12px',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          background: currentBranding.watermark?.type === 'text' ? '#007bff' : '#fff',
                          color: currentBranding.watermark?.type === 'text' ? '#fff' : '#333',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        <FiType size={12} style={{ marginRight: '4px' }} />
                        Text
                      </button>
                    </div>
                  </div>

                  {/* Image Watermark */}
                  {currentBranding.watermark?.type === 'image' && (
                    <div>
                      {!currentBranding.watermark?.image ? (
                        <DropzoneArea {...getWatermarkRootProps()} isDragActive={isWatermarkDragActive}>
                          <input {...getWatermarkInputProps()} />
                          <div>
                            <FiImage size={24} style={{ color: '#666', marginBottom: '8px' }} />
                            <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
                              Drop watermark here or click to upload
                            </p>
                          </div>
                        </DropzoneArea>
                      ) : (
                        <div>
                          <WatermarkPreview>
                            <img 
                              src={currentBranding.watermark.processedImage || currentBranding.watermark.image} 
                              alt="Watermark"
                              style={{
                                transform: `rotate(${currentBranding.watermark.rotation || 0}deg)`
                              }}
                            />
                            <RemoveButton onClick={handleRemoveWatermark}>
                              ×
                            </RemoveButton>
                          </WatermarkPreview>
                          
                          <div style={{ marginTop: '8px' }}>
                            <DropzoneArea {...getWatermarkRootProps()} isDragActive={isWatermarkDragActive}>
                              <input {...getWatermarkInputProps()} />
                              <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>
                                Click or drag to replace watermark
                              </p>
                            </DropzoneArea>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Text Watermark */}
                  {currentBranding.watermark?.type === 'text' && (
                    <div>
                      <Input
                        type="text"
                        placeholder="Enter watermark text..."
                        value={currentBranding.watermark?.text || ''}
                        onChange={(e) => {
                          const newText = e.target.value;
                          dispatch(updateCurrentBranding({
                            watermark: { ...currentBranding.watermark, text: newText }
                          }));
                          
                          // Sync to proposal after a short delay
                          setTimeout(() => {
                            if (currentProposal?.id) {
                              dispatch(updateProposal({
                                id: currentProposal.id,
                                branding: {
                                  ...currentBranding,
                                  watermark: { ...currentBranding.watermark, text: newText }
                                }
                              }));
                            }
                          }, 100);
                        }}
                        style={{ marginBottom: '12px' }}
                      />
                      
                      {currentBranding.watermark?.text && (
                        <div style={{
                          padding: '20px',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          background: '#f8f9fa',
                          textAlign: 'center',
                          marginBottom: '12px',
                          position: 'relative'
                        }}>
                          <div style={{
                            fontSize: '24px',
                            color: '#666',
                            opacity: 1 - (currentBranding.watermark?.transparency || 0.3),
                            transform: `rotate(${currentBranding.watermark?.rotation || 0}deg)`,
                            display: 'inline-block'
                          }}>
                            {currentBranding.watermark.text}
                          </div>
                          <RemoveButton onClick={handleRemoveWatermark}>
                            ×
                          </RemoveButton>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Common Controls */}
                  {((currentBranding.watermark?.type === 'image' && currentBranding.watermark?.image) || 
                    (currentBranding.watermark?.type === 'text' && currentBranding.watermark?.text)) && (
                    <div>
                      {/* Transparency Control */}
                      <SliderContainer style={{ marginBottom: '12px' }}>
                        <SliderLabel>
                          <span>
                            <FiDroplet size={14} style={{ marginRight: '4px' }} />
                            Opacity
                          </span>
                          <span>{Math.round(localTransparency * 100)}%</span>
                        </SliderLabel>
                        <Slider
                          type="range"
                          min={0.05}
                          max={0.95}
                          step="0.05"
                          value={localTransparency}
                          onChange={(e) => handleTransparencyChange(parseFloat(e.target.value))}
                          disabled={isProcessingWatermark}
                        />
                      </SliderContainer>

                      {/* Rotation Control */}
                      <SliderContainer>
                        <SliderLabel>
                          <span>
                            <FiRotateCw size={14} style={{ marginRight: '4px' }} />
                            Rotation
                          </span>
                          <span>{currentBranding.watermark?.rotation || 0}°</span>
                        </SliderLabel>
                        <Slider
                          type="range"
                          min={-180}
                          max={180}
                          step="15"
                          value={currentBranding.watermark?.rotation || 0}
                          onChange={(e) => {
                            const newRotation = parseInt(e.target.value);
                            dispatch(updateCurrentBranding({
                              watermark: { ...currentBranding.watermark, rotation: newRotation }
                            }));
                            
                            // Sync to proposal after a short delay
                            setTimeout(() => {
                              if (currentProposal?.id) {
                                dispatch(updateProposal({
                                  id: currentProposal.id,
                                  branding: {
                                    ...currentBranding,
                                    watermark: { ...currentBranding.watermark, rotation: newRotation }
                                  }
                                }));
                              }
                            }, 100);
                          }}
                        />
                      </SliderContainer>

                      {/* Remove Watermark Button */}
                      <div style={{ marginTop: '16px' }}>
                        <Button 
                          onClick={handleRemoveWatermark}
                          style={{ 
                            background: '#dc3545',
                            color: 'white',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}
                        >
                          <FiTrash2 size={14} />
                          Remove Watermark
                        </Button>
                      </div>

                      {isProcessingWatermark && (
                        <ProcessingIndicator>
                          <FiSettings size={12} style={{ animation: 'spin 1s linear infinite' }} />
                          Processing watermark...
                        </ProcessingIndicator>
                      )}
                    </div>
                  )}
                </FormGroup>
              </FormGrid>
            </EditorSection>

            <EditorSection style={{ marginTop: '20px' }}>
              <SectionTitle>
                <FiSettings size={20} />
                Color Scheme
              </SectionTitle>
              
              <div style={{ 
                marginBottom: '20px', 
                padding: '12px', 
                backgroundColor: '#f8f9fa', 
                borderRadius: '6px', 
                fontSize: '14px', 
                color: '#6c757d',
                lineHeight: '1.5'
              }}>
                <strong>Color Usage Guide:</strong>
                <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
                  <li><strong>Primary Color:</strong> Main headings and key document elements</li>
                  <li><strong>Secondary Color:</strong> Subheadings, borders, and supporting text</li>
                  <li><strong>Accent Color:</strong> Highlights, emphasis, and decorative elements</li>
                </ul>
              </div>
              
              <FormGrid>
                <FormGroup>
                  <Label>Primary Color</Label>
                  <ColorPickerContainer>
                    <ColorButton 
                      color={currentBranding.colors?.primary || '#007bff'}
                      onClick={() => toggleColorPicker('primary')}
                    />
                    {showColorPicker.primary && (
                      <ColorPickerPopover>
                        <ChromePicker
                          color={currentBranding.colors?.primary || '#007bff'}
                          onChange={(color) => handleColorChange('primary', color)}
                        />
                      </ColorPickerPopover>
                    )}
                  </ColorPickerContainer>
                </FormGroup>

                <FormGroup>
                  <Label>Secondary Color</Label>
                  <ColorPickerContainer>
                    <ColorButton 
                      color={currentBranding.colors?.secondary || '#6c757d'}
                      onClick={() => toggleColorPicker('secondary')}
                    />
                    {showColorPicker.secondary && (
                      <ColorPickerPopover>
                        <ChromePicker
                          color={currentBranding.colors?.secondary || '#6c757d'}
                          onChange={(color) => handleColorChange('secondary', color)}
                        />
                      </ColorPickerPopover>
                    )}
                  </ColorPickerContainer>
                </FormGroup>

                <FormGroup>
                  <Label>Accent Color</Label>
                  <ColorPickerContainer>
                    <ColorButton 
                      color={currentBranding.colors?.accent || '#28a745'}
                      onClick={() => toggleColorPicker('accent')}
                    />
                    {showColorPicker.accent && (
                      <ColorPickerPopover>
                        <ChromePicker
                          color={currentBranding.colors?.accent || '#28a745'}
                          onChange={(color) => handleColorChange('accent', color)}
                        />
                      </ColorPickerPopover>
                    )}
                  </ColorPickerContainer>
                </FormGroup>
              </FormGrid>
            </EditorSection>

            <EditorSection style={{ marginTop: '20px' }}>
              <SectionTitle>
                <FiType size={20} />
                Typography
              </SectionTitle>
              
              <FormGrid>
                <FormGroup>
                  <Label>Primary Font</Label>
                  <Select
                    value={currentBranding.fonts?.primary || 'Arial, sans-serif'}
                    onChange={(e) => handleInputChange('fonts.primary', e.target.value)}
                  >
                    {fontOptions.map(font => (
                      <option key={font} value={font}>
                        {font.split(',')[0]}
                      </option>
                    ))}
                  </Select>
                </FormGroup>

                <FormGroup>
                  <Label>Secondary Font</Label>
                  <Select
                    value={currentBranding.fonts?.secondary || 'Georgia, serif'}
                    onChange={(e) => handleInputChange('fonts.secondary', e.target.value)}
                  >
                    {fontOptions.map(font => (
                      <option key={font} value={font}>
                        {font.split(',')[0]}
                      </option>
                    ))}
                  </Select>
                </FormGroup>
              </FormGrid>
            </EditorSection>

            <EditorSection style={{ marginTop: '20px' }}>
              <SectionTitle>
                <FiLayout size={20} />
                Company Information
              </SectionTitle>
              
              <FormGrid>
                <FormGroup>
                  <Label>Company Name</Label>
                  <Input
                    type="text"
                    value={currentBranding.companyName || ''}
                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                    placeholder="Your Company Name"
                  />
                </FormGroup>

                <FormGroup style={{ gridColumn: '1 / -1' }}>
                  <Label>Header Text</Label>
                  <TextArea
                    value={currentBranding.headerText || ''}
                    onChange={(e) => handleInputChange('headerText', e.target.value)}
                    placeholder="Header content for proposals..."
                  />
                  
                  {/* Header Formatting Options */}
                  <div style={{ 
                    marginTop: '16px', 
                    padding: '16px', 
                    backgroundColor: '#f8f9fa', 
                    borderRadius: '8px',
                    border: '1px solid #e9ecef',
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
                    gap: '16px' 
                  }}>
                    <div>
                      <Label style={{ 
                        fontSize: '13px', 
                        fontWeight: '600', 
                        marginBottom: '8px', 
                        display: 'block',
                        color: '#495057'
                      }}>
                        Text Alignment
                      </Label>
                      <Select
                        value={currentBranding.headerAlignment || 'center'}
                        onChange={(e) => handleInputChange('headerAlignment', e.target.value)}
                        style={{ 
                          fontSize: '14px', 
                          padding: '10px 12px',
                          borderRadius: '6px',
                          border: '1px solid #ced4da',
                          backgroundColor: '#ffffff',
                          width: '100%',
                          fontFamily: 'inherit',
                          color: '#495057',
                          transition: 'border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out'
                        }}
                      >
                        <option value="left">← Left Align</option>
                        <option value="center">⬌ Center Align</option>
                        <option value="right">→ Right Align</option>
                        <option value="justify">⬌ Justify</option>
                      </Select>
                    </div>
                    
                    <div>
                      <Label style={{ 
                        fontSize: '13px', 
                        fontWeight: '600', 
                        marginBottom: '8px', 
                        display: 'block',
                        color: '#495057'
                      }}>
                        Font Size
                      </Label>
                      <Select
                        value={currentBranding.headerFontSize || '24'}
                        onChange={(e) => handleInputChange('headerFontSize', e.target.value)}
                        style={{ 
                          fontSize: '14px', 
                          padding: '10px 12px',
                          borderRadius: '6px',
                          border: '1px solid #ced4da',
                          backgroundColor: '#ffffff',
                          width: '100%',
                          fontFamily: 'inherit',
                          color: '#495057',
                          transition: 'border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out'
                        }}
                      >
                        <option value="11">11 pt</option>
                        <option value="12">12 pt</option>
                        <option value="13">13 pt</option>
                        <option value="14">14 pt</option>
                        <option value="15">15 pt</option>
                        <option value="16">16 pt</option>
                        <option value="17">17 pt</option>
                        <option value="18">18 pt</option>
                        <option value="19">19 pt</option>
                        <option value="20">20 pt</option>
                        <option value="21">21 pt</option>
                        <option value="22">22 pt</option>
                        <option value="23">23 pt</option>
                        <option value="24">24 pt</option>
                      </Select>
                    </div>
                    
                    <div>
                      <Label style={{ 
                        fontSize: '13px', 
                        fontWeight: '600', 
                        marginBottom: '8px', 
                        display: 'block',
                        color: '#495057'
                      }}>
                        Text Style
                      </Label>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '8px', 
                          fontSize: '13px',
                          color: '#495057',
                          cursor: 'pointer',
                          padding: '4px 0'
                        }}>
                          <input
                            type="checkbox"
                            checked={currentBranding.headerBold !== false}
                            onChange={(e) => handleInputChange('headerBold', e.target.checked)}
                            style={{ 
                              width: '16px', 
                              height: '16px',
                              accentColor: '#007bff'
                            }}
                          />
                          <strong>Bold</strong>
                        </label>
                        <label style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '8px', 
                          fontSize: '13px',
                          color: '#495057',
                          cursor: 'pointer',
                          padding: '4px 0'
                        }}>
                          <input
                            type="checkbox"
                            checked={currentBranding.headerItalic || false}
                            onChange={(e) => handleInputChange('headerItalic', e.target.checked)}
                            style={{ 
                              width: '16px', 
                              height: '16px',
                              accentColor: '#007bff'
                            }}
                          />
                          <em>Italic</em>
                        </label>
                        <label style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '8px', 
                          fontSize: '13px',
                          color: '#495057',
                          cursor: 'pointer',
                          padding: '4px 0'
                        }}>
                          <input
                            type="checkbox"
                            checked={currentBranding.headerUnderline || false}
                            onChange={(e) => handleInputChange('headerUnderline', e.target.checked)}
                            style={{ 
                              width: '16px', 
                              height: '16px',
                              accentColor: '#007bff'
                            }}
                          />
                          <u>Underline</u>
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  {/* Header Preview */}
                  {currentBranding.headerText && (
                    <div style={{ 
                      marginTop: '16px', 
                      padding: '12px', 
                      backgroundColor: '#f8f9fa', 
                      borderRadius: '6px',
                      border: '1px solid #e9ecef'
                    }}>
                      <Label style={{ fontSize: '12px', marginBottom: '8px', display: 'block', color: '#6c757d' }}>
                        Header Preview:
                      </Label>
                      <div style={{
                        textAlign: currentBranding.headerAlignment || 'center',
                        fontSize: `${currentBranding.headerFontSize || 24}px`,
                        fontWeight: currentBranding.headerBold !== false ? 'bold' : 'normal',
                        fontStyle: currentBranding.headerItalic ? 'italic' : 'normal',
                        textDecoration: currentBranding.headerUnderline ? 'underline' : 'none',
                        fontFamily: currentBranding.fonts?.primary || 'Arial, sans-serif',
                        color: currentBranding.colors?.primary || '#000000',
                        lineHeight: '1.2',
                        minHeight: '1.2em'
                      }}>
                        {currentBranding.headerText}
                      </div>
                    </div>
                  )}
                </FormGroup>

                <FormGroup style={{ gridColumn: '1 / -1' }}>
                  <Label>Footer Text</Label>
                  <TextArea
                    value={currentBranding.footerText || ''}
                    onChange={(e) => handleInputChange('footerText', e.target.value)}
                    placeholder="Footer content for proposals..."
                  />
                  
                  {/* Footer Formatting Options */}
                  <div style={{ 
                    marginTop: '16px', 
                    padding: '16px', 
                    backgroundColor: '#f8f9fa', 
                    borderRadius: '8px',
                    border: '1px solid #e9ecef',
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
                    gap: '16px' 
                  }}>
                    <div>
                      <Label style={{ 
                        fontSize: '13px', 
                        fontWeight: '600', 
                        marginBottom: '8px', 
                        display: 'block',
                        color: '#495057'
                      }}>
                        Text Alignment
                      </Label>
                      <Select
                        value={currentBranding.footerAlignment || 'center'}
                        onChange={(e) => handleInputChange('footerAlignment', e.target.value)}
                        style={{ 
                          fontSize: '14px', 
                          padding: '10px 12px',
                          borderRadius: '6px',
                          border: '1px solid #ced4da',
                          backgroundColor: '#ffffff',
                          width: '100%',
                          fontFamily: 'inherit',
                          color: '#495057',
                          transition: 'border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out'
                        }}
                      >
                        <option value="left">← Left Align</option>
                        <option value="center">⬌ Center Align</option>
                        <option value="right">→ Right Align</option>
                        <option value="justify">⬌ Justify</option>
                      </Select>
                    </div>
                    
                    <div>
                      <Label style={{ 
                        fontSize: '13px', 
                        fontWeight: '600', 
                        marginBottom: '8px', 
                        display: 'block',
                        color: '#495057'
                      }}>
                        Font Size
                      </Label>
                      <Select
                        value={currentBranding.footerFontSize || '20'}
                        onChange={(e) => handleInputChange('footerFontSize', e.target.value)}
                        style={{ 
                          fontSize: '14px', 
                          padding: '10px 12px',
                          borderRadius: '6px',
                          border: '1px solid #ced4da',
                          backgroundColor: '#ffffff',
                          width: '100%',
                          fontFamily: 'inherit',
                          color: '#495057',
                          transition: 'border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out'
                        }}
                      >
                        <option value="11">11 pt</option>
                        <option value="12">12 pt</option>
                        <option value="13">13 pt</option>
                        <option value="14">14 pt</option>
                        <option value="15">15 pt</option>
                        <option value="16">16 pt</option>
                        <option value="17">17 pt</option>
                        <option value="18">18 pt</option>
                        <option value="19">19 pt</option>
                        <option value="20">20 pt</option>
                        <option value="21">21 pt</option>
                        <option value="22">22 pt</option>
                        <option value="23">23 pt</option>
                        <option value="24">24 pt</option>
                      </Select>
                    </div>
                    
                    <div>
                      <Label style={{ 
                        fontSize: '13px', 
                        fontWeight: '600', 
                        marginBottom: '8px', 
                        display: 'block',
                        color: '#495057'
                      }}>
                        Text Style
                      </Label>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '8px', 
                          fontSize: '13px',
                          color: '#495057',
                          cursor: 'pointer',
                          padding: '4px 0'
                        }}>
                          <input
                            type="checkbox"
                            checked={currentBranding.footerBold || false}
                            onChange={(e) => handleInputChange('footerBold', e.target.checked)}
                            style={{ 
                              width: '16px', 
                              height: '16px',
                              accentColor: '#007bff'
                            }}
                          />
                          <strong>Bold</strong>
                        </label>
                        <label style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '8px', 
                          fontSize: '13px',
                          color: '#495057',
                          cursor: 'pointer',
                          padding: '4px 0'
                        }}>
                          <input
                            type="checkbox"
                            checked={currentBranding.footerItalic !== false}
                            onChange={(e) => handleInputChange('footerItalic', e.target.checked)}
                            style={{ 
                              width: '16px', 
                              height: '16px',
                              accentColor: '#007bff'
                            }}
                          />
                          <em>Italic</em>
                        </label>
                        <label style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '8px', 
                          fontSize: '13px',
                          color: '#495057',
                          cursor: 'pointer',
                          padding: '4px 0'
                        }}>
                          <input
                            type="checkbox"
                            checked={currentBranding.footerUnderline || false}
                            onChange={(e) => handleInputChange('footerUnderline', e.target.checked)}
                            style={{ 
                              width: '16px', 
                              height: '16px',
                              accentColor: '#007bff'
                            }}
                          />
                          <u>Underline</u>
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  {/* Footer Preview */}
                  {currentBranding.footerText && (
                    <div style={{ 
                      marginTop: '16px', 
                      padding: '12px', 
                      backgroundColor: '#f8f9fa', 
                      borderRadius: '6px',
                      border: '1px solid #e9ecef'
                    }}>
                      <Label style={{ fontSize: '12px', marginBottom: '8px', display: 'block', color: '#6c757d' }}>
                        Footer Preview:
                      </Label>
                      <div style={{
                        textAlign: currentBranding.footerAlignment || 'center',
                        fontSize: `${currentBranding.footerFontSize || 20}px`,
                        fontWeight: currentBranding.footerBold ? 'bold' : 'normal',
                        fontStyle: currentBranding.footerItalic !== false ? 'italic' : 'normal',
                        textDecoration: currentBranding.footerUnderline ? 'underline' : 'none',
                        fontFamily: currentBranding.fonts?.primary || 'Arial, sans-serif',
                        color: currentBranding.colors?.secondary || '#888888',
                        lineHeight: '1.2',
                        minHeight: '1.2em'
                      }}>
                        {currentBranding.footerText}
                      </div>
                    </div>
                  )}
                </FormGroup>
              </FormGrid>
            </EditorSection>

            <EditorSection style={{ marginTop: '20px' }}>
              <SectionTitle>
                <FiList size={20} />
                Table of Contents
              </SectionTitle>
              
              <FormGrid>
                <FormGroup>
                  <Label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="checkbox"
                      checked={currentBranding.tableOfContents?.enabled !== false}
                      onChange={(e) => handleInputChange('tableOfContents', {
                        ...currentBranding.tableOfContents,
                        enabled: e.target.checked
                      })}
                      style={{ 
                        width: '16px', 
                        height: '16px',
                        accentColor: '#007bff'
                      }}
                    />
                    Enable Table of Contents
                  </Label>
                </FormGroup>

                {currentBranding.tableOfContents?.enabled !== false && (
                  <>
                    <FormGroup>
                      <div style={{ 
                        fontSize: '14px', 
                        color: '#495057', 
                        marginBottom: '8px',
                        padding: '12px',
                        backgroundColor: '#e7f3ff',
                        borderRadius: '6px',
                        border: '1px solid #b3d9ff'
                      }}>
                        ✨ <strong>Manual Table of Contents</strong> - Generated with your custom styling and formatting applied immediately
                      </div>
                    </FormGroup>

                    <FormGroup>
                      <Label>Heading Levels</Label>
                      <Select
                        value={currentBranding.tableOfContents?.headingLevels || '1-3'}
                        onChange={(e) => handleInputChange('tableOfContents', {
                          ...currentBranding.tableOfContents,
                          headingLevels: e.target.value
                        })}
                      >
                        <option value="1">Level 1 only</option>
                        <option value="1-2">Levels 1-2</option>
                        <option value="1-3">Levels 1-3</option>
                        <option value="1-4">Levels 1-4</option>
                        <option value="1-5">Levels 1-5</option>
                      </Select>
                    </FormGroup>

                    <FormGroup style={{ gridColumn: '1 / -1' }}>
                      <Label>TOC Options</Label>
                      <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                        gap: '12px',
                        marginTop: '8px'
                      }}>
                        <label style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '8px', 
                          fontSize: '14px',
                          color: '#495057',
                          cursor: 'pointer',
                          padding: '8px 12px',
                          backgroundColor: '#f8f9fa',
                          borderRadius: '6px',
                          border: '1px solid #e9ecef'
                        }}>
                          <input
                            type="checkbox"
                            checked={currentBranding.tableOfContents?.showPageNumbers !== false}
                            onChange={(e) => handleInputChange('tableOfContents', {
                              ...currentBranding.tableOfContents,
                              showPageNumbers: e.target.checked
                            })}
                            style={{ 
                              width: '16px', 
                              height: '16px',
                              accentColor: '#007bff'
                            }}
                          />
                          Show Page Numbers
                        </label>

                        <label style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '8px', 
                          fontSize: '14px',
                          color: '#495057',
                          cursor: 'pointer',
                          padding: '8px 12px',
                          backgroundColor: '#f8f9fa',
                          borderRadius: '6px',
                          border: '1px solid #e9ecef'
                        }}>
                          <input
                            type="checkbox"
                            checked={currentBranding.tableOfContents?.includeHyperlinks !== false}
                            onChange={(e) => handleInputChange('tableOfContents', {
                              ...currentBranding.tableOfContents,
                              includeHyperlinks: e.target.checked
                            })}
                            style={{ 
                              width: '16px', 
                              height: '16px',
                              accentColor: '#007bff'
                            }}
                          />
                          Include Hyperlinks
                        </label>
                      </div>
                    </FormGroup>

                    {/* TOC Preview */}
                    <FormGroup style={{ gridColumn: '1 / -1' }}>
                      <div style={{ 
                        marginTop: '16px', 
                        padding: '16px', 
                        backgroundColor: '#f8f9fa', 
                        borderRadius: '8px',
                        border: '1px solid #e9ecef'
                      }}>
                        <Label style={{ fontSize: '13px', marginBottom: '12px', display: 'block', color: '#6c757d' }}>
                          TOC Preview (Manual Generation with Custom Styling):
                        </Label>
                        <div style={{
                          fontFamily: currentBranding.fonts?.primary || 'Arial, sans-serif',
                          fontSize: '14px',
                          lineHeight: '1.6'
                        }}>
                          <div style={{ fontWeight: 'bold', marginBottom: '12px', textAlign: 'center' }}>
                            Table of Contents
                          </div>
                          
                          <div style={{ 
                            color: '#495057',
                            textAlign: 'left'
                          }}>
                            <div style={{ marginLeft: '0px', marginBottom: '8px' }}>
                              1. Introduction {currentBranding.tableOfContents?.showPageNumbers !== false && '.......................'} {currentBranding.tableOfContents?.showPageNumbers !== false && '3'}
                            </div>
                            <div style={{ marginLeft: '0px', marginBottom: '8px' }}>
                              2. Project Overview {currentBranding.tableOfContents?.showPageNumbers !== false && '................'} {currentBranding.tableOfContents?.showPageNumbers !== false && '5'}
                            </div>
                            {(currentBranding.tableOfContents?.headingLevels || '1-3').includes('2') && (
                              <div style={{ marginLeft: '20px', fontSize: '13px', marginBottom: '8px' }}>
                                2.1 Objectives {currentBranding.tableOfContents?.showPageNumbers !== false && '........................'} {currentBranding.tableOfContents?.showPageNumbers !== false && '6'}
                              </div>
                            )}
                            <div style={{ marginLeft: '0px', marginBottom: '8px' }}>
                              3. Implementation {currentBranding.tableOfContents?.showPageNumbers !== false && '...................'} {currentBranding.tableOfContents?.showPageNumbers !== false && '8'}
                            </div>
                            {(currentBranding.tableOfContents?.headingLevels || '1-3').includes('3') && (
                              <div style={{ marginLeft: '40px', fontSize: '12px', marginBottom: '8px' }}>
                                3.1.1 Phase 1 {currentBranding.tableOfContents?.showPageNumbers !== false && '........................'} {currentBranding.tableOfContents?.showPageNumbers !== false && '9'}
                              </div>
                            )}
                          </div>
                          
                          <div style={{ 
                            marginTop: '12px',
                            padding: '8px',
                            backgroundColor: '#e7f3ff',
                            borderRadius: '4px',
                            fontSize: '12px',
                            color: '#0066cc'
                          }}>
                            ✨ This will be generated with your custom fonts and colors applied immediately - no manual updates needed in MS Word!
                          </div>
                        </div>
                      </div>
                    </FormGroup>
                  </>
                )}
              </FormGrid>
            </EditorSection>

            <div style={{ marginTop: '30px', display: 'flex', gap: '12px', alignItems: 'center' }}>
              <Input
                type="text"
                placeholder="Template name..."
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                style={{ maxWidth: '200px' }}
              />
              <SaveButton onClick={handleSaveTemplate}>
                <FiSave size={16} />
                {editingTemplate ? 'Update Template' : 'Save as Template'}
              </SaveButton>
              {editingTemplate && (
                <Button 
                  onClick={() => {
                    setEditingTemplate(null);
                    setTemplateName('');
                    setActiveTab('templates');
                  }}
                  style={{ background: '#6c757d' }}
                >
                  Cancel Edit
                </Button>
              )}
            </div>
          </div>
        )}
      </ContentArea>
    </BrandingContainer>
  );
};

export default BrandingTemplates;