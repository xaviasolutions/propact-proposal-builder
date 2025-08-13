import React, { useState } from 'react';
import styled from 'styled-components';
import { FiPlus, FiEdit3, FiTrash2, FiFileText, FiImage, FiUpload } from 'react-icons/fi';
import { useSelector, useDispatch } from 'react-redux';
import { addCover, updateCover, deleteCover } from '../../store/slices/coversSlice';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { resizeImageForA4Letterhead } from '../../utils/imageProcessor';

const ManagerContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
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

const AddButton = styled.button`
  padding: 10px 16px;
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

const CoverGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 20px;
  flex: 1;
  overflow-y: auto;
`;

const CoverCard = styled.div`
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  transition: all 0.2s ease;
  height: fit-content;

  &:hover {
    border-color: #007bff;
    box-shadow: 0 4px 12px rgba(0,123,255,0.1);
  }
`;

const CoverHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
`;

const CoverName = styled.h3`
  font-size: 18px;
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
  border-radius: 6px;
  padding: 16px;
  margin-bottom: 16px;
  min-height: 120px;
  position: relative;
  background-image: ${props => props.backgroundImage ? `url(${props.backgroundImage})` : 'none'};
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  
  ${props => props.backgroundImage && `
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 6px;
    }
  `}
`;

const PreviewHeader = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #007bff;
  margin-bottom: 8px;
  text-align: center;
`;

const PreviewContent = styled.div`
  font-size: 12px;
  color: #666;
  line-height: 1.4;
  max-height: 60px;
  overflow: hidden;
  text-overflow: ellipsis;
  
  p {
    margin: 0 0 4px 0;
  }
  
  strong {
    font-weight: 600;
  }
`;

const PreviewFooter = styled.div`
  font-size: 12px;
  color: #666;
  margin-top: 8px;
  text-align: center;
  font-style: italic;
`;

const LogoIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: ${props => props.hasLogo ? '#28a745' : '#666'};
  margin-bottom: 8px;
`;

const CoverActions = styled.div`
  display: flex;
  gap: 8px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
`;

const ActionButton = styled.button`
  padding: 6px 12px;
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

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 8px;
  padding: 24px;
  width: 90%;
  max-width: 700px;
  max-height: 80vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const ModalTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  color: #333;
`;

const CloseButton = styled.button`
  border: none;
  background: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  
  &:hover {
    color: #333;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
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

const QuillWrapper = styled.div`
  .ql-editor {
    min-height: 200px;
    font-size: 14px;
  }
  
  .ql-toolbar {
    border-top: 1px solid #e0e0e0;
    border-left: 1px solid #e0e0e0;
    border-right: 1px solid #e0e0e0;
  }
  
  .ql-container {
    border-bottom: 1px solid #e0e0e0;
    border-left: 1px solid #e0e0e0;
    border-right: 1px solid #e0e0e0;
  }
`;

const BackgroundPreview = styled.div`
  width: 100%;
  min-height: 200px;
  border: 2px dashed #e0e0e0;
  border-radius: 8px;
  margin-top: 8px;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  
  ${props => props.backgroundImage ? `
    border: 2px solid #007bff;
    background: white;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 12px;
  ` : `
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    border-style: dashed;
    
    &:hover {
      border-color: #007bff;
      background: linear-gradient(135deg, #f0f8ff 0%, #e6f3ff 100%);
    }
  `}
`;

const ImageContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
`;

const PreviewImage = styled.img`
  max-width: 100%;
  max-height: 180px;
  object-fit: contain;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
`;

const ImageInfo = styled.div`
  position: absolute;
  bottom: 8px;
  left: 8px;
  right: 8px;
  background: rgba(0,0,0,0.7);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  text-align: center;
  backdrop-filter: blur(4px);
`;

const RemoveBackgroundButton = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(220, 53, 69, 0.9);
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  cursor: pointer;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: rgba(220, 53, 69, 1);
  }
`;

const FileInputWrapper = styled.div`
  position: relative;
  display: inline-block;
  width: 100%;
`;

const FileInput = styled.input`
  position: absolute;
  opacity: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
`;

const FileInputButton = styled.div`
  padding: 10px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #007bff;
    background: #f8f9fa;
  }
`;

const ModalActions = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 20px;
`;

const Button = styled.button`
  padding: 10px 16px;
  border: 1px solid ${props => props.primary ? '#007bff' : '#e0e0e0'};
  background: ${props => props.primary ? '#007bff' : 'white'};
  color: ${props => props.primary ? 'white' : '#666'};
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.primary ? '#0056b3' : '#f8f9fa'};
  }
`;

const EmptyState = styled.div`
  text-align: center;
  color: #666;
  font-size: 16px;
  padding: 60px 20px;
