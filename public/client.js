const socket = io();

const loginContainer = document.getElementById("login-container");
const registerContainer = document.getElementById("register-container");
const chatContainer = document.getElementById("chat-container");

const loginLink = document.getElementById("login-link");
const registerLink = document.getElementById("register-link");

const usernameInput = document.getElementById("username-input");
const passwordInput = document.getElementById("password-input");
const loginButton = document.getElementById("login-button");

const registerUsernameInput = document.getElementById("register-username-input");
const registerPasswordInput = document.getElementById("register-password-input");
const registerButton = document.getElementById("register-button");

const messageContainer = [
    document.getElementById("message-container"),
    document.getElementById("message-container-1"),
    document.getElementById("message-container-2"),
    document.getElementById("message-container-3"),
];
const messageInput = document.getElementById("message-input");
const sendButton = document.getElementById("send-button");
const fileInput = document.getElementById("file-input");
const sendFileButton = document.getElementById("send-file-button");
const emojiPanel = document.getElementById("emoji-panel");

const room1 = document.getElementById("room1");
const room2 = document.getElementById("room2");
const room3 = document.getElementById("room3");

let username = "";
let token = "";
let currentRoom = 0;

function showLogin() {
    loginContainer.style.display = "flex";
    registerContainer.style.display = "none";
    chatContainer.style.display = "none";
}

function showRegister() {
    loginContainer.style.display = "none";
    registerContainer.style.display = "flex";
    chatContainer.style.display = "none";
}

function showChat(room) {
    loginContainer.style.display = "none";
    registerContainer.style.display = "none";
    chatContainer.style.display = "flex";
    messageContainer.forEach((element) => {
        element.style.display = "none";
    });
    messageContainer[room].style.display = "flex";
    messageContainer[room].style = "flex-direction: column";
}

usernameInput.addEventListener("keypress", (e) => {
    if (e.key == "Enter") {
        passwordInput.focus();
    }
});

passwordInput.addEventListener("keypress", (e) => {
    if (e.key == "Enter") {
        loginButton.dispatchEvent(new Event("click"));
    }
});

loginButton.addEventListener("click", () => {
    username = usernameInput.value;
    password = passwordInput.value;

    fetch("/login", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({username, password}),
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.token) {
                localStorage.setItem("token", data.token);
                showChat(0);
                username = usernameInput.value;
                token = data.token;
            } else {
                console.log(data.message);
            }
        });
});

registerUsernameInput.addEventListener("keypress", (e) => {
    if (e.key == "Enter") {
        registerPasswordInput.focus();
    }
});

registerPasswordInput.addEventListener("keypress", (e) => {
    if (e.key == "Enter") {
        registerButton.dispatchEvent(new Event("click"));
    }
});

registerButton.addEventListener("click", () => {
    username = registerUsernameInput.value;
    password = registerPasswordInput.value;

    fetch("/register", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({username, password}),
    })
        .then((response) => response.json())
        .then((data) => {
            console.log(data.message);
            showLogin();
        });
});

registerButton.addEventListener("keypress", (e) => {
    if (e.key == "Enter") {
        registerButton.dispatchEvent(new Event("click"));
    }
});

loginLink.addEventListener("click", (e) => {
    e.preventDefault();
    showLogin();
});

registerLink.addEventListener("click", (e) => {
    e.preventDefault();
    showRegister();
});

messageInput.addEventListener("keypress", (e) => {
    if (e.key == "Enter") {
        sendButton.dispatchEvent(new Event("click"));
    }
});

sendButton.addEventListener("click", () => {
    const message = messageInput.value;

    if (message.trim() !== "") {
        const id = Date.now();
        socket.emit("chat message", {currentRoom, id, username, message});
        messageInput.value = "";
    }
});

fileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    const id = Date.now();
    reader.onload = function (event) {
        socket.emit("chat image", {
            currentRoom,
            id,
            username,
            image: event.target.result,
        });
    };

    if (file) {
        reader.readAsDataURL(file);
    }
});

fileInput.addEventListener("click", () => {
    const file = fileInput.files[0];

    if (file) {
        const formData = new FormData();
        formData.append("file", file);

        fetch("/upload", {
            method: "POST",
            headers: {Authorization: `Bearer ${token}`},
            body: formData,
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.message) {
                    console.log(currentRoom, username, data.fileUrl);

                    socket.emit("chat file", {username, fileUrl: data.fileUrl});
                }
            });
    }
});

