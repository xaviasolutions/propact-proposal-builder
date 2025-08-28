import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './store';
import Sidebar from './components/Sidebar/Sidebar';
import ProposalBuilder from './components/ProposalBuilder/ProposalBuilder';
import ContentManager from './components/ContentManager/ContentManager';
import BrandingTemplates from './components/BrandingTemplates/BrandingTemplates';
import GlobalSearch from './components/GlobalSearch/GlobalSearch';
import { useDispatch, useSelector } from 'react-redux';
import { setProposals, setCurrentProposal } from './store/slices/proposalsSlice';
import { v4 as uuidv4 } from 'uuid';

const AppContainer = styled.div`
  display: flex;
  height: 100vh;
  background-color: #f5f5f5;
`;

const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const TabContainer = styled.div`
  display: flex;
  background-color: white;
  border-bottom: 1px solid #e0e0e0;
  padding: 0 20px;
`;

const Tab = styled.button`
  padding: 12px 24px;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: ${props => props.active ? '#007bff' : '#666'};
  border-bottom: 2px solid ${props => props.active ? '#007bff' : 'transparent'};
  transition: all 0.2s ease;

  &:hover {
    color: #007bff;
  }
`;

const ContentArea = styled.div`
  flex: 1;
  overflow: auto;
  padding: 20px;
`;

const SearchArea = styled.div`
  background: white;
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
  position: sticky;
  top: 0;
  z-index: 100;
`;

// Main App Content Component
function AppContent() {
  const [activeTab, setActiveTab] = useState('builder');
  const dispatch = useDispatch();
  const { proposals } = useSelector(state => state.proposals);

  // Initialize with a default proposal ONLY if no persisted data exists
  useEffect(() => {
    // Only create default data if no proposals exist (meaning no persisted data was loaded)
    if (proposals.length === 0) {
      const defaultProposal = {
        id: uuidv4(),
        name: 'Sample Proposal',
        clientId: '1', // Reference to TechCorp Solutions client
        sections: [
          { 
            id: uuidv4(), 
            type: 'cover', 
            title: 'Cover Letter', 
            content: ``, 
            order: 0 
          },
          { 
            id: uuidv4(), 
            type: 'scope', 
            title: 'Scope of Work', 
            content: ``, 
            order: 1 
          },
//           { 
//             id: uuidv4(), 
//             type: 'fees', 
//             title: 'Fees', 
//             content: `<h2>Investment & Timeline</h2>
// <h3>Project Investment</h3>
// <table border="1" style="width: 100%; border-collapse: collapse; margin: 20px 0;">
// <tr style="background-color: #f8f9fa;"><th style="padding: 10px; text-align: left;">Phase</th><th style="padding: 10px; text-align: left;">Duration</th><th style="padding: 10px; text-align: left;">Investment</th></tr>
// <tr><td style="padding: 10px;">Discovery & Planning</td><td style="padding: 10px;">2 weeks</td><td style="padding: 10px;">$15,000</td></tr>
// <tr><td style="padding: 10px;">Development & Implementation</td><td style="padding: 10px;">8 weeks</td><td style="padding: 10px;">$45,000</td></tr>
// <tr><td style="padding: 10px;">Deployment & Support</td><td style="padding: 10px;">2 weeks</td><td style="padding: 10px;">$10,000</td></tr>
// <tr style="background-color: #f8f9fa; font-weight: bold;"><td style="padding: 10px;">Total</td><td style="padding: 10px;">12 weeks</td><td style="padding: 10px;">$70,000</td></tr>
// </table>
// <h3>Payment Schedule</h3>
// <ul>
// <li>50% upon project commencement</li>
// <li>30% at development milestone completion</li>
// <li>20% upon final delivery and acceptance</li>
// </ul>`, 
//             order: 2 
//           },
          { 
            id: uuidv4(), 
            type: 'team', 
            title: 'Our Team', 
            content: ``, 
            order: 3 
          },
          { 
            id: uuidv4(), 
            type: 'cvs', 
            title: 'Team CVs', 
            content: ``, 
            order: 4 
          }
        ],
        branding: {
          logo: null,
          primaryColor: '#007bff',
          secondaryColor: '#6c757d',
          fontFamily: 'Arial, sans-serif',
          headerText: '',
          footerText: '',
          watermark: null
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Initialize default data only if no data exists
      dispatch(setProposals([defaultProposal]));
      dispatch(setCurrentProposal(defaultProposal));
    }
  }, [dispatch, proposals.length]);

  const tabs = [
    { id: 'builder', label: 'Proposal Builder' },
    { id: 'content', label: 'Content Manager' },
    { id: 'branding', label: 'Branding & Templates' }
  ];

  const handleSearchResult = (result) => {
    console.log('Search result clicked:', result);
    
    // Navigate to appropriate tab based on result type
    switch (result.type) {
      case 'proposal':
      case 'proposal-section':
        setActiveTab('builder');
        if (result.data.proposal) {
          dispatch(setCurrentProposal(result.data.proposal));
        } else if (result.data) {
          dispatch(setCurrentProposal(result.data));
        }
        break;
      case 'client':
      case 'firmExperience':
      case 'service':
      case 'teamMember':
        setActiveTab('content');
        break;
      case 'branding':
        setActiveTab('branding');
        break;
      default:
        break;
    }
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'builder':
        return <ProposalBuilder />;
      case 'content':
        return <ContentManager />;
      case 'branding':
          return <BrandingTemplates />;
      default:
        return <ProposalBuilder />;
    }
  };

  return (
    <AppContainer>
      <Sidebar />
      <MainContent>
        <TabContainer>
          {tabs.map(tab => (
            <Tab
              key={tab.id}
              active={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </Tab>
          ))}
        </TabContainer>
        <SearchArea>
          <GlobalSearch onResultClick={handleSearchResult} />
        </SearchArea>
        <ContentArea>
          {renderActiveTab()}
        </ContentArea>
      </MainContent>
    </AppContainer>
  );
}

// Main App Component with Redux Provider
function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={<div>Loading...</div>} persistor={persistor}>
        <AppContent />
      </PersistGate>
    </Provider>
  );
}

export default App;