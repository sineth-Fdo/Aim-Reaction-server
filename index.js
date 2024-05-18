const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
const {Server} = require("socket.io");
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
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



    socket.on("disconnect", () => {
        console.log("User Disconnected", socket.id);
    })
    
});




server.listen(3001, () => {
    console.log("Server is running on port 3001");
});