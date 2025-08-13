import React, { useState, useEffect, useCallback, useRef } from 'react';
import styled from 'styled-components';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { FiType, FiFileText, FiUsers, FiBriefcase, FiTable, FiStar, FiMinus, FiSave, FiMove } from 'react-icons/fi';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useSelector } from 'react-redux';

const EditorContainer = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const EditorHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e0e0e0;
`;

const EditorTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: #333;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const AutosaveStatus = styled.div`
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
  color: #666;
  background: ${props => props.isSaving ? '#fff3cd' : '#d4edda'};
  border: 1px solid ${props => props.isSaving ? '#ffeaa7' : '#c3e6cb'};
  
  &.saving {
    color: #856404;
  }
  
  &.saved {
    color: #155724;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;
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

const QuillContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 400px;
  max-height: 400px;
  
  .ql-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    height: 100%;
  }
  
  .ql-editor {
    flex: 1;
    min-height: 300px;
    max-height: 350px;
    overflow-y: auto;
    word-wrap: break-word;
    word-break: break-word;
    white-space: pre-wrap;
    line-height: 1.6;
  }
  
  .ql-toolbar {
    border-bottom: 1px solid #e0e0e0;
    flex-shrink: 0;
  }
`;

const SelectorContainer = styled.div`
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 20px;
  background: #f8f9fa;
  margin-bottom: 20px;
`;

const SelectorTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ItemGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
`;

const ItemCard = styled.div`
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #007bff;
    background: #f0f8ff;
  }
  
  &.selected {
    border-color: #007bff;
    background: #e3f2fd;
  }
`;

const ItemTitle = styled.div`
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
`;

const ItemSubtitle = styled.div`
  font-size: 12px;
  color: #666;
  margin-bottom: 8px;
`;

const ItemPreview = styled.div`
  font-size: 12px;
  color: #666;
  line-height: 1.4;
  max-height: 60px;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const TableToolbar = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 4px;
`;

const TableButton = styled.button`
  padding: 6px 12px;
  border: 1px solid #007bff;
  background: white;
  color: #007bff;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #007bff;
    color: white;
  }
`;



const ClientInfoContainer = styled.div`
  background: #e8f4fd;
  border: 1px solid #b3d9ff;
  border-radius: 4px;
  padding: 16px;
  margin-bottom: 20px;
`;

const ClientInfoTitle = styled.h4`
  font-size: 14px;
  font-weight: 600;
  color: #0056b3;
  margin-bottom: 12px;
`;

const ClientInfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
`;

const ClientInfoItem = styled.div`
  font-size: 12px;
  color: #333;
  
  .label {
    font-weight: 500;
    color: #0056b3;
  }
  
  .value {
    margin-top: 2px;
  }
`;

const RadioGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
`;

const RadioOption = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background: white;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #007bff;
    background: #f0f8ff;
  }
  
  &.selected {
    border-color: #007bff;
    background: #e3f2fd;
  }
`;

const RadioInput = styled.input`
  margin: 0;
`;

const RadioLabel = styled.span`
  font-weight: 500;
  color: #333;
`;

const CheckboxContainer = styled.div`
  margin: 16px 0;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 4px;
  border: 1px solid #e0e0e0;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-weight: 500;
  color: #333;
`;

const CheckboxInput = styled.input`
  margin: 0;
`;

// Legal Fees styled components
const FeesContainer = styled.div`
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 20px;
`;

const FeesSection = styled.div`
  margin-bottom: 24px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const FeesTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
  border-bottom: 2px solid #007bff;
  padding-bottom: 8px;
`;

const FeesSubtitle = styled.h4`
  font-size: 16px;
  font-weight: 500;
  color: #555;
  margin-bottom: 12px;
`;

const InputGroup = styled.div`
  display: grid;
  grid-template-columns: ${props => props.columns || '1fr'};
  gap: 16px;
  margin-bottom: 16px;
`;

const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const SmallInput = styled(Input)`
  width: 120px;
`;

const RatesTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 16px;
  background: white;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
`;

const TableHeader = styled.th`
  background: #007bff;
  color: white;
  padding: 12px;
  text-align: left;
  font-weight: 600;
  font-size: 14px;
`;

const TableCell = styled.td`
  padding: 12px;
  border-bottom: 1px solid #e0e0e0;
  vertical-align: middle;
`;

const TableRow = styled.tr`
  &:hover {
    background: #f8f9fa;
  }
  
  &:last-child td {
    border-bottom: none;
  }
`;

const AssumptionsList = styled.div`
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 16px;
`;

const AssumptionItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
  padding: 8px;
  background: #f8f9fa;
  border-radius: 4px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const AssumptionText = styled.textarea`
  flex: 1;
  border: none;
  background: transparent;
  resize: vertical;
  min-height: 40px;
  font-size: 14px;
  line-height: 1.4;
  outline: none;
  font-family: inherit;
`;

const RemoveButton = styled.button`
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 14px;
  margin: 0;
  transition: background 0.2s ease;
  white-space: nowrap;
  
  &:hover {
    background: #c82333;
  }
`;

const AddButton = styled.button`
  background: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 14px;
  margin: 0;
  transition: background 0.2s ease;
  white-space: nowrap;
  
  &:hover {
    background: #218838;
  }
`;

const WorkstreamContainer = styled.div`
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 16px;
  margin-bottom: 12px;
`;

const WorkstreamHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const CurrencySelect = styled(Select)`
  width: 200px;
  min-width: 200px;
`;

