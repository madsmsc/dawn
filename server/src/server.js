const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws) => {
  console.log('New client connected');

  // Sending a message to the client
  ws.send('Welcome to the WebSocket server!');

  // Listening for messages from the client
  ws.on('message', (message) => {
    console.log(`Received message: ${message}`);
    // Echoing the message back to the client
    ws.send(`Server received: ${message}`);
  });

  // Handling client disconnection
  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

console.log('WebSocket server is running on ws://localhost:8080');
