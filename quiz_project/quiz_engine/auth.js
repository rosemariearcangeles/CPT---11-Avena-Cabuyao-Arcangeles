/* ======================================
        TOAST NOTIFICATION SYSTEM
====================================== */

function showToast(message, type = "success") {
    const toast = document.getElementById("toast");

    if (!toast) {
        console.error("Toast element missing in HTML!");
        return;
    }

    toast.textContent = message;
    toast.className = "toast show " + type;

    setTimeout(() => {
        toast.className = "toast";
    }, 3000);
}

/* ======================================
        LOGIN (CONNECTS TO PHP)
====================================== */

async function handleLogin(event) {
    event.preventDefault();

    const username = document.getElementById("login-username").value.trim();
    const password = document.getElementById("login-password").value.trim();

    try {
        const response = await fetch("../backend/login.php", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`
        });

        const data = await response.json();

        if (data.status === "success") {
            showToast("Login successful!", "success");
            closeLogin();

            localStorage.setItem("loggedUser", data.username);
            updateNavbarState();
        } else {
            showToast(data.message || "Login failed", "error");
        }

    } catch (err) {
        showToast("Server error.", "error");
        console.error(err);
    }
}

/* ======================================
        REGISTER (PHP BACKEND)
====================================== */

async function handleRegister(event) {
    event.preventDefault();

    const username = document.getElementById("register-username").value.trim();
    const email = document.getElementById("register-email").value.trim();
    const password = document.getElementById("register-password").value.trim();
    const confirm = document.getElementById("register-confirm-password").value.trim();

    if (password !== confirm) {
        showToast("Passwords do not match!", "error");
        return;
    }

    try {
        const response = await fetch("../backend/register.php", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `username=${encodeURIComponent(username)}&email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
        });

        const data = await response.json();

        if (data.status === "success") {
            showToast("Registration successful!", "success");
            closeRegister();
        } else {
            showToast(data.message || "Registration failed", "error");
        }

    } catch (err) {
        showToast("Server error.", "error");
        console.error(err);
    }
}

/* ======================================
        NAVBAR STATE (LOGGED IN/OUT)
====================================== */

function updateNavbarState() {
    const user = localStorage.getItem("loggedUser");

    const loginBtn = document.querySelector(".login-btn");
    const registerBtn = document.querySelector(".register-btn");
    const profileDashboard = document.querySelector(".profile-dashboard");

    if (user) {
        if (loginBtn) loginBtn.style.display = "none";
        if (registerBtn) registerBtn.style.display = "none";
        if (profileDashboard) {
            profileDashboard.style.display = "inline-block";
            document.getElementById("profile-username").textContent = user;
        }

    } else {
        if (loginBtn) loginBtn.style.display = "inline-block";
        if (registerBtn) registerBtn.style.display = "inline-block";
        if (profileDashboard) profileDashboard.style.display = "none";
    }
}

function logoutUser() {
    localStorage.removeItem("loggedUser");
    updateNavbarState();
    showToast("Logged out successfully!", "success");
}

/* Initialize on page load */
document.addEventListener("DOMContentLoaded", updateNavbarState);
