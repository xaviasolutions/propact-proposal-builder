import React, { useState } from 'react';
import styled from 'styled-components';
import { FiPlus, FiEdit3, FiTrash2, FiFileText, FiImage, FiUpload } from 'react-icons/fi';
import { useSelector, useDispatch } from 'react-redux';
import { addCover, updateCover, deleteCover } from '../../store/slices/coversSlice';

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

const TextArea = styled.textarea`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 14px;
  outline: none;
  resize: vertical;
  min-height: 120px;
  transition: border-color 0.2s ease;

  &:focus {
    border-color: #007bff;
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
    logo: null
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
      logo: null
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
      logo: cover.logo
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

              <LogoIndicator hasLogo={!!cover.logo}>
                <FiImage size={14} />
                {cover.logo ? 'Logo attached' : 'No logo'}
              </LogoIndicator>

              <CoverPreview>
                {cover.header && <PreviewHeader>{cover.header}</PreviewHeader>}
                <PreviewContent>
                  {cover.content.substring(0, 150)}
                  {cover.content.length > 150 && '...'}
                </PreviewContent>
                {cover.footer && <PreviewFooter>{cover.footer}</PreviewFooter>}
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
                <Label>Cover Content</Label>
                <TextArea
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  placeholder="Enter the main content for your cover page..."
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label>Logo Upload</Label>
                <FileInputWrapper>
                  <FileInput
                    type="file"
                    accept="image/*"
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
              </FormGroup>

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