import { createSlice } from '@reduxjs/toolkit';

const defaultTemplates = [
  {
    id: 'professional-blue',
    name: 'Professional Blue',
    colors: {
      primary: '#000000',
      secondary: '#000000',
      accent: '#000000'
    },
    fonts: {
      primary: 'Inter, sans-serif',
      secondary: 'Georgia, serif'
    },
    logo: null,
    watermark: null,
    companyName: 'Your Company Name',
    address: '',
    companyAddress: '',
    headerText: 'Professional Services',
    footerText: 'Your Trusted Partner',
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
      type: 'image', // 'image' or 'text'
      image: null,
      text: '',
      transparency: 0.3,
      rotation: 0, // rotation angle in degrees
      processedImage: null // This will store the transparent version
    },
    companyName: 'Your Company Name',
    address: '',
    companyAddress: '',
    headerText: '',
    footerText: '',
    tableOfContents: {
      enabled: true,
      showPageNumbers: true,
      headingLevels: '1-3' // which heading levels to include
    }
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