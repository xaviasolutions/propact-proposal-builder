import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { FiPlus, FiEdit3, FiTrash2, FiBriefcase } from 'react-icons/fi';
import { useSelector, useDispatch } from 'react-redux';
import { addFirmExperience, updateFirmExperience, deleteFirmExperience } from '../../store/slices/firmExperienceSlice';
import { addKeyword } from '../../store/slices/keywordsSlice';
import { addSector } from '../../store/slices/sectorsSlice';

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

const FirmExperienceGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 20px;
  flex: 1;
  overflow-y: auto;
`;

const FirmExperienceCard = styled.div`
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

const ExperienceClient = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
`;

const ExperienceYear = styled.div`
  font-size: 14px;
  color: #007bff;
  font-weight: 500;
  margin-bottom: 12px;
`;

const ExperienceDescription = styled.div`
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

const ExperienceActions = styled.div`
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
  transition: border-color 0.2s ease;
  background: white;
  cursor: pointer;
  appearance: none;
  background-image: url('data:image/svg+xml;charset=US-ASCII,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 4 5"><path fill="%23666" d="M2 0L0 2h4zm0 5L0 3h4z"/></svg>');
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 12px;

  &:focus {
    border-color: #007bff;
  }

  option {
    padding: 8px;
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

const MultiSelectContainer = styled.div`
  position: relative;
`;

const MultiSelectDropdown = styled.div`
  width: 100%;
  min-height: 42px;
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  align-items: center;
  transition: border-color 0.2s ease;

  &:focus {
    border-color: #007bff;
    outline: none;
  }

  &.open {
    border-color: #007bff;
  }
`;

const SelectedTag = styled.span`
  background: #007bff;
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const RemoveTag = styled.button`
  border: none;
  background: none;
  color: white;
  cursor: pointer;
  padding: 0;
  font-size: 14px;
  line-height: 1;
  
  &:hover {
    opacity: 0.8;
  }
`;

const Placeholder = styled.span`
  color: #999;
  font-size: 14px;
  flex: 1;
`;

const DropdownOptions = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e0e0e0;
  border-top: none;
  border-radius: 0 0 4px 4px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
