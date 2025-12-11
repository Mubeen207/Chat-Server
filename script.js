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
let fb = firebase.auth();
const db = firebase.firestore();
let nameEl = document.getElementById("name");
let emailEl = document.getElementById("email");
let passwordEl = document.getElementById("password");
let message = document.getElementById("message");
let addBtn = document.getElementById("addBtn");

function signUp() {
  if (!nameEl.value || !emailEl.value || !passwordEl.value) {
    message.innerHTML = "Please enter your name, email, and password."; 
    message.classList.add("show", "message-error");
    message.classList.remove("message-success");
    return;
  }

  fb.createUserWithEmailAndPassword(emailEl.value, passwordEl.value)
    .then((userCredential) => {
      let user = userCredential.user;

      return db
        .collection("users")
        .doc(user.uid)
        .set({
          name: nameEl.value,
          email: emailEl.value,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        })

        .then(() => {
          message.innerHTML =
            "Sign up successful! Account and data have been saved.";
          message.style.color = "green";
          message.classList.remove("message-error");
          message.classList.add("show", "message-success");

          localStorage.setItem("uid", JSON.stringify(fb.currentUser));
          location.href = "./application.html";
        })

        .catch((firestoreError) => {
          console.error(
            "Firestore Saving Error. Starting Rollback...",
            firestoreError
          );
          message.innerHTML =
            "Data saving failed. Rolling back account creation. Please try again. (Error: Firestore)";
          message.classList.add("show", "message-error");
          message.classList.remove("message-success");

          return user
            .delete()
            .then(() => {
              console.log("Unsynced Auth User deleted.");
            })
            .catch((deleteError) => {
              console.error(
                "Rollback Error: Failed to delete Auth user.",
                deleteError
              );
              message.innerHTML =
                "Failed to save data and failed to delete the unsynced account. Please contact support.";
            });
        });
    })
    .catch((authError) => {
      let errorCode = authError.code;
      message.innerHTML = errorMessage(errorCode);

      message.classList.add("show", "message-error");
      message.classList.remove("message-success");
    });
}
function signIn() {
  fb.signInWithEmailAndPassword(emailEl.value, passwordEl.value)
    .then((userCredential) => {
      let user = userCredential.user;
      message.innerHTML = "Sign up Successful";
      message.style.color = "green";
      location.href = "./application.html";
      localStorage.setItem("uid", JSON.stringify(fb.currentUser));
    })
    .catch((error) => {
      let errorCode = error.code;
      message.innerHTML = errorMessage(errorCode);

      message.classList.add("show", "message-error");
      message.classList.remove("message-success");
    });
}
function errorMessage(Code) {
  if (Code === "auth/wrong-password") {
    return "Incorrect password. Please try again.";
  } else if (Code === "auth/user-not-found") {
    return "No account found with this email.";
  } else if (Code === "auth/invalid-email") {
    return "The email address is not valid.";
  } else if (Code === "auth/email-already-in-use") {
    return "This email address is already in use.";
  } else if (Code === "auth/weak-password") {
    return "Password is too weak. It should be at least 6 characters long.";
  } else {
    return "An unknown error occurred. Please try again.";
  }
}
function forgotPassword() {
  message = document.getElementById("message");
  let email = emailEl.value;
  if (email === "") {
    message.innerHTML = "Please enter your email address first.";
    message.classList.add("show", "message-error");
    return;
  }
  message.innerHTML = "";
  message.classList.remove("show", "message-error", "message-success");
  fb.sendPasswordResetEmail(email)
    .then(() => {
      message.innerHTML = "Password reset email sent! Please check your email spam.";
      message.classList.add("show", "message-success");
    })
    .catch((error) => {
      message.innerHTML = errorMessage(error.code);
      message.classList.add("show", "message-error");
    });
}

function loginChk() {
  let stored = localStorage.getItem("uid");
  let uid = [];

  if (stored) {
    try {
      uid = JSON.parse(stored).uid || [];
    } catch (e) {
      uid = [];
    }
  }

  if (uid.length > 0) {
    window.location.href = "./application.html";
  }
}

function showForm(mode) {
  const nameGroup = document.getElementById("nameGroup");
  const actionButton = document.getElementById("actionButton");
  const forgotPasswordContainer = document.getElementById(
    "forgotPasswordContainer"
  );
  const showSignInBtn = document.getElementById("showSignInBtn");
  const showSignUpBtn = document.getElementById("showSignUpBtn");

  showSignInBtn.classList.remove("active");
  showSignUpBtn.classList.remove("active");

  if (mode === "signIn") {
    nameGroup.classList.remove("visible-transition");
    nameGroup.classList.add("hidden-transition");

    forgotPasswordContainer.classList.remove("hidden-transition");
    forgotPasswordContainer.classList.add("visible-transition");

    actionButton.textContent = "Sign In";
    actionButton.setAttribute("onClick", "signIn()");

    showSignInBtn.classList.add("active");
  } else if (mode === "signUp") {
    nameGroup.classList.remove("hidden-transition");
    nameGroup.classList.add("visible-transition");

    forgotPasswordContainer.classList.remove("visible-transition");
    forgotPasswordContainer.classList.add("hidden-transition");

    actionButton.textContent = "Sign Up";
    actionButton.setAttribute("onClick", "signUp()");

    showSignUpBtn.classList.add("active");
  }
}
