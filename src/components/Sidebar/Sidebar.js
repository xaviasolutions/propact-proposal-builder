import React, { useState } from 'react';
import styled from 'styled-components';
import { FiPlus, FiDownload, FiChevronDown, FiTrash2 } from 'react-icons/fi';
import { useSelector, useDispatch } from 'react-redux';
import { addProposal, setCurrentProposal, deleteProposal } from '../../store/slices/proposalsSlice';
import { v4 as uuidv4 } from 'uuid';
import { exportToDocx } from '../../utils/docxExporter';
import { exportToPdf } from '../../utils/pdfExporter';
import TemplateSelector from '../TemplateSelector/TemplateSelector';

const SidebarContainer = styled.div`
  width: 300px;
  background-color: white;
  border-right: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  height: 100vh;
`;

const Header = styled.div`
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
`;

const Logo = styled.h1`
  font-size: 24px;
  font-weight: bold;
  color: #007bff;
  margin: 0;
`;

const Subtitle = styled.p`
  font-size: 14px;
  color: #666;
  margin: 5px 0 0 0;
`;

const Section = styled.div`
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
`;

const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 15px;
`;

const Button = styled.button`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #007bff;
  background-color: ${props => props.primary ? '#007bff' : 'white'};
  color: ${props => props.primary ? 'white' : '#007bff'};
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${props => props.primary ? '#0056b3' : '#f8f9fa'};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ProposalList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
`;

const ProposalItem = styled.div`
  padding: 12px 16px;
  border: 1px solid ${props => props.active ? '#007bff' : '#e0e0e0'};
  background-color: ${props => props.active ? '#f8f9fa' : 'white'};
  border-radius: 6px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  justify-content: space-between;
  align-items: center;

  &:hover {
    border-color: #007bff;
    background-color: #f8f9fa;
  }
`;

const ProposalName = styled.div`
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
`;

const ProposalDate = styled.div`
  font-size: 12px;
  color: #666;
`;

const ProposalContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const DeleteButton = styled.button`
  background: none;
  border: none;
  color: #dc3545;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  margin-left: 8px;

  &:hover {
    background-color: #dc3545;
    color: white;
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(220, 53, 69, 0.25);
  }
`;

const ExportDropdown = styled.div`
  position: relative;
  display: inline-block;
  width: 100%;
