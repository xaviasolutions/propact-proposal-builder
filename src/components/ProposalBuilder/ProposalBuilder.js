import React, { useState } from 'react';
import styled from 'styled-components';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { FiEdit3, FiMenu, FiPlus, FiTrash2, FiEye } from 'react-icons/fi';
import { useSelector, useDispatch } from 'react-redux';
import { updateProposal } from '../../store/slices/proposalsSlice';
import SectionEditor from './SectionEditor';
import ProposalPreview from './ProposalPreview';
import { v4 as uuidv4 } from 'uuid';
// import { exportToDocx } from '../../utils/docxExporter2';

const BuilderContainer = styled.div`
  display: flex;
  gap: 20px;
  height: calc(100vh - 140px);
`;

const SectionsPanel = styled.div`
  flex: 1;
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  height: calc(100vh - 140px);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
`;

const EditorPanel = styled.div`
  flex: 1;
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  height: calc(100vh - 140px);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
`;

const PanelTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const ProposalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e0e0e0;
`;

const ProposalTitle = styled.input`
  font-size: 18px;
  font-weight: 600;
  color: #333;
  border: none;
  background: transparent;
  outline: none;
  flex: 1;
  padding: 8px 12px;
  border-radius: 4px;
  
  &:focus {
    background: #f8f9fa;
  }
`;

const AddSectionButton = styled.button`
  padding: 8px 16px;
  border: 1px solid #007bff;
  background: white;
  color: #007bff;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;

  &:hover {
    background: #f8f9fa;
  }
`;

const SectionsList = styled.div`
  flex: 1;
  overflow-y: auto;
  min-height: 0;
`;

const SectionItem = styled.div`
  background: ${props => props.isDragging ? '#f8f9fa' : 'white'};
  border: 1px solid ${props => props.isSelected ? '#007bff' : '#e0e0e0'};
  border-radius: 6px;
  padding: 16px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 12px;

  &:hover {
    border-color: #007bff;
    box-shadow: 0 2px 8px rgba(0,123,255,0.1);
  }
`;

const DragHandle = styled.div`
  color: #999;
  cursor: grab;
  
  &:active {
    cursor: grabbing;
  }
`;

const SectionContent = styled.div`
  flex: 1;
`;

const SectionTitle = styled.div`
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
`;

const SectionType = styled.div`
  font-size: 12px;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const SectionActions = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button`
  padding: 6px;
  border: none;
  background: none;
  color: #666;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s ease;

  &:hover {
    background: #f8f9fa;
    color: #333;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  color: #666;
  font-size: 14px;
  padding: 40px 20px;
`;