`;

const CoverManager = () => {
  const dispatch = useDispatch();
  const { covers } = useSelector(state => state.covers);
  const [showModal, setShowModal] = useState(false);
  const [editingCover, setEditingCover] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    header: '',
    footer: '',
    content: '',
    rightSideText: '',
    logo: null,
    backgroundImage: null,
    backgroundImageName: ''
  });

  const coverCategories = [
    'Business',
    'Creative',
    'Technical',
    'Consulting',
    'Marketing',
    'Legal',
    'Healthcare',
    'Education',
    'Other'
  ];

  const handleAddCover = () => {
    setEditingCover(null);
    setFormData({
      name: '',
      category: '',
      header: '',
      footer: '',
      content: '',
      rightSideText: '',
      logo: null,
      backgroundImage: null
    });
    setShowModal(true);
  };

  const handleEditCover = (cover) => {
    setEditingCover(cover);
    setFormData({
      name: cover.name,
      category: cover.category,
      header: cover.header,
      footer: cover.footer,
      content: cover.content,
      rightSideText: cover.rightSideText || '',
      logo: cover.logo,
      backgroundImage: cover.backgroundImage || null
    });
    setShowModal(true);
  };

  const handleDeleteCover = (coverId) => {
    if (window.confirm('Are you sure you want to delete this cover template?')) {
      dispatch(deleteCover(coverId));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editingCover) {
      dispatch(updateCover({ 
        id: editingCover.id, 
        updates: formData
      }));
    } else {
      dispatch(addCover(formData));
    }
    
    setShowModal(false);
  };

  const handleInputChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        alert('Please select only JPEG, JPG, or PNG image files.');
        e.target.value = ''; // Clear the input
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData(prev => ({
          ...prev,
          logo: event.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBackgroundImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        alert('Please select only JPEG, JPG, or PNG image files.');
        e.target.value = ''; // Clear the input
        return;
      }
      
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          // Resize image to A4 letterhead dimensions
          const resizedImage = await resizeImageForA4Letterhead(event.target.result);
          setFormData(prev => ({
            ...prev,
            backgroundImage: resizedImage,
            backgroundImageName: file.name
          }));
        } catch (error) {
          console.error('Error resizing Letterhead:', error);
          alert('Error processing the image. Please try again.');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveBackgroundImage = () => {
    setFormData(prev => ({
      ...prev,
      backgroundImage: null,
      backgroundImageName: ''
    }));
  };

  const handleContentChange = (content) => {
    setFormData(prev => ({
      ...prev,
      content: content
    }));
  };

  // Quill modules configuration
  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'align': [] }],
      ['link'],
      [{ 'color': [] }, { 'background': [] }],
      ['clean']
    ],
  };

  const quillFormats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'indent', 'align',
    'link', 'color', 'background'
  ];

  return (
    <ManagerContainer>
      <Header>
        <Title>
          <FiFileText size={24} />
          Cover Management
        </Title>
        <AddButton onClick={handleAddCover}>
          <FiPlus size={16} />
          Add Cover Template
        </AddButton>
      </Header>

      {covers.length === 0 ? (
        <EmptyState>
          No cover templates created yet. Add your first cover template to get started!
        </EmptyState>
      ) : (
        <CoverGrid>
          {covers.map(cover => (
            <CoverCard key={cover.id}>
              <CoverHeader>
                <div>
                  <CoverName>{cover.name}</CoverName>
                  <CoverCategory>{cover.category}</CoverCategory>
                </div>
              </CoverHeader>

              {/* <LogoIndicator hasLogo={!!cover.logo}>
                <FiImage size={14} />
                {cover.logo ? 'Logo attached' : 'No logo'}
              </LogoIndicator>
               */}
              <LogoIndicator hasLogo={!!cover.backgroundImage}>
                <FiImage size={14} />
                {cover.backgroundImage ? 'Letterhead attached' : 'No Letterhead'}
              </LogoIndicator>

              <CoverPreview backgroundImage={cover.backgroundImage}>
                {cover.header && <PreviewHeader style={{ position: 'relative', zIndex: 1 }}>{cover.header}</PreviewHeader>}
                <PreviewContent
                  style={{ position: 'relative', zIndex: 1 }}
                  dangerouslySetInnerHTML={{
                    __html: cover.content.length > 150 
                      ? cover.content.substring(0, 150) + '...' 
                      : cover.content
                  }}
                />
                {cover.footer && <PreviewFooter style={{ position: 'relative', zIndex: 1 }}>{cover.footer}</PreviewFooter>}
              </CoverPreview>

              <CoverActions>
                <ActionButton onClick={() => handleEditCover(cover)}>
                  <FiEdit3 size={12} />
                  Edit
                </ActionButton>
                <ActionButton 
                  danger 
                  onClick={() => handleDeleteCover(cover.id)}
                >
                  <FiTrash2 size={12} />
                  Delete
                </ActionButton>
              </CoverActions>
            </CoverCard>
          ))}
        </CoverGrid>
      )}

      {showModal && (
        <Modal onClick={() => setShowModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>
                {editingCover ? 'Edit Cover Template' : 'Add New Cover Template'}
              </ModalTitle>
              <CloseButton onClick={() => setShowModal(false)}>×</CloseButton>
            </ModalHeader>

            <form onSubmit={handleSubmit}>
              <FormRow>
                <FormGroup>
                  <Label>Template Name</Label>
                  <Input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., Professional Business Cover"
                    required
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Category</Label>
                  <Select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select category</option>
                    {coverCategories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </Select>
                </FormGroup>
              </FormRow>

              <FormGroup>
                <Label>Header Text</Label>
                <Input
                  type="text"
                  name="header"
                  value={formData.header}
                  onChange={handleInputChange}
                  placeholder="e.g., Professional Business Proposal"
                />
              </FormGroup>

              <FormGroup>
                <Label>Footer Text</Label>
                <Input
                  type="text"
                  name="footer"
                  value={formData.footer}
                  onChange={handleInputChange}
                  placeholder="e.g., Confidential & Proprietary"
                />
              </FormGroup>

              <FormGroup>
                <Label>Right Side Text</Label>
                <Input
                  type="text"
                  name="rightSideText"
                  value={formData.rightSideText}
                  onChange={handleInputChange}
                  placeholder="e.g., PRIVATE AND CONFIDENTIAL"
                />
              </FormGroup>

              <FormGroup>
                <Label>Cover Content</Label>
                <QuillWrapper>
                  <ReactQuill
                    theme="snow"
                    value={formData.content}
                    onChange={handleContentChange}
                    modules={quillModules}
                    formats={quillFormats}
                    placeholder="Enter the main content for your cover page..."
                  />
                </QuillWrapper>
              </FormGroup>

              <FormGroup>
                <Label>Letterhead (Optional)</Label>
                <FileInputWrapper>
                  <FileInput
                    type="file"
                    accept=".jpeg,.jpg,.png,image/jpeg,image/jpg,image/png"
                    onChange={handleBackgroundImageUpload}
                  />
                  <FileInputButton>
                    <FiUpload size={16} />
                    {formData.backgroundImage ? 'Change Letterhead' : 'Upload Letterhead'}
                  </FileInputButton>
                </FileInputWrapper>
                <BackgroundPreview backgroundImage={formData.backgroundImage}>
                  {formData.backgroundImage ? (
                    <ImageContainer>
                      <PreviewImage 
                        src={formData.backgroundImage} 
                        alt="Background preview"
                        onError={(e) => {
                          console.error('Image failed to load:', e);
                          e.target.style.display = 'none';
                        }}
                      />
                      {formData.backgroundImageName && (
                        <ImageInfo>
                          {formData.backgroundImageName}
                        </ImageInfo>
                      )}
                      <RemoveBackgroundButton
                        type="button"
                        onClick={handleRemoveBackgroundImage}
                        title="Remove Letterhead"
                      >
                        ×
                      </RemoveBackgroundButton>
                    </ImageContainer>
                  ) : (
                    <div style={{ 
                      textAlign: 'center', 
                      color: '#6c757d',
                      padding: '40px 20px'
                    }}>
                      <FiImage size={32} style={{ 
                        marginBottom: '12px', 
                        color: '#adb5bd' 
                      }} />
                      <div style={{ 
                        fontSize: '16px', 
                        fontWeight: '500',
                        marginBottom: '8px'
                      }}>
                        Upload Letterhead
                      </div>
                      <div style={{ 
                        fontSize: '14px', 
                        color: '#6c757d',
                        marginBottom: '4px'
                      }}>
                        Drag & drop or click to browse
                      </div>
                      <div style={{ 
                        fontSize: '12px', 
                        color: '#adb5bd'
                      }}>
                        Supported: JPEG, JPG, PNG
                      </div>
                    </div>
                  )}
                </BackgroundPreview>
              </FormGroup>

              {/* <FormGroup>
                <Label>Logo Upload</Label>
                <FileInputWrapper>
                  <FileInput
                    type="file"
                    accept=".jpeg,.jpg,.png,image/jpeg,image/jpg,image/png"
                    onChange={handleLogoUpload}
                  />
                  <FileInputButton>
                    <FiUpload size={16} />
                    {formData.logo ? 'Change Logo' : 'Upload Logo'}
                  </FileInputButton>
                </FileInputWrapper>
                {formData.logo && (
                  <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
                    Logo uploaded successfully
                  </div>
                )}
              </FormGroup> */}

              <ModalActions>
                <Button type="button" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" primary>
                  {editingCover ? 'Update Cover' : 'Add Cover'}
                </Button>
              </ModalActions>
            </form>
          </ModalContent>
        </Modal>
      )}
    </ManagerContainer>
  );
};

export default CoverManager;