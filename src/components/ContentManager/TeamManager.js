import React, { useState } from 'react';
import styled from 'styled-components';
import { FiPlus, FiEdit3, FiTrash2, FiUser, FiUpload } from 'react-icons/fi';
import { useSelector, useDispatch } from 'react-redux';
import { addTeamMember, updateTeamMember, deleteTeamMember } from '../../store/slices/teamMembersSlice';
import { useDropzone } from 'react-dropzone';

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

const TeamGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
  flex: 1;
  overflow-y: auto;
`;

const TeamCard = styled.div`
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

const MemberHeader = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
`;

const Avatar = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: ${props => props.photo ? `url(${props.photo})` : '#e0e0e0'};
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  font-size: 24px;
`;

const MemberInfo = styled.div`
  flex: 1;
`;

const MemberName = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
`;

const MemberRole = styled.div`
  font-size: 14px;
  color: #007bff;
  font-weight: 500;
  margin-bottom: 4px;
`;

const MemberEmail = styled.div`
  font-size: 14px;
  color: #666;
`;

const MemberBio = styled.div`
  font-size: 14px;
  color: #666;
  margin-bottom: 16px;
  line-height: 1.4;
`;

const SkillsContainer = styled.div`
  margin-bottom: 16px;
`;

const SkillsLabel = styled.div`
  font-size: 12px;
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const Skills = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

const Skill = styled.span`
  background: #f8f9fa;
  color: #495057;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  border: 1px solid #e9ecef;
`;

const MemberActions = styled.div`
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

const PhotoUpload = styled.div`
  border: 2px dashed #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
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

const TeamManager = () => {
  const dispatch = useDispatch();
  const teamMembers = useSelector(state => state.teamMembers.teamMembers);
  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    email: '',
    phone: '',
    bio: '',
    skills: '',
    photo: null,
    cv: ''
  });

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        const reader = new FileReader();
        reader.onload = () => {
          setFormData(prev => ({ ...prev, photo: reader.result }));
        };
        reader.readAsDataURL(file);
      }
    }
  });

  const handleAddMember = () => {
    setEditingMember(null);
    setFormData({
      name: '',
      role: '',
      email: '',
      phone: '',
      bio: '',
      skills: '',
      photo: null,
      cv: ''
    });
    setShowModal(true);
  };

  const handleEditMember = (member) => {
    setEditingMember(member);
    setFormData({
      ...member,
      skills: Array.isArray(member.skills) ? member.skills.join(', ') : member.skills || ''
    });
    setShowModal(true);
  };

  const handleDeleteMember = (memberId) => {
    if (window.confirm('Are you sure you want to delete this team member?')) {
      dispatch(deleteTeamMember(memberId));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const memberData = {
      ...formData,
      skills: formData.skills.split(',').map(skill => skill.trim()).filter(skill => skill)
    };
    
    if (editingMember) {
      dispatch(updateTeamMember({ 
        id: editingMember.id, 
        updates: { ...memberData, updatedAt: new Date().toISOString() }
      }));
    } else {
      dispatch(addTeamMember(memberData));
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
          <FiUser size={24} />
          Team Management
        </Title>
        <AddButton onClick={handleAddMember}>
          <FiPlus size={16} />
          Add Team Member
        </AddButton>
      </Header>

      {teamMembers.length === 0 ? (
        <EmptyState>
          No team members added yet. Add your first team member to get started!
        </EmptyState>
      ) : (
        <TeamGrid>
          {teamMembers.map(member => (
            <TeamCard key={member.id}>
              <MemberHeader>
                <Avatar photo={member.photo}>
                  {!member.photo && <FiUser />}
                </Avatar>
                <MemberInfo>
                  <MemberName>{member.name}</MemberName>
                  <MemberRole>{member.role}</MemberRole>
                  <MemberEmail>{member.email}</MemberEmail>
                </MemberInfo>
              </MemberHeader>
              
              {member.bio && <MemberBio>{member.bio}</MemberBio>}
              
              {member.skills && member.skills.length > 0 && (
                <SkillsContainer>
                  <SkillsLabel>Skills</SkillsLabel>
                  <Skills>
                    {(Array.isArray(member.skills) ? member.skills : member.skills.split(',').map(s => s.trim())).map((skill, index) => (
                      <Skill key={index}>{skill}</Skill>
                    ))}
                  </Skills>
                </SkillsContainer>
              )}
              
              <MemberActions>
                <ActionButton onClick={() => handleEditMember(member)}>
                  <FiEdit3 size={12} />
                  Edit
                </ActionButton>
                <ActionButton 
                  danger 
                  onClick={() => handleDeleteMember(member.id)}
                >
                  <FiTrash2 size={12} />
                  Delete
                </ActionButton>
              </MemberActions>
            </TeamCard>
          ))}
        </TeamGrid>
      )}

      {showModal && (
        <Modal onClick={() => setShowModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>
                {editingMember ? 'Edit Team Member' : 'Add New Team Member'}
              </ModalTitle>
              <CloseButton onClick={() => setShowModal(false)}>
                ×
              </CloseButton>
            </ModalHeader>

            <form onSubmit={handleSubmit}>
              <FormGroup>
                <Label>Photo</Label>
                <PhotoUpload {...getRootProps()}>
                  <input {...getInputProps()} />
                  {formData.photo ? (
                    <img 
                      src={formData.photo} 
                      alt="Preview" 
                      style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div>
                      <FiUpload size={24} style={{ marginBottom: '8px' }} />
                      <div>Click or drag to upload photo</div>
                    </div>
                  )}
                </PhotoUpload>
              </FormGroup>

              <FormGroup>
                <Label>Name *</Label>
                <Input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label>Role *</Label>
                <Input
                  type="text"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  required
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
                <Label>Bio</Label>
                <TextArea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  placeholder="Brief description of the team member..."
                />
              </FormGroup>

              <FormGroup>
                <Label>Skills (comma-separated)</Label>
                <Input
                  type="text"
                  name="skills"
                  value={formData.skills}
                  onChange={handleInputChange}
                  placeholder="React, Node.js, Project Management..."
                />
              </FormGroup>

              <FormGroup>
                <Label>CV/Resume</Label>
                <TextArea
                  name="cv"
                  value={formData.cv}
                  onChange={handleInputChange}
                  placeholder="Detailed CV or resume content..."
                  style={{ minHeight: '120px' }}
                />
              </FormGroup>

              <ModalActions>
                <Button type="button" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" primary>
                  {editingMember ? 'Update Member' : 'Add Member'}
                </Button>
              </ModalActions>
            </form>
          </ModalContent>
        </Modal>
      )}
    </ManagerContainer>
  );
};

export default TeamManager;