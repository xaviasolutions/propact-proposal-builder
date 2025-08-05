import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  services: [
    {
      id: '1',
      name: 'Web Development',
      category: 'Web Development',
      description: 'Custom web application development using modern technologies like React, Node.js, and cloud deployment.',
      price: 'Starting at $5,000',
      duration: '4-8 weeks',
      deliverables: [
        'Custom website design',
        'Responsive development',
        'Content management system',
        'SEO optimization',
        'Performance optimization'
      ],
      features: [
        'Modern responsive design',
        'Fast loading times',
        'SEO optimized',
        'Mobile-first approach',
        'Cross-browser compatibility'
      ],
      createdAt: new Date().toISOString()
    },
    {
      id: '2',
      name: 'Mobile App Development',
      category: 'Mobile Development',
      description: 'Native and cross-platform mobile application development for iOS and Android platforms.',
      price: 'Starting at $8,000',
      duration: '6-12 weeks',
      deliverables: [
        'iOS and Android apps',
        'App store deployment',
        'User authentication',
        'Push notifications',
        'Analytics integration'
      ],
      features: [
        'Native performance',
        'Offline functionality',
        'Push notifications',
        'Social media integration',
        'Analytics tracking'
      ],
      createdAt: new Date().toISOString()
    },
    {
      id: '3',
      name: 'UI/UX Design',
      category: 'UI/UX Design',
      description: 'Complete user interface and user experience design services including wireframing, prototyping, and visual design.',
      price: 'Starting at $3,000',
      duration: '2-4 weeks',
      deliverables: [
        'User research and personas',
        'Wireframes and mockups',
        'Interactive prototypes',
        'Design system',
        'Usability testing'
      ],
      features: [
        'User-centered design',
        'Modern aesthetics',
        'Accessibility compliance',
        'Brand consistency',
        'Responsive layouts'
      ],
      createdAt: new Date().toISOString()
    }
  ],
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