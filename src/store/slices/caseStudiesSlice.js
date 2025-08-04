import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  caseStudies: [
    {
      id: '1',
      title: 'E-commerce Platform Modernization',
      client: 'TechRetail Corp',
      description: 'Complete overhaul of legacy e-commerce platform to modern, scalable solution',
      challenge: 'Legacy system was slow, difficult to maintain, and couldn\'t handle peak traffic',
      solution: 'Migrated to modern React/Node.js architecture with microservices and cloud deployment',
      results: '300% improvement in page load times, 99.9% uptime, 40% increase in conversions',
      duration: '6 months',
      budget: '$150,000',
      tags: 'E-commerce, React, Node.js, AWS',
      testimonial: 'Outstanding work! The new platform exceeded our expectations.',
      createdAt: new Date().toISOString()
    },
    {
      id: '2',
      title: 'Healthcare Management System',
      client: 'MedCare Solutions',
      description: 'Custom patient management system with appointment scheduling and billing',
      challenge: 'Manual processes were causing delays and errors in patient care',
      solution: 'Developed comprehensive web application with automated workflows and integrations',
      results: '50% reduction in administrative time, improved patient satisfaction scores',
      duration: '4 months',
      budget: '$80,000',
      tags: 'Healthcare, Custom Development, Automation',
      testimonial: 'The system has transformed how we manage our practice.',
      createdAt: new Date().toISOString()
    },
    {
      id: '3',
      title: 'Financial Dashboard Analytics',
      client: 'InvestPro Financial',
      description: 'Real-time financial analytics dashboard with advanced reporting capabilities',
      challenge: 'Needed real-time data visualization for complex financial instruments',
      solution: 'Built responsive dashboard with D3.js visualizations and real-time data feeds',
      results: 'Enabled faster decision-making, reduced reporting time by 80%',
      duration: '3 months',
      budget: '$120,000',
      tags: 'Finance, Analytics, Data Visualization, D3.js',
      testimonial: 'The dashboard provides insights we never had before.',
      createdAt: new Date().toISOString()
    },
    {
      id: '4',
      title: 'Mobile Learning Platform',
      client: 'EduTech Academy',
      description: 'Cross-platform mobile app for online learning with interactive features',
      challenge: 'Needed engaging mobile learning experience with offline capabilities',
      solution: 'Developed React Native app with offline sync and gamification features',
      results: '200% increase in student engagement, 95% completion rates',
      duration: '5 months',
      budget: '$100,000',
      tags: 'Mobile, Education, React Native, Gamification',
      testimonial: 'Students love the app and engagement has skyrocketed.',
      createdAt: new Date().toISOString()
    }
  ],
};

const caseStudiesSlice = createSlice({
  name: 'caseStudies',
  initialState,
  reducers: {
    setCaseStudies: (state, action) => {
      state.caseStudies = action.payload;
    },
    addCaseStudy: (state, action) => {
      const newCaseStudy = {
        ...action.payload,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      };
      state.caseStudies.push(newCaseStudy);
    },
    updateCaseStudy: (state, action) => {
      const { id, updates } = action.payload;
      const caseStudyIndex = state.caseStudies.findIndex(caseStudy => caseStudy.id === id);
      if (caseStudyIndex !== -1) {
        state.caseStudies[caseStudyIndex] = {
          ...state.caseStudies[caseStudyIndex],
          ...updates,
          updatedAt: new Date().toISOString()
        };
      }
    },
    deleteCaseStudy: (state, action) => {
      const id = action.payload;
      state.caseStudies = state.caseStudies.filter(caseStudy => caseStudy.id !== id);
    },
  },
});

export const {
  setCaseStudies,
  addCaseStudy,
  updateCaseStudy,
  deleteCaseStudy,
} = caseStudiesSlice.actions;

export default caseStudiesSlice.reducer;