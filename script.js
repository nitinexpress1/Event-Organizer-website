// Navigation + Section Switching
const navLinks = document.querySelectorAll(".nav-link");
const sections = document.querySelectorAll(".content-section");
const loginLink = document.getElementById("login-link");

function switchSection(target) {
    sections.forEach(sec => sec.classList.remove("active"));
    document.getElementById(target).classList.add("active");
    navLinks.forEach(l => l.classList.remove("active"));
    document.querySelector(`[data-section="${target}"]`)?.classList.add("active");
}

navLinks.forEach(link => {
    link.addEventListener("click", (e) => {
        e.preventDefault();
        switchSection(link.dataset.section);
    });
});

// Toggle Login/Register
document.getElementById("show-register").addEventListener("click", (e) => {
    e.preventDefault();
    switchSection("register");
});
document.getElementById("show-login").addEventListener("click", (e) => {
    e.preventDefault();
    switchSection("login");
});

// LocalStorage
let users = JSON.parse(localStorage.getItem("users")) || [];
let currentUser = JSON.parse(localStorage.getItem("currentUser")) || null;
let events = JSON.parse(localStorage.getItem("events")) || [];

// Register
document.getElementById("register-form").addEventListener("submit", function(e) {
    e.preventDefault();
    const username = document.getElementById("register-username").value;
    const password = document.getElementById("register-password").value;

    if (users.find(u => u.username === username)) {
        alert("Username already exists!");
        return;
    }

    users.push({ username, password });
    localStorage.setItem("users", JSON.stringify(users));
    alert("Account created successfully! Please login.");
    switchSection("login");
});

// Login
document.getElementById("login-form").addEventListener("submit", function(e) {
    e.preventDefault();
    const username = document.getElementById("login-username").value;
    const password = document.getElementById("login-password").value;

    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
        currentUser = username;
        localStorage.setItem("currentUser", JSON.stringify(currentUser));
        alert("Login successful!");
        loginLink.innerText = "Logout";
        switchSection("events");
        renderEvents();
    } else {
        alert("Invalid credentials!");
    }
});

// Logout
loginLink.addEventListener("click", function(e) {
    if (currentUser) {
        e.preventDefault();
        currentUser = null;
        localStorage.removeItem("currentUser");
        loginLink.innerText = "Login";
        alert("Logged out successfully.");
        switchSection("login");
    }
});

// Create Event
document.getElementById("event-form").addEventListener("submit", function(e) {
    e.preventDefault();
    if (!currentUser) {
        alert("Please login to create events.");
        switchSection("login");
        return;
    }

    const name = document.getElementById("event-name").value;
    const type = document.getElementById("event-type").value;
    const date = document.getElementById("event-date").value;
    const time = document.getElementById("event-time").value;
    const location = document.getElementById("event-location").value;
    const price = parseFloat(document.getElementById("ticket-price").value);
    const quantity = parseInt(document.getElementById("ticket-quantity").value);
    const description = document.getElementById("event-description").value;

    let imageURL = "";
    const imageFile = document.getElementById("event-image").files[0];
    if (imageFile) {
        imageURL = URL.createObjectURL(imageFile);
    }

    const newEvent = {
        id: Date.now(),
        name, type, date, time, location, description,
        image: imageURL, price, quantity, sold: 0, views: 0,
        user: currentUser
    };

    events.push(newEvent);
    localStorage.setItem("events", JSON.stringify(events));
    renderEvents();
    alert("Event created successfully!");
    document.getElementById("event-form").reset();
});

// Render Events
function renderEvents() {
    const eventsList = document.getElementById("events-list");
    eventsList.innerHTML = "";
    const userEvents = events.filter(ev => ev.user === currentUser);

    let totalSold = 0, totalRevenue = 0;

    if (userEvents.length === 0) {
        eventsList.innerHTML = "<p>No events created yet.</p>";
    }

    userEvents.forEach(event => {
        totalSold += event.sold;
        totalRevenue += event.sold * event.price;

        const eventCard = document.createElement("div");
        eventCard.classList.add("event-card");
        eventCard.innerHTML = `
            ${event.image ? `<img src="${event.image}" alt="${event.name}">` : ""}
            <h3>${event.name}</h3>
            <p><strong>Type:</strong> ${event.type}</p>
            <p><strong>Date:</strong> ${event.date} ${event.time}</p>
            <p><strong>Location:</strong> ${event.location}</p>
            <p><strong>Price:</strong> ₹${event.price}</p>
            <p><strong>Tickets Available:</strong> ${event.quantity - event.sold}</p>
            <p><strong>Description:</strong> ${event.description}</p>
            <button onclick="bookTicket(${event.id})">Book Ticket</button>
            <button onclick="shareEvent(${event.id})">Share Event</button>
        `;
        eventsList.appendChild(eventCard);
    });

    document.getElementById("total-sold").innerText = totalSold;
    document.getElementById("total-revenue").innerText = totalRevenue;
}

// Book Ticket
function bookTicket(id) {
    const event = events.find(e => e.id === id);
    if (event && event.sold < event.quantity) {
        event.sold++;
        localStorage.setItem("events", JSON.stringify(events));
        alert("Ticket booked successfully!");
        renderEvents();
    } else {
        alert("Tickets sold out!");
    }
}

// Share Event
function shareEvent(id) {
    const event = events.find(e => e.id === id);
    if (event) {
        const link = `${window.location.origin}?event=${id}`;
        navigator.clipboard.writeText(link);
        alert("Event link copied to clipboard!");
    }
}

// Auto-login session
if (currentUser) {
    loginLink.innerText = "Logout";
    renderEvents();
}
