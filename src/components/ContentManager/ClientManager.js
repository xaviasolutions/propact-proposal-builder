import React, { useState } from 'react';
import styled from 'styled-components';
import { FiPlus, FiEdit3, FiTrash2, FiBriefcase } from 'react-icons/fi';
import { useSelector, useDispatch } from 'react-redux';
import { addClient, updateClient, deleteClient } from '../../store/slices/clientsSlice';

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

const ClientGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  flex: 1;
  overflow-y: auto;
`;

const ClientCard = styled.div`
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

const ClientName = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
`;

const ClientInfo = styled.div`
  font-size: 14px;
  color: #666;
  margin-bottom: 4px;
`;

const ClientActions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 16px;
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
  max-width: 500px;
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

const ClientManager = () => {
  const dispatch = useDispatch();
  const { clients } = useSelector(state => state.clients);
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    address: '',
    notes: ''
  });

  const handleAddClient = () => {
    setEditingClient(null);
    setFormData({
      name: '',
      company: '',
      email: '',
      phone: '',
      address: '',
      notes: ''
    });
    setShowModal(true);
  };

  const handleEditClient = (client) => {
    setEditingClient(client);
    setFormData(client);
    setShowModal(true);
  };

  const handleDeleteClient = (clientId) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      dispatch(deleteClient(clientId));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editingClient) {
      dispatch(updateClient({ 
        id: editingClient.id, 
        updates: { ...formData, updatedAt: new Date().toISOString() }
      }));
    } else {
      dispatch(addClient(formData));
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
          Client Management
        </Title>
        <AddButton onClick={handleAddClient}>
          <FiPlus size={16} />
          Add Client
        </AddButton>
      </Header>

      {clients.length === 0 ? (
        <EmptyState>
          No clients added yet. Create your first client to get started!
        </EmptyState>
      ) : (
        <ClientGrid>
          {clients.map(client => (
            <ClientCard key={client.id}>
              <ClientName>{client.name}</ClientName>
              <ClientInfo><strong>Company:</strong> {client.company}</ClientInfo>
              <ClientInfo><strong>Email:</strong> {client.email}</ClientInfo>
              <ClientInfo><strong>Phone:</strong> {client.phone}</ClientInfo>
              {client.address && (
                <ClientInfo><strong>Address:</strong> {client.address}</ClientInfo>
              )}
              {client.notes && (
                <ClientInfo><strong>Notes:</strong> {client.notes}</ClientInfo>
              )}
              
              <ClientActions>
                <ActionButton onClick={() => handleEditClient(client)}>
                  <FiEdit3 size={12} />
                  Edit
                </ActionButton>
                <ActionButton 
                  danger 
                  onClick={() => handleDeleteClient(client.id)}
                >
                  <FiTrash2 size={12} />
                  Delete
                </ActionButton>
              </ClientActions>
            </ClientCard>
          ))}
        </ClientGrid>
      )}

      {showModal && (
        <Modal onClick={() => setShowModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>
                {editingClient ? 'Edit Client' : 'Add New Client'}
              </ModalTitle>
              <CloseButton onClick={() => setShowModal(false)}>
                ×
              </CloseButton>
            </ModalHeader>

            <form onSubmit={handleSubmit}>
              <FormGroup>
                <Label>Client Name *</Label>
                <Input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label>Company</Label>
                <Input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                />
              </FormGroup>

              <FormGroup>
                <Label>Email</Label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </FormGroup>

              <FormGroup>
                <Label>Phone</Label>
                <Input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </FormGroup>

              <FormGroup>
                <Label>Address</Label>
                <TextArea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                />
              </FormGroup>

              <FormGroup>
                <Label>Notes</Label>
                <TextArea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                />
              </FormGroup>

              <ModalActions>
                <Button type="button" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" primary>
                  {editingClient ? 'Update Client' : 'Add Client'}
                </Button>
              </ModalActions>
            </form>
          </ModalContent>
        </Modal>
      )}
    </ManagerContainer>
  );
};

export default ClientManager;