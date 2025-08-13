import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  firmExperience: []
};

const firmExperienceSlice = createSlice({
  name: 'firmExperience',
  initialState,
  reducers: {
    setFirmExperience: (state, action) => {
      state.firmExperience = action.payload;
    },
    addFirmExperience: (state, action) => {
      const newFirmExperience = {
        ...action.payload,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      };
      state.firmExperience.push(newFirmExperience);
    },
    updateFirmExperience: (state, action) => {
      const { id, updates } = action.payload;
      const firmExperienceIndex = state.firmExperience.findIndex(experience => experience.id === id);
      if (firmExperienceIndex !== -1) {
        state.firmExperience[firmExperienceIndex] = {
          ...state.firmExperience[firmExperienceIndex],
          ...updates,
          updatedAt: new Date().toISOString()
        };
      }
    },
    deleteFirmExperience: (state, action) => {
      const id = action.payload;
      state.firmExperience = state.firmExperience.filter(experience => experience.id !== id);
    },
  },
});

export const {
  setFirmExperience,
  addFirmExperience,
  updateFirmExperience,
  deleteFirmExperience,
} = firmExperienceSlice.actions;

export default firmExperienceSlice.reducer;