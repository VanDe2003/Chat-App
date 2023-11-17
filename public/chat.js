var messagecontainer = document.getElementById("message-container");

function scrollToBottom() {
    messagecontainer.scrollTop = messagecontainer.scrollHeight;
}

function addNewMessage(message) {
    var newMessage = document.createElement("div");
    newMessage.textContent = message;
    messagecontainer.appendChild(newMessage);

    messagecontainer.scrollTop = messagecontainer.scrollHeight;
}
