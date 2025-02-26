// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toBeInTheDocument();
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// The extend-expect import is no longer needed as it's included in the main package

// This file is not meant to be a test file, but to prevent Jest from treating it as one,
// we add a dummy test
if (process.env.NODE_ENV === 'test') {
  describe('Setup file', () => {
    it('is just a setup file, not a test', () => {
      expect(true).toBe(true);
    });
  });
} 