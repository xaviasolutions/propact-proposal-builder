import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { FiSearch, FiFilter, FiX, FiFileText, FiUsers, FiBriefcase, FiStar, FiSettings, FiFolder } from 'react-icons/fi';

const SearchContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 600px;
  margin: 0 auto 20px;
`;

const SearchInputContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  padding: 0;
  transition: border-color 0.2s ease;

  &:focus-within {
    border-color: #007bff;
  }
`;

const SearchIcon = styled(FiSearch)`
  position: absolute;
  left: 12px;
  color: #666;
  z-index: 1;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px 12px 12px 40px;
  border: none;
  outline: none;
  font-size: 16px;
  background: transparent;

  &::placeholder {
    color: #999;
  }
`;

const FilterButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border: none;
  background: ${props => props.active ? '#007bff' : 'transparent'};
  color: ${props => props.active ? 'white' : '#666'};
  cursor: pointer;
  border-left: 1px solid #e0e0e0;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.active ? '#0056b3' : '#f8f9fa'};
  }
`;

const FilterDropdown = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  min-width: 250px;
  margin-top: 4px;
`;

const FilterSection = styled.div`
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }
`;

const FilterSectionTitle = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 0 16px 8px;
`;

const FilterOption = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #f8f9fa;
  }
`;

const FilterCheckbox = styled.input`
  margin: 0;
`;

const FilterIcon = styled.div`
  display: flex;
  align-items: center;
  color: #666;
`;

const SearchResults = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 999;
  max-height: 400px;
  overflow-y: auto;
  margin-top: 4px;
`;

const SearchResultItem = styled.div`
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #f8f9fa;
  }

  &:last-child {
    border-bottom: none;
  }
`;

const ResultTitle = styled.div`
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ResultDescription = styled.div`
  font-size: 14px;
  color: #666;
  line-height: 1.4;
`;

const ResultCategory = styled.span`
  font-size: 12px;
  background: #e9ecef;
  color: #495057;
  padding: 2px 6px;
  border-radius: 4px;
  margin-left: auto;
`;

const NoResults = styled.div`
  padding: 20px;
  text-align: center;
  color: #666;
  font-style: italic;
`;

const ActiveFilters = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
`;

const ActiveFilter = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;
  background: #007bff;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
`;

const RemoveFilterButton = styled.button`
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 0;
  margin-left: 4px;
`;

