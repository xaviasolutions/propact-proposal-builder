import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [
    {
      id: 1,
      title: 'Company Overview Template',
      content: 'Our company has been a leader in innovative solutions for over 10 years, serving clients across various industries with cutting-edge technology and exceptional service.',
      category: 'Company Info',
      createdAt: '2024-01-15'
    },
    {
      id: 2,
      title: 'Project Timeline Standard',
      content: 'Phase 1: Discovery and Planning (2-3 weeks)\nPhase 2: Design and Development (4-6 weeks)\nPhase 3: Testing and Quality Assurance (1-2 weeks)\nPhase 4: Deployment and Launch (1 week)',
      category: 'Timeline',
      createdAt: '2024-01-16'
    },
    {
      id: 3,
      title: 'Pricing Disclaimer',
      content: 'All prices are subject to change based on project scope and requirements. Final pricing will be confirmed after detailed project analysis.',
      category: 'Legal',
      createdAt: '2024-01-17'
    }
  ],
  selectedItems: []
};

const preSavedContentSlice = createSlice({
  name: 'preSavedContent',
  initialState,
  reducers: {
    addPreSavedContent: (state, action) => {
      const newItem = {
        id: Date.now(),
        ...action.payload,
        createdAt: new Date().toISOString().split('T')[0]
      };
      state.items.push(newItem);
    },
    updatePreSavedContent: (state, action) => {
      const { id, ...updates } = action.payload;
      const index = state.items.findIndex(item => item.id === id);
      if (index !== -1) {
        state.items[index] = { ...state.items[index], ...updates };
      }
    },
    deletePreSavedContent: (state, action) => {
      state.items = state.items.filter(item => item.id !== action.payload);
    },
    selectPreSavedContent: (state, action) => {
      const itemId = action.payload;
      if (!state.selectedItems.includes(itemId)) {
        state.selectedItems.push(itemId);
      }
    },
    deselectPreSavedContent: (state, action) => {
      state.selectedItems = state.selectedItems.filter(id => id !== action.payload);
    },
    clearSelectedPreSavedContent: (state) => {
      state.selectedItems = [];
    }
  }
});

export const {
  addPreSavedContent,
  updatePreSavedContent,
  deletePreSavedContent,
  selectPreSavedContent,
  deselectPreSavedContent,
  clearSelectedPreSavedContent
} = preSavedContentSlice.actions;

export default preSavedContentSlice.reducer;