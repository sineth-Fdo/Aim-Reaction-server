const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
app.use(cors());

const server = http.createServer(app);
const port = process.env.PORT || 3001;

const io = new Server(server, {
    cors: {
        origin: "https://trainaim.netlify.app",
        // origin: "http://localhost:3000",
        methods: ["GET", "POST", "PUT", "DELETE"],
    },
});

io.of("/home").on('connection', (socket) => {
    console.log(`User Connected : ${socket.id}`);

    // Send ID to client
    socket.emit("yourID", socket.id);

    // Join room
    socket.on("join_room", (data) => {
        socket.join(data);
        console.log(`Socket ${socket.id} has joined room ${data}`);
    });

    // Send and receive messages
    socket.on("send_message", (data, room) => {
        socket.to(room).emit("receive_message", data);
        console.log(`${data.message} from room ${room}`);
    });

    // Leave room
    socket.on("leave-room", (room) => {
        socket.leave(room);
        console.log(`Socket ${socket.id} has left room ${room}`);
    });

    // Delete a room
    socket.on("delete-room", (room) => {
        socket.to(room).emit("delete-room", room);
        console.log(`Room ${room} has been deleted`);
    });

    // Get room count
    socket.on("get-room-count", (room) => {
        const roomCount = io.of("/home").adapter.rooms.get(room)?.size || 0;
        console.log(`Room ${room} has ${roomCount} users`);
        io.of("/home").to(room).emit("room-count", roomCount);
    });

    // Handle disconnection
    socket.on("disconnect", () => {
        console.log("User Disconnected", socket.id);
    });

    // Send win message
    socket.on("win_message", (data, room) => {
        socket.to(room).emit("receive_win", data);
        console.log(`${data.id} Won from room ${room}`);
    });

    // Start countdown and game
    socket.on("start_countdown", (room) => {
        let countdown = 3;
        const countdownInterval = setInterval(() => {
            io.of("/home").to(room).emit("countdown", countdown);
            console.log(`Countdown ${countdown} for room ${room}`);
            if (countdown === 0) {
                clearInterval(countdownInterval);
                io.of("/home").to(room).emit("start_game");
                console.log(`Game started for room ${room}`);
            }
            countdown--;
        }, 1000);
    });

    // Get start timer
    socket.on("get-start-timer", (data, room) => {
        socket.to(room).emit("start-timer", data);
        console.log("Timer started " + data + " from room " + room);
    });
});

// Get room count (API endpoint)
app.get("/room-count", (req, res) => {
    res.json(roomCount);
});

server.listen(port, () => {
    console.log(`Port: ${port}`);
});
