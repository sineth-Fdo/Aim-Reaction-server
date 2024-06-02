const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
const {Server} = require("socket.io");
app.use(cors());

const server = http.createServer(app);
const port = process.env.PORT || 3001;

const io = new Server(server, {
    cors: {
        origin: "trainaim.netlify.app",
        methods: ["GET", "POST", "PUT", "DELETE"],
    },
});



io.of("/home").on('connection', (socket) => {
    console.log(`User Connected : ${socket.id}`);

    //send id to client
    socket.emit("yourID", socket.id);

    //join room
    socket.on("join_room", (data) => {
        socket.join(data);
        console.log(`socket ${socket.id} has joined room ${data}`);
    });

    // send and receive messages
    socket.on("send_message", (data,room) => {
        socket.to(room).emit("receive_message",data)
        console.log(`${data.message} from room ${room}`)
    
    })

    //leave room
    socket.on("leave-room", (room) => {
        socket.leave(room);
        console.log(`socket ${socket.id} has left room ${room}`);
    })

    //delete a room 
    socket.on("delete-room", (room) => {
        socket.to(room).emit("delete-room", room);
        console.log(`Room ${room} has been deleted`);
    })

    // Get room count
    socket.on("get-room-count", (room) => {
        const roomCount = io.of("/home").adapter.rooms.get(room)?.size || 0;
        console.log(`Room ${room} has ${roomCount} users`);
        io.of("/home").to(room).emit("room-count", roomCount); 
    });

    socket.on("disconnect", () => {
        console.log("User Disconnected", socket.id);
    })

    //send win message
    socket.on("win_message", (data, room) => {
        socket.to(room).emit("receive_win", data);
        console.log(`${data.id} Won from room ${room}`);
    });
    
});

//get room count
app.get("/room-count", (req, res) => {
    
    res.json(roomCount);
});


server.listen( port , () => {
    console.log(`Port: ${port}`);

});