let firebaseConfig = {
  apiKey: "AIzaSyBEQvJzksg9zaDJxSeFtJ-YV0wYmQkL4eU",
  authDomain: "chat-server-ec754.firebaseapp.com",
  projectId: "chat-server-ec754",
  storageBucket: "chat-server-ec754.firebasestorage.app",
  messagingSenderId: "26189459038",
  appId: "1:26189459038:web:9a1e133648ab4e91c74ecf",
  measurementId: "G-L9TGGSH9HK",
};

firebase.initializeApp(firebaseConfig);

let db = firebase.firestore();
let fb = firebase.auth();
let messagesDiv = document.getElementById("messages");
let sendButton = document.getElementById("send-button");
let messageInput = document.getElementById("message-input");
let usernameInput = document.getElementById("username");

function formatTimestamp(timestamp) {
  if (timestamp && typeof timestamp.toDate === "function") {
    const date = timestamp.toDate();

    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }
  return "";
}

db.collection("messages")
  .orderBy("timestamp", "asc")
  .onSnapshot(
    (snapshot) => {
      messagesDiv.innerHTML = "";

      snapshot.forEach((doc) => {
        let message = doc.data();
        let time = formatTimestamp(message.timestamp);

        let messageElement = document.createElement("div");
        messageElement.className = "message";

        const displayUsername = message.username || "Anonymous";

        messageElement.innerHTML = `
                <span class="message-time">${time}</span> 
                <strong>${displayUsername}:</strong> 
                ${message.text}
            `;
        messagesDiv.appendChild(messageElement);
      });

      messagesDiv.scrollTop = messagesDiv.scrollHeight;
    },
    (error) => {
      console.error("Error listening to messages: ", error);
    }
  );

function sendBtn() {
  let username = usernameInput.value.trim();
  let text = messageInput.value.trim();

  if (text === "") {
    alert("Please write a message.");
    return;
  }

  if (username === "") {
    username = "Anonymous";
  }

  db.collection("messages")
    .add({
      username: username,
      text: text,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    })
    .then(() => {
      messageInput.value = "";
    })
    .catch((error) => {
      console.error("Error sending message: ", error);
    });
};

messageInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    sendButton.click();
  }
});
function signOut() {
  localStorage.clear();
  fb.signOut()
    .then(() => {
      window.location.href = "./index.html";
    })
    .catch((error) => {});
}
