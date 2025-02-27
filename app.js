// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBXhlWUOD_zydbJJwy2RY1DswKYCXEcYEg",
  authDomain: "expense-tracker-8de9a.firebaseapp.com",
  projectId: "expense-tracker-8de9a",
  storageBucket: "expense-tracker-8de9a.firebasestorage.app",
  messagingSenderId: "135022087495",
  appId: "1:135022087495:web:97c2b2b1a99712134a9062"
};

const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// DOM elements
const loginContainer = document.getElementById("login-container");
const expenseContainer = document.getElementById("expense-container");
const loginEmail = document.getElementById("login-email");
const loginPassword = document.getElementById("login-password");
const loginBtn = document.getElementById("login-btn");
const signupBtn = document.getElementById("signup-btn");
const logoutBtn = document.getElementById("logout-btn");
const addExpenseBtn = document.getElementById("add-expense-btn");
const expenseName = document.getElementById("expense-name");
const expenseAmount = document.getElementById("expense-amount");
const expenseList = document.getElementById("expense-list");
const googleSignInBtn = document.getElementById("google-signin-btn"); // New Google Sign-In button

// Function to show toast messages
function showToast(message, isSuccess) {
  const toast = document.createElement("div");
  toast.classList.add("toast");
  toast.style.position = "fixed";
  toast.style.top = "20px";
  toast.style.right = "20px";
  toast.style.padding = "10px 20px";
  toast.style.backgroundColor = isSuccess ? "green" : "red";
  toast.style.color = "white";
  toast.style.borderRadius = "5px";
  toast.style.zIndex = "9999";
  toast.textContent = message;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// Login/Sign Up functionality (Email & Password)
loginBtn.addEventListener("click", async () => {
  try {
    await auth.signInWithEmailAndPassword(loginEmail.value, loginPassword.value);
    loginEmail.value = '';
    loginPassword.value = '';
    showExpensePage();
    showToast("Sign-in successful!", true);  // Green toast
  } catch (error) {
    showToast("Error: " + error.message, false);  // Red toast
  }
});

signupBtn.addEventListener("click", async () => {
  try {
    await auth.createUserWithEmailAndPassword(loginEmail.value, loginPassword.value);
    loginEmail.value = '';
    loginPassword.value = '';
    showExpensePage();
    showToast("Sign-up successful!", true);  // Green toast
  } catch (error) {
    showToast("Error: " + error.message, false);  // Red toast
  }
});

// Google Sign-In functionality
googleSignInBtn.addEventListener("click", async () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  try {
    const result = await auth.signInWithPopup(provider);
    // This gives you a Google Access Token.
    const user = result.user;
    console.log('Google user info:', user);
    showExpensePage();
    showToast("Google Sign-In successful!", true);  // Green toast
  } catch (error) {
    showToast("Error with Google Sign-In: " + error.message, false);  // Red toast
  }
});

logoutBtn.addEventListener("click", () => {
  auth.signOut();
  showLoginPage();
});

// Expense tracking functionality
addExpenseBtn.addEventListener("click", async () => {
  const name = expenseName.value;
  const amount = parseFloat(expenseAmount.value);
  if (name && !isNaN(amount)) {
    const userId = auth.currentUser.uid;
    await db.collection("expenses").add({
      name,
      amount,
      userId,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    });
    expenseName.value = '';
    expenseAmount.value = '';
    loadExpenses();
  } else {
    alert("Please enter valid expense details.");
  }
});

// Load expenses
async function loadExpenses() {
  expenseList.innerHTML = '';
  const userId = auth.currentUser.uid;
  const querySnapshot = await db.collection("expenses")
    .where("userId", "==", userId)
    .orderBy("timestamp", "desc")
    .get();
  querySnapshot.forEach((doc) => {
    const expense = doc.data();
    const expenseDiv = document.createElement("div");
    expenseDiv.innerHTML = `${expense.name}: $${expense.amount.toFixed(2)}`;
    expenseList.appendChild(expenseDiv);
  });
}

// Show Expense Page
function showExpensePage() {
  loginContainer.style.display = "none";
  expenseContainer.style.display = "block";
  loadExpenses();
}

// Show Login Page
function showLoginPage() {
  loginContainer.style.display = "block";
  expenseContainer.style.display = "none";
}

// Firebase Auth state change listener
auth.onAuthStateChanged((user) => {
  if (user) {
    showExpensePage();
    console.log("Failure");
  } else {
    showLoginPage();
    console.log("Success");
  }
});