const ProposalBuilder = () => {
  const dispatch = useDispatch();
  const { currentProposal } = useSelector(state => state.proposals);
  const [selectedSection, setSelectedSection] = useState(null);
  const [viewMode, setViewMode] = useState('editor'); // 'editor' or 'preview'

  if (!currentProposal) {
    return (
      <BuilderContainer>
        <EmptyState>
          Select a proposal from the sidebar to start building
        </EmptyState>
      </BuilderContainer>
    );
  }

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const sections = Array.from(currentProposal.sections);
    const [reorderedSection] = sections.splice(result.source.index, 1);
    sections.splice(result.destination.index, 0, reorderedSection);

    // Update order property
    const updatedSections = sections.map((section, index) => ({
      ...section,
      order: index
    }));

    dispatch(updateProposal({ id: currentProposal.id, updates: { sections: updatedSections } }));
  };

  const handleProposalNameChange = (e) => {
    dispatch(updateProposal({ id: currentProposal.id, updates: { name: e.target.value } }));
  };

  const addNewSection = () => {
    const newSection = {
      id: uuidv4(),
      type: 'custom',
      title: 'New Section',
      content: '',
      order: currentProposal.sections.length
    };

    const updatedSections = [...currentProposal.sections, newSection];
    dispatch(updateProposal({ id: currentProposal.id, updates: { sections: updatedSections } }));
    setSelectedSection(newSection);
  };

  const deleteSection = (sectionId) => {
    const updatedSections = currentProposal.sections
      .filter(section => section.id !== sectionId)
      .map((section, index) => ({ ...section, order: index }));

    dispatch(updateProposal({ id: currentProposal.id, updates: { sections: updatedSections } }));

    if (selectedSection?.id === sectionId) {
      setSelectedSection(null);
    }
  };

  const updateSection = (sectionId, updates) => {
    const updatedSections = currentProposal.sections.map(section =>
      section.id === sectionId ? { ...section, ...updates } : section
    );

    dispatch(updateProposal({ id: currentProposal.id, updates: { sections: updatedSections } }));

    if (selectedSection?.id === sectionId) {
      setSelectedSection({ ...selectedSection, ...updates });
    }
  };

  const sortedSections = [...currentProposal.sections].sort((a, b) => a.order - b.order);

  // const proposalPreview = ReactDOMServer.renderToStaticMarkup(<ProposalPreview />);

  // console.log(proposalPreview)

  return (
    <BuilderContainer>
      <SectionsPanel>
        <ProposalHeader>
          <ProposalTitle
            value={currentProposal.name}
            onChange={handleProposalNameChange}
            placeholder="Proposal Name"
          />
          <div style={{ display: 'flex', gap: '10px' }}>
            <AddSectionButton onClick={addNewSection}>
              <FiPlus size={14} />
              Add Section
            </AddSectionButton>
            <AddSectionButton
              onClick={() => setViewMode(viewMode === 'editor' ? 'preview' : 'editor')}
              style={{
                background: viewMode === 'preview' ? '#007bff' : 'white',
                color: viewMode === 'preview' ? 'white' : '#007bff'
              }}
            >
              <FiEye size={14} />
              {viewMode === 'editor' ? 'Preview' : 'Edit'}
            </AddSectionButton>
          </div>
        </ProposalHeader>

        <PanelTitle>
          <FiEdit3 size={20} />
          Proposal Sections
        </PanelTitle>

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="sections">
            {(provided) => (
              <SectionsList
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {sortedSections.map((section, index) => (
                  <Draggable
                    key={section.id}
                    draggableId={section.id}
                    index={index}
                  >
                    {(provided, snapshot) => (
                      <SectionItem
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        isDragging={snapshot.isDragging}
                        isSelected={selectedSection?.id === section.id}
                        onClick={() => setSelectedSection(section)}
                      >
                        <DragHandle {...provided.dragHandleProps}>
                          <FiMenu size={16} />
                        </DragHandle>
                        <SectionContent>
                          <SectionTitle>{section.title}</SectionTitle>
                          <SectionType>{section.type}</SectionType>
                        </SectionContent>
                        <SectionActions>
                          <ActionButton
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteSection(section.id);
                            }}
                          >
                            <FiTrash2 size={14} />
                          </ActionButton>
                        </SectionActions>
                      </SectionItem>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </SectionsList>
            )}
          </Droppable>
        </DragDropContext>

        {sortedSections.length === 0 && (
          <EmptyState>
            No sections yet. Add your first section to get started!
          </EmptyState>
        )}
      </SectionsPanel>

      {viewMode === 'editor' ? (
        <EditorPanel>
          {selectedSection ? (
            <SectionEditor
              section={selectedSection}
              onUpdate={(updates) => updateSection(selectedSection.id, updates)}
            />
          ) : (
            <EmptyState>
              Select a section from the left to start editing
            </EmptyState>
          )}
        </EditorPanel>
      ) : (
        <>
          <ProposalPreview />
          {/* <button onClick={() => exportToDocx(<ProposalPreview />)}>asd</button> */}
        </>
      )}
    </BuilderContainer>
  );
};

export default ProposalBuilder;