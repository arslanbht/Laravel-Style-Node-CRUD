const Application = require('./bootstrap/app');

// Create and start the application
const app = new Application();

// Start the server
app.start().catch(error => {
    console.error('Failed to start server:', error);
    process.exit(1);
});
