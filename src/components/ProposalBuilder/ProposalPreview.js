import React from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';

const PreviewContainer = styled.div`
  flex: 2;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  height: calc(100vh - 140px);
  overflow-y: auto;
  position: relative;
`;

const PreviewContent = styled.div`
  max-width: 800px;
  margin: 0 auto;
  position: relative;
`;

const Page = styled.div`
  min-height: 100vh;
  padding: 40px;
  page-break-after: always;
  
  @media print {
    page-break-after: always;
  }
  
  &:last-child {
    page-break-after: auto;
  }
`;

const Watermark = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(-45deg);
  pointer-events: none;
  z-index: 1;
  opacity: 0.1;
  
  img {
    max-width: 300px;
    max-height: 200px;
    object-fit: contain;
  }
`;

const CoverPage = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  position: relative;
  z-index: 2;
`;

const Logo = styled.img`
  max-width: 200px;
  max-height: 100px;
  margin-bottom: 40px;
  object-fit: contain;
`;

const ProposalTitle = styled.h1`
  font-size: 48px;
  font-weight: bold;
  color: ${props => props.primaryColor || '#007bff'};
  margin-bottom: 20px;
  font-family: ${props => props.fontFamily || 'Arial, sans-serif'};
`;

const ProposalSubtitle = styled.h2`
  font-size: 24px;
  color: ${props => props.secondaryColor || '#6c757d'};
  margin-bottom: 40px;
  font-family: ${props => props.fontFamily || 'Arial, sans-serif'};
`;

const TableOfContents = styled.div`
  background: #f8f9fa;
  border-radius: 8px;
  padding: 30px;
  position: relative;
  z-index: 2;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;



const TOCItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px dotted #ccc;
  cursor: pointer;
  transition: color 0.2s ease;

  &:hover {
    color: ${props => props.primaryColor || '#007bff'};
  }

  &:last-child {
    border-bottom: none;
  }
`;

const SectionContainer = styled.div`
  margin-bottom: 40px;
  position: relative;
  z-index: 2;
`;

const SectionTitle = styled.h2`
  font-size: 28px;
  color: ${props => props.primaryColor || '#007bff'};
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid ${props => props.primaryColor || '#007bff'};
  font-family: ${props => props.fontFamily || 'Arial, sans-serif'};
`;

const SectionContent = styled.div`
  font-size: 16px;
  line-height: 1.6;
  color: #333;
  font-family: ${props => props.fontFamily || 'Arial, sans-serif'};

  h1, h2, h3, h4, h5, h6 {
    color: ${props => props.primaryColor || '#007bff'};
    font-family: ${props => props.fontFamily || 'Arial, sans-serif'};
  }

  p {
    margin-bottom: 16px;
  }

  ul, ol {
    margin-bottom: 16px;
    padding-left: 20px;
  }

  li {
    margin-bottom: 8px;
  }
`;

const TeamGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 20px;
`;

const TeamMemberCard = styled.div`
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
`;

const MemberPhoto = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: ${props => props.photo ? `url(${props.photo})` : '#e0e0e0'};
  background-size: cover;
  background-position: center;
  margin: 0 auto 15px;
`;

const MemberName = styled.h4`
  font-size: 18px;
  color: ${props => props.primaryColor || '#007bff'};
  margin-bottom: 5px;
`;

const MemberRole = styled.p`
  font-size: 14px;
  color: #666;
  margin-bottom: 10px;
`;

const ServiceGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
`;

const ServiceCard = styled.div`
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  border-left: 4px solid ${props => props.primaryColor || '#007bff'};
`;

const ServiceName = styled.h4`
  font-size: 20px;
  color: ${props => props.primaryColor || '#007bff'};
  margin-bottom: 10px;
`;

const ServiceDescription = styled.p`
  font-size: 14px;
  color: #666;
  margin-bottom: 15px;
`;

const ServicePrice = styled.div`
  font-size: 18px;
  font-weight: bold;
  color: ${props => props.accentColor || '#28a745'};
`;

const CaseStudyCard = styled.div`
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
`;

const CaseStudyTitle = styled.h4`
  font-size: 20px;
  color: ${props => props.primaryColor || '#007bff'};
  margin-bottom: 10px;
`;

const CaseStudyClient = styled.p`
  font-size: 14px;
  color: #666;
  margin-bottom: 10px;
  font-style: italic;
