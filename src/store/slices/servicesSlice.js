import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  services: [],
};

const servicesSlice = createSlice({
  name: 'services',
  initialState,
  reducers: {
    setServices: (state, action) => {
      state.services = action.payload;
    },
    addService: (state, action) => {
      const newService = {
        ...action.payload,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      };
      state.services.push(newService);
    },
    updateService: (state, action) => {
      const { id, updates } = action.payload;
      const serviceIndex = state.services.findIndex(service => service.id === id);
      if (serviceIndex !== -1) {
        state.services[serviceIndex] = {
          ...state.services[serviceIndex],
          ...updates,
          updatedAt: new Date().toISOString()
        };
      }
    },
    deleteService: (state, action) => {
      const id = action.payload;
      state.services = state.services.filter(service => service.id !== id);
    },
  },
});

export const {
  setServices,
  addService,
  updateService,
  deleteService,
} = servicesSlice.actions;

export default servicesSlice.reducer;