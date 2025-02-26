// This file configures the testing environment for Jest
import "@testing-library/jest-dom";

// Extend Jest expect
expect.extend({
  toBeInTheDocument(received) {
    const pass = Boolean(received);
    if (pass) {
      return {
        message: () => `expected ${received} not to be in the document`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be in the document`,
        pass: false,
      };
    }
  },
});
