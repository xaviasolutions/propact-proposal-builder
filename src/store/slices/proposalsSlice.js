import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  proposals: [],
  currentProposal: null,
};

const proposalsSlice = createSlice({
  name: 'proposals',
  initialState,
  reducers: {
    setProposals: (state, action) => {
      state.proposals = action.payload;
    },
    setCurrentProposal: (state, action) => {
      state.currentProposal = action.payload;
    },
    addProposal: (state, action) => {
      state.proposals.push(action.payload);
    },
    updateProposal: (state, action) => {
      const { id, updates } = action.payload;
      const proposalIndex = state.proposals.findIndex(proposal => proposal.id === id);
      if (proposalIndex !== -1) {
        state.proposals[proposalIndex] = {
          ...state.proposals[proposalIndex],
          ...updates,
          updatedAt: new Date().toISOString()
        };
      }
      
      // Update current proposal if it's the one being updated
      if (state.currentProposal && state.currentProposal.id === id) {
        state.currentProposal = {
          ...state.currentProposal,
          ...updates,
          updatedAt: new Date().toISOString()
        };
      }
    },
    deleteProposal: (state, action) => {
      const id = action.payload;
      state.proposals = state.proposals.filter(proposal => proposal.id !== id);
      
      // Clear current proposal if it's the one being deleted
      if (state.currentProposal && state.currentProposal.id === id) {
        state.currentProposal = null;
      }
    },
  },
});

export const {
  setProposals,
  setCurrentProposal,
  addProposal,
  updateProposal,
  deleteProposal,
} = proposalsSlice.actions;

export default proposalsSlice.reducer;