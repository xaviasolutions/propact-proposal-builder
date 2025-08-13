import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  keywords: [
    'Web Development',
    'Mobile App',
    'UI/UX Design',
    'E-commerce',
    'Database Design',
    'API Development',
    'Cloud Computing',
    'DevOps',
    'Machine Learning',
    'Data Analytics',
    'Cybersecurity',
    'Blockchain',
    'IoT Solutions',
    'Digital Marketing',
    'SEO Optimization'
  ]
};

const keywordsSlice = createSlice({
  name: 'keywords',
  initialState,
  reducers: {
    setKeywords: (state, action) => {
      state.keywords = action.payload;
    },
    addKeyword: (state, action) => {
      const keyword = action.payload.trim();
      if (keyword && !state.keywords.includes(keyword)) {
        state.keywords.push(keyword);
      }
    },
    removeKeyword: (state, action) => {
      const keyword = action.payload;
      state.keywords = state.keywords.filter(k => k !== keyword);
    },
  },
});

export const {
  setKeywords,
  addKeyword,
  removeKeyword,
} = keywordsSlice.actions;

export default keywordsSlice.reducer;