`;

const ProposalPreview = (props) => {
  const { currentProposal } = useSelector(state => state.proposals);
  const { currentBranding } = useSelector(state => state.branding);
  const { services } = useSelector(state => state.services);
  const { teamMembers } = useSelector(state => state.teamMembers);
  const { caseStudies } = useSelector(state => state.caseStudies);

  if (!currentProposal) {
    return (
      <PreviewContainer ref={props.ref}>
        <PreviewContent>
          <div style={{ textAlign: 'center', color: '#666', marginTop: '100px' }}>
            <h3>No proposal selected</h3>
            <p>Create a new proposal or select an existing one to see the preview.</p>
          </div>
        </PreviewContent>
      </PreviewContainer>
    );
  }

  const branding = currentProposal.branding || currentBranding;
  const primaryColor = branding?.colors?.primary || '#007bff';
  const secondaryColor = branding?.colors?.secondary || '#6c757d';
  const accentColor = branding?.colors?.accent || '#28a745';
  const fontFamily = branding?.fonts?.primary || 'Arial, sans-serif';

  const sortedSections = [...currentProposal.sections].sort((a, b) => a.order - b.order);

  const renderSectionContent = (section) => {
    switch (section.type) {
      case 'team':
        const selectedTeamMembersForTeam = section.selectedTeamMembers || [];
        const selectedTeamMembersData = selectedTeamMembersForTeam.map(id => 
          teamMembers.find(member => member.id === id)
        ).filter(Boolean);
        
        return (
          <div>
            <div dangerouslySetInnerHTML={{ __html: section.content }} />
            {selectedTeamMembersData.length > 0 ? (
              <TeamGrid>
                {selectedTeamMembersData.map(member => (
                  <TeamMemberCard key={member.id}>
                    <MemberPhoto photo={member.photo} />
                    <MemberName primaryColor={primaryColor}>{member.name}</MemberName>
                    <MemberRole>{member.position}</MemberRole>
                    <p style={{ fontSize: '12px', color: '#666' }}>{member.skills}</p>
                    {member.bio && (
                      <p style={{ fontSize: '14px', color: '#555', marginTop: '10px' }}>{member.bio}</p>
                    )}
                  </TeamMemberCard>
                ))}
              </TeamGrid>
            ) : (
              <p style={{ color: '#666', fontStyle: 'italic' }}>No team members selected for this section.</p>
            )}
          </div>
        );

      case 'cvs':
        const selectedTeamMembersForCVs = section.selectedTeamMembers || [];
        const selectedCVMembersData = selectedTeamMembersForCVs.map(id => 
          teamMembers.find(member => member.id === id)
        ).filter(Boolean);
        
        return (
          <div>
            <div dangerouslySetInnerHTML={{ __html: section.content }} />
            {selectedCVMembersData.length > 0 ? (
              <div>
                {selectedCVMembersData.map(member => (
                  <div key={member.id} style={{
                    marginBottom: '32px',
                    padding: '20px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    backgroundColor: '#f9f9f9'
                  }}>
                    <h4 style={{ color: primaryColor, marginBottom: '10px' }}>{member.name} - CV</h4>
                    <p style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>
                      <strong>Position:</strong> {member.position || 'Team Member'}
                    </p>
                    <div style={{ marginTop: '15px' }}>
                      <strong style={{ color: primaryColor }}>Curriculum Vitae:</strong>
                      <div style={{
                        marginTop: '10px',
                        padding: '15px',
                        backgroundColor: '#ffffff',
                        borderRadius: '4px',
                        border: '1px solid #ddd',
                        lineHeight: '1.6'
                      }}>
                        {member.cv ? (
                          <div dangerouslySetInnerHTML={{ __html: member.cv }} />
                        ) : (
                          <p style={{ color: '#666', fontStyle: 'italic' }}>CV content not available</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: '#666', fontStyle: 'italic' }}>No team members selected for CVs section.</p>
            )}
          </div>
        );

      case 'services':
      case 'scope':
        return (
          <div>
            <div dangerouslySetInnerHTML={{ __html: section.content }} />
            {services.length > 0 ? (
              <ServiceGrid>
                {services.map(service => (
                  <ServiceCard key={service.id} primaryColor={primaryColor}>
                    <ServiceName primaryColor={primaryColor}>{service.name}</ServiceName>
                    <ServiceDescription>{service.description}</ServiceDescription>
                    {service.price && (
                      <ServicePrice accentColor={accentColor}>{service.price}</ServicePrice>
                    )}
                    {service.duration && (
                      <p style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>Duration: {service.duration}</p>
                    )}
                  </ServiceCard>
                ))}
              </ServiceGrid>
            ) : (
              <p style={{ color: '#666', fontStyle: 'italic' }}>No services added yet. Add services in the Content Manager.</p>
            )}
          </div>
        );

      case 'case-study':
      case 'case-studies':
      case 'experience':
        return (
          <div>
            <div dangerouslySetInnerHTML={{ __html: section.content }} />
            {caseStudies.length > 0 ? (
              <div>
                {caseStudies.map(caseStudy => (
                  <CaseStudyCard key={caseStudy.id}>
                    <CaseStudyTitle primaryColor={primaryColor}>{caseStudy.title}</CaseStudyTitle>
                    <CaseStudyClient>Client: {caseStudy.client}</CaseStudyClient>
                    <p>{caseStudy.description}</p>
                    {caseStudy.results && (
                      <div style={{ marginTop: '15px' }}>
                        <strong>Results:</strong>
                        <p>{caseStudy.results}</p>
                      </div>
                    )}
                  </CaseStudyCard>
                ))}
              </div>
            ) : (
              <p style={{ color: '#666', fontStyle: 'italic' }}>No case studies added yet. Add case studies in the Content Manager.</p>
            )}
          </div>
        );

      case 'cover-letter':
        return (
          <div style={{
            padding: '25px',
            background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
            borderRadius: '12px',
            border: `2px solid ${primaryColor}20`,
            lineHeight: '1.8',
            fontSize: '16px'
          }}>
            <div dangerouslySetInnerHTML={{ __html: section.content || '<p style="color: #666; font-style: italic;">No cover letter content added yet.</p>' }} />
          </div>
        );

      case 'fees':
        return (
          <div style={{
            padding: '25px',
            background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
            borderRadius: '12px',
            border: `2px solid ${primaryColor}20`
          }}>
            <div dangerouslySetInnerHTML={{ __html: section.content || '<p style="color: #666; font-style: italic;">No fee structure added yet.</p>' }} />
          </div>
        );

      case 'table':
        return (
          <div>
            {/* Table Title */}
            {section.tableTitle && (
              <h3 style={{ 
                color: primaryColor, 
                marginBottom: '10px',
                fontFamily 
              }}>
                {section.tableTitle}
              </h3>
            )}
            
            {/* Table Description */}
            {section.tableDescription && (
              <p style={{ 
                color: '#666', 
                marginBottom: '20px',
                fontFamily 
              }}>
                {section.tableDescription}
              </p>
            )}
            
            {/* Table Data */}
            {section.tableData && section.tableData.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  overflow: 'hidden'
                }}>
                  <thead>
                    <tr style={{ backgroundColor: primaryColor + '20' }}>
                      {section.tableData[0]?.map((header, index) => (
                        <th key={index} style={{
                          padding: '12px',
                          textAlign: 'left',
                          borderBottom: '1px solid #ddd',
                          fontWeight: 'bold',
                          color: primaryColor,
                          fontFamily
                        }}>
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {section.tableData.slice(1).map((row, rowIndex) => (
                      <tr key={rowIndex} style={{
                        backgroundColor: rowIndex % 2 === 0 ? '#f9f9f9' : 'white'
                      }}>
                        {row.map((cell, cellIndex) => (
                          <td key={cellIndex} style={{
                            padding: '12px',
                            borderBottom: '1px solid #ddd',
                            fontFamily
                          }}>
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {/* Table Note - Renders after table */}
            {section.tableNote && (
              <p style={{ 
                color: '#666', 
                fontStyle: 'italic',
                marginTop: '15px',
                padding: '10px',
                backgroundColor: '#f8f9fa',
                borderRadius: '4px',
                border: '1px solid #e9ecef',
                fontFamily 
              }}>
                {section.tableNote}
              </p>
            )}
          </div>
        );

      case 'page-break':
        return (
          <div style={{
            pageBreakBefore: 'always',
            height: '1px',
            visibility: 'hidden'
          }}>
            {/* Page Break */}
          </div>
        );

      default:
        return (
          <div style={{
            padding: '20px',
            background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
            borderRadius: '12px',
            border: `2px solid ${primaryColor}20`,
            lineHeight: '1.6'
          }}>
            <div dangerouslySetInnerHTML={{ __html: section.content || '<p style="color: #666; font-style: italic;">No content added yet.</p>' }} />
          </div>
        );
    }
  };

  return (
    <PreviewContainer data-testid="proposal-preview">
      {branding?.watermark && (
        <Watermark>
          {branding.watermark}
        </Watermark>
      )}

      <PreviewContent>
        {/* Page 1: Cover Page */}
        <Page>
          <CoverPage>
            <div style={{ textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              {branding?.logo && (
                <div style={{ marginBottom: '40px' }}>
                  <Logo src={branding.logo} alt="Company Logo" />
                </div>
              )}
              <ProposalTitle
                primaryColor={primaryColor}
                fontFamily={fontFamily}
              >
                {currentProposal.name}
              </ProposalTitle>
              <ProposalSubtitle
                secondaryColor={secondaryColor}
                fontFamily={fontFamily}
              >
                Professional Business Proposal
              </ProposalSubtitle>
              {branding?.headerText && (
                <p style={{ fontSize: '16px', color: secondaryColor, fontFamily }}>
                  {branding.headerText}
                </p>
              )}
              <div style={{
                marginTop: '60px',
                padding: '20px',
                background: `linear-gradient(135deg, ${primaryColor}10 0%, ${primaryColor}05 100%)`,
                borderRadius: '12px',
                border: `2px solid ${primaryColor}20`
              }}>
                <div style={{ fontSize: '18px', color: primaryColor, fontWeight: '600', marginBottom: '10px' }}>
                  Prepared by: {branding?.footerText || 'Your Company Name'}
                </div>
                <div style={{ fontSize: '16px', color: secondaryColor }}>
                  Date: {new Date().toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>
            </div>
          </CoverPage>
        </Page>

        {/* Page 2: Table of Contents */}
        <Page>
          <TableOfContents>
            <div style={{
              background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
              color: 'white',
              padding: '30px',
              borderRadius: '12px',
              marginBottom: '30px',
              textAlign: 'center'
            }}>
              <h2 style={{ margin: '0', fontSize: '28px', fontWeight: '700' }}>Table of Contents</h2>
              <p style={{ margin: '10px 0 0 0', opacity: '0.9' }}>Navigate through our comprehensive proposal</p>
            </div>
            <div style={{ padding: '0 20px' }}>
              {sortedSections.filter(section => section.type !== 'page-break').map((section, index) => (
                <TOCItem key={section.id} primaryColor={primaryColor} style={{
                  padding: '15px 20px',
                  marginBottom: '8px',
                  background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
                  borderRadius: '8px',
                  border: `1px solid ${primaryColor}20`,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}>
                  <span style={{ fontWeight: '500', color: primaryColor }}>{section.title}</span>
                  <span style={{
                    background: primaryColor,
                    color: 'white',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}>
                    {index + 1}
                  </span>
                </TOCItem>
              ))}
            </div>
          </TableOfContents>
        </Page>

        {/* Page 3+: Proposal Sections */}
        <Page>
          {sortedSections.map(section => {
            // Handle page break sections differently - no container or title
            if (section.type === 'page-break') {
              return (
                <div key={section.id}>
                  {renderSectionContent(section)}
                </div>
              );
            }
            
            return (
              <SectionContainer key={section.id}>
                <SectionTitle
                  primaryColor={primaryColor}
                  fontFamily={fontFamily}
                >
                  {section.title}
                </SectionTitle>
                <SectionContent
                  primaryColor={primaryColor}
                  fontFamily={fontFamily}
                >
                  {renderSectionContent(section)}
                </SectionContent>
              </SectionContainer>
            );
          })}

          {/* Footer */}
          {branding?.footerText && (
            <div style={{
              marginTop: '60px',
              paddingTop: '20px',
              borderTop: `2px solid ${primaryColor}`,
              textAlign: 'center',
              color: secondaryColor,
              fontFamily
            }}>
              {branding.footerText}
            </div>
          )}
        </Page>
      </PreviewContent>
    </PreviewContainer>
  );
};

export default ProposalPreview;