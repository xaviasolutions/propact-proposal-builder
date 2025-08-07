import React, { useState } from 'react';
import styled from 'styled-components';
import { FiUsers, FiBriefcase, FiStar, FiUser, FiFileText, FiSave } from 'react-icons/fi';
import ClientManager from './ClientManager';
import CaseStudyManager from './CaseStudyManager';
import ServiceManager from './ServiceManager';
import TeamManager from './TeamManager';
import CoverManager from './CoverManager';
import PreSavedContentManager from './PreSavedContentManager';


const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: calc(100vh - 140px);
`;

const TabContainer = styled.div`
  display: flex;
  background: white;
  border-radius: 8px 8px 0 0;
  border-bottom: 1px solid #e0e0e0;
  margin-bottom: 0;
`;

const Tab = styled.button`
  padding: 16px 24px;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: ${props => props.active ? '#007bff' : '#666'};
  border-bottom: 2px solid ${props => props.active ? '#007bff' : 'transparent'};
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    color: #007bff;
    background: #f8f9fa;
  }
`;

const ContentArea = styled.div`
  flex: 1;
  background: white;
  border-radius: 0 0 8px 8px;
  padding: 20px;
  overflow-y: auto;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const ContentManager = () => {
  const [activeTab, setActiveTab] = useState('clients');

  const tabs = [
    { id: 'clients', label: 'Clients', icon: FiUsers },
    { id: 'case-studies', label: 'Case Studies', icon: FiBriefcase },
    { id: 'services', label: 'Services', icon: FiStar },
    { id: 'team', label: 'Team Members', icon: FiUser },
    { id: 'covers', label: 'Cover Pages', icon: FiFileText },
    // { id: 'pre-saved', label: 'Pre-saved Content', icon: FiSave },
  ];

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'clients':
        return <ClientManager />;
      case 'case-studies':
        return <CaseStudyManager />;
      case 'services':
        return <ServiceManager />;
      case 'team':
        return <TeamManager />;
      case 'covers':
        return <CoverManager />;
      case 'pre-saved':
        return <PreSavedContentManager />;
      default:
        return <ClientManager />;
    }
  };

  return (
    <ContentContainer>
      <TabContainer>
        {tabs.map(tab => {
          const IconComponent = tab.icon;
          return (
            <Tab
              key={tab.id}
              active={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
            >
              <IconComponent size={16} />
              {tab.label}
            </Tab>
          );
        })}
      </TabContainer>
      
      <ContentArea>
        {renderActiveTab()}
      </ContentArea>
    </ContentContainer>
  );
};

export default ContentManager;