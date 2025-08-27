// Import required dependencies
import { createSlice } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';

// Initial state for covers slice
const initialState = {
  covers: [
    {
      id: 'default-professional',
      name: 'Professional Cover',
      logo: null,
      backgroundImage: null,
      header: 'Professional Business Proposal',
      footer: 'Confidential & Proprietary',
      // HTML content for the professional cover
      // Formatted to match the screenshot exactly
      content: `
        <div style="margin-bottom:20px;">
          Dear [Client Name],
        </div>
  
        <div style="margin-bottom:20px; text-align:left;">
        We are pleased to submit this fee proposal. Drawing on our experience with similar transactions, we have outlined the anticipated scope of work in Schedule A (the <strong>"Scope of Work"</strong>). Our team is well-equipped to provide the required legal support and services, and we have detailed our proposed fees in Schedule B.
        </div>

        <div style="margin-bottom:20px; text-align:left;">
        Al Maamary, Al Abri &amp; Co. (<strong>MAQ Legal</strong>) is a multi-award winning corporate and commercial legal practice based in the Sultanate of Oman. Our team of lawyers brings over 100 years of combined experience in advising local and international clients in multiple jurisdictions, including the Sultanate of Oman, the United Kingdom and Pakistan. Our clients include the Government of Oman, the Ministry of Finance, Oman Investment Authority, ITHCA Group, PTTEP, Mubadala, MOL (Hungary), BP, Abraj Energy, Energy Development Oman SAOC, OQ SAOC, Majid Al Futtaim Group, Total S.A., Bank Muscat SAOG, National Bank of Oman SAOG (including Muzn Islamic), Oman Air SAOC, and other leading entities.
        </div>

        <div style="margin-bottom:20px; text-align:left;">
        Our expertise includes advising clients on their corporate law (including public and private M&amp;A and restructuring), oil and gas / energy matters, capital markets (equity and debt), commercial transactions and banking (conventional and Islamic) in Oman and internationally. Some of our selected experience is set out in Schedule C, and the CVs of the core team members assigned to this matter are included in Schedule D.
        </div>

        <div style="margin-bottom:20px; text-align:left;">
        We sincerely appreciate the opportunity to submit this proposal and look forward to the possibility of assisting you with this matter. Should you require further clarification, please do not hesitate to contact us.
        </div>

        <div style="margin-bottom:20px;">
      Yours sincerely,
        </div>

        <div style="margin-top:20px;">
          <div style="margin-bottom:10px;">for and on behalf of <strong>MAQ Legal</strong></div>
          <div style="margin-bottom:10px; font-family:monospace; letter-spacing:2px;">.........................................................</div>
          <div style="margin-bottom:2px; color:red;">Asad Qayyum</div>
          <div>Managing Partner</div>
        </div>
      </div>
      `,
      category: 'Business',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    // {
    //   id: 'default-creative',
    //   name: 'Creative Cover',
    //   logo: null,
    //   backgroundImage: null,
    //   header: 'Creative Solutions Proposal',
    //   footer: 'Let\'s Create Something Amazing Together',
    //   content: `<p>Hello [Client Name],</p><p>Creativity meets strategy in this proposal designed specifically for your vision. We understand that every project is unique, and we're excited to bring your ideas to life.</p><p>Our creative team has crafted a solution that not only meets your requirements but exceeds your expectations. We believe in the power of innovative thinking combined with proven methodologies.</p><p>This proposal represents our commitment to delivering exceptional results that will make a lasting impact on your business.</p><p>Looking forward to collaborating with you!</p><p>The Creative Team</p>`,
    //   category: 'Creative',
    //   createdAt: new Date().toISOString(),
    //   updatedAt: new Date().toISOString()
    // }
  ]
};

// Create slice for covers
const coversSlice = createSlice({
  name: 'covers',
  initialState,
  reducers: {
    // Reducer to add a new cover
    addCover: (state, action) => {
      const newCover = {
        id: uuidv4(), // generate unique ID
        ...action.payload,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      state.covers.push(newCover);
    },
    // Reducer to update existing cover
    updateCover: (state, action) => {
      const { id, updates } = action.payload;
      const coverIndex = state.covers.findIndex(cover => cover.id === id);
      if (coverIndex !== -1) {
        state.covers[coverIndex] = {
          ...state.covers[coverIndex],
          ...updates,
          updatedAt: new Date().toISOString()
        };
      }
    },
    // Reducer to delete a cover
    deleteCover: (state, action) => {
      const id = action.payload;
      state.covers = state.covers.filter(cover => cover.id !== id);
    }
  }
});

// Export actions and reducer
export const { addCover, updateCover, deleteCover } = coversSlice.actions;
export default coversSlice.reducer;
