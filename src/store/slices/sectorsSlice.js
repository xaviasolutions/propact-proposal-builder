import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  sectors: [
    'Technology',
    'Healthcare',
    'Finance',
    'Education',
    'Retail',
    'Manufacturing',
    'Real Estate',
    'Transportation',
    'Energy',
    'Entertainment',
    'Government',
    'Non-Profit',
    'Hospitality',
    'Agriculture',
    'Construction'
  ]
};

const sectorsSlice = createSlice({
  name: 'sectors',
  initialState,
  reducers: {
    setSectors: (state, action) => {
      state.sectors = action.payload;
    },
    addSector: (state, action) => {
      const sector = action.payload.trim();
      if (sector && !state.sectors.includes(sector)) {
        state.sectors.push(sector);
      }
    },
    removeSector: (state, action) => {
      const sector = action.payload;
      state.sectors = state.sectors.filter(s => s !== sector);
    },
  },
});

export const {
  setSectors,
  addSector,
  removeSector,
} = sectorsSlice.actions;

export default sectorsSlice.reducer;