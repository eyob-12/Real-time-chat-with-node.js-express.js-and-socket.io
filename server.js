const express = require('express')
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const formatMessage = require('./format/messages');
const {userJoin, getCurrentUser, userLeave, getRoomUsers} =require('./format/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const botName = "welcome to eyob's chatbot";
//set static folder
app.use(express.static(path.join(__dirname, 'public')));

// when the cient connect
io.on('connection', socket => {
    
    // to catch chatRoom
    socket.on('joinRoom', ({ username, room }) => {
       
        // for actually join
        const user = userJoin(socket.id, username, room);
        socket.join(user.room);
 

        // welcome the current user
        socket.emit('message',
            formatMessage(botName, 'welcome to the chat'));
        
    
        // listen message from the client or broadcast
        //  when the user connect
        // also to emit the specific room
        socket.broadcast.to(user.room).emit(
            'message',
            formatMessage(botName, `${user.username} has joined the chat`)
        );

        // send users and room info
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        });
    });
                       
    // catch the chat message for the sever to client
    socket.on('chatMessage', (msg) => {
        const user = getCurrentUser(socket.id);
        io.to(user.room).emit('message', formatMessage(user.username, msg));
    });

    // cilient disconnect
    socket.on('disconnect', () => {
        const user = userLeave(socket.id);
        if (user) {
            io.to(user.room).emit('message',
                formatMessage(botName, `${user.username} got to left the chat`
                ));
            
             // send users and room info
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        });
        }
    });
});


const PORT = 5000 || process.env.PORT;

server.listen(PORT, ()=>console.log(`the server is about to start ${PORT}`));