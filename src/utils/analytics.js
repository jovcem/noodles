import ReactGA from 'react-ga4';

// Initialize Google Analytics
// Replace 'G-XXXXXXXXXX' with your actual Measurement ID
const MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || 'G-XXXXXXXXXX';

export const initGA = () => {
  // Only initialize if we have a valid measurement ID and we're not in development
  if (MEASUREMENT_ID !== 'G-XXXXXXXXXX') {
    ReactGA.initialize(MEASUREMENT_ID, {
      gaOptions: {
        // You can add additional configuration here
        anonymize_ip: true, // Anonymize IP addresses for privacy
      },
    });
    console.log('Google Analytics initialized');
  }
};

// Track page views
export const trackPageView = (path) => {
  if (MEASUREMENT_ID !== 'G-XXXXXXXXXX') {
    ReactGA.send({ hitType: 'pageview', page: path });
  }
};

// Track custom events
export const trackEvent = (category, action, label = null, value = null) => {
  if (MEASUREMENT_ID !== 'G-XXXXXXXXXX') {
    ReactGA.event({
      category,
      action,
      label,
      value,
    });
  }
};

// Track file uploads
export const trackFileUpload = (fileType) => {
  trackEvent('File', 'Upload', fileType);
};

// Track feature usage
export const trackFeatureUse = (featureName) => {
  trackEvent('Feature', 'Use', featureName);
};
