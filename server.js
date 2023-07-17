// server.js
/* This code is setting up the server for the application using the Socket.IO
library. */

const { Server } = require('socket.io') 
const express = require('express') 
const http = require('http') 
const app = express() 
const server = http.createServer(app) 
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
}) 

const gameRoomWidth = 500 
const gameRoomHeight = 500 
const playerSize = 50 
const players = {} 

io.on('connection', (socket) => {
  const roomName = 'friends' 

  // Emit the 'playerInitialPosition' event to the newly connected player
  const initialPosition = {
    x: Math.floor(Math.random() * (gameRoomWidth - playerSize)),
    y: Math.floor(Math.random() * (gameRoomHeight - playerSize)),
  } 
  socket.emit('playerInitialPosition', { ...initialPosition, name: socket.id }) 

  // Add the new player to the list of players
  players[socket.id] = {
    id: socket.id,
    position: initialPosition,
  } 

  // Send the list of players to the new player
  socket.emit('currentPlayers', Object.values(players)) 

  // Broadcast 'playerJoined' event to all other players in the room
  socket.to(roomName).emit('playerJoined', players[socket.id]) 

  // Join the room
  socket.join(roomName) 

  // Listen for 'updatePosition' event from the player
  socket.on('updatePosition', (data) => {
    // Update the player's position in the list
    players[socket.id].position = data 

    // Broadcast 'playerPositionUpdated' event to all other players in the room
    socket.to(roomName).emit('playerPositionUpdated', { playerId: socket.id, position: data }) 
    console.log(data)
  }) 

  // Handle player disconnection
  socket.on('disconnect', () => {
    // Broadcast 'playerDisconnected' event to all other players in the room
    socket.to(roomName).emit('playerDisconnected', { id: socket.id }) 

    // Remove the player from the list of players
    delete players[socket.id] 
  }) 
}) 

app.use(express.static('public')) 
server.listen(process.env.PORT || 3333, () => console.log('Server is running on port 3000')) 

