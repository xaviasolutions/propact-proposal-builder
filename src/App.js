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
            content: `<h2>Dear Valued Client,</h2>
<p>We are excited to present this comprehensive proposal for your upcoming project. Our team has carefully analyzed your requirements and developed a tailored solution that addresses your specific needs.</p>
<p>This proposal outlines our understanding of your project, our recommended approach, timeline, and investment details. We believe our expertise and commitment to excellence make us the ideal partner for your project.</p>
<p>We look forward to discussing this proposal with you and answering any questions you may have.</p>
<p><strong>Best regards,</strong><br>The Project Team</p>`, 
            order: 0 
          },
          { 
            id: uuidv4(), 
            type: 'scope', 
            title: 'Scope of Work', 
            content: `<h2>Project Scope & Deliverables</h2>
<h3>Phase 1: Discovery & Planning</h3>
<ul>
<li>Stakeholder interviews and requirements gathering</li>
<li>Technical architecture design</li>
<li>Project timeline and milestone definition</li>
</ul>
<h3>Phase 2: Development & Implementation</h3>
<ul>
<li>Core functionality development</li>
<li>User interface design and implementation</li>
<li>Quality assurance and testing</li>
</ul>
<h3>Phase 3: Deployment & Support</h3>
<ul>
<li>Production deployment</li>
<li>User training and documentation</li>
<li>Ongoing support and maintenance</li>
</ul>`, 
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
            content: `<h2>Our Expert Team</h2>
<h3>Project Manager</h3>
<p><strong>Sarah Johnson</strong> - 8+ years of project management experience in technology solutions</p>
<h3>Lead Developer</h3>
<p><strong>Michael Chen</strong> - Senior full-stack developer with expertise in modern web technologies</p>
<h3>UX/UI Designer</h3>
<p><strong>Emily Rodriguez</strong> - Creative designer specializing in user-centered design principles</p>
<h3>Quality Assurance</h3>
<p><strong>David Kim</strong> - QA specialist ensuring robust and reliable solutions</p>`, 
            order: 3 
          },
          { 
            id: uuidv4(), 
            type: 'cvs', 
            title: 'Team CVs', 
            content: `<h2>Team Qualifications</h2>
<h3>Sarah Johnson - Project Manager</h3>
<ul>
<li>MBA in Technology Management</li>
<li>PMP Certified</li>
<li>Led 50+ successful technology projects</li>
<li>Expertise in Agile and Waterfall methodologies</li>
</ul>
<h3>Michael Chen - Lead Developer</h3>
<ul>
<li>M.S. Computer Science</li>
<li>10+ years full-stack development</li>
<li>Expert in React, Node.js, Python, AWS</li>
<li>Open source contributor</li>
</ul>
<h3>Emily Rodriguez - UX/UI Designer</h3>
<ul>
<li>B.A. Graphic Design</li>
<li>Google UX Design Certificate</li>
<li>5+ years designing digital experiences</li>
<li>Proficient in Figma, Adobe Creative Suite</li>
</ul>`, 
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
      case 'caseStudy':
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