`;

const DropdownButton = styled.button`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #007bff;
  background-color: white;
  color: #007bff;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  transition: all 0.2s ease;

  &:hover {
    background-color: #f8f9fa;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const DropdownContent = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  margin-top: -10px;
  margin-bottom: 10px;
  display: ${props => props.show ? 'block' : 'none'};
`;

const DropdownItem = styled.button`
  width: 100%;
  padding: 12px 16px;
  border: none;
  background: white;
  color: #333;
  text-align: left;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #f8f9fa;
  }

  &:first-child {
    border-radius: 6px 6px 0 0;
  }

  &:last-child {
    border-radius: 0 0 6px 6px;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const Sidebar = () => {
  const dispatch = useDispatch();
  const { proposals, currentProposal } = useSelector(state => state.proposals);
  const [isExporting, setIsExporting] = useState(false);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);

  const createNewProposal = () => {
    setShowTemplateSelector(true);
  };

  const handleTemplateSelect = (selection) => {
    const { template: selectedTemplate, cover: selectedCover } = selection;
    
    // Create cover section content based on selected cover template
    let coverContent = '';
    if (selectedCover) {
      coverContent = `${selectedCover.header ? selectedCover.header + '\n\n' : ''}${selectedCover.content}${selectedCover.footer ? '\n\n' + selectedCover.footer : ''}`;
    }
    
    const newProposal = {
      id: uuidv4(),
      name: `Proposal ${proposals.length + 1}`,
      sections: [
        { 
          id: uuidv4(), 
          type: 'cover', 
          title: 'Cover Letter', 
          content: coverContent, 
          order: 0 
        },
        { id: uuidv4(), type: 'scope', title: 'Scope of Work', content: '', order: 1 },
        { id: uuidv4(), type: 'fees', title: 'Fees & Timeline', content: '', order: 2 },
        { id: uuidv4(), type: 'team', title: 'Our Team', content: '', order: 3 },
        { id: uuidv4(), type: 'cvs', title: 'Team CVs', content: '', order: 4 }
      ],
      branding: selectedTemplate || {
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
      },
      coverTemplate: selectedCover || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    dispatch(addProposal(newProposal));
    dispatch(setCurrentProposal(newProposal));
    setShowTemplateSelector(false);
  };

  const handleExportToDocx = async () => {
    if (!currentProposal) return;
    
    setIsExporting(true);
    setShowExportDropdown(false);
    try {
      await exportToDocx(currentProposal, currentProposal.branding);
    } catch (error) {
      console.error('DOCX Export failed:', error);
      alert('DOCX Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportToPdf = async () => {
    if (!currentProposal) return;
    
    setIsExporting(true);
    setShowExportDropdown(false);
    try {
      await exportToPdf(currentProposal);
    } catch (error) {
      console.error('PDF Export failed:', error);
      alert('PDF Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const toggleExportDropdown = () => {
    setShowExportDropdown(!showExportDropdown);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleDeleteProposal = (proposalId, proposalName, event) => {
    event.stopPropagation(); // Prevent triggering the proposal selection
    
    if (window.confirm(`Are you sure you want to delete "${proposalName}"? This action cannot be undone.`)) {
      dispatch(deleteProposal(proposalId));
    }
  };

  return (
    <SidebarContainer>
      <Header>
        <Logo>Propact</Logo>
        <Subtitle>Professional Proposal Builder</Subtitle>
      </Header>

      <Section>
        <SectionTitle>Actions</SectionTitle>
        <Button primary onClick={createNewProposal}>
          <FiPlus size={16} />
          New Proposal
        </Button>
        <ExportDropdown>
          <DropdownButton 
            onClick={toggleExportDropdown}
            disabled={!currentProposal || isExporting}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiDownload size={16} />
              {isExporting ? 'Exporting...' : 'Export Proposal'}
            </span>
            <FiChevronDown size={16} />
          </DropdownButton>
          <DropdownContent show={showExportDropdown}>
            <DropdownItem 
              onClick={handleExportToDocx}
              disabled={isExporting}
            >
              <FiDownload size={16} />
              Export as DOCX
            </DropdownItem>
            <DropdownItem 
              onClick={handleExportToPdf}
              disabled={isExporting}
            >
              <FiDownload size={16} />
              Export as PDF
            </DropdownItem>
          </DropdownContent>
        </ExportDropdown>
      </Section>

      <ProposalList>
        <SectionTitle>Your Proposals</SectionTitle>
        {proposals.map(proposal => (
          <ProposalItem
            key={proposal.id}
            active={currentProposal?.id === proposal.id}
            onClick={() => dispatch(setCurrentProposal(proposal))}
          >
            <ProposalContent>
              <ProposalName>{proposal.name}</ProposalName>
              <ProposalDate>
                Updated {formatDate(proposal.updatedAt)}
              </ProposalDate>
            </ProposalContent>
            <DeleteButton
              onClick={(e) => handleDeleteProposal(proposal.id, proposal.name, e)}
              title="Delete proposal"
            >
              <FiTrash2 size={16} />
            </DeleteButton>
          </ProposalItem>
        ))}
        {proposals.length === 0 && (
          <div style={{ 
            textAlign: 'center', 
            color: '#666', 
            fontSize: '14px',
            marginTop: '20px' 
          }}>
            No proposals yet. Create your first one!
          </div>
        )}
      </ProposalList>

      <TemplateSelector
        isOpen={showTemplateSelector}
        onClose={() => setShowTemplateSelector(false)}
        onSelect={handleTemplateSelect}
      />
    </SidebarContainer>
  );
};

export default Sidebar;