const GlobalSearch = ({ onResultClick }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    proposals: true,
    clients: true,
    firmExperience: true,
    services: true,
    teamMembers: true,
    branding: true
  });

  // Get data from Redux store
  const { proposals } = useSelector(state => state.proposals);
  const { clients } = useSelector(state => state.clients);
  const { firmExperience } = useSelector(state => state.firmExperience);
  const { services } = useSelector(state => state.services);
  const { teamMembers } = useSelector(state => state.teamMembers);
  const { brandingTemplates } = useSelector(state => state.branding);

  const filterOptions = [
    { key: 'proposals', label: 'Your Proposals', icon: FiFileText },
    { key: 'clients', label: 'Clients', icon: FiUsers },
    { key: 'firmExperience', label: 'Firm Experience', icon: FiStar },
    { key: 'services', label: 'Services', icon: FiBriefcase },
    { key: 'teamMembers', label: 'Team Members', icon: FiUsers },
    { key: 'branding', label: 'Branding & Templates', icon: FiSettings }
  ];

  // Search function
  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) return [];

    const results = [];
    const term = searchTerm.toLowerCase();

    // Search in proposals
    if (activeFilters.proposals) {
      proposals.forEach(proposal => {
        if (proposal.name?.toLowerCase().includes(term)) {
          results.push({
            id: proposal.id,
            type: 'proposal',
            title: proposal.name,
            description: `Proposal created ${new Date(proposal.createdAt).toLocaleDateString()}`,
            category: 'Proposals',
            icon: FiFileText,
            data: proposal
          });
        }
        
        // Search in proposal sections
        proposal.sections?.forEach(section => {
          if (section.title?.toLowerCase().includes(term) || 
              section.content?.toLowerCase().includes(term)) {
            results.push({
              id: `${proposal.id}-${section.id}`,
              type: 'proposal-section',
              title: `${section.title} (in ${proposal.name})`,
              description: section.content?.replace(/<[^>]*>/g, '').substring(0, 100) + '...',
              category: 'Proposals',
              icon: FiFileText,
              data: { proposal, section }
            });
          }
        });
      });
    }

    // Search in clients
    if (activeFilters.clients) {
      clients.forEach(client => {
        if (client.name?.toLowerCase().includes(term) || 
            client.email?.toLowerCase().includes(term) ||
            client.company?.toLowerCase().includes(term)) {
          results.push({
            id: client.id,
            type: 'client',
            title: client.name,
            description: `${client.company} - ${client.email}`,
            category: 'Clients',
            icon: FiUsers,
            data: client
          });
        }
      });
    }

    // Search in firm experience
    if (activeFilters.firmExperience) {
      firmExperience.forEach(experience => {
        if (experience.client?.toLowerCase().includes(term) ||
            experience.description?.toLowerCase().includes(term) ||
            experience.sector?.toLowerCase().includes(term) ||
            (Array.isArray(experience.keywords) && experience.keywords.some(keyword => keyword.toLowerCase().includes(term)))) {
          results.push({
            id: experience.id,
            type: 'firmExperience',
            title: experience.client,
            description: `${experience.year} - ${experience.sector} - ${experience.description?.substring(0, 100)}...`,
            category: 'Firm Experience',
            icon: FiStar,
            data: experience
          });
        }
      });
    }

    // Search in services
    if (activeFilters.services) {
      services.forEach(service => {
        if (service.name?.toLowerCase().includes(term) ||
            service.category?.toLowerCase().includes(term) ||
            service.description?.toLowerCase().includes(term)) {
          results.push({
            id: service.id,
            type: 'service',
            title: service.name,
            description: `${service.category} - ${service.price}`,
            category: 'Services',
            icon: FiBriefcase,
            data: service
          });
        }
      });
    }

    // Search in team members
    if (activeFilters.teamMembers) {
      teamMembers.forEach(member => {
        if (member.name?.toLowerCase().includes(term) ||
            member.role?.toLowerCase().includes(term) ||
            member.skills?.toLowerCase().includes(term)) {
          results.push({
            id: member.id,
            type: 'teamMember',
            title: member.name,
            description: `${member.role} - ${member.skills?.substring(0, 50)}...`,
            category: 'Team Members',
            icon: FiUsers,
            data: member
          });
        }
      });
    }

    // Search in branding templates
    if (activeFilters.branding) {
      brandingTemplates.forEach(template => {
        if (template.name?.toLowerCase().includes(term)) {
          results.push({
            id: template.id,
            type: 'branding',
            title: template.name,
            description: `Branding template with ${template.colors?.primary || 'custom'} color scheme`,
            category: 'Branding',
            icon: FiSettings,
            data: template
          });
        }
      });
    }

    return results.slice(0, 20); // Limit to 20 results
  }, [searchTerm, activeFilters, proposals, clients, firmExperience, services, teamMembers, brandingTemplates]);

  const handleFilterChange = (filterKey) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterKey]: !prev[filterKey]
    }));
  };

  const getActiveFilterCount = () => {
    return Object.values(activeFilters).filter(Boolean).length;
  };

  const clearAllFilters = () => {
    setActiveFilters({
      proposals: false,
      clients: false,
      firmExperience: false,
      services: false,
      teamMembers: false,
      branding: false
    });
  };

  const selectAllFilters = () => {
    setActiveFilters({
      proposals: true,
      clients: true,
      firmExperience: true,
      services: true,
      teamMembers: true,
      branding: true
    });
  };

  const handleResultClick = (result) => {
    setShowResults(false);
    setSearchTerm('');
    if (onResultClick) {
      onResultClick(result);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.search-container')) {
        setShowFilters(false);
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <SearchContainer className="search-container">
      <SearchInputContainer>
        <SearchIcon size={18} />
        <SearchInput
          type="text"
          placeholder="Search proposals, clients, firm experience, services..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setShowResults(e.target.value.trim().length > 0);
          }}
          onFocus={() => {
            if (searchTerm.trim()) setShowResults(true);
          }}
        />
        <FilterButton
          active={showFilters}
          onClick={() => setShowFilters(!showFilters)}
        >
          <FiFilter size={16} />
          {getActiveFilterCount() < 6 && `(${getActiveFilterCount()})`}
        </FilterButton>
      </SearchInputContainer>

      {/* Active Filters Display */}
      {Object.values(activeFilters).some(Boolean) && getActiveFilterCount() < 6 && (
        <ActiveFilters>
          {filterOptions.map(option => 
            activeFilters[option.key] && (
              <ActiveFilter key={option.key}>
                <option.icon size={12} />
                {option.label}
                <RemoveFilterButton onClick={() => handleFilterChange(option.key)}>
                  <FiX size={12} />
                </RemoveFilterButton>
              </ActiveFilter>
            )
          )}
        </ActiveFilters>
      )}

      {/* Filter Dropdown */}
      {showFilters && (
        <FilterDropdown>
          <FilterSection>
            <FilterSectionTitle>Search In</FilterSectionTitle>
            {filterOptions.map(option => (
              <FilterOption key={option.key}>
                <FilterCheckbox
                  type="checkbox"
                  checked={activeFilters[option.key]}
                  onChange={() => handleFilterChange(option.key)}
                />
                <FilterIcon>
                  <option.icon size={16} />
                </FilterIcon>
                {option.label}
              </FilterOption>
            ))}
          </FilterSection>
          <FilterSection>
            <FilterOption onClick={selectAllFilters} style={{ cursor: 'pointer' }}>
              <FilterIcon>
                <FiFolder size={16} />
              </FilterIcon>
              Select All
            </FilterOption>
            <FilterOption onClick={clearAllFilters} style={{ cursor: 'pointer' }}>
              <FilterIcon>
                <FiX size={16} />
              </FilterIcon>
              Clear All
            </FilterOption>
          </FilterSection>
        </FilterDropdown>
      )}

      {/* Search Results */}
      {showResults && (
        <SearchResults>
          {searchResults.length > 0 ? (
            searchResults.map(result => (
              <SearchResultItem
                key={result.id}
                onClick={() => handleResultClick(result)}
              >
                <ResultTitle>
                  <result.icon size={16} />
                  {result.title}
                  <ResultCategory>{result.category}</ResultCategory>
                </ResultTitle>
                <ResultDescription>{result.description}</ResultDescription>
              </SearchResultItem>
            ))
          ) : (
            <NoResults>
              No results found for "{searchTerm}"
            </NoResults>
          )}
        </SearchResults>
      )}
    </SearchContainer>
  );
};

export default GlobalSearch;