import React from 'react';
import styled from 'styled-components';
import { FiX, FiFileText, FiImage } from 'react-icons/fi';
import { useSelector } from 'react-redux';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const Modal = styled.div`
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 900px;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
`;

const ModalHeader = styled.div`
  padding: 24px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ModalTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;

  &:hover {
    color: #333;
    background: #f8f9fa;
  }
`;

const ModalContent = styled.div`
  padding: 24px;
  max-height: 60vh;
  overflow-y: auto;
`;

const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CoverGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
`;

const CoverCard = styled.div`
  border: 2px solid ${props => props.selected ? '#007bff' : '#e0e0e0'};
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${props => props.selected ? '#f8f9fa' : 'white'};

  &:hover {
    border-color: #007bff;
    box-shadow: 0 4px 12px rgba(0, 123, 255, 0.1);
  }
`;

const CoverName = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
`;

const CoverCategory = styled.div`
  font-size: 12px;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 12px;
`;

const CoverPreview = styled.div`
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 12px;
  margin-bottom: 12px;
  min-height: 80px;
`;

const PreviewHeader = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: #007bff;
  margin-bottom: 6px;
  text-align: center;
`;

const PreviewContent = styled.div`
  font-size: 11px;
  color: #666;
  line-height: 1.3;
  max-height: 40px;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const PreviewFooter = styled.div`
  font-size: 11px;
  color: #666;
  margin-top: 6px;
  text-align: center;
  font-style: italic;
`;

const LogoIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: ${props => props.hasLogo ? '#28a745' : '#666'};
`;

const ModalActions = styled.div`
  padding: 24px;
  border-top: 1px solid #e0e0e0;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
`;

const Button = styled.button`
  padding: 10px 20px;
  border: 1px solid ${props => props.primary ? '#007bff' : '#e0e0e0'};
  background: ${props => props.primary ? '#007bff' : 'white'};
  color: ${props => props.primary ? 'white' : '#666'};
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.primary ? '#0056b3' : '#f8f9fa'};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  color: #666;
  font-size: 14px;
  padding: 40px 20px;
`;

const CoverSelector = ({ isOpen, onClose, onSelect, selectedCover }) => {
  const { covers } = useSelector(state => state.covers);

  if (!isOpen) return null;

  const handleCoverSelect = (cover) => {
    onSelect(cover);
  };

  const handleConfirm = () => {
    onClose();
  };

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>Select Cover Template</ModalTitle>
          <CloseButton onClick={onClose}>
            <FiX />
          </CloseButton>
        </ModalHeader>

        <ModalContent>
          <SectionTitle>
            <FiFileText size={16} />
            Available Cover Templates
          </SectionTitle>

          {covers.length === 0 ? (
            <EmptyState>
              No cover templates available. Create cover templates in the Content Manager first.
            </EmptyState>
          ) : (
            <CoverGrid>
              {covers.map(cover => (
                <CoverCard
                  key={cover.id}
                  selected={selectedCover?.id === cover.id}
                  onClick={() => handleCoverSelect(cover)}
                >
                  <CoverName>{cover.name}</CoverName>
                  <CoverCategory>{cover.category}</CoverCategory>

                  <LogoIndicator hasLogo={!!cover.logo}>
                    <FiImage size={12} />
                    {cover.logo ? 'Logo included' : 'No logo'}
                  </LogoIndicator>

                  <CoverPreview>
                    {cover.header && <PreviewHeader>{cover.header}</PreviewHeader>}
                    <PreviewContent>
                      {cover.content.substring(0, 100)}
                      {cover.content.length > 100 && '...'}
                    </PreviewContent>
                    {cover.footer && <PreviewFooter>{cover.footer}</PreviewFooter>}
                  </CoverPreview>
                </CoverCard>
              ))}
            </CoverGrid>
          )}
        </ModalContent>

        <ModalActions>
          <Button onClick={onClose}>
            Cancel
          </Button>
          <Button 
            primary 
            onClick={handleConfirm}
            disabled={!selectedCover}
          >
            Use Selected Cover
          </Button>
        </ModalActions>
      </Modal>
    </Overlay>
  );
};

export default CoverSelector;