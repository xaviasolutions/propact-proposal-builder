import React, { useState } from 'react';
import styled from 'styled-components';
import { FiPlus, FiEdit3, FiTrash2, FiBriefcase } from 'react-icons/fi';
import { useSelector, useDispatch } from 'react-redux';
import { addCaseStudy, updateCaseStudy, deleteCaseStudy } from '../../store/slices/caseStudiesSlice';

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

const CaseStudyGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 20px;
  flex: 1;
  overflow-y: auto;
`;

const CaseStudyCard = styled.div`
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

const CaseStudyTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
`;

const CaseStudyClient = styled.div`
  font-size: 14px;
  color: #007bff;
  font-weight: 500;
  margin-bottom: 12px;
`;

const CaseStudyDescription = styled.div`
  font-size: 14px;
  color: #666;
  margin-bottom: 16px;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const MetaInfo = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 16px;
  font-size: 14px;
`;

const MetaItem = styled.div`
  color: #666;
  
  strong {
    color: #333;
  }
`;

const TagsContainer = styled.div`
  margin-bottom: 16px;
`;

const Tags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

const Tag = styled.span`
  background: #f8f9fa;
  color: #495057;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  border: 1px solid #e9ecef;
`;

const CaseStudyActions = styled.div`
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

const CaseStudyManager = () => {
  const dispatch = useDispatch();
  const caseStudies = useSelector(state => state.caseStudies.caseStudies);
  const [showModal, setShowModal] = useState(false);
  const [editingCaseStudy, setEditingCaseStudy] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    client: '',
    description: '',
    challenge: '',
    solution: '',
    results: '',
    duration: '',
    budget: '',
    tags: '',
    testimonial: ''
  });

  const handleAddCaseStudy = () => {
    setEditingCaseStudy(null);
    setFormData({
      title: '',
      client: '',
      description: '',
      challenge: '',
      solution: '',
      results: '',
      duration: '',
      budget: '',
      tags: '',
      testimonial: ''
    });
    setShowModal(true);
  };

  const handleEditCaseStudy = (caseStudy) => {
    setEditingCaseStudy(caseStudy);
    setFormData({
      ...caseStudy,
      tags: Array.isArray(caseStudy.tags) ? caseStudy.tags.join(', ') : caseStudy.tags || ''
    });
    setShowModal(true);
  };

  const handleDeleteCaseStudy = (caseStudyId) => {
    if (window.confirm('Are you sure you want to delete this case study?')) {
      dispatch(deleteCaseStudy(caseStudyId));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const caseStudyData = {
      ...formData,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
    };
    
    if (editingCaseStudy) {
      dispatch(updateCaseStudy({ 
        id: editingCaseStudy.id, 
        updates: { ...caseStudyData, updatedAt: new Date().toISOString() }
      }));
    } else {
      dispatch(addCaseStudy(caseStudyData));
    }
    
    setShowModal(false);
  };

  const handleInputChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <ManagerContainer>
      <Header>
        <Title>
          <FiBriefcase size={24} />
          Case Study Management
        </Title>
        <AddButton onClick={handleAddCaseStudy}>
          <FiPlus size={16} />
          Add Case Study
        </AddButton>
      </Header>

      {caseStudies.length === 0 ? (
        <EmptyState>
          No case studies added yet. Create your first case study to showcase your work!
        </EmptyState>
      ) : (
        <CaseStudyGrid>
          {caseStudies.map(caseStudy => (
            <CaseStudyCard key={caseStudy.id}>
              <CaseStudyTitle>{caseStudy.title}</CaseStudyTitle>
              <CaseStudyClient>Client: {caseStudy.client}</CaseStudyClient>
              <CaseStudyDescription>{caseStudy.description}</CaseStudyDescription>
              
              <MetaInfo>
                <MetaItem><strong>Duration:</strong> {caseStudy.duration}</MetaItem>
                <MetaItem><strong>Budget:</strong> {caseStudy.budget}</MetaItem>
              </MetaInfo>
              
              {caseStudy.tags && caseStudy.tags.length > 0 && (
                <TagsContainer>
                  <Tags>
                    {caseStudy.tags.map((tag, index) => (
                      <Tag key={index}>{tag}</Tag>
                    ))}
                  </Tags>
                </TagsContainer>
              )}
              
              <CaseStudyActions>
                <ActionButton onClick={() => handleEditCaseStudy(caseStudy)}>
                  <FiEdit3 size={12} />
                  Edit
                </ActionButton>
                <ActionButton 
                  danger 
                  onClick={() => handleDeleteCaseStudy(caseStudy.id)}
                >
                  <FiTrash2 size={12} />
                  Delete
                </ActionButton>
              </CaseStudyActions>
            </CaseStudyCard>
          ))}
        </CaseStudyGrid>
      )}

      {showModal && (
        <Modal onClick={() => setShowModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>
                {editingCaseStudy ? 'Edit Case Study' : 'Add New Case Study'}
              </ModalTitle>
              <CloseButton onClick={() => setShowModal(false)}>
                ×
              </CloseButton>
            </ModalHeader>

            <form onSubmit={handleSubmit}>
              <FormGroup>
                <Label>Title *</Label>
                <Input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </FormGroup>

              <FormRow>
                <FormGroup>
                  <Label>Client *</Label>
                  <Input
                    type="text"
                    name="client"
                    value={formData.client}
                    onChange={handleInputChange}
                    required
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Duration</Label>
                  <Input
                    type="text"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    placeholder="e.g., 3 months"
                  />
                </FormGroup>
              </FormRow>

              <FormRow>
                <FormGroup>
                  <Label>Budget</Label>
                  <Input
                    type="text"
                    name="budget"
                    value={formData.budget}
                    onChange={handleInputChange}
                    placeholder="e.g., $50,000"
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Tags (comma-separated)</Label>
                  <Input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleInputChange}
                    placeholder="Web Development, React, E-commerce"
                  />
                </FormGroup>
              </FormRow>

              <FormGroup>
                <Label>Description *</Label>
                <TextArea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Brief overview of the project..."
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label>Challenge</Label>
                <TextArea
                  name="challenge"
                  value={formData.challenge}
                  onChange={handleInputChange}
                  placeholder="What challenges did the client face?"
                />
              </FormGroup>

              <FormGroup>
                <Label>Solution</Label>
                <TextArea
                  name="solution"
                  value={formData.solution}
                  onChange={handleInputChange}
                  placeholder="How did you solve the problem?"
                />
              </FormGroup>

              <FormGroup>
                <Label>Results</Label>
                <TextArea
                  name="results"
                  value={formData.results}
                  onChange={handleInputChange}
                  placeholder="What were the outcomes and achievements?"
                />
              </FormGroup>

              <FormGroup>
                <Label>Client Testimonial</Label>
                <TextArea
                  name="testimonial"
                  value={formData.testimonial}
                  onChange={handleInputChange}
                  placeholder="Client feedback or testimonial..."
                />
              </FormGroup>

              <ModalActions>
                <Button type="button" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" primary>
                  {editingCaseStudy ? 'Update Case Study' : 'Add Case Study'}
                </Button>
              </ModalActions>
            </form>
          </ModalContent>
        </Modal>
      )}
    </ManagerContainer>
  );
};

export default CaseStudyManager;