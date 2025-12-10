// Step 1: Firebase Configuration and Initialization
let firebaseConfig = {
    apiKey: "AIzaSyBEQvJzksg9zaDJxSeFtJ-YV0wYmQkL4eU", 
    authDomain: "chat-server-ec754.firebaseapp.com",
    projectId: "chat-server-ec754",
    storageBucket: "chat-server-ec754.firebasestorage.app",
    messagingSenderId: "26189459038",
    appId: "1:26189459038:web:9a1e133648ab4e91c74ecf",
    measurementId: "G-L9TGGSH9HK"
};

// Initialize the Firebase App
firebase.initializeApp(firebaseConfig);

// Get the Cloud Firestore service reference
let db = firebase.firestore();

// Step 3: Select HTML Elements
let messagesDiv = document.getElementById("messages");
let sendButton = document.getElementById("send-button");
let messageInput = document.getElementById("message-input");
let usernameInput = document.getElementById("username");

// ⭐️ IMPROVEMENT: Optimized time format function ⭐️
function formatTimestamp(timestamp) {
    if (timestamp && typeof timestamp.toDate === 'function') {
        const date = timestamp.toDate(); 
        // This format is cleaner: 9:30 AM (without seconds, without leading zero on hour if it's 1-9)
        return date.toLocaleTimeString('en-US', { 
            hour: 'numeric', // '2-digit' -> 09, 'numeric' -> 9
            minute: '2-digit',
            hour12: true // AM/PM
        });
    }
    return '';
}

// Step 4: Retrieve Messages in Real-time (onSnapshot)
db.collection("messages")
    .orderBy("timestamp", "asc") 
    .onSnapshot((snapshot) => {
        messagesDiv.innerHTML = "";
        
        snapshot.forEach((doc) => {
            let message = doc.data();
            let time = formatTimestamp(message.timestamp);

            let messageElement = document.createElement("div");
            messageElement.className = "message";
            
            const displayUsername = message.username || "Anonymous"; 
            
            // ⭐️ IMPROVEMENT: Updated structure for cleaner display ⭐️
            messageElement.innerHTML = `
                <span class="message-time">${time}</span> 
                <strong>${displayUsername}:</strong> 
                ${message.text}
            `;
            messagesDiv.appendChild(messageElement);
        });
        
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
        
    }, (error) => {
        console.error("Error listening to messages: ", error);
    });

// Step 5: Send Button Functionality (Rest of the logic remains the same)
sendButton.addEventListener("click", () => {
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
});

messageInput.addEventListener("keydown", (e) => {
    if (e.key === 'Enter') {
        sendButton.click();
    }
});