`;

const DropdownOption = styled.div`
  padding: 10px 12px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s ease;
  
  &:hover {
    background: #f8f9fa;
  }
  
  &.selected {
    background: #e3f2fd;
    color: #1976d2;
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 8px 12px;
  border: none;
  border-bottom: 1px solid #e0e0e0;
  outline: none;
  font-size: 14px;
  
  &:focus {
    border-bottom-color: #1976d2;
  }
  
  &::placeholder {
    color: #999;
  }
`;

const YearPickerContainer = styled.div`
  position: relative;
`;

const YearPickerInput = styled.div`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  transition: border-color 0.2s ease;
  
  &:focus {
    border-color: #007bff;
    outline: none;
  }
  
  &.open {
    border-color: #007bff;
  }
`;

const YearPickerDropdown = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e0e0e0;
  border-top: none;
  border-radius: 0 0 4px 4px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
`;

const YearGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1px;
  padding: 8px;
`;

const YearOption = styled.div`
  padding: 8px 12px;
  cursor: pointer;
  font-size: 14px;
  text-align: center;
  transition: background-color 0.2s ease;
  border-radius: 4px;
  
  &:hover {
    background: #f8f9fa;
  }
  
  &.selected {
    background: #007bff;
    color: white;
  }
  
  &.current {
    background: #e3f2fd;
    color: #1976d2;
    font-weight: 500;
  }
`;

const YearPickerPlaceholder = styled.span`
  color: #999;
`;

const YearPickerIcon = styled.span`
  color: #666;
  font-size: 12px;
`;

const FirmExperienceManager = () => {
  const dispatch = useDispatch();
  const firmExperience = useSelector(state => state.firmExperience.firmExperience);
  const clients = useSelector(state => state.clients?.clients || []);
  const teamMembers = useSelector(state => state.teamMembers?.teamMembers || []);
  const keywords = useSelector(state => state.keywords?.keywords || []);
  const sectors = useSelector(state => state.sectors?.sectors || []);
  

  const [showModal, setShowModal] = useState(false);
  const [editingExperience, setEditingExperience] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [teamMemberSearch, setTeamMemberSearch] = useState('');
  const [isKeywordsDropdownOpen, setIsKeywordsDropdownOpen] = useState(false);
  const [keywordsSearch, setKeywordsSearch] = useState('');
  const [isSectorsDropdownOpen, setIsSectorsDropdownOpen] = useState(false);
  const [sectorsSearch, setSectorsSearch] = useState('');
  const [isYearPickerOpen, setIsYearPickerOpen] = useState(false);
  const [formData, setFormData] = useState({
    client: '',
    year: '',
    description: '',
    teamMembers: [],
    sector: [],
    keywords: []
  });

  // Ensure we have valid clients data
  const validClients = React.useMemo(() => {
    return Array.isArray(clients) ? clients : [];
  }, [clients]);

  // Ensure we have valid team members data
  const validTeamMembers = useMemo(() => {
    return Array.isArray(teamMembers) ? teamMembers : [];
  }, [teamMembers]);

  const filteredTeamMembers = useMemo(() => {
    if (!teamMemberSearch.trim()) {
      return validTeamMembers;
    }
    return validTeamMembers.filter(member => 
      member.name.toLowerCase().includes(teamMemberSearch.toLowerCase()) ||
      member.role.toLowerCase().includes(teamMemberSearch.toLowerCase())
    );
  }, [validTeamMembers, teamMemberSearch]);

  const filteredKeywords = useMemo(() => {
    if (!keywordsSearch.trim()) {
      return keywords;
    }
    return keywords.filter(keyword => 
      keyword.toLowerCase().includes(keywordsSearch.toLowerCase())
    );
  }, [keywords, keywordsSearch]);

  const filteredSectors = useMemo(() => {
    if (!sectorsSearch.trim()) {
      return sectors;
    }
    return sectors.filter(sector => 
      sector.toLowerCase().includes(sectorsSearch.toLowerCase())
    );
  }, [sectors, sectorsSearch]);

  const availableYears = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear; year >= 2000; year--) {
      years.push(year);
    }
    return years;
  }, []);

  const handleAddExperience = () => {
    setEditingExperience(null);
    setFormData({
      client: '',
      year: '',
      description: '',
      teamMembers: [],
      sector: [],
      keywords: []
    });
    setIsDropdownOpen(false);
    setTeamMemberSearch('');
    setIsKeywordsDropdownOpen(false);
    setKeywordsSearch('');
    setIsSectorsDropdownOpen(false);
    setSectorsSearch('');
    setIsYearPickerOpen(false);
    setShowModal(true);
  };

  const handleEditExperience = (experience) => {
    setEditingExperience(experience);
    setIsDropdownOpen(false);
    setTeamMemberSearch('');
    setIsKeywordsDropdownOpen(false);
    setKeywordsSearch('');
    setIsSectorsDropdownOpen(false);
    setSectorsSearch('');
    setIsYearPickerOpen(false);
    setFormData({
      ...experience,
      teamMembers: Array.isArray(experience.teamMembers) ? experience.teamMembers : (experience.teamMembers ? experience.teamMembers.split(',').map(member => member.trim()) : []),
      keywords: Array.isArray(experience.keywords) ? experience.keywords : (experience.keywords ? experience.keywords.split(',').map(keyword => keyword.trim()) : []),
      sector: Array.isArray(experience.sector) ? experience.sector : (experience.sector ? [experience.sector] : [])
    });
    setShowModal(true);
  };

  const handleDeleteExperience = (experienceId) => {
    if (window.confirm('Are you sure you want to delete this firm experience?')) {
      dispatch(deleteFirmExperience(experienceId));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const experienceData = {
      ...formData,
      teamMembers: Array.isArray(formData.teamMembers) ? formData.teamMembers : [],
      keywords: Array.isArray(formData.keywords) ? formData.keywords : [],
      sector: Array.isArray(formData.sector) ? formData.sector : []
    };

    if (editingExperience) {
      dispatch(updateFirmExperience({
        id: editingExperience.id,
        updates: { ...experienceData, updatedAt: new Date().toISOString() }
      }));
    } else {
      dispatch(addFirmExperience(experienceData));
    }

    setShowModal(false);
    setIsDropdownOpen(false);
    setIsKeywordsDropdownOpen(false);
    setIsSectorsDropdownOpen(false);
  };

  const handleTeamMemberToggle = (memberName) => {
    setFormData(prev => ({
      ...prev,
      teamMembers: prev.teamMembers.includes(memberName)
        ? prev.teamMembers.filter(name => name !== memberName)
        : [...prev.teamMembers, memberName]
    }));
  };

  const handleRemoveTeamMember = (memberName) => {
    setFormData(prev => ({
      ...prev,
      teamMembers: prev.teamMembers.filter(name => name !== memberName)
    }));
  };

  const handleKeywordToggle = (keyword) => {
    if (formData.keywords.includes(keyword)) {
      setFormData(prev => ({
        ...prev,
        keywords: prev.keywords.filter(k => k !== keyword)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        keywords: [...prev.keywords, keyword]
      }));
    }
  };

  const handleRemoveKeyword = (keyword) => {
    setFormData(prev => ({
      ...prev,
      keywords: prev.keywords.filter(k => k !== keyword)
    }));
  };

  const handleSectorToggle = (sector) => {
    if (formData.sector.includes(sector)) {
      setFormData(prev => ({
        ...prev,
        sector: prev.sector.filter(s => s !== sector)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        sector: [...prev.sector, sector]
      }));
    }
  };

  const handleRemoveSector = (sector) => {
    setFormData(prev => ({
      ...prev,
      sector: prev.sector.filter(s => s !== sector)
    }));
  };

  const handleAddNewKeyword = () => {
    const trimmedSearch = keywordsSearch.trim();
    if (trimmedSearch && !keywords.includes(trimmedSearch)) {
      dispatch(addKeyword(trimmedSearch));
      handleKeywordToggle(trimmedSearch);
      setKeywordsSearch('');
    }
  };

  const handleAddNewSector = () => {
    const trimmedSearch = sectorsSearch.trim();
    if (trimmedSearch && !sectors.includes(trimmedSearch)) {
      dispatch(addSector(trimmedSearch));
      handleSectorToggle(trimmedSearch);
      setSectorsSearch('');
    }
  };

  const handleYearSelect = (year) => {
    setFormData(prev => ({
      ...prev,
      year: year
    }));
    setIsYearPickerOpen(false);
  };

  const handleInputChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.multi-select-container') && !event.target.closest('.year-picker-container')) {
        setIsDropdownOpen(false);
        setTeamMemberSearch('');
        setIsKeywordsDropdownOpen(false);
        setKeywordsSearch('');
        setIsSectorsDropdownOpen(false);
        setSectorsSearch('');
        setIsYearPickerOpen(false);
      }
    };

    if (isDropdownOpen || isKeywordsDropdownOpen || isSectorsDropdownOpen || isYearPickerOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen, isKeywordsDropdownOpen, isSectorsDropdownOpen, isYearPickerOpen]);

  // Close dropdown when modal is closed
  React.useEffect(() => {
    if (!showModal) {
      setIsDropdownOpen(false);
      setTeamMemberSearch('');
      setIsKeywordsDropdownOpen(false);
      setKeywordsSearch('');
      setIsSectorsDropdownOpen(false);
      setSectorsSearch('');
      setIsYearPickerOpen(false);
    }
  }, [showModal]);

  return (
    <ManagerContainer>
      <Header>
        <Title>
          <FiBriefcase size={24} />
          Firm Experience Management
        </Title>
        <AddButton onClick={handleAddExperience}>
          <FiPlus size={16} />
          Add Firm Experience
        </AddButton>
      </Header>

      {firmExperience.length === 0 ? (
        <EmptyState>
          No firm experience added yet. Create your first firm experience to showcase your work!
        </EmptyState>
      ) : (
        <FirmExperienceGrid>
          {firmExperience.map(experience => (
            <FirmExperienceCard key={experience.id}>
              <ExperienceClient>{experience.client}</ExperienceClient>
              <ExperienceYear>Year: {experience.year}</ExperienceYear>
              <ExperienceDescription>{experience.description}</ExperienceDescription>

              <MetaInfo>
                <MetaItem><strong>Sector:</strong> {experience.sector}</MetaItem>
                <MetaItem><strong>Team Size:</strong> {Array.isArray(experience.teamMembers) ? experience.teamMembers.length : experience.teamMembers.split(',').length} members</MetaItem>
              </MetaInfo>

              {experience?.keywords && (Array.isArray(experience.keywords) ? experience.keywords.length > 0 : experience.keywords.trim().length > 0) && (
                <TagsContainer>
                  <Tags>
                    {(Array.isArray(experience.keywords) 
                      ? experience.keywords 
                      : experience.keywords.split(',').map(keyword => keyword.trim()).filter(keyword => keyword)
                    ).map((keyword, index) => (
                      <Tag key={index}>{keyword}</Tag>
                    ))}
                  </Tags>
                </TagsContainer>
              )}

              <ExperienceActions>
                <ActionButton onClick={() => handleEditExperience(experience)}>
                  <FiEdit3 size={12} />
                  Edit
                </ActionButton>
                <ActionButton
                  danger
                  onClick={() => handleDeleteExperience(experience.id)}
                >
                  <FiTrash2 size={12} />
                  Delete
                </ActionButton>
              </ExperienceActions>
            </FirmExperienceCard>
          ))}
        </FirmExperienceGrid>
      )}

      {showModal && (
        <Modal onClick={() => setShowModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>
                {editingExperience ? 'Edit Firm Experience' : 'Add New Firm Experience'}
              </ModalTitle>
              <CloseButton onClick={() => setShowModal(false)}>
                ×
              </CloseButton>
            </ModalHeader>

            <form onSubmit={handleSubmit}>
              <FormRow>
                <FormGroup>
                  <Label>Client *</Label>
                  <Select
                    name="client"
                    value={formData.client}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select a client...</option>
                    {validClients.length > 0 ? (
                      validClients.map(client => (
                        <option key={client.id} value={client.company}>
                          {client.company} ({client.name})
                        </option>
                      ))
                    ) : (
                      <option disabled>No clients available</option>
                    )}
                  </Select>
                </FormGroup>
                <FormGroup>
                  <Label>Year *</Label>
                  <YearPickerContainer className="year-picker-container">
                    <YearPickerInput
                      className={isYearPickerOpen ? 'open' : ''}
                      onClick={() => setIsYearPickerOpen(!isYearPickerOpen)}
                      tabIndex={0}
                    >
                      {formData.year ? (
                        <span>{formData.year}</span>
                      ) : (
                        <YearPickerPlaceholder>Select year...</YearPickerPlaceholder>
                      )}
                      <YearPickerIcon>▼</YearPickerIcon>
                    </YearPickerInput>
                    {isYearPickerOpen && (
                      <YearPickerDropdown>
                        <YearGrid>
                          {availableYears.map(year => {
                            const currentYear = new Date().getFullYear();
                            const isSelected = formData.year === year;
                            const isCurrent = year === currentYear;
                            
                            return (
                              <YearOption
                                key={year}
                                className={`${isSelected ? 'selected' : ''} ${isCurrent ? 'current' : ''}`}
                                onClick={() => handleYearSelect(year)}
                              >
                                {year}
                              </YearOption>
                            );
                          })}
                        </YearGrid>
                      </YearPickerDropdown>
                    )}
                  </YearPickerContainer>
                </FormGroup>
              </FormRow>

              <FormRow>
                <FormGroup>
                  <Label>Sector *</Label>
                  <MultiSelectContainer className="multi-select-container">
                    <MultiSelectDropdown
                      className={isSectorsDropdownOpen ? 'open' : ''}
                      onClick={() => setIsSectorsDropdownOpen(!isSectorsDropdownOpen)}
                      tabIndex={0}
                    >
                      {formData.sector.length > 0 ? (
                        formData.sector.map(sectorName => (
                          <SelectedTag key={sectorName}>
                            {sectorName}
                            <RemoveTag
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveSector(sectorName);
                              }}
                            >
                              ×
                            </RemoveTag>
                          </SelectedTag>
                        ))
                      ) : (
                        <Placeholder>Select sectors...</Placeholder>
                      )}
                    </MultiSelectDropdown>
                    {isSectorsDropdownOpen && (
                      <DropdownOptions>
                        <SearchInput
                          type="text"
                          placeholder="Search or add new sector..."
                          value={sectorsSearch}
                          onChange={(e) => setSectorsSearch(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddNewSector();
                            }
                          }}
                        />
                        {filteredSectors.length > 0 ? (
                          filteredSectors.map(sector => (
                            <DropdownOption
                              key={sector}
                              className={formData.sector.includes(sector) ? 'selected' : ''}
                              onClick={() => handleSectorToggle(sector)}
                            >
                              {sector}
                            </DropdownOption>
                          ))
                        ) : sectorsSearch.trim() ? (
                          <DropdownOption
                            onClick={handleAddNewSector}
                            style={{ color: '#007bff', fontWeight: '500' }}
                          >
                            + Add "{sectorsSearch.trim()}"
                          </DropdownOption>
                        ) : (
                          <DropdownOption style={{ color: '#999', fontStyle: 'italic' }}>
                            No sectors available
                          </DropdownOption>
                        )}
                      </DropdownOptions>
                    )}
                  </MultiSelectContainer>
                </FormGroup>
                <FormGroup>
                  <Label>Team Members - Internal Use</Label>
                  <MultiSelectContainer className="multi-select-container">
                    <MultiSelectDropdown
                      className={isDropdownOpen ? 'open' : ''}
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      tabIndex={0}
                    >
                      {formData.teamMembers.length > 0 ? (
                        formData.teamMembers.map(memberName => (
                          <SelectedTag key={memberName}>
                            {memberName}
                            <RemoveTag
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveTeamMember(memberName);
                              }}
                            >
                              ×
                            </RemoveTag>
                          </SelectedTag>
                        ))
                      ) : (
                        <Placeholder>Select team members...</Placeholder>
                      )}
                    </MultiSelectDropdown>
                    {isDropdownOpen && (
                      <DropdownOptions>
                        <SearchInput
                          type="text"
                          placeholder="Search team members..."
                          value={teamMemberSearch}
                          onChange={(e) => setTeamMemberSearch(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        {filteredTeamMembers.length > 0 ? (
                          filteredTeamMembers.map(member => (
                            <DropdownOption
                              key={member.id}
                              className={formData.teamMembers.includes(member.name) ? 'selected' : ''}
                              onClick={() => handleTeamMemberToggle(member.name)}
                            >
                              {member.name} - {member.role}
                            </DropdownOption>
                          ))
                        ) : teamMemberSearch.trim() ? (
                          <DropdownOption style={{ color: '#999', fontStyle: 'italic' }}>
                            No team members found
                          </DropdownOption>
                        ) : (
                          <DropdownOption>No team members available</DropdownOption>
                        )}
                      </DropdownOptions>
                    )}
                  </MultiSelectContainer>
                </FormGroup>
              </FormRow>

              <FormGroup>
                <Label>Description * - Appears in Proposals</Label>
                <TextArea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Brief overview of the project and work performed..."
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label>Keywords - Internal Use</Label>
                <MultiSelectContainer className="multi-select-container">
                  <MultiSelectDropdown
                    className={isKeywordsDropdownOpen ? 'open' : ''}
                    onClick={() => setIsKeywordsDropdownOpen(!isKeywordsDropdownOpen)}
                    tabIndex={0}
                  >
                    {formData.keywords.length > 0 ? (
                      formData.keywords.map(keyword => (
                        <SelectedTag key={keyword}>
                          {keyword}
                          <RemoveTag
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveKeyword(keyword);
                            }}
                          >
                            ×
                          </RemoveTag>
                        </SelectedTag>
                      ))
                    ) : (
                      <Placeholder>Select keywords...</Placeholder>
                    )}
                  </MultiSelectDropdown>
                  {isKeywordsDropdownOpen && (
                    <DropdownOptions>
                      <SearchInput
                        type="text"
                        placeholder="Search or add new keyword..."
                        value={keywordsSearch}
                        onChange={(e) => setKeywordsSearch(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddNewKeyword();
                          }
                        }}
                      />
                      {filteredKeywords.length > 0 ? (
                        filteredKeywords.map(keyword => (
                          <DropdownOption
                            key={keyword}
                            className={formData.keywords.includes(keyword) ? 'selected' : ''}
                            onClick={() => handleKeywordToggle(keyword)}
                          >
                            {keyword}
                          </DropdownOption>
                        ))
                      ) : keywordsSearch.trim() ? (
                        <DropdownOption
                          onClick={handleAddNewKeyword}
                          style={{ color: '#007bff', fontWeight: '500' }}
                        >
                          + Add "{keywordsSearch.trim()}"
                        </DropdownOption>
                      ) : (
                        <DropdownOption style={{ color: '#999', fontStyle: 'italic' }}>
                          No keywords available
                        </DropdownOption>
                      )}
                    </DropdownOptions>
                  )}
                </MultiSelectContainer>
              </FormGroup>

              <ModalActions>
                <Button type="button" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" primary>
                  {editingExperience ? 'Update Firm Experience' : 'Add Firm Experience'}
                </Button>
              </ModalActions>
            </form>
          </ModalContent>
        </Modal>
      )}
    </ManagerContainer>
  );
};

export default FirmExperienceManager;