const WebSocket = require('ws');

const db = require('./db.json');

const login = (message, ws) => {
  const user = message.user;
  const pass = message.pass;
  if (!user || !pass) {
    ws.send('{"msg":"invalid user or pass"}');
    return;
  }
  const userFound = db.find(u => u.user === user && u.pass === pass);
  if (userFound) {
    const response = {
      action: message.action,
      player: userFound.player,
      spaceship: userFound.spaceship
    };
    ws.send(JSON.stringify(response));
  } else {
    ws.send('{"msg":"no such user/pass combo"}');
  }
};

const register = (message, ws) => {
  console.log(`Received register message: ${message}`);
  ws.send('{"msg":"not implemented"}');
};

const respond = (message, ws) => {
  if (message?.action === 'login') {
    login(message, ws);
  } else if (message?.action === 'register') {
    register(message, ws);
  }
};

const wss = new WebSocket.Server({ port: 8080 });
wss.on('connection', (ws) => {
  console.log('');
  console.log('* New client connected');

  // Sending a message to the client
  ws.send('{"msg":"Welcome to the WebSocket server!"}');

  // Listening for messages from the client
  ws.on('message', (message) => {
    const data = JSON.parse(message);
    console.log('* Received message:', data);
    respond(data, ws);
  });

  // Handling client disconnection
  ws.on('close', () => {
    console.log('* Client disconnected');
  });
});

console.log('* WebSocket server is running on ws://localhost:8080');
console.log('');
