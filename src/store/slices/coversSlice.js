import { createSlice } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';

const initialState = {
  covers: [
    {
      id: 'default-professional',
      name: 'Professional Cover',
      logo: null,
      header: 'Professional Business Proposal',
      footer: 'Confidential & Proprietary',
      content: `Dear [Client Name],

We are pleased to present this comprehensive proposal for your consideration. Our team has carefully analyzed your requirements and developed a tailored solution that addresses your specific needs.

This proposal outlines our understanding of your project, our recommended approach, timeline, and investment details. We believe our expertise and commitment to excellence make us the ideal partner for your upcoming project.

We look forward to the opportunity to discuss this proposal with you and answer any questions you may have.

Best regards,
[Your Company Name]`,
      category: 'Business',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'default-creative',
      name: 'Creative Cover',
      logo: null,
      header: 'Creative Solutions Proposal',
      footer: 'Let\'s Create Something Amazing Together',
      content: `Hello [Client Name],

Creativity meets strategy in this proposal designed specifically for your vision. We understand that every project is unique, and we're excited to bring your ideas to life.

Our creative team has crafted a solution that not only meets your requirements but exceeds your expectations. We believe in the power of innovative thinking combined with proven methodologies.

This proposal represents our commitment to delivering exceptional results that will make a lasting impact on your business.

Looking forward to collaborating with you!

The Creative Team`,
      category: 'Creative',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]
};

const coversSlice = createSlice({
  name: 'covers',
  initialState,
  reducers: {
    addCover: (state, action) => {
      const newCover = {
        id: uuidv4(),
        ...action.payload,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      state.covers.push(newCover);
    },
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
    deleteCover: (state, action) => {
      const id = action.payload;
      state.covers = state.covers.filter(cover => cover.id !== id);
    }
  }
});

export const { addCover, updateCover, deleteCover } = coversSlice.actions;
export default coversSlice.reducer;