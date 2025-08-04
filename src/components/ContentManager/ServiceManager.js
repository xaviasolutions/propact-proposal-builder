import React, { useState } from 'react';
import styled from 'styled-components';
import { FiPlus, FiEdit3, FiTrash2, FiStar } from 'react-icons/fi';
import { useSelector, useDispatch } from 'react-redux';
import { addService, updateService, deleteService } from '../../store/slices/servicesSlice';

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

const ServiceGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
  flex: 1;
  overflow-y: auto;
`;

const ServiceCard = styled.div`
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

const ServiceHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
`;

const ServiceName = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
`;

const ServicePrice = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #007bff;
`;

const ServiceCategory = styled.div`
  font-size: 12px;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 12px;
`;

const ServiceDescription = styled.div`
  font-size: 14px;
  color: #666;
  margin-bottom: 16px;
  line-height: 1.5;
`;

const DeliverablesList = styled.ul`
  margin: 16px 0;
  padding-left: 20px;
`;

const Deliverable = styled.li`
  font-size: 14px;
  color: #666;
  margin-bottom: 4px;
`;

const ServiceMeta = styled.div`
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

const ServiceActions = styled.div`
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
  max-width: 600px;
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
  min-height: 80px;
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

const ServiceManager = () => {
  const dispatch = useDispatch();
  const { services } = useSelector(state => state.services);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    price: '',
    duration: '',
    deliverables: '',
    features: ''
  });

  const serviceCategories = [
    'Web Development',
    'Mobile Development',
    'UI/UX Design',
    'Digital Marketing',
    'Consulting',
    'Maintenance & Support',
    'Custom Development',
    'Other'
  ];

  const handleAddService = () => {
    setEditingService(null);
    setFormData({
      name: '',
      category: '',
      description: '',
      price: '',
      duration: '',
      deliverables: '',
      features: ''
    });
    setShowModal(true);
  };

  const handleEditService = (service) => {
    setEditingService(service);
    setFormData({
      ...service,
      deliverables: Array.isArray(service.deliverables) ? service.deliverables.join('\n') : service.deliverables || '',
      features: Array.isArray(service.features) ? service.features.join('\n') : service.features || ''
    });
    setShowModal(true);
  };

  const handleDeleteService = (serviceId) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      dispatch(deleteService(serviceId));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const serviceData = {
      ...formData,
      deliverables: formData.deliverables.split('\n').map(item => item.trim()).filter(item => item),
      features: formData.features.split('\n').map(item => item.trim()).filter(item => item)
    };
    
    if (editingService) {
      dispatch(updateService({ 
        id: editingService.id, 
        updates: { ...serviceData, updatedAt: new Date().toISOString() }
      }));
    } else {
      dispatch(addService(serviceData));
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
          <FiStar size={24} />
          Service Management
        </Title>
        <AddButton onClick={handleAddService}>
          <FiPlus size={16} />
          Add Service
        </AddButton>
      </Header>

      {services.length === 0 ? (
        <EmptyState>
          No services added yet. Create your first service offering to get started!
        </EmptyState>
      ) : (
        <ServiceGrid>
          {services.map(service => (
            <ServiceCard key={service.id}>
              <ServiceHeader>
                <div>
                  <ServiceName>{service.name}</ServiceName>
                  <ServiceCategory>{service.category}</ServiceCategory>
                </div>
                <ServicePrice>{service.price}</ServicePrice>
              </ServiceHeader>
              
              <ServiceDescription>{service.description}</ServiceDescription>
              
              <ServiceMeta>
                <MetaItem><strong>Duration:</strong> {service.duration}</MetaItem>
                <MetaItem><strong>Category:</strong> {service.category}</MetaItem>
              </ServiceMeta>
              
              {service.deliverables && service.deliverables.length > 0 && (
                <div>
                  <strong style={{ fontSize: '14px', color: '#333' }}>Deliverables:</strong>
                  <DeliverablesList>
                    {service.deliverables.map((deliverable, index) => (
                      <Deliverable key={index}>{deliverable}</Deliverable>
                    ))}
                  </DeliverablesList>
                </div>
              )}
              
              <ServiceActions>
                <ActionButton onClick={() => handleEditService(service)}>
                  <FiEdit3 size={12} />
                  Edit
                </ActionButton>
                <ActionButton 
                  danger 
                  onClick={() => handleDeleteService(service.id)}
                >
                  <FiTrash2 size={12} />
                  Delete
                </ActionButton>
              </ServiceActions>
            </ServiceCard>
          ))}
        </ServiceGrid>
      )}

      {showModal && (
        <Modal onClick={() => setShowModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>
                {editingService ? 'Edit Service' : 'Add New Service'}
              </ModalTitle>
              <CloseButton onClick={() => setShowModal(false)}>
                ×
              </CloseButton>
            </ModalHeader>

            <form onSubmit={handleSubmit}>
              <FormGroup>
                <Label>Service Name *</Label>
                <Input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </FormGroup>

              <FormRow>
                <FormGroup>
                  <Label>Category *</Label>
                  <Select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Category</option>
                    {serviceCategories.map(category => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </Select>
                </FormGroup>
                <FormGroup>
                  <Label>Price</Label>
                  <Input
                    type="text"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="e.g., $5,000 or Starting at $2,500"
                  />
                </FormGroup>
              </FormRow>

              <FormGroup>
                <Label>Duration</Label>
                <Input
                  type="text"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  placeholder="e.g., 4-6 weeks"
                />
              </FormGroup>

              <FormGroup>
                <Label>Description *</Label>
                <TextArea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Detailed description of the service..."
                  required
                  style={{ minHeight: '100px' }}
                />
              </FormGroup>

              <FormGroup>
                <Label>Deliverables (one per line)</Label>
                <TextArea
                  name="deliverables"
                  value={formData.deliverables}
                  onChange={handleInputChange}
                  placeholder="Custom website design&#10;Responsive development&#10;SEO optimization&#10;Content management system"
                  style={{ minHeight: '100px' }}
                />
              </FormGroup>

              <FormGroup>
                <Label>Key Features (one per line)</Label>
                <TextArea
                  name="features"
                  value={formData.features}
                  onChange={handleInputChange}
                  placeholder="Modern design&#10;Mobile responsive&#10;Fast loading&#10;SEO optimized"
                  style={{ minHeight: '100px' }}
                />
              </FormGroup>

              <ModalActions>
                <Button type="button" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" primary>
                  {editingService ? 'Update Service' : 'Add Service'}
                </Button>
              </ModalActions>
            </form>
          </ModalContent>
        </Modal>
      )}
    </ManagerContainer>
  );
};

export default ServiceManager;