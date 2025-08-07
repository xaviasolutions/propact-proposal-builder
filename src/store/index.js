import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';


// Import all slices
import proposalsReducer from './slices/proposalsSlice';
import clientsReducer from './slices/clientsSlice';
import caseStudiesReducer from './slices/caseStudiesSlice';
import servicesReducer from './slices/servicesSlice';
import teamMembersReducer from './slices/teamMembersSlice';
import brandingReducer from './slices/brandingSlice';
import coversReducer from './slices/coversSlice';
import preSavedContentReducer from './slices/preSavedContentSlice';


// Combine all reducers
const rootReducer = combineReducers({
  proposals: proposalsReducer,
  clients: clientsReducer,
  caseStudies: caseStudiesReducer,
  services: servicesReducer,
  teamMembers: teamMembersReducer,
  branding: brandingReducer,
  covers: coversReducer,
  preSavedContent: preSavedContentReducer,

});

// Redux Persist configuration
const persistConfig = {
  key: 'propact-root',
  storage,
  version: 1,
  // Optionally, you can blacklist certain reducers from being persisted
  // blacklist: ['someReducer']
};

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

// Make store globally accessible for exporters
if (typeof window !== 'undefined') {
  window.__REDUX_STORE__ = store;
}

// Create persistor
export const persistor = persistStore(store);

// Export store and persistor
export default store;