const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const upload = multer({dest: "public/uploads/"});

const secretKey = "your-secret-key";

const {MongoClient} = require("mongodb");
const mongoURL = "mongodb://127.0.0.1:27017";
const dbName = "ChatApp";

let db;
MongoClient.connect(mongoURL, {useUnifiedTopology: true})
    .then((client) => {
        console.log("Connected to MongoDB");
        db = client.db(dbName);
    })
    .catch((err) => console.error("Error connecting to MongoDB:", err));

app.use(express.static("public"));
app.use(express.json());

app.post("/register", async (req, res) => {
    const {username, password} = req.body;
    const existingUser = (await db.collection("accounts").find({username: username}).toArray())[0];

    if (existingUser) {
        return res.status(400).json({message: "Username already exists"});
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const newUser = {username, password: hashedPassword};
    await db.collection("accounts").insertOne(newUser);
    res.status(200).json({message: "User registered successfully"});
});

app.post("/login", async (req, res) => {
    const {username, password} = req.body;
    const user = (await db.collection("accounts").find({username: username}).toArray())[0];
    if (!user || !bcrypt.compareSync(password, user.password)) {
        return res.status(401).json({message: "Invalid username or password"});
    }

    const token = jwt.sign({username}, secretKey, {expiresIn: "1h"});
    res.status(200).json({message: "Login successful", token});
});

io.on("connection", (socket) => {
    console.log("A user connected");

    socket.on("chat message", (msg) => {
        io.emit("chat message", msg);
    });

    socket.on("chat image", (imageData) => {
        io.emit("chat image", imageData);
    });

    socket.on("chat emoji", (emoji) => {
        io.emit("chat emoji", emoji);
    });

    socket.on("chat file", (fileData) => {
        io.emit("chat file", fileData);
    });

    socket.on("disconnect", () => {
        console.log("A user disconnected");
    });
});

http.listen(3000, () => {
    console.log("Server listening on port 3000");
});
