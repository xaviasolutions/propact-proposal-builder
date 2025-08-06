import { createSlice } from '@reduxjs/toolkit';

const defaultTemplates = [
  {
    id: 'professional-blue',
    name: 'Professional Blue',
    colors: {
      primary: '#2563eb',
      secondary: '#64748b',
      accent: '#10b981'
    },
    fonts: {
      primary: 'Inter, sans-serif',
      secondary: 'Georgia, serif'
    },
    logo: null,
    watermark: null,
    companyName: 'Your Company Name',
    headerText: 'Professional Services',
    footerText: 'Your Trusted Partner',
    createdAt: new Date().toISOString()
  },
  {
    id: 'modern-green',
    name: 'Modern Green',
    colors: {
      primary: '#059669',
      secondary: '#6b7280',
      accent: '#f59e0b'
    },
    fonts: {
      primary: 'Roboto, sans-serif',
      secondary: 'Times New Roman, serif'
    },
    logo: null,
    watermark: null,
    companyName: 'Your Company Name',
    headerText: 'Innovative Solutions',
    footerText: 'Building Tomorrow',
    createdAt: new Date().toISOString()
  },
  {
    id: 'elegant-purple',
    name: 'Elegant Purple',
    colors: {
      primary: '#7c3aed',
      secondary: '#64748b',
      accent: '#ec4899'
    },
    fonts: {
      primary: 'Montserrat, sans-serif',
      secondary: 'Georgia, serif'
    },
    logo: null,
    watermark: null,
    companyName: 'Your Company Name',
    headerText: 'Creative Excellence',
    footerText: 'Crafted with Care',
    createdAt: new Date().toISOString()
  }
];

const initialState = {
  brandingTemplates: defaultTemplates,
  currentBranding: {
    colors: {
      primary: '#007bff',
      secondary: '#6c757d',
      accent: '#28a745'
    },
    fonts: {
      primary: 'Arial, sans-serif',
      secondary: 'Georgia, serif'
    },
    logo: null,
    watermark: {
      image: null,
      transparency: 0.3,
      processedImage: null // This will store the transparent version
    },
    companyName: 'Your Company Name',
    headerText: '',
    footerText: ''
  },
};

const brandingSlice = createSlice({
  name: 'branding',
  initialState,
  reducers: {
    setBrandingTemplates: (state, action) => {
      state.brandingTemplates = action.payload;
    },
    addBrandingTemplate: (state, action) => {
      const newTemplate = {
        ...action.payload,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      };
      state.brandingTemplates.push(newTemplate);
    },
    updateBrandingTemplate: (state, action) => {
      const { id, updates } = action.payload;
      const templateIndex = state.brandingTemplates.findIndex(template => template.id === id);
      if (templateIndex !== -1) {
        state.brandingTemplates[templateIndex] = {
          ...state.brandingTemplates[templateIndex],
          ...updates,
          updatedAt: new Date().toISOString()
        };
      }
    },
    deleteBrandingTemplate: (state, action) => {
      const id = action.payload;
      state.brandingTemplates = state.brandingTemplates.filter(template => template.id !== id);
    },
    setCurrentBranding: (state, action) => {
      state.currentBranding = action.payload;
    },
    updateCurrentBranding: (state, action) => {
      state.currentBranding = {
        ...state.currentBranding,
        ...action.payload
      };
    },
    updateCurrentBrandingColors: (state, action) => {
      state.currentBranding.colors = {
        ...state.currentBranding.colors,
        ...action.payload
      };
    },
    updateCurrentBrandingFonts: (state, action) => {
      state.currentBranding.fonts = {
        ...state.currentBranding.fonts,
        ...action.payload
      };
    },
  },
});

export const {
  setBrandingTemplates,
  addBrandingTemplate,
  updateBrandingTemplate,
  deleteBrandingTemplate,
  setCurrentBranding,
  updateCurrentBranding,
  updateCurrentBrandingColors,
  updateCurrentBrandingFonts,
} = brandingSlice.actions;

export default brandingSlice.reducer;