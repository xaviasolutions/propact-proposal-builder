import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  clients: [
    {
      id: '1',
      name: 'John Smith',
      company: 'TechCorp Solutions',
      email: 'john.smith@techcorp.com',
      phone: '+1 (555) 987-6543',
      address: '123 Business Ave, Suite 100, New York, NY 10001',
      notes: 'Looking for e-commerce platform modernization. Budget: $150k-200k',
      createdAt: new Date().toISOString()
    },
    {
      id: '2',
      name: 'Maria Garcia',
      company: 'HealthFirst Medical',
      email: 'maria.garcia@healthfirst.com',
      phone: '+1 (555) 876-5432',
      address: '456 Medical Center Dr, Los Angeles, CA 90210',
      notes: 'Needs patient management system. Timeline: 4-6 months',
      createdAt: new Date().toISOString()
    },
    {
      id: '3',
      name: 'Robert Johnson',
      company: 'EduTech Academy',
      email: 'robert.johnson@edutech.edu',
      phone: '+1 (555) 765-4321',
      address: '789 Education Blvd, Austin, TX 78701',
      notes: 'Mobile learning platform development. Focus on student engagement',
      createdAt: new Date().toISOString()
    }
  ],
};

const clientsSlice = createSlice({
  name: 'clients',
  initialState,
  reducers: {
    setClients: (state, action) => {
      state.clients = action.payload;
    },
    addClient: (state, action) => {
      const newClient = {
        ...action.payload,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      };
      state.clients.push(newClient);
    },
    updateClient: (state, action) => {
      const { id, updates } = action.payload;
      const clientIndex = state.clients.findIndex(client => client.id === id);
      if (clientIndex !== -1) {
        state.clients[clientIndex] = {
          ...state.clients[clientIndex],
          ...updates,
          updatedAt: new Date().toISOString()
        };
      }
    },
    deleteClient: (state, action) => {
      const id = action.payload;
      state.clients = state.clients.filter(client => client.id !== id);
    },
  },
});

export const {
  setClients,
  addClient,
  updateClient,
  deleteClient,
} = clientsSlice.actions;

export default clientsSlice.reducer;