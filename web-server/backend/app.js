// Import the Express.js module
const express = require('express');

// Create an instance of the Express application
const app = express();

// Define a route handler for the root URL
app.get('/', (req, res) => {
  // Send a simple message as the response
  res.send('Hello, World!');
});

// Define the port number that your server will listen on
const port = 3000;

// Start the server and make it listen for incoming connections on the specified port
app.listen(port, () => {
  // Log a message indicating that the server is now running
  console.log(`Server is listening on port ${port}`);
});