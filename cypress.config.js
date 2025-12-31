const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    // Change this to whatever port your API runs on locally/CI
    baseUrl: "http://localhost:3000",
    specPattern: "cypress/e2e/**/*.cy.{js,jsx,ts,tsx}",
    supportFile: "cypress/support/e2e.js",
    video: false,
    retries: {
      runMode: 1,
      openMode: 0,
    },
  },
});