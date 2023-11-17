const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);

const registeredUsers = [];

const rooms = {};

app.post("/register", (req, res) => {
    rooms[username] = [];
});

app.post("/login", (req, res) => {
    const userRooms = rooms[username] || [];
    res.status(200).json({message: "Login successful", rooms: userRooms});
});

io.on("connection", (socket) => {
    console.log("A user connected");

    socket.on("disconnect", () => {
        console.log("A user disconnected");
    });

    socket.on("join room", (room) => {
        socket.join(room);
    });

    socket.on("chat message", (data) => {
        const {username, room, message} = data;

        if (rooms[room]) {
            rooms[room].push({username, message});

            io.to(room).emit("chat message", {username, message});
        }
    });
});

const {MongoClient} = require("mongodb");

const mongoURI = "mongodb+srv://phanvande2003:VanDex2003@sdfaf.ncrrtpe.mongodb.net/";

const client = new MongoClient(mongoURI);

client.connect((err) => {
    if (err) {
        console.error("Error connecting to MongoDB:", err);
        return;
    }

    console.log("Connected to MongoDB");

    const PORT = process.env.PORT || 3000;

    const server = http.listen(PORT, () => {
        console.log(`Server listening on port ${PORT}`);
    });
});