emojiPanel.addEventListener("click", (e) => {
    if (e.target.classList.contains("emoji")) {
        const emoji = e.target.innerText;
        const id = Date.now();
        socket.emit("chat emoji", {currentRoom, id, username, emoji});
    }
});

room1.addEventListener("click", (e) => {
    showChat(1);
    currentRoom = 1;
});

room2.addEventListener("click", (e) => {
    showChat(2);
    currentRoom = 2;
});

room3.addEventListener("click", (e) => {
    showChat(3);
    currentRoom = 3;
});

socket.on("chat message", (msg) => {
    const messageElement = document.createElement("div");
    messageElement.classList.add("message");
    messageElement.id = msg.id;

    const messageContent = document.createElement("span");
    messageContent.textContent = msg.message;

    if (msg.username === username) {
        messageElement.classList.add("message-right");
        messageElement.appendChild(messageContent);
    } else {
        const senderNameElement = document.createElement("span");
        senderNameElement.textContent = msg.username + ":  ";
        senderNameElement.classList.add("sender-name");

        messageElement.classList.add("message-left");
        messageElement.appendChild(senderNameElement);
        messageElement.appendChild(messageContent);
    }

    messageContainer[msg.currentRoom].appendChild(messageElement);
    messageContainer[msg.currentRoom].scrollTop = messageContainer[msg.currentRoom].scrollHeight;
});

socket.on("chat image", (msg) => {
    const messageElement = document.createElement("div");
    messageElement.classList.add("image");
    messageElement.id = msg.id;

    const imageElement = document.createElement("img");
    imageElement.src = msg.image;
    imageElement.width = 200;

    if (msg.username === username) {
        messageElement.classList.add("message-right");
        messageElement.appendChild(imageElement);
    } else {
        const senderNameElement = document.createElement("span");
        senderNameElement.textContent = msg.username + ":  ";
        senderNameElement.classList.add("sender-name");

        messageElement.classList.add("message-left");
        messageElement.appendChild(senderNameElement);
        messageElement.appendChild(imageElement);
    }

    messageContainer[msg.currentRoom].appendChild(messageElement);
    messageContainer[msg.currentRoom].scrollTop = messageContainer[msg.currentRoom].scrollHeight;
});

socket.on("chat emoji", (msg) => {
    const messageElement = document.createElement("div");
    messageElement.classList.add("emoji");
    messageElement.id = msg.id;

    const emojiElement = document.createElement("span");
    emojiElement.textContent = msg.emoji;
    emojiElement.style.whiteSpace = "pre-wrap";

    if (msg.username === username) {
        messageElement.classList.add("message-right");
        messageElement.appendChild(emojiElement);
    } else {
        const senderNameElement = document.createElement("span");
        senderNameElement.textContent = msg.username + ":  ";
        senderNameElement.classList.add("sender-name");

        messageElement.classList.add("message-left");
        messageElement.appendChild(senderNameElement);
        messageElement.appendChild(emojiElement);
    }

    messageContainer[msg.currentRoom].appendChild(messageElement);
});

socket.on("chat file", (fileData) => {
    const fileLinkElement = document.createElement("a");
    fileLinkElement.href = fileData.fileUrl;
    fileLinkElement.textContent = "Download File";
    messageContainer.appendChild(fileLinkElement);
    messageContainer.scrollTop = messageContainer.scrollHeight;
});

function checkLoggedIn() {
    token = localStorage.getItem("token");

    if (token) {
        fetch("/verify", {
            method: "GET",
            headers: {Authorization: `Bearer ${token}`},
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.username) {
                    showChat(0);
                    username = data.username;
                } else {
                    showLogin();
                }
            });
    } else {
        showLogin();
    }
}

document.addEventListener("DOMContentLoaded", checkLoggedIn);

const {MongoClient} = require("mongodb");

const uri = "mongodb+srv://phanvande2003:VanDex2003@sdfaf.ncrrtpe.mongodb.net/";
const client = new MongoClient(uri);

client.connect((err) => {
    if (err) {
        console.error("Error connecting to MongoDB:", err);
        return;
    }

    console.log("Connected to MongoDB");
});
