import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [proposals, setProposals] = useState([]);
  const [currentProposal, setCurrentProposal] = useState(null);
  const [clients, setClients] = useState([]);
  const [caseStudies, setCaseStudies] = useState([]);
  const [services, setServices] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [brandingTemplates, setBrandingTemplates] = useState([]);
  const [currentBranding, setCurrentBranding] = useState({
    colors: {
      primary: '#007bff',
      secondary: '#6c757d',
      accent: '#28a745'
    },
    fonts: {
      primary: 'Arial, sans-serif',
      secondary: 'Georgia, serif'
    },
    logo: null,
    watermark: null,
    headerText: '',
    footerText: ''
  });

  // Load data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('propact-data');
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        setProposals(data.proposals || []);
        setClients(data.clients || []);
        setCaseStudies(data.caseStudies || []);
        setServices(data.services || []);
        setTeamMembers(data.teamMembers || []);
        setBrandingTemplates(data.brandingTemplates || []);
        
        if (data.currentBranding) {
          setCurrentBranding(data.currentBranding);
        }
        
        if (data.currentProposal) {
          setCurrentProposal(data.currentProposal);
        } else if (data.proposals && data.proposals.length > 0) {
          setCurrentProposal(data.proposals[0]);
        }
      } catch (error) {
        console.error('Error loading saved data:', error);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save data to localStorage whenever state changes (only after initial load)
  useEffect(() => {
    if (!isLoaded) return; // Don't save until initial load is complete
    
    const dataToSave = {
      proposals,
      currentProposal,
      clients,
      caseStudies,
      services,
      teamMembers,
      brandingTemplates,
      currentBranding
    };
    localStorage.setItem('propact-data', JSON.stringify(dataToSave));
  }, [isLoaded, proposals, currentProposal, clients, caseStudies, services, teamMembers, brandingTemplates, currentBranding]);

  const updateProposal = (proposalId, updates) => {
    setProposals(prev => prev.map(proposal => 
      proposal.id === proposalId 
        ? { ...proposal, ...updates, updatedAt: new Date().toISOString() }
        : proposal
    ));
    
    if (currentProposal && currentProposal.id === proposalId) {
      setCurrentProposal(prev => ({ 
        ...prev, 
        ...updates, 
        updatedAt: new Date().toISOString() 
      }));
    }
  };

  const addClient = (client) => {
    const newClient = {
      ...client,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    setClients(prev => [...prev, newClient]);
    return newClient;
  };

  const addCaseStudy = (caseStudy) => {
    const newCaseStudy = {
      ...caseStudy,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    setCaseStudies(prev => [...prev, newCaseStudy]);
    return newCaseStudy;
  };

  const addService = (service) => {
    const newService = {
      ...service,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    setServices(prev => [...prev, newService]);
    return newService;
  };

  const addTeamMember = (member) => {
    const newMember = {
      ...member,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    setTeamMembers(prev => [...prev, newMember]);
    return newMember;
  };

  const addBrandingTemplate = (template) => {
    const newTemplate = {
      ...template,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    setBrandingTemplates(prev => [...prev, newTemplate]);
    return newTemplate;
  };

  const value = {
    // Proposals
    proposals,
    setProposals,
    currentProposal,
    setCurrentProposal,
    updateProposal,
    
    // Content Management
    clients,
    setClients,
    addClient,
    caseStudies,
    setCaseStudies,
    addCaseStudy,
    services,
    setServices,
    addService,
    teamMembers,
    setTeamMembers,
    addTeamMember,
    
    // Branding
    brandingTemplates,
    setBrandingTemplates,
    addBrandingTemplate,
    currentBranding,
    setCurrentBranding
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};