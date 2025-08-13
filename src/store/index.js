import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
// import storage from 'redux-persist/lib/storage';
import storage from 'localforage';

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

// Transform to exclude large image data from persistence
const imageTransform = {
  in: (inboundState, key) => {
    if (key === 'branding' && inboundState) {
      // Remove large image data from branding state before persisting
      const { currentBranding, ...rest } = inboundState;
      if (currentBranding) {
        const cleanBranding = { ...currentBranding };
        if (cleanBranding.logo) {
          cleanBranding.logo = null; // Don't persist logo data
        }
        if (cleanBranding.watermark && cleanBranding.watermark.processedImage) {
          cleanBranding.watermark = {
            ...cleanBranding.watermark,
            processedImage: null, // Don't persist processed image
            image: null // Don't persist original image
          };
        }
        return { ...rest, currentBranding: cleanBranding };
      }
    }
    if (key === 'proposals' && inboundState && inboundState.proposals) {
      // Remove large image data from proposals before persisting
      const cleanProposals = inboundState.proposals.map(proposal => {
        if (proposal.branding) {
          const cleanBranding = { ...proposal.branding };
          if (cleanBranding.logo) {
            cleanBranding.logo = null;
          }
          if (cleanBranding.watermark && cleanBranding.watermark.processedImage) {
            cleanBranding.watermark = {
              ...cleanBranding.watermark,
              processedImage: null,
              image: null
            };
          }
          return { ...proposal, branding: cleanBranding };
        }
        return proposal;
      });
      const cleanCurrentProposal = inboundState.currentProposal ? {
        ...inboundState.currentProposal,
        branding: inboundState.currentProposal.branding ? {
          ...inboundState.currentProposal.branding,
          logo: null,
          watermark: inboundState.currentProposal.branding.watermark ? {
            ...inboundState.currentProposal.branding.watermark,
            processedImage: null,
            image: null
          } : null
        } : null
      } : null;
      return { ...inboundState, proposals: cleanProposals, currentProposal: cleanCurrentProposal };
    }
    return inboundState;
  },
  out: (outboundState, key) => {
    // No transformation needed on rehydration
    return outboundState;
  }
};

// Redux Persist configuration
const persistConfig = {
  key: 'propact-root',
  storage,
  version: 1,
  transforms: [imageTransform],
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