const SectionEditor = ({ section, onUpdate }) => {
  const [title, setTitle] = useState(section.title);
  const [type, setType] = useState(section.type);
  const [content, setContent] = useState(section.content);
  const [selectedCoverId, setSelectedCoverId] = useState(null);
  const [selectedTeamMembers, setSelectedTeamMembers] = useState([]);
  const [selectedCaseStudies, setSelectedCaseStudies] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedPreSavedContent, setSelectedPreSavedContent] = useState([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const saveTimeoutRef = useRef(null);

  // Table-specific state
  const [tableData, setTableData] = useState([
    ['Header 1', 'Header 2', 'Header 3'],
    ['Cell 1,1', 'Cell 1,2', 'Cell 1,3'],
    ['Cell 2,1', 'Cell 2,2', 'Cell 2,3']
  ]);
  const [tableTitle, setTableTitle] = useState('');
  const [tableDescription, setTableDescription] = useState('');
  const [tableNote, setTableNote] = useState('');
  const [tablePageBreak, setTablePageBreak] = useState(true); // Default to true
  
  // Fees-specific state
  const [feeType, setFeeType] = useState('fixed'); // 'fixed', 'hourly', 'capped'
  const [includeWorkstream, setIncludeWorkstream] = useState(false);
  const [fixedFeeContent, setFixedFeeContent] = useState('');
  const [hourlyFeeContent, setHourlyFeeContent] = useState('');
  const [cappedFeeContent, setCappedFeeContent] = useState('');
  const [workstreamContent, setWorkstreamContent] = useState('');
  
  // Legal fees specific state
  const [hourlyRates, setHourlyRates] = useState([
    { position: 'Senior Partner', rate: '', discountedRate: '' },
    { position: 'Partner', rate: '', discountedRate: '' },
    { position: 'Senior Associate', rate: '', discountedRate: '' },
    { position: 'Associate', rate: '', discountedRate: '' },
    { position: 'Paralegal/Trainee', rate: '', discountedRate: '' }
  ]);
  const [translationRate, setTranslationRate] = useState(''); // OMR per 250 words
  const [translationContent, setTranslationContent] = useState(''); // Translation charges content
  const [includeTaxes, setIncludeTaxes] = useState(true); // Include taxes by default
  const [taxContent, setTaxContent] = useState(''); // Tax content
  const [vatRate, setVatRate] = useState('5'); // Default 5%
  const [maxRevisions, setMaxRevisions] = useState('');
  const [maxHours, setMaxHours] = useState('');
  const [assumptions, setAssumptions] = useState([
    'Scope of work will not expand beyond workstreams listed in Schedule A',
    'No in-person meetings required in specified locations unless agreed',
    'Drafting limited to agreements/documents relevant to the project',
    'Advice confined to Omani law unless otherwise agreed',
    'Any work outside the defined schedules requires prior approval',
    'Deliverables will be prepared in English',
    'Judicial or court costs excluded'
  ]);
  const [workstreams, setWorkstreams] = useState([
    { name: '', amount: '', type: 'fixed', description: '' } // type: 'fixed' or 'capped'
  ]);
  const [includeDiscountedRates, setIncludeDiscountedRates] = useState(false);
  const [includeTranslation, setIncludeTranslation] = useState(true);
  const [currency, setCurrency] = useState('OMR');
  
  // Editable headers state
  const [positionHeader, setPositionHeader] = useState('Position');
  const [standardRateHeader, setStandardRateHeader] = useState('Standard Rate');
  const [assumptionsTitle, setAssumptionsTitle] = useState('Other Assumptions');
  const [additionalDetailsTitle, setAdditionalDetailsTitle] = useState('Additional Details');
  
  const covers = useSelector(state => state.covers.covers);
  const teamMembers = useSelector(state => state.teamMembers.teamMembers);
  const caseStudies = useSelector(state => state.caseStudies.caseStudies);
  const services = useSelector(state => state.services.services);
  const clients = useSelector(state => state.clients.clients);
  const currentProposal = useSelector(state => state.proposals.currentProposal);
  const preSavedContent = useSelector(state => state.preSavedContent?.items || []);

  useEffect(() => {
    setTitle(section.title);
    setType(section.type);
    setContent(section.content);
    setHasChanges(false);
    
    // Load section-specific data
    if (section.selectedTeamMembers) {
      setSelectedTeamMembers(section.selectedTeamMembers);
    }
    if (section.selectedCaseStudies) {
      setSelectedCaseStudies(section.selectedCaseStudies);
    }
    if (section.selectedServices) {
      setSelectedServices(section.selectedServices);
    }
    if (section.selectedCoverId) {
      setSelectedCoverId(section.selectedCoverId);
    }
    
    // Load table data for table sections
    if (section.type === 'table') {
      if (section.tableData) {
        setTableData(section.tableData);
      }
      setTableTitle(section.tableTitle || '');
      setTableDescription(section.tableDescription || '');
      setTableNote(section.tableNote || '');
      setTablePageBreak(section.tablePageBreak !== undefined ? section.tablePageBreak : true);
    }
    
    // Load fees data for fees sections
    if (section.type === 'fees') {
      setFeeType(section.feeType || 'fixed');
      setIncludeWorkstream(section.includeWorkstream || false);
      setFixedFeeContent(section.fixedFeeContent || '');
      setHourlyFeeContent(section.hourlyFeeContent || '');
      setCappedFeeContent(section.cappedFeeContent || '');
      setWorkstreamContent(section.workstreamContent || '');
      
      // Load new legal fees data
      setHourlyRates(section.hourlyRates || [
        { position: 'Senior Partner', rate: 250 },
        { position: 'Partner', rate: 200 },
        { position: 'Senior Associate', rate: 150 },
        { position: 'Associate', rate: 120 },
        { position: 'Paralegal/Trainee', rate: 80 }
      ]);
      setTranslationRate(section.translationRate || 8);
      setTranslationContent(section.translationContent || 'The Fee does not include translation charges (Arabic to English or vice versa), which shall be billed separately at a rate of OMR 8 per 250 words. This rate may increase if any internal revisions are required by our lawyers, and such revisions shall be charged at the above hourly rates.');
      setIncludeTaxes(section.includeTaxes !== undefined ? section.includeTaxes : true);
      setTaxContent(section.taxContent || 'The Fee does not include applicable taxes. VAT will be charged at a rate of 5% (or any other rate applicable at the time of invoicing).');
      setVatRate(section.vatRate || 5);
      setMaxRevisions(section.maxRevisions || 3);
      setMaxHours(section.maxHours || 40);
      setAssumptions(section.assumptions || [
        'Scope of work will not expand beyond workstreams listed in Schedule A',
        'Maximum of 3 revisions or 40 hours (configurable based on scope)',
        'No in-person meetings required in specified locations unless agreed',
        'Drafting limited to agreements/documents relevant to the project',
        'Advice confined to Omani law unless otherwise agreed',
        'Any work outside the defined schedules requires prior approval',
        'Deliverables will be prepared in English',
        'Judicial or court costs excluded'
      ]);
      setWorkstreams(section.workstreams || [{ name: 'Main Workstream', amount: 5000, description: '' }]);
      setIncludeDiscountedRates(section.includeDiscountedRates || false);
      setIncludeTranslation(section.includeTranslation || false);
      setCurrency(section.currency || 'OMR');
      
      // Load editable headers
      setPositionHeader(section.positionHeader || 'Position');
      setStandardRateHeader(section.standardRateHeader || 'Standard Rate');
      setAssumptionsTitle(section.assumptionsTitle || 'Other Assumptions');
      setAdditionalDetailsTitle(section.additionalDetailsTitle || 'Additional Details');
    }
    
    // If this is a cover letter section, try to find the selected cover
    if (section.type === 'cover' && section.content) {
      const matchingCover = covers.find(cover => cover.content === section.content);
      if (matchingCover) {
        setSelectedCoverId(matchingCover.id);
      }
    }
  }, [section, covers]);

  const handleSave = useCallback(async () => {
    if (!hasChanges) return;
    
    setIsSaving(true);
    
    try {
      // Debug: Log the actual content being saved
      console.log('🔍 AUTOSAVING SECTION:', title, 'Type:', type);
      console.log('📄 Content length:', content?.length || 0);
      
      // Check for tables in the content
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = content;
      const tables = tempDiv.querySelectorAll('table');
      console.log('🔍 Tables found in section content:', tables.length);
      if (tables.length > 0) {
        tables.forEach((table, index) => {
          console.log(`📊 Table ${index + 1} HTML:`, table.outerHTML);
        });
      }

      onUpdate({
        ...section,
        title,
        type,
        content,
        selectedTeamMembers,
        selectedCaseStudies,
        selectedServices,
        selectedCoverId,
        tableData: type === 'table' ? tableData : section.tableData,
        tableTitle: type === 'table' ? tableTitle : section.tableTitle,
        tableDescription: type === 'table' ? tableDescription : section.tableDescription,
        tableNote: type === 'table' ? tableNote : section.tableNote,
        tablePageBreak: type === 'table' ? tablePageBreak : section.tablePageBreak,
        feeType: type === 'fees' ? feeType : section.feeType,
        includeWorkstream: type === 'fees' ? includeWorkstream : section.includeWorkstream,
        fixedFeeContent: type === 'fees' ? fixedFeeContent : section.fixedFeeContent,
        hourlyFeeContent: type === 'fees' ? hourlyFeeContent : section.hourlyFeeContent,
        cappedFeeContent: type === 'fees' ? cappedFeeContent : section.cappedFeeContent,
        workstreamContent: type === 'fees' ? workstreamContent : section.workstreamContent,
        // New legal fees data
        hourlyRates: type === 'fees' ? hourlyRates : section.hourlyRates,
        translationRate: type === 'fees' ? translationRate : section.translationRate,
        translationContent: type === 'fees' ? translationContent : section.translationContent,
        includeTaxes: type === 'fees' ? includeTaxes : section.includeTaxes,
        taxContent: type === 'fees' ? taxContent : section.taxContent,
        vatRate: type === 'fees' ? vatRate : section.vatRate,
        maxRevisions: type === 'fees' ? maxRevisions : section.maxRevisions,
        maxHours: type === 'fees' ? maxHours : section.maxHours,
        assumptions: type === 'fees' ? assumptions : section.assumptions,
        workstreams: type === 'fees' ? workstreams : section.workstreams,
        includeDiscountedRates: type === 'fees' ? includeDiscountedRates : section.includeDiscountedRates,
        includeTranslation: type === 'fees' ? includeTranslation : section.includeTranslation,
        currency: type === 'fees' ? currency : section.currency,
        // Editable headers
        positionHeader: type === 'fees' ? positionHeader : section.positionHeader,
        standardRateHeader: type === 'fees' ? standardRateHeader : section.standardRateHeader,
        assumptionsTitle: type === 'fees' ? assumptionsTitle : section.assumptionsTitle,
        additionalDetailsTitle: type === 'fees' ? additionalDetailsTitle : section.additionalDetailsTitle
      });
      
      setHasChanges(false);
      setLastSaved(new Date());
    } catch (error) {
      console.error('Error saving section:', error);
    } finally {
      setIsSaving(false);
    }
  }, [hasChanges, title, type, content, selectedTeamMembers, selectedCaseStudies, selectedServices, selectedCoverId, tableData, tableTitle, tableDescription, tableNote, tablePageBreak, feeType, includeWorkstream, fixedFeeContent, hourlyFeeContent, cappedFeeContent, workstreamContent, hourlyRates, translationRate, translationContent, includeTaxes, taxContent, vatRate, maxRevisions, maxHours, assumptions, workstreams, includeDiscountedRates, includeTranslation, currency, positionHeader, standardRateHeader, assumptionsTitle, additionalDetailsTitle, section, onUpdate]);

  // Autosave with debouncing
  const triggerAutosave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      handleSave();
    }, 1000); // 1 second debounce
  }, [handleSave]);

  // Autosave effect - triggers when any state changes
  useEffect(() => {
    if (hasChanges) {
      triggerAutosave();
    }
  }, [hasChanges, triggerAutosave]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);



  const createNewTable = (rows = 3, cols = 3) => {
    const newTableData = [];
    // Create header row
    const headerRow = [];
    for (let j = 0; j < cols; j++) {
      headerRow.push(`Header ${j + 1}`);
    }
    newTableData.push(headerRow);
    
    // Create data rows
    for (let i = 1; i < rows; i++) {
      const row = [];
      for (let j = 0; j < cols; j++) {
        row.push(`Cell ${i},${j + 1}`);
      }
      newTableData.push(row);
    }
    
    setTableData(newTableData);
    setHasChanges(true);
  };

  const updateTableCell = (rowIndex, colIndex, value) => {
    const newTableData = [...tableData];
    newTableData[rowIndex][colIndex] = value;
    setTableData(newTableData);
    setHasChanges(true);
  };

  const addTableRow = () => {
    const newRow = new Array(tableData[0].length).fill('New Cell');
    setTableData([...tableData, newRow]);
  };

  const removeTableRow = () => {
    if (tableData.length > 2) { // Keep at least header + 1 row
      setTableData(tableData.slice(0, -1));
    }
  };

  const addTableColumn = () => {
    const newTableData = tableData.map((row, index) => [
      ...row,
      index === 0 ? 'New Header' : 'New Cell'
    ]);
    setTableData(newTableData);
  };

  const removeTableColumn = () => {
    if (tableData[0].length > 2) { // Keep at least 2 columns
      const newTableData = tableData.map(row => row.slice(0, -1));
      setTableData(newTableData);
    }
  };



  const getCurrentClient = () => {
    if (!currentProposal?.clientId) return null;
    return clients.find(client => client.id === currentProposal.clientId);
  };

  const generateTeamContent = () => {
    if (selectedTeamMembers.length === 0) return '';
    
    let teamContent = '<h3>Our Team</h3>';
    selectedTeamMembers.forEach(memberId => {
      const member = teamMembers.find(tm => tm.id === memberId);
      if (member) {
        teamContent += `
          <div style="margin-bottom: 24px; padding: 16px; border: 1px solid #e0e0e0; border-radius: 4px;">
            <h4>${member.name}</h4>
            <p><strong>Position:</strong> ${member.position || 'Team Member'}</p>
            <p><strong>Experience:</strong> ${member.experience || 'Not specified'}</p>
            <p><strong>Skills:</strong> ${member.skills || 'Not specified'}</p>
            ${member.bio ? `<p><strong>Bio:</strong> ${member.bio}</p>` : ''}
          </div>
        `;
      }
    });
    return teamContent;
  };

  const generateCVContent = () => {
    if (selectedTeamMembers.length === 0) return '';
    
    let cvContent = '<h3>Team CVs</h3>';
    selectedTeamMembers.forEach(memberId => {
      const member = teamMembers.find(tm => tm.id === memberId);
      if (member) {
        cvContent += `
          <div style="margin-bottom: 32px; padding: 20px; border: 1px solid #e0e0e0; border-radius: 4px;">
            <h4>${member.name} - CV</h4>
            <p><strong>Position:</strong> ${member.position || 'Team Member'}</p>
            <div style="margin-top: 16px;">
              <strong>Curriculum Vitae:</strong>
              <div style="margin-top: 8px; padding: 12px; background-color: #f9f9f9; border-radius: 4px;">
                ${member.cv || 'CV content not available'}
              </div>
            </div>
          </div>
        `;
      }
    });
    return cvContent;
  };

  const generateCaseStudyContent = () => {
    if (selectedCaseStudies.length === 0) return '';
    
    let caseStudyContent = '<h3>Case Studies</h3>';
    selectedCaseStudies.forEach(caseStudyId => {
      const caseStudy = caseStudies.find(cs => cs.id === caseStudyId);
      if (caseStudy) {
        caseStudyContent += `
          <div style="margin-bottom: 24px; padding: 16px; border: 1px solid #e0e0e0; border-radius: 4px;">
            <h4>${caseStudy.title}</h4>
            <p><strong>Client:</strong> ${caseStudy.client || 'Not specified'}</p>
            <p><strong>Duration:</strong> ${caseStudy.duration || 'Not specified'}</p>
            <div>${caseStudy.description || 'No description available'}</div>
          </div>
        `;
      }
    });
    return caseStudyContent;
  };

  const generateServiceContent = () => {
    if (selectedServices.length === 0) return '';
    
    let serviceContent = '<h3>Our Services</h3>';
    selectedServices.forEach(serviceId => {
      const service = services.find(s => s.id === serviceId);
      if (service) {
        serviceContent += `
          <div style="margin-bottom: 24px; padding: 16px; border: 1px solid #e0e0e0; border-radius: 4px;">
            <h4>${service.name}</h4>
            <p><strong>Category:</strong> ${service.category || 'Not specified'}</p>
            <p><strong>Price:</strong> ${service.price || 'Contact for pricing'}</p>
            <p><strong>Duration:</strong> ${service.duration || 'Not specified'}</p>
            <div style="margin-top: 12px;">${service.description || 'No description available'}</div>
            ${service.deliverables && service.deliverables.length > 0 ? `
              <div style="margin-top: 12px;">
                <strong>Deliverables:</strong>
                <ul style="margin-top: 8px; padding-left: 20px;">
                  ${service.deliverables.map(deliverable => `<li>${deliverable}</li>`).join('')}
                </ul>
              </div>
            ` : ''}
            ${service.features && service.features.length > 0 ? `
              <div style="margin-top: 12px;">
                <strong>Key Features:</strong>
                <ul style="margin-top: 8px; padding-left: 20px;">
                  ${service.features.map(feature => `<li>${feature}</li>`).join('')}
                </ul>
              </div>
            ` : ''}
          </div>
        `;
      }
    });
    return serviceContent;
  };

  const generatePreSavedContent = () => {
    if (selectedPreSavedContent.length === 0) return '';
    
    let preSavedContentHtml = '';
    selectedPreSavedContent.forEach(contentId => {
      const contentItem = preSavedContent.find(item => item.id === contentId);
      if (contentItem) {
        preSavedContentHtml += `
          <div style="margin-bottom: 24px; padding: 16px; border: 1px solid #e0e0e0; border-radius: 4px;">
            <h4>${contentItem.title}</h4>
            <div style="margin-top: 12px;">${contentItem.content}</div>
          </div>
        `;
      }
    });
    return preSavedContentHtml;
  };

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
    setHasChanges(true);
  };

  const handleTypeChange = (e) => {
    setType(e.target.value);
    setHasChanges(true);
  };

  const handleContentChange = (value) => {
    setContent(value);
    setHasChanges(true);
  };

  const handleCoverLetterSelect = (cover) => {
    setSelectedCoverId(cover.id);
    setContent(cover.content);
    setHasChanges(true);
  };

  const stripHtmlTags = (html) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  const sectionTypes = [
    { value: 'cover', label: 'Cover Letter' },
    { value: 'scope', label: 'Scope of Work' },
    { value: 'fees', label: 'Fees' },
    { value: 'team', label: 'Our Team' },
    { value: 'cvs', label: 'Team CVs' },
    { value: 'case-study', label: 'Case Study' },
    // { value: 'services', label: 'Services' },
    { value: 'table', label: 'Table Section' },

    // { value: 'testimonials', label: 'Testimonials' },
    // { value: 'page-break', label: 'Page Break' },
    { value: 'custom', label: 'Custom Section' }
  ];

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'align': [] }],
      ['link', 'image'],
      [{ 'color': [] }, { 'background': [] }],
      ['clean']
    ],
    clipboard: {
      matchVisual: false
    }
  };

  const quillFormats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'indent', 'align',
    'link', 'image', 'color', 'background',
    'table', 'table-cell-line', 'table-cell', 'table-col', 'table-row'
  ];

  const currentClient = getCurrentClient();

  return (
    <EditorContainer>
      <EditorHeader>
        <EditorTitle>
          <FiType size={20} />
          Edit Section
        </EditorTitle>
        <AutosaveStatus 
          isSaving={isSaving} 
          className={isSaving ? 'saving' : 'saved'}
        >
          <FiSave size={14} />
          {isSaving ? 'Saving...' : 
           lastSaved ? `Saved ${lastSaved.toLocaleTimeString()}` : 
           hasChanges ? 'Changes pending...' : 'All changes saved'}
        </AutosaveStatus>
      </EditorHeader>

      {/* Client Information Display */}
      {currentClient && (
        <ClientInfoContainer>
          <ClientInfoTitle>Client Information</ClientInfoTitle>
          <ClientInfoGrid>
            <ClientInfoItem>
              <div className="label">Company:</div>
              <div className="value">{currentClient.company}</div>
            </ClientInfoItem>
            <ClientInfoItem>
              <div className="label">Contact:</div>
              <div className="value">{currentClient.name}</div>
            </ClientInfoItem>
            <ClientInfoItem>
              <div className="label">Email:</div>
              <div className="value">{currentClient.email}</div>
            </ClientInfoItem>
            <ClientInfoItem>
              <div className="label">Phone:</div>
              <div className="value">{currentClient.phone}</div>
            </ClientInfoItem>
          </ClientInfoGrid>
        </ClientInfoContainer>
      )}

      <FormGroup>
        <Label>Section Title</Label>
        <Input
          type="text"
          value={title}
          onChange={handleTitleChange}
          placeholder="Enter section title"
        />
      </FormGroup>

      <FormGroup>
        <Label>Section Type</Label>
        <Select value={type} onChange={handleTypeChange}>
          {sectionTypes.map(sectionType => (
            <option key={sectionType.value} value={sectionType.value}>
              {sectionType.label}
            </option>
          ))}
        </Select>
      </FormGroup>

      {/* Cover Letter Selection */}
      {type === 'cover' && (
        <SelectorContainer>
          <SelectorTitle>
            <FiFileText />
            Select Cover Letter Template
          </SelectorTitle>
          <ItemGrid>
            {covers.map(cover => (
              <ItemCard
                key={cover.id}
                className={selectedCoverId === cover.id ? 'selected' : ''}
                onClick={() => handleCoverLetterSelect(cover)}
              >
                <ItemTitle>{cover.title}</ItemTitle>
                <ItemSubtitle>Template</ItemSubtitle>
                <ItemPreview>{stripHtmlTags(cover.content).substring(0, 100)}...</ItemPreview>
              </ItemCard>
            ))}
          </ItemGrid>
        </SelectorContainer>
      )}

      {/* Team Member Selection */}
      {(type === 'team' || type === 'cvs') && (
        <SelectorContainer>
          <SelectorTitle>
            <FiUsers />
            Select Team Members
          </SelectorTitle>
          <ItemGrid>
            {teamMembers.map(member => (
              <ItemCard
                key={member.id}
                className={selectedTeamMembers.includes(member.id) ? 'selected' : ''}
                onClick={() => {
                  const newSelection = selectedTeamMembers.includes(member.id)
                    ? selectedTeamMembers.filter(id => id !== member.id)
                    : [...selectedTeamMembers, member.id];
                  setSelectedTeamMembers(newSelection);
                  setHasChanges(true);
                }}
              >
                <ItemTitle>{member.name}</ItemTitle>
                <ItemSubtitle>{member.position || 'Team Member'}</ItemSubtitle>
                <ItemPreview>{member.experience || 'Experience not specified'}</ItemPreview>
              </ItemCard>
            ))}
          </ItemGrid>
          {selectedTeamMembers.length > 0 && (
            <TableButton onClick={() => {
              const contentToInsert = type === 'cvs' ? generateCVContent() : generateTeamContent();
              setContent(content + contentToInsert);
              setHasChanges(true);
            }}>
              {type === 'cvs' ? 'Insert Selected Team CVs' : 'Insert Selected Team Members'}
            </TableButton>
          )}
        </SelectorContainer>
      )}

      {/* Case Study Selection */}
      {type === 'case-study' && (
        <SelectorContainer>
          <SelectorTitle>
            <FiBriefcase />
            Select Case Studies
          </SelectorTitle>
          <ItemGrid>
            {caseStudies.map(caseStudy => (
              <ItemCard
                key={caseStudy.id}
                className={selectedCaseStudies.includes(caseStudy.id) ? 'selected' : ''}
                onClick={() => {
                  const newSelection = selectedCaseStudies.includes(caseStudy.id)
                    ? selectedCaseStudies.filter(id => id !== caseStudy.id)
                    : [...selectedCaseStudies, caseStudy.id];
                  setSelectedCaseStudies(newSelection);
                  setHasChanges(true);
                }}
              >
                <ItemTitle>{caseStudy.title}</ItemTitle>
                <ItemSubtitle>{caseStudy.client || 'Client not specified'}</ItemSubtitle>
                <ItemPreview>{stripHtmlTags(caseStudy.description || '').substring(0, 100)}...</ItemPreview>
              </ItemCard>
            ))}
          </ItemGrid>
          {selectedCaseStudies.length > 0 && (
            <TableButton onClick={() => {
              const caseStudyContent = generateCaseStudyContent();
              setContent(content + caseStudyContent);
              setHasChanges(true);
            }}>
              Insert Selected Case Studies
            </TableButton>
          )}
        </SelectorContainer>
      )}

      {/* Service Selection */}
      {type === 'services' && (
        <SelectorContainer>
          <SelectorTitle>
            <FiStar />
            Select Services
          </SelectorTitle>
          <ItemGrid>
            {services.map(service => (
              <ItemCard
                key={service.id}
                className={selectedServices.includes(service.id) ? 'selected' : ''}
                onClick={() => {
                  const newSelection = selectedServices.includes(service.id)
                    ? selectedServices.filter(id => id !== service.id)
                    : [...selectedServices, service.id];
                  setSelectedServices(newSelection);
                  setHasChanges(true);
                }}
              >
                <ItemTitle>{service.name}</ItemTitle>
                <ItemSubtitle>{service.category || 'Service'}</ItemSubtitle>
                <ItemPreview>{stripHtmlTags(service.description || '').substring(0, 100)}...</ItemPreview>
              </ItemCard>
            ))}
          </ItemGrid>
          {selectedServices.length > 0 && (
            <TableButton onClick={() => {
              const serviceContent = generateServiceContent();
              setContent(content + serviceContent);
              setHasChanges(true);
            }}>
              Insert Selected Services
            </TableButton>
          )}
        </SelectorContainer>
      )}

      {/* Pre-saved Content Selection */}
      {/* <SelectorContainer>
        <SelectorTitle>
          <FiSave />
          Pre-saved Content Selection
        </SelectorTitle>
        <ItemGrid>
          {preSavedContent && preSavedContent.map(contentItem => (
            <ItemCard
              key={contentItem.id}
              className={selectedPreSavedContent.includes(contentItem.id) ? 'selected' : ''}
              onClick={() => {
                const newSelection = selectedPreSavedContent.includes(contentItem.id)
                  ? selectedPreSavedContent.filter(id => id !== contentItem.id)
                  : [...selectedPreSavedContent, contentItem.id];
                setSelectedPreSavedContent(newSelection);
                setHasChanges(true);
              }}
            >
              <ItemTitle>{contentItem.title}</ItemTitle>
              <ItemSubtitle>{contentItem.category || 'Content'}</ItemSubtitle>
              <ItemPreview>{contentItem.content.substring(0, 100)}...</ItemPreview>
            </ItemCard>
          ))}
        </ItemGrid>
        {selectedPreSavedContent.length > 0 && (
          <TableButton onClick={() => {
            const preSavedContentHtml = generatePreSavedContent();
            setContent(content + preSavedContentHtml);
            setHasChanges(true);
          }}>
            Insert Selected Pre-saved Content
          </TableButton>
        )}
      </SelectorContainer> */}

      {/* Page Break Section */}
      {type === 'page-break' && (
        <SelectorContainer>
          <SelectorTitle>
            <FiMinus />
            Page Break
          </SelectorTitle>
          <div style={{ 
            padding: '20px', 
            textAlign: 'center', 
            backgroundColor: '#f8f9fa', 
            border: '2px dashed #dee2e6', 
            borderRadius: '8px',
            margin: '10px 0'
          }}>
            <p style={{ margin: '0 0 15px 0', color: '#6c757d', fontSize: '14px' }}>
              This section will create a page break in your proposal when exported to PDF.
            </p>
            <TableButton onClick={() => {
              const pageBreakContent = '<div style="page-break-before: always; height: 1px; visibility: hidden;"><!-- Page Break --></div>';
              setContent(pageBreakContent);
              setHasChanges(true);
            }}>
              Insert Page Break
            </TableButton>
          </div>
        </SelectorContainer>
      )}

      {/* Dedicated Table Section */}
      {type === 'table' && (
        <SelectorContainer>
          {/* Tips for Table Section */}
          <div style={{
            background: '#e3f2fd',
            border: '1px solid #2196f3',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '16px',
            fontSize: '14px',
            color: '#1976d2'
          }}>
            <strong>💡 Table Section:</strong>
            <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
              <li>Create and edit your table using the builder below</li>
              <li>Add a title and description for your table</li>
              <li>Tables are stored as structured data for perfect DOCX export</li>
            </ul>
          </div>

          {/* Table Title */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
              Table Title (Optional)
            </label>
            <Input
              type="text"
              value={tableTitle}
              onChange={(e) => {
                setTableTitle(e.target.value);
                setHasChanges(true);
              }}
              placeholder="Enter table title..."
            />
          </div>

          {/* Table Introduction */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
              Table Introduction (Optional)
            </label>
            <ReactQuill
              value={tableDescription}
              onChange={(value) => {
                setTableDescription(value);
                setHasChanges(true);
              }}
              placeholder="Add introduction text before the table (e.g., timeline explanation)..."
              style={{
                backgroundColor: 'white',
                borderRadius: '4px'
              }}
              modules={{
                toolbar: [
                  ['bold', 'italic', 'underline'],
                  [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                  ['link'],
                  ['clean']
                ]
              }}
              formats={[
                'bold', 'italic', 'underline',
                'list', 'bullet',
                'link'
              ]}
            />
          </div>

          <SelectorTitle>
            <FiTable />
            Table Builder
          </SelectorTitle>
          
          <TableToolbar>
            <TableButton onClick={() => createNewTable(2, 2)}>
              2x2 Table
            </TableButton>
            <TableButton onClick={() => createNewTable(3, 3)}>
              3x3 Table
            </TableButton>
            <TableButton onClick={() => createNewTable(4, 3)}>
              4x3 Table
            </TableButton>
            <TableButton onClick={() => createNewTable(5, 4)}>
              5x4 Table
            </TableButton>
          </TableToolbar>
          
          <div style={{ marginBottom: '16px' }}>
            <TableButton onClick={addTableRow}>+ Add Row</TableButton>
            <TableButton onClick={removeTableRow}>- Remove Row</TableButton>
            <TableButton onClick={addTableColumn}>+ Add Column</TableButton>
            <TableButton onClick={removeTableColumn}>- Remove Column</TableButton>
          </div>
          
          {/* Table Editor */}
          {tableData && tableData.length > 0 && (
            <div style={{ 
              border: '1px solid #ddd', 
              borderRadius: '8px', 
              overflow: 'auto',
              marginBottom: '16px',
              width: '100%'
            }}>
              <table style={{ 
                width: '100%', 
                borderCollapse: 'collapse',
                tableLayout: 'fixed'
              }}>
                <thead>
                  <tr style={{ background: '#f8f9fa' }}>
                    {tableData[0]?.map((cell, colIndex) => (
                      <th key={colIndex} style={{ 
                        border: '1px solid #ddd', 
                        padding: '12px',
                        textAlign: 'left',
                        width: `${100 / tableData[0].length}%`,
                        verticalAlign: 'top'
                      }}>
                        <input
                          type="text"
                          value={cell}
                          onChange={(e) => updateTableCell(0, colIndex, e.target.value)}
                          placeholder="Header"
                          style={{
                            width: '100%',
                            border: 'none',
                            background: 'transparent',
                            padding: '4px',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            outline: 'none',
                            boxSizing: 'border-box'
                          }}
                        />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tableData.slice(1).map((row, rowIndex) => (
                    <tr key={rowIndex + 1}>
                      {row.map((cell, colIndex) => (
                        <td key={colIndex} style={{ 
                          border: '1px solid #ddd', 
                          padding: '12px',
                          verticalAlign: 'top',
                          width: `${100 / tableData[0].length}%`
                        }}>
                          <input
                            type="text"
                            value={cell}
                            onChange={(e) => updateTableCell(rowIndex + 1, colIndex, e.target.value)}
                            placeholder="Cell content"
                            style={{
                              width: '100%',
                              border: 'none',
                              background: 'transparent',
                              padding: '4px',
                              fontSize: '14px',
                              outline: 'none',
                              boxSizing: 'border-box'
                            }}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Table Summary - Renders after table */}
          <div style={{ marginTop: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
              Table Summary (Optional)
            </label>
            <ReactQuill
              value={tableNote}
              onChange={(value) => {
                setTableNote(value);
                setHasChanges(true);
              }}
              placeholder="Add summary or explanation after the table (e.g., key takeaways, next steps)..."
              style={{
                backgroundColor: 'white',
                borderRadius: '4px'
              }}
              modules={{
                toolbar: [
                  ['bold', 'italic', 'underline'],
                  [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                  ['link'],
                  ['clean']
                ]
              }}
              formats={[
                'bold', 'italic', 'underline',
                'list', 'bullet',
                'link'
              ]}
            />
          </div>

          {/* Page Break Option */}
          {/* <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontWeight: 'bold', color: '#333' }}>
              <input
                type="checkbox"
                checked={tablePageBreak}
                onChange={(e) => {
                  setTablePageBreak(e.target.checked);
                  setHasChanges(true);
                }}
                style={{ marginRight: '8px' }}
              />
              Add page break after table
            </label>
            <p style={{ margin: '4px 0 0 24px', fontSize: '12px', color: '#666' }}>
              When enabled, the content after this table will start on a new page in the exported document.
            </p>
          </div> */}
        </SelectorContainer>
      )}

      {/* Fees Section */}
      {type === 'fees' && (
        <FeesContainer>
          <FeesTitle>Legal Fees Configuration</FeesTitle>
          
          {/* Currency Selection */}
          <FeesSection>
            <InputGroup>
              <InputWrapper>
                <Label>Currency</Label>
                <CurrencySelect
                  value={currency}
                  onChange={(e) => {
                    setCurrency(e.target.value);
                    setHasChanges(true);
                  }}
                >
                  <option value="OMR">OMR - Omani Rial</option>
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                </CurrencySelect>
              </InputWrapper>
            </InputGroup>
          </FeesSection>

          {/* Fee Structure Selection */}
          <FeesSection>
            <FeesSubtitle>Fee Structure</FeesSubtitle>
            <RadioGroup>
              <RadioOption 
                className={feeType === 'capped' ? 'selected' : ''}
                onClick={() => {
                  setFeeType('capped');
                  setHasChanges(true);
                }}
              >
                <RadioInput
                  type="radio"
                  name="feeType"
                  value="capped"
                  checked={feeType === 'capped'}
                  onChange={() => {}}
                />
                <RadioLabel>Capped Fees - Maximum fee for entire scope (excluding taxes and disbursements)</RadioLabel>
              </RadioOption>
              
              <RadioOption 
                className={feeType === 'fixed' ? 'selected' : ''}
                onClick={() => {
                  setFeeType('fixed');
                  setHasChanges(true);
                }}
              >
                <RadioInput
                  type="radio"
                  name="feeType"
                  value="fixed"
                  checked={feeType === 'fixed'}
                  onChange={() => {}}
                />
                <RadioLabel>Fixed Fees - Set fee per workstream or entire scope</RadioLabel>
              </RadioOption>
              
              <RadioOption 
                className={feeType === 'hourly' ? 'selected' : ''}
                onClick={() => {
                  setFeeType('hourly');
                  setHasChanges(true);
                }}
              >
                <RadioInput
                  type="radio"
                  name="feeType"
                  value="hourly"
                  checked={feeType === 'hourly'}
                  onChange={() => {}}
                />
                <RadioLabel>Hourly Billing Without Caps - Fixed hourly rates by position</RadioLabel>
              </RadioOption>
            </RadioGroup>
          </FeesSection>

          {/* Content Editors for each fee type */}
          <FeesSection>
            <FeesSubtitle>Additional Content</FeesSubtitle>
            
            {/* Additional Details Title Input */}
            <div style={{ marginBottom: '16px' }}>
              <Label>Additional Details Section Title</Label>
              <Input
                value={additionalDetailsTitle}
                onChange={(e) => {
                  setAdditionalDetailsTitle(e.target.value);
                  setHasChanges(true);
                }}
                placeholder="Additional Details"
                style={{
                  fontSize: '14px',
                  padding: '8px 12px',
                  borderRadius: '4px',
                  border: '1px solid #e0e0e0'
                }}
              />
            </div>
            
            {feeType === 'fixed' && (
              <div style={{ marginBottom: '16px' }}>
                <Label>Fixed Fee Content</Label>
                <ReactQuill
                  value={fixedFeeContent}
                  onChange={(value) => {
                    setFixedFeeContent(value);
                    setHasChanges(true);
                  }}
                  placeholder="Additional content for fixed fee structure..."
                  style={{ backgroundColor: 'white', borderRadius: '4px' }}
                  modules={{
                    toolbar: [
                      ['bold', 'italic', 'underline'],
                      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                      ['link'],
                      ['clean']
                    ]
                  }}
                  formats={['bold', 'italic', 'underline', 'list', 'bullet', 'link']}
                />
              </div>
            )}
            
            {feeType === 'hourly' && (
              <div style={{ marginBottom: '16px' }}>
                <Label>Hourly Fee Content</Label>
                <ReactQuill
                  value={hourlyFeeContent}
                  onChange={(value) => {
                    setHourlyFeeContent(value);
                    setHasChanges(true);
                  }}
                  placeholder="Additional content for hourly fee structure..."
                  style={{ backgroundColor: 'white', borderRadius: '4px' }}
                  modules={{
                    toolbar: [
                      ['bold', 'italic', 'underline'],
                      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                      ['link'],
                      ['clean']
                    ]
                  }}
                  formats={['bold', 'italic', 'underline', 'list', 'bullet', 'link']}
                />
              </div>
            )}
            
            {feeType === 'capped' && (
              <div style={{ marginBottom: '16px' }}>
                <Label>Capped Fee Content</Label>
                <ReactQuill
                  value={cappedFeeContent}
                  onChange={(value) => {
                    setCappedFeeContent(value);
                    setHasChanges(true);
                  }}
                  placeholder="Additional content for capped fee structure..."
                  style={{ backgroundColor: 'white', borderRadius: '4px' }}
                  modules={{
                    toolbar: [
                      ['bold', 'italic', 'underline'],
                      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                      ['link'],
                      ['clean']
                    ]
                  }}
                  formats={['bold', 'italic', 'underline', 'list', 'bullet', 'link']}
                />
              </div>
            )}
          </FeesSection>

          {/* Hourly Rates Table - Only for Hourly Billing */}
          {feeType === 'hourly' && (
            <FeesSection>
            <FeesSubtitle>Hourly Rates</FeesSubtitle>
            <RatesTable>
              <thead>
                <tr>
                  <TableHeader>
                    <Input
                      value={positionHeader}
                      onChange={(e) => {
                        setPositionHeader(e.target.value);
                        setHasChanges(true);
                      }}
                      style={{ 
                        background: 'transparent', 
                        border: 'none', 
                        color: 'white', 
                        fontWeight: '600',
                        fontSize: '14px',
                        padding: '0'
                      }}
                      placeholder="Position"
                    />
                  </TableHeader>
                  <TableHeader>
                    <Input
                      value={`${standardRateHeader} (${currency})`}
                      onChange={(e) => {
                        // Remove the currency part when editing
                        const newValue = e.target.value.replace(` (${currency})`, '');
                        setStandardRateHeader(newValue);
                        setHasChanges(true);
                      }}
                      style={{ 
                        background: 'transparent', 
                        border: 'none', 
                        color: 'white', 
                        fontWeight: '600',
                        fontSize: '14px',
                        padding: '0'
                      }}
                      placeholder="Standard Rate"
                    />
                  </TableHeader>
                  {includeDiscountedRates && <TableHeader>Discounted Rate ({currency})</TableHeader>}
                </tr>
              </thead>
              <tbody>
                {hourlyRates.map((rate, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Input
                        value={rate.position}
                        onChange={(e) => {
                          const newRates = hourlyRates.map((rate, i) => 
                            i === index ? { ...rate, position: e.target.value } : rate
                          );
                          setHourlyRates(newRates);
                          setHasChanges(true);
                        }}
                        placeholder="Position title"
                      />
                    </TableCell>
                    <TableCell>
                      <SmallInput
                        type="number"
                        value={rate.standardRate}
                        onChange={(e) => {
                          const newRates = hourlyRates.map((rate, i) => 
                            i === index ? { ...rate, standardRate: e.target.value } : rate
                          );
                          setHourlyRates(newRates);
                          setHasChanges(true);
                        }}
                        placeholder="0"
                      />
                    </TableCell>
                    {includeDiscountedRates && (
                      <TableCell>
                        <SmallInput
                          type="number"
                          value={rate.discountedRate}
                          onChange={(e) => {
                            const newRates = hourlyRates.map((rate, i) => 
                              i === index ? { ...rate, discountedRate: e.target.value } : rate
                            );
                            setHourlyRates(newRates);
                            setHasChanges(true);
                          }}
                          placeholder="0"
                        />
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </tbody>
            </RatesTable>
            
            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
              <AddButton
                onClick={() => {
                  setHourlyRates([...hourlyRates, { position: '', standardRate: '', discountedRate: '' }]);
                  setHasChanges(true);
                }}
                style={{ margin: 0 }}
              >
                + Add Position
              </AddButton>
              
              {hourlyRates.length > 1 && (
                <RemoveButton
                  onClick={() => {
                    setHourlyRates(hourlyRates.slice(0, -1));
                    setHasChanges(true);
                  }}
                  style={{ margin: 0 }}
                >
                  - Remove Last
                </RemoveButton>
              )}
            </div>
            
            <CheckboxContainer>
              <CheckboxLabel>
                <CheckboxInput
                  type="checkbox"
                  checked={includeDiscountedRates}
                  onChange={(e) => {
                    setIncludeDiscountedRates(e.target.checked);
                    setHasChanges(true);
                  }}
                />
                Include discounted rates for out-of-scope work
              </CheckboxLabel>
            </CheckboxContainer>
          </FeesSection>
          )}

          {/* Additional Charges */}
          <FeesSection>
            <FeesSubtitle>Additional Charges</FeesSubtitle>
            
            <CheckboxContainer>
              <CheckboxLabel>
                <CheckboxInput
                  type="checkbox"
                  checked={includeTranslation}
                  onChange={(e) => {
                    setIncludeTranslation(e.target.checked);
                    setHasChanges(true);
                  }}
                />
                Include translation charges
              </CheckboxLabel>
            </CheckboxContainer>
            
            {includeTranslation && (
              <>
                {/* <InputGroup>
                  <InputWrapper>
                    <Label>Translation Rate ({currency} per 250 words)</Label>
                    <SmallInput
                      type="number"
                      value={translationRate}
                      onChange={(e) => {
                        setTranslationRate(e.target.value);
                        setHasChanges(true);
                      }}
                      placeholder="8"
                    />
                  </InputWrapper>
                </InputGroup> */}
                <div style={{ marginTop: '16px' }}>
                  <Label>Translation Charges Content</Label>
                  <ReactQuill
                    value={translationContent}
                    onChange={(value) => {
                      setTranslationContent(value);
                      setHasChanges(true);
                    }}
                    placeholder="Enter translation charges details..."
                    style={{ backgroundColor: 'white', borderRadius: '4px' }}
                    modules={{
                      toolbar: [
                        ['bold', 'italic', 'underline'],
                        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                        ['link'],
                        ['clean']
                      ]
                    }}
                    formats={['bold', 'italic', 'underline', 'list', 'bullet', 'link']}
                  />
                </div>
              </>
            )}
            
            <CheckboxContainer>
              <CheckboxLabel>
                <CheckboxInput
                  type="checkbox"
                  checked={includeTaxes}
                  onChange={(e) => {
                    setIncludeTaxes(e.target.checked);
                    setHasChanges(true);
                  }}
                />
                Include taxes
              </CheckboxLabel>
            </CheckboxContainer>
            
            {includeTaxes && (
              <div style={{ marginTop: '16px' }}>
                <Label>Taxes Content</Label>
                <ReactQuill
                  value={taxContent}
                  onChange={(value) => {
                    setTaxContent(value);
                    setHasChanges(true);
                  }}
                  placeholder="Enter tax details..."
                  style={{ backgroundColor: 'white', borderRadius: '4px' }}
                  modules={{
                    toolbar: [
                      ['bold', 'italic', 'underline'],
                      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                      ['link'],
                      ['clean']
                    ]
                  }}
                  formats={['bold', 'italic', 'underline', 'list', 'bullet', 'link']}
                />
              </div>
            )}
            
            {/* <InputGroup>
              <InputWrapper>
                <Label>VAT Rate (%)</Label>
                <SmallInput
                  type="number"
                  value={vatRate}
                  onChange={(e) => {
                    setVatRate(e.target.value);
                    setHasChanges(true);
                  }}
                  placeholder="5"
                />
              </InputWrapper>
            </InputGroup> */}
          </FeesSection>

          {/* Scope Limitations */}
          <FeesSection>
            <FeesSubtitle>Scope Limitations</FeesSubtitle>
            <InputGroup>
              <InputWrapper>
                <Label>Maximum Revisions</Label>
                <SmallInput
                  type="number"
                  value={maxRevisions}
                  onChange={(e) => {
                    setMaxRevisions(e.target.value);
                    setHasChanges(true);
                  }}
                  placeholder="3"
                />
              </InputWrapper>
              <InputWrapper>
                <Label>Maximum Hours (if applicable)</Label>
                <SmallInput
                  type="number"
                  value={maxHours}
                  onChange={(e) => {
                    setMaxHours(e.target.value);
                    setHasChanges(true);
                  }}
                  placeholder="50"
                />
              </InputWrapper>
            </InputGroup>
          </FeesSection>

          {/* Other Assumptions */}
          <FeesSection>
            <div style={{ marginBottom: '12px' }}>
              <Input
                value={assumptionsTitle}
                onChange={(e) => {
                  setAssumptionsTitle(e.target.value);
                  setHasChanges(true);
                }}
                style={{
                  fontSize: '16px',
                  fontWeight: '500',
                  color: '#555',
                  border: '1px solid transparent',
                  background: 'transparent',
                  padding: '4px 8px',
                  borderRadius: '4px'
                }}
                onFocus={(e) => {
                  e.target.style.border = '1px solid #007bff';
                  e.target.style.background = 'white';
                }}
                onBlur={(e) => {
                  e.target.style.border = '1px solid transparent';
                  e.target.style.background = 'transparent';
                }}
                placeholder="Section Title"
              />
            </div>
            <DragDropContext onDragEnd={(result) => {
              if (!result.destination) return;
              
              const items = Array.from(assumptions);
              const [reorderedItem] = items.splice(result.source.index, 1);
              items.splice(result.destination.index, 0, reorderedItem);
              
              setAssumptions(items);
              setHasChanges(true);
            }}>
              <Droppable droppableId="assumptions">
                {(provided) => (
                  <AssumptionsList {...provided.droppableProps} ref={provided.innerRef}>
                    {assumptions.map((assumption, index) => (
                      <Draggable key={`assumption-${index}`} draggableId={`assumption-${index}`} index={index}>
                        {(provided, snapshot) => (
                          <AssumptionItem
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            style={{
                              ...provided.draggableProps.style,
                              backgroundColor: snapshot.isDragging ? '#f8f9fa' : 'white',
                              boxShadow: snapshot.isDragging ? '0 2px 8px rgba(0,0,0,0.1)' : 'none'
                            }}
                          >
                            <div {...provided.dragHandleProps} style={{ cursor: 'grab', padding: '4px', color: '#666' }}>
                              <FiMove size={16} />
                            </div>
                            <span style={{ marginTop: '8px', color: '#666' }}>•</span>
                            <AssumptionText
                              value={assumption}
                              onChange={(e) => {
                                const newAssumptions = [...assumptions];
                                newAssumptions[index] = e.target.value;
                                setAssumptions(newAssumptions);
                                setHasChanges(true);
                              }}
                              placeholder="Enter assumption..."
                            />
                            <RemoveButton
                              onClick={() => {
                                setAssumptions(assumptions.filter((_, i) => i !== index));
                                setHasChanges(true);
                              }}
                            >
                              ×
                            </RemoveButton>
                          </AssumptionItem>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    <AddButton
                      onClick={() => {
                        setAssumptions([...assumptions, '']);
                        setHasChanges(true);
                      }}
                    >
                      + Add Assumption
                    </AddButton>
                  </AssumptionsList>
                )}
              </Droppable>
            </DragDropContext>
          </FeesSection>

          {/* Workstreams - Only for Hourly and Capped fees */}
          {(feeType === 'capped' || feeType === 'hourly') && (
            <FeesSection>
              <FeesSubtitle>Workstreams</FeesSubtitle>
              {workstreams.map((workstream, index) => (
                <WorkstreamContainer key={index}>
                  <WorkstreamHeader>
                    <h5 style={{ margin: 0, color: '#333' }}>Workstream {index + 1}</h5>
                    <RemoveButton
                      onClick={() => {
                        setWorkstreams(workstreams.filter((_, i) => i !== index));
                        setHasChanges(true);
                      }}
                    >
                      Remove
                    </RemoveButton>
                  </WorkstreamHeader>
                  <InputGroup>
                    <InputWrapper>
                      <Label>Workstream Name</Label>
                      <Input
                        value={workstream.name}
                        onChange={(e) => {
                          const newWorkstreams = workstreams.map((ws, i) => 
                            i === index ? { ...ws, name: e.target.value } : ws
                          );
                          setWorkstreams(newWorkstreams);
                          setHasChanges(true);
                        }}
                        placeholder="e.g., Contract Review"
                      />
                    </InputWrapper>
                    {feeType !== 'hourly' && (
                      <InputWrapper>
                        <Label>{feeType === 'capped' ? 'Cap Amount' : 'Fixed Amount'} ({currency})</Label>
                        <SmallInput
                          type="number"
                          value={workstream.amount}
                          onChange={(e) => {
                            const newWorkstreams = workstreams.map((ws, i) => 
                              i === index ? { ...ws, amount: e.target.value } : ws
                            );
                            setWorkstreams(newWorkstreams);
                            setHasChanges(true);
                          }}
                          placeholder="0"
                        />
                      </InputWrapper>
                    )}
                  </InputGroup>
                  <div style={{ marginTop: '12px' }}>
                    <Label>Description</Label>
                    <AssumptionText
                      value={workstream.description}
                      onChange={(e) => {
                        const newWorkstreams = workstreams.map((ws, i) => 
                          i === index ? { ...ws, description: e.target.value } : ws
                        );
                        setWorkstreams(newWorkstreams);
                        setHasChanges(true);
                      }}
                      placeholder="Describe the scope of this workstream..."
                      style={{ minHeight: '60px', width: '100%' }}
                    />
                  </div>
                </WorkstreamContainer>
              ))}
              <AddButton
                onClick={() => {
                  setWorkstreams([...workstreams, { name: '', amount: '', description: '' }]);
                  setHasChanges(true);
                }}
              >
                + Add Workstream
              </AddButton>
            </FeesSection>
          )}


        </FeesContainer>
      )}

      {/* Quick Insert Templates */}
      {/* {type === 'fees' && (
        <div style={{ marginTop: '20px' }}>
          <Label>Quick Insert Templates</Label>
          <TableToolbar>
            <TableButton onClick={() => {
              const tableHtml = `
                <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                  <thead>
                    <tr style="background-color: #f8f9fa;">
                      <th style="border: 1px solid #dee2e6; padding: 12px; text-align: left;">Service</th>
                      <th style="border: 1px solid #dee2e6; padding: 12px; text-align: left;">Timeline</th>
                      <th style="border: 1px solid #dee2e6; padding: 12px; text-align: left;">Fee</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style="border: 1px solid #dee2e6; padding: 12px;">Service 1</td>
                      <td style="border: 1px solid #dee2e6; padding: 12px;">2-3 weeks</td>
                      <td style="border: 1px solid #dee2e6; padding: 12px;">$X,XXX</td>
                    </tr>
                    <tr>
                      <td style="border: 1px solid #dee2e6; padding: 12px;">Service 2</td>
                      <td style="border: 1px solid #dee2e6; padding: 12px;">1-2 weeks</td>
                      <td style="border: 1px solid #dee2e6; padding: 12px;">$X,XXX</td>
                    </tr>
                    </tbody>
                  </table>
                `;                const currentContent = feeType === 'fixed' ? fixedFeeContent :                                     feeType === 'hourly' ? hourlyFeeContent :                                     cappedFeeContent;                const newContent = currentContent + tableHtml;                                if (feeType === 'fixed') {                  setFixedFeeContent(newContent);                } else if (feeType === 'hourly') {                  setHourlyFeeContent(newContent);                } else {                  setCappedFeeContent(newContent);                }                setHasChanges(true);              }}>                Insert Fees Table              </TableButton>              <TableButton onClick={() => {                const timelineHtml = `                  <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">                    <thead>                      <tr style="background-color: #f8f9fa;">                        <th style="border: 1px solid #dee2e6; padding: 12px; text-align: left;">Phase</th>                        <th style="border: 1px solid #dee2e6; padding: 12px; text-align: left;">Duration</th>                        <th style="border: 1px solid #dee2e6; padding: 12px; text-align: left;">Deliverables</th>                      </tr>                    </thead>                    <tbody>                      <tr>                        <td style="border: 1px solid #dee2e6; padding: 12px;">Phase 1</td>                        <td style="border: 1px solid #dee2e6; padding: 12px;">Week 1-2</td>                        <td style="border: 1px solid #dee2e6; padding: 12px;">Initial deliverables</td>                      </tr>                      <tr>                        <td style="border: 1px solid #dee2e6; padding: 12px;">Phase 2</td>                        <td style="border: 1px solid #dee2e6; padding: 12px;">Week 3-4</td>                        <td style="border: 1px solid #dee2e6; padding: 12px;">Final deliverables</td>                      </tr>                    </tbody>                  </table>                `;                const currentContent = feeType === 'fixed' ? fixedFeeContent :                                     feeType === 'hourly' ? hourlyFeeContent :                                     cappedFeeContent;                const newContent = currentContent + timelineHtml;                                if (feeType === 'fixed') {                  setFixedFeeContent(newContent);                } else if (feeType === 'hourly') {                  setHourlyFeeContent(newContent);                } else {                  setCappedFeeContent(newContent);                }                setHasChanges(true);              }}>                Insert Timeline Table              </TableButton>            </TableToolbar>          </div>
      )} */}

      {/* Content Editor - Hidden for page break, table, and fees sections */}      {type !== 'page-break' && type !== 'table' && type !== 'fees' && (
        <FormGroup>
          <Label>Content</Label>
          <QuillContainer>
            <ReactQuill
              theme="snow"
              value={content}
              onChange={handleContentChange}
              modules={quillModules}
              formats={quillFormats}
              placeholder="Start writing your section content..."
            />
          </QuillContainer>
        </FormGroup>
      )}
    </EditorContainer>
  );
};

export default SectionEditor;