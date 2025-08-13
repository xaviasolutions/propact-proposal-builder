/**
 * Image processing utilities for watermark transparency
 */

/**
 * Apply transparency to an image and return as base64
 * @param {string} imageDataUrl - Base64 image data URL
 * @param {number} transparency - Transparency value between 0 and 1
 * @returns {Promise<string>} - Processed image as base64 data URL
 */
export const applyTransparency = (imageDataUrl, transparency) => {
  return new Promise((resolve, reject) => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Set canvas dimensions to match image
        canvas.width = img.width;
        canvas.height = img.height;

        // Set global alpha for transparency
        ctx.globalAlpha = transparency;

        // Draw the image with transparency
        ctx.drawImage(img, 0, 0);

        // Convert canvas to base64
        const processedImageDataUrl = canvas.toDataURL('image/png');
        resolve(processedImageDataUrl);
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      img.src = imageDataUrl;
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Resize image to exact A4 letterhead dimensions (stretching to fit)
 * @param {string} imageDataUrl - Base64 image data URL
 * @returns {Promise<string>} - Resized image as base64 data URL
 */
export const resizeImageForA4Letterhead = (imageDataUrl) => {
  return new Promise((resolve, reject) => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // A4 dimensions in pixels at 300 DPI
        const a4Width = 2480;
        const a4Height = 3508;

        // Set canvas to exact A4 dimensions
        canvas.width = a4Width;
        canvas.height = a4Height;

        // Draw image stretched to fill entire A4 canvas
        ctx.drawImage(img, 0, 0, a4Width, a4Height);

        // Convert canvas to base64
        const resizedImageDataUrl = canvas.toDataURL('image/png');
        resolve(resizedImageDataUrl);
      };

      img.onerror = () => {
        reject(new Error('Failed to load image for A4 letterhead resize'));
      };

      img.src = imageDataUrl;
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Resize image while maintaining aspect ratio
 * @param {string} imageDataUrl - Base64 image data URL
 * @param {number} maxWidth - Maximum width
 * @param {number} maxHeight - Maximum height
 * @returns {Promise<string>} - Resized image as base64 data URL
 */
export const resizeImage = (imageDataUrl, maxWidth = 800, maxHeight = 600) => {
  return new Promise((resolve, reject) => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions while maintaining aspect ratio
        let { width, height } = img;
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }

        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;

        // Draw resized image
        ctx.drawImage(img, 0, 0, width, height);

        // Convert canvas to base64
        const resizedImageDataUrl = canvas.toDataURL('image/png');
        resolve(resizedImageDataUrl);
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      img.src = imageDataUrl;
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Apply transparency and resize image
 * @param {string} imageDataUrl - Base64 image data URL
 * @param {number} transparency - Transparency value between 0 and 1
 * @param {number} maxWidth - Maximum width
 * @param {number} maxHeight - Maximum height
 * @returns {Promise<string>} - Processed image as base64 data URL
 */
export const processWatermarkImage = async (imageDataUrl, transparency, maxWidth = 400, maxHeight = 300) => {
  try {
    // First resize the image
    const resizedImage = await resizeImage(imageDataUrl, maxWidth, maxHeight);
    
    // Then apply transparency
    const processedImage = await applyTransparency(resizedImage, transparency);
    
    return processedImage;
  } catch (error) {
    console.error('Error processing watermark image:', error);
    throw error;
  }
};

/**
 * Save image to local storage
 * @param {string} key - Storage key
 * @param {string} imageDataUrl - Base64 image data URL
 */
export const saveImageToLocalStorage = (key, imageDataUrl) => {
  try {
    localStorage.setItem(key, imageDataUrl);
  } catch (error) {
    console.error('Error saving image to local storage:', error);
    throw error;
  }
};

/**
 * Load image from local storage
 * @param {string} key - Storage key
 * @returns {string|null} - Base64 image data URL or null if not found
 */
export const loadImageFromLocalStorage = (key) => {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.error('Error loading image from local storage:', error);
    return null;
  }
};

/**
 * Remove image from local storage
 * @param {string} key - Storage key
 */
export const removeImageFromLocalStorage = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing image from local storage:', error);
  }
};