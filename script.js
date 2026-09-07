
/* =========================================================
   SMARTTOUR360 - TRAIN LOCATION + IMAGE FALLBACK FIX
   ========================================================= */
function detectTrainLocation() {
    const fromInput = document.getElementById("trainFrom");
    const status = document.getElementById("locationStatus");
    const button = document.getElementById("useLocationBtn");

    if (status) status.textContent = "📍 Detecting your current location…";
    if (button) {
        button.disabled = true;
        button.textContent = "📍 Detecting Location…";
    }

    if (!navigator.geolocation) {
        if (status) status.textContent = "⚠️ Geolocation is not supported by this browser.";
        if (button) { button.disabled = false; button.textContent = "📍 Use My Current Location"; }
        return;
    }

    navigator.geolocation.getCurrentPosition(
        function(position) {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;

            window.smartTourCurrentLocation = { lat, lng };

            const nearest = findNearestMapStation(lat, lng);
            const stationName = nearest?.name || "Nearest Railway Station";

            if (fromInput) fromInput.value = stationName;
            if (status) {
                status.textContent = nearest
                    ? `✅ Location detected • Nearest station: ${stationName}`
                    : `✅ Location detected • ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
            }

            try {
                initializeSmartTrainMap(lat, lng);
                if (typeof addCurrentLocationToSmartTrainMap === "function") {
                    addCurrentLocationToSmartTrainMap(lat, lng);
                }
            } catch (e) {
                console.warn("Train map location update skipped:", e);
            }

            if (button) { button.disabled = false; button.textContent = "📍 Location Detected"; }
        },
        function(error) {
            let message = "Unable to detect location.";
            if (error && error.code === 1) message = "Location permission denied. Please allow location access in the browser.";
            else if (error && error.code === 2) message = "Location unavailable. Please check GPS/Wi‑Fi and try again.";
            else if (error && error.code === 3) message = "Location request timed out. Please try again.";

            if (status) status.textContent = "⚠️ " + message;
            if (button) { button.disabled = false; button.textContent = "📍 Use My Current Location"; }
        },
        { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 }
    );
}

window.detectTrainLocation = detectTrainLocation;

/* =========================================================
   SMARTTOUR360 - FINAL COMPLETE SCRIPT.JS
========================================================= */

const API_BASE_URL = "http://127.0.0.1:5000";

let currentUser = null;
let activityInterval = null;

let selectedTripMode = "family";

let aiStep = 0;
let aiDestination = "";
let aiDays = 0;
let aiBudget = 0;


/* =========================================================
   DOM READY
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    const destinationModal =
        document.getElementById("destinationModal");

    if (destinationModal) {
        destinationModal.classList.remove("active");
    }

    const accountModal =
        document.getElementById("accountModal");

    if (accountModal) {
        accountModal.classList.remove("active");
    }

    const savedUser =
        localStorage.getItem("smarttour360_user");

    if (savedUser) {

        try {

            currentUser =
                JSON.parse(savedUser);

            updateAccountUI();

            startActivityTracking();

        } catch (error) {

            localStorage.removeItem(
                "smarttour360_user"
            );

        }

    }

    trackVisitor();

    selectTripMode("family");

});


/* =========================================================
   NAVIGATION
========================================================= */

function scrollToSection(sectionId) {

    const section =
        document.getElementById(sectionId);

    if (section) {

        section.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }

}


/* =========================================================
   DESTINATION SEARCH
========================================================= */

function searchDestinations() {

    const input =
        document.getElementById(
            "destinationSearch"
        );

    if (!input) return;

    const cards =
        document.querySelectorAll(
            ".destination-card"
        );

    const search =
        input.value.toLowerCase().trim();

    cards.forEach(function (card) {

        const text =
            card.textContent.toLowerCase();

        if (text.includes(search)) {

            card.style.display = "";

        } else {

            card.style.display = "none";

        }

    });

}


function searchDestination() {

    const input =
        document.getElementById(
            "destinationSearch"
        );

    if (!input) return;

    const searchText =
        input.value.trim().toLowerCase();

    if (!searchText) {

        alert(
            "Please enter a destination."
        );

        return;

    }

    const destinationNames = [

        "rishikesh",
        "manali",
        "goa",
        "jaipur",
        "jammu & kashmir",
        "jammu",
        "kashmir",
        "varanasi",
        "ayodhya",
        "vrindavan",
        "agra",
        "shimla",
        "kerala",
        "udaipur"

    ];

    let foundDestination = null;

    for (const destination of destinationNames) {

        if (
            destination.includes(searchText) ||
            searchText.includes(destination)
        ) {

            foundDestination =
                destination;

            break;

        }

    }

    if (!foundDestination) {

        alert(
            "Destination not found.\n\n" +
            "Try Rishikesh, Manali, Goa, Jaipur, Kashmir, " +
            "Varanasi, Ayodhya, Vrindavan, Agra, Shimla, " +
            "Kerala or Udaipur."
        );

        return;

    }

    if (
        foundDestination === "jammu" ||
        foundDestination === "kashmir"
    ) {

        foundDestination =
            "jammu & kashmir";

    }

    showDestination(
        foundDestination
    );

}


/* =========================================================
   DESTINATION DATA
========================================================= */

const destinationData = {

    "rishikesh": {

        title: "Rishikesh",
        location: "Uttarakhand",

        attractions:
            "Laxman Jhula, Ram Jhula, Triveni Ghat, Ganga Aarti, River Rafting",

        budget: "₹2,500 - ₹6,000",

        bestTime:
            "September - June",

        stay:
            "Budget hotels, hostels and riverside stays",

        tip:
            "Perfect for adventure, yoga, spirituality and nature."

    },


    "manali": {

        title: "Manali",
        location: "Himachal Pradesh",

        attractions:
            "Solang Valley, Rohtang Pass, Hadimba Temple, Mall Road",

        budget:
            "₹4,000 - ₹10,000",

        bestTime:
            "October - June",

        stay:
            "Hotels, hostels and mountain resorts",

        tip:
            "Carry warm clothes and plan mountain activities carefully."

    },


    "goa": {

        title: "Goa",
        location: "Goa",

        attractions:
            "Baga Beach, Calangute Beach, Fort Aguada, Panjim",

        budget:
            "₹5,000 - ₹12,000",

        bestTime:
            "November - February",

        stay:
            "Beach hotels, hostels and resorts",

        tip:
            "Best for beaches, relaxation, food and sightseeing."

    },


    "jaipur": {

        title: "Jaipur",
        location: "Rajasthan",

        attractions:
            "Amber Fort, Hawa Mahal, City Palace, Jantar Mantar",

        budget:
            "₹3,000 - ₹8,000",

        bestTime:
            "October - March",

        stay:
            "Hotels, hostels and heritage stays",

        tip:
            "Explore the Pink City and try traditional Rajasthani food."

    },


    "jammu & kashmir": {

        title: "Jammu & Kashmir",
        location: "Jammu & Kashmir",

        attractions:
            "Srinagar, Gulmarg, Pahalgam, Dal Lake, Sonamarg",

        budget:
            "₹6,000 - ₹15,000",

        bestTime:
            "March - October",

        stay:
            "Hotels, houseboats and resorts",

        tip:
            "Plan weather-sensitive activities in advance."

    },


    "varanasi": {

        title: "Varanasi",
        location: "Uttar Pradesh",

        attractions:
            "Dashashwamedh Ghat, Kashi Vishwanath Temple, Sarnath, Ganga Aarti",

        budget:
            "₹2,000 - ₹6,000",

        bestTime:
            "October - March",

        stay:
            "Hotels, guest houses and hostels",

        tip:
            "Experience the ghats and evening Ganga Aarti."

    },


    "ayodhya": {

        title: "Ayodhya",
        location: "Uttar Pradesh",

        attractions:
            "Ram Mandir, Hanuman Garhi, Saryu Ghat, Kanak Bhawan",

        budget:
            "₹2,000 - ₹5,000",

        bestTime:
            "October - March",

        stay:
            "Hotels, guest houses and budget stays",

        tip:
            "Keep enough time for temple visits and local sightseeing."

    },


    "vrindavan": {

        title: "Vrindavan",
        location: "Uttar Pradesh",

        attractions:
            "Banke Bihari Temple, Prem Mandir, ISKCON Temple, Nidhivan",

        budget:
            "₹2,000 - ₹5,000",

        bestTime:
            "October - March",

        stay:
            "Guest houses, hotels and budget stays",

        tip:
            "Explore temples and local cultural experiences."

    },


    "agra": {

        title: "Agra",
        location: "Uttar Pradesh",

        attractions:
            "Taj Mahal, Agra Fort, Mehtab Bagh, Fatehpur Sikri",

        budget:
            "₹2,500 - ₹7,000",

        bestTime:
            "October - March",

        stay:
            "Hotels, hostels and guest houses",

        tip:
            "Start sightseeing early to avoid crowds."

    },


    "shimla": {

        title: "Shimla",
        location: "Himachal Pradesh",

        attractions:
            "Mall Road, Kufri, Ridge, Jakhoo Temple",

        budget:
            "₹4,000 - ₹10,000",

        bestTime:
            "October - June",

        stay:
            "Hotels, hostels and mountain stays",

        tip:
            "Ideal for mountain views, shopping and relaxing."

    },


    "kerala": {

        title: "Kerala",
        location: "Kerala",

        attractions:
            "Munnar, Alleppey, Kochi, Wayanad, Kovalam",

        budget:
            "₹6,000 - ₹15,000",

        bestTime:
            "October - March",

        stay:
            "Hotels, homestays, resorts and houseboats",

        tip:
            "Combine hill stations, backwaters and coastal destinations."

    },


    "udaipur": {

        title: "Udaipur",
        location: "Rajasthan",

        attractions:
            "Lake Pichola, City Palace, Jag Mandir, Fateh Sagar Lake",

        budget:
            "₹3,000 - ₹8,000",

        bestTime:
            "October - March",

        stay:
            "Hotels, heritage hotels and budget stays",

        tip:
            "Enjoy lakeside views and Rajasthan's cultural heritage."

    }

};


/* =========================================================
   DESTINATION POPUP
========================================================= */

function showDestination(destination) {

    const key =
        destination.toLowerCase().trim();

    const data =
        destinationData[key];

    if (!data) {

        alert(
            "Destination information not available."
        );

        return;

    }

    const modal =
        document.getElementById(
            "destinationModal"
        );

    if (!modal) return;

    document.getElementById(
        "modalTitle"
    ).textContent = data.title;

    document.getElementById(
        "modalLocation"
    ).textContent = data.location;

    document.getElementById(
        "modalAttractions"
    ).textContent = data.attractions;

    document.getElementById(
        "modalBudget"
    ).textContent = data.budget;

    document.getElementById(
        "modalBestTime"
    ).textContent = data.bestTime;

    document.getElementById(
        "modalStay"
    ).textContent = data.stay;

    document.getElementById(
        "modalTip"
    ).textContent = data.tip;

    const paymentModal = document.getElementById("paymentModal");
    if (paymentModal) { paymentModal.classList.remove("active"); paymentModal.setAttribute("aria-hidden", "true"); }
    modal.classList.add("active");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("st360-payment-success-open");
    modal.style.display = "flex";

}


function closeDestination() {

    const modal =
        document.getElementById(
            "destinationModal"
        );

    if (modal) {

        modal.classList.remove(
            "active"
        );

    }

}


/* =========================================================
   ACCOUNT MODAL
========================================================= */

function openAccountModal() {

    const modal =
        document.getElementById(
            "accountModal"
        );

    if (!modal) {

        alert(
            "Account section not found."
        );

        return;

    }

    modal.classList.add("active");

    if (currentUser) {

        showProfileView();

    } else {

        showLoginForm();

    }

}


function closeAccountModal() {

    const modal =
        document.getElementById(
            "accountModal"
        );

    if (modal) {

        modal.classList.remove(
            "active"
        );

    }

}


/* =========================================================
   LOGIN / SIGNUP FORM
========================================================= */

function showLoginForm() {

    const loginForm =
        document.getElementById(
            "loginForm"
        );

    const signupForm =
        document.getElementById(
            "signupForm"
        );

    const profileView =
        document.getElementById(
            "profileView"
        );

    if (loginForm)
        loginForm.style.display =
            "block";

    if (signupForm)
        signupForm.style.display =
            "none";

    if (profileView)
        profileView.style.display =
            "none";

}


function showSignupForm() {

    const loginForm =
        document.getElementById(
            "loginForm"
        );

    const signupForm =
        document.getElementById(
            "signupForm"
        );

    const profileView =
        document.getElementById(
            "profileView"
        );

    if (loginForm)
        loginForm.style.display =
            "none";

    if (signupForm)
        signupForm.style.display =
            "block";

    if (profileView)
        profileView.style.display =
            "none";

}


/* =========================================================
   SIGNUP
========================================================= */

function signupUser(event) {

    if (event) event.preventDefault();

    const nameInput = document.getElementById("signupName");
    const emailInput = document.getElementById("signupEmail");
    const passwordInput = document.getElementById("signupPassword");
    const confirmInput = document.getElementById("signupConfirmPassword");
    const message = document.getElementById("signupMessage");

    const name = nameInput ? nameInput.value.trim() : "";
    const email = emailInput ? emailInput.value.trim().toLowerCase() : "";
    const password = passwordInput ? passwordInput.value : "";
    const confirmPassword = confirmInput ? confirmInput.value : "";

    if (!name || !email || !password || !confirmPassword) {
        if (message) message.textContent = "Please fill all fields.";
        return;
    }

    if (password !== confirmPassword) {
        if (message) message.textContent = "Passwords do not match.";
        return;
    }

    const demoAccount = {
        id: "demo_" + Date.now(),
        name,
        email,
        password,
        profile_picture: ""
    };

    localStorage.setItem("smarttour360_demo_account", JSON.stringify(demoAccount));

    if (message) message.textContent = "Demo account created successfully! Now login below.";

    if (nameInput) nameInput.value = "";
    if (emailInput) emailInput.value = "";
    if (passwordInput) passwordInput.value = "";
    if (confirmInput) confirmInput.value = "";

    setTimeout(showLoginForm, 900);
}


/* =========================================================
   DEMO LOGIN - NO FLASK / DATABASE REQUIRED
========================================================= */

function loginUser(event) {

    if (event) event.preventDefault();

    const emailInput = document.getElementById("loginEmail");
    const passwordInput = document.getElementById("loginPassword");
    const message = document.getElementById("loginMessage");

    const email = emailInput ? emailInput.value.trim().toLowerCase() : "";
    const password = passwordInput ? passwordInput.value : "";

    if (!email || !password) {
        if (message) message.textContent = "Please enter email and password.";
        return;
    }

    let demoAccount = null;
    try {
        demoAccount = JSON.parse(localStorage.getItem("smarttour360_demo_account") || "null");
    } catch (e) {
        demoAccount = null;
    }

    if (!demoAccount) {
        if (message) message.textContent = "No demo account found. Please Sign Up first.";
        return;
    }

    if (email !== demoAccount.email || password !== demoAccount.password) {
        if (message) message.textContent = "Invalid demo email or password.";
        return;
    }

    currentUser = { ...demoAccount };
    delete currentUser.password;

    localStorage.setItem("smarttour360_user", JSON.stringify(currentUser));
    updateAccountUI();
    startActivityTracking();

    if (message) message.textContent = "Demo login successful!";
    if (passwordInput) passwordInput.value = "";

    setTimeout(showProfileView, 500);
}


/* =========================================================
   PROFILE
========================================================= */

function showProfileView() {

    const loginForm =
        document.getElementById(
            "loginForm"
        );

    const signupForm =
        document.getElementById(
            "signupForm"
        );

    const profileView =
        document.getElementById(
            "profileView"
        );

    if (loginForm)
        loginForm.style.display =
            "none";

    if (signupForm)
        signupForm.style.display =
            "none";

    if (!profileView)
        return;

    profileView.style.display =
        "block";

    if (currentUser) {

        const profileName =
            document.getElementById(
                "profileName"
            );

        const profileEmail =
            document.getElementById(
                "profileEmail"
            );

        if (profileName)
            profileName.textContent =
                currentUser.name ||
                "User";

        if (profileEmail)
            profileEmail.textContent =
                currentUser.email ||
                "";

    }

    updateProfileImage();

}


function updateProfileImage() {

    const profileImage =
        document.getElementById(
            "profileImage"
        );

    const defaultIcon =
        document.getElementById(
            "profileDefaultIcon"
        );

    if (
        !profileImage ||
        !currentUser
    )
        return;

    const picture =
        currentUser.profile_picture;

    if (picture) {

        profileImage.src =
            picture.startsWith("http")
                ? picture
                : `${API_BASE_URL}${picture}`;

        profileImage.style.display =
            "block";

        if (defaultIcon)
            defaultIcon.style.display =
                "none";

    } else {

        profileImage.style.display =
            "none";

        if (defaultIcon)
            defaultIcon.style.display =
                "inline";

    }

}


function updateAccountUI() {

    const accountButton =
        document.querySelector(
            ".account-btn"
        );

    if (!accountButton)
        return;

    if (currentUser) {

        accountButton.innerHTML =
            `👤 ${currentUser.name}`;

    } else {

        accountButton.innerHTML =
            "👤 Account";

    }

}


/* =========================================================
   LOGOUT
========================================================= */

function logoutUser() {
    currentUser = null;
    localStorage.removeItem("smarttour360_user");
    stopActivityTracking();
    updateAccountUI();
    closeAccountModal();
    alert("Demo account logged out successfully.");
}


/* =========================================================
   ACTIVITY TRACKING
========================================================= */

function startActivityTracking() {

    stopActivityTracking();

    if (!currentUser)
        return;

    sendActivityUpdate();

    activityInterval =
        setInterval(
            sendActivityUpdate,
            30000
        );

}


function stopActivityTracking() {

    if (activityInterval) {

        clearInterval(
            activityInterval
        );

        activityInterval =
            null;

    }

}


async function sendActivityUpdate() {

    if (!currentUser)
        return;

    try {

        await fetch(
            `${API_BASE_URL}/api/activity`,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({
                    user_id:
                        currentUser.id
                })

            }
        );

    } catch (error) {

        console.log(
            "Activity update failed."
        );

    }

}


/* =========================================================
   VISITOR TRACKING
========================================================= */

async function trackVisitor() {

    let sessionId =
        localStorage.getItem(
            "smarttour360_session"
        );

    if (!sessionId) {

        sessionId =
            "session_" +
            Date.now() +
            "_" +
            Math.random()
                .toString(36)
                .substring(2, 10);

        localStorage.setItem(
            "smarttour360_session",
            sessionId
        );

    }

    try {

        await fetch(
            `${API_BASE_URL}/api/visitor`,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({
                    session_id:
                        sessionId
                })

            }
        );

    } catch (error) {

        console.log(
            "Visitor tracking unavailable."
        );

    }

}


/* =========================================================
   PROFILE PICTURE
========================================================= */

function uploadProfilePicture(event) {

    if (!currentUser) {
        alert("Please login first.");
        return;
    }

    const fileInput = document.getElementById("profilePictureInput");
    if (!fileInput || !fileInput.files.length) {
        alert("Please select a picture.");
        return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = function () {
        currentUser.profile_picture = reader.result;
        localStorage.setItem("smarttour360_user", JSON.stringify(currentUser));

        const demoAccount = JSON.parse(localStorage.getItem("smarttour360_demo_account") || "null");
        if (demoAccount) {
            demoAccount.profile_picture = reader.result;
            localStorage.setItem("smarttour360_demo_account", JSON.stringify(demoAccount));
        }

        updateProfileImage();
        alert("Demo profile picture updated successfully.");
    };

    reader.readAsDataURL(file);
}


/* =========================================================
   SMART TRIP PLANNER
========================================================= */

function createTripPlan() {

    const destination =
        document.getElementById(
            "tripDestination"
        );

    const daysInput =
        document.getElementById(
            "tripDays"
        );

    const budgetInput =
        document.getElementById(
            "tripBudget"
        );

    const result =
        document.getElementById(
            "plannerResult"
        );

    if (
        !destination ||
        !daysInput ||
        !budgetInput ||
        !result
    )
        return;

    const place =
        destination.value.trim();

    const days =
        parseInt(
            daysInput.value
        );

    const budget =
        parseInt(
            budgetInput.value
        );

    let travelers = 1;

    if (
        selectedTripMode ===
        "family"
    ) {

        travelers =
            parseInt(
                document.getElementById(
                    "familyMembers"
                )?.value
            ) || 1;

    }

    else if (
        selectedTripMode ===
        "friends"
    ) {

        travelers =
            parseInt(
                document.getElementById(
                    "friendsMembers"
                )?.value
            ) || 2;

    }

    if (
        !place ||
        isNaN(days) ||
        days <= 0 ||
        isNaN(budget) ||
        budget <= 0
    ) {

        result.innerHTML = `

            <div class="result-box">

                ⚠️ Please fill all trip details correctly.

            </div>

        `;

        return;

    }

    const stay =
        Math.round(
            budget * 0.35
        );

    const food =
        Math.round(
            budget * 0.20
        );

    const transport =
        Math.round(
            budget * 0.20
        );

    const activities =
        Math.round(
            budget * 0.15
        );

    const emergency =
        Math.round(
            budget * 0.10
        );

    const modeName =

        selectedTripMode ===
            "family"

            ? "Family Trip"

            : selectedTripMode ===
                "friends"

                ? "Friends Trip"

                : "Solo Trip";

    result.innerHTML = `

        <div class="result-box">

            <h3>
                🧳 Smart Trip Plan
            </h3>

            <p>
                <strong>Travel Type:</strong>
                ${modeName}
            </p>

            <p>
                <strong>Destination:</strong>
                ${place}
            </p>

            <p>
                <strong>Duration:</strong>
                ${days} days
            </p>

            <p>
                <strong>Travelers:</strong>
                ${travelers}
            </p>

            <hr>

            <p>
                🏨 Stay: ₹${stay}
            </p>

            <p>
                🍴 Food: ₹${food}
            </p>

            <p>
                🚌 Transport: ₹${transport}
            </p>

            <p>
                🎯 Activities: ₹${activities}
            </p>

            <p>
                🛡️ Emergency: ₹${emergency}
            </p>

            <hr>

            <p>
                <strong>
                    Total Budget:
                </strong>

                ₹${budget}

            </p>

            <p>
                👤 Approx. per person:
                ₹${Math.round(
                    budget / travelers
                )}
            </p>

            <p>
                ✅ Your ${modeName.toLowerCase()}
                plan is ready!
            </p>

        </div>

    `;

}


/* =========================================================
   TRIP MODE
========================================================= */

function selectTripMode(mode) {

    selectedTripMode =
        mode;

    document
        .querySelectorAll(
            ".trip-mode"
        )
        .forEach(
            function (button) {

                button.classList.remove(
                    "active"
                );

            }
        );

    const selectedButton =
        document.getElementById(
            mode + "Mode"
        );

    if (selectedButton) {

        selectedButton.classList.add(
            "active"
        );

    }

    const familyGroup =
        document.getElementById(
            "familyMembersGroup"
        );

    const friendsGroup =
        document.getElementById(
            "friendsMembersGroup"
        );

    if (familyGroup) {

        familyGroup.style.display =
            mode === "family"
                ? "block"
                : "none";

    }

    if (friendsGroup) {

        friendsGroup.style.display =
            mode === "friends"
                ? "block"
                : "none";

    }

}


/* =========================================================
   SMART EXPENSE PLANNER
========================================================= */

function calculateExpenseBreakdown() {

    const destination =
        document.getElementById(
            "expenseDestination"
        );

    const daysInput =
        document.getElementById(
            "expenseDays"
        );

    const travelersInput =
        document.getElementById(
            "expenseTravelers"
        );

    const budgetInput =
        document.getElementById(
            "expenseBudget"
        );

    const result =
        document.getElementById(
            "expenseResult"
        );

    if (
        !destination ||
        !daysInput ||
        !travelersInput ||
        !budgetInput ||
        !result
    )
        return;

    const place =
        destination.value.trim();

    const days =
        parseInt(
            daysInput.value
        );

    const travelers =
        parseInt(
            travelersInput.value
        );

    const budget =
        parseInt(
            budgetInput.value
        );

    if (
        !place ||
        isNaN(days) ||
        isNaN(travelers) ||
        isNaN(budget) ||
        days <= 0 ||
        travelers <= 0 ||
        budget <= 0
    ) {

        result.innerHTML = `

            <div class="result-box">

                ⚠️ Please enter all details correctly.

            </div>

        `;

        return;

    }

    const stay =
        Math.round(
            budget * 0.35
        );

    const food =
        Math.round(
            budget * 0.20
        );

    const transport =
        Math.round(
            budget * 0.20
        );

    const activities =
        Math.round(
            budget * 0.15
        );

    const other =
        Math.round(
            budget * 0.10
        );

    const perPerson =
        Math.round(
            budget / travelers
        );

    result.innerHTML = `

        <div class="result-box">

            <h3>
                💰 Smart Expense Plan
            </h3>

            <p>
                <strong>
                    Destination:
                </strong>
                ${place}
            </p>

            <p>
                <strong>
                    Duration:
                </strong>
                ${days} days
            </p>

            <p>
                <strong>
                    Travelers:
                </strong>
                ${travelers}
            </p>

            <hr>

            <p>
                🏨 Stay: ₹${stay}
            </p>

            <p>
                🍴 Food: ₹${food}
            </p>

            <p>
                🚌 Transport: ₹${transport}
            </p>

            <p>
                🎯 Activities: ₹${activities}
            </p>

            <p>
                📦 Other: ₹${other}
            </p>

            <hr>

            <p>
                <strong>
                    Total:
                </strong>
                ₹${budget}
            </p>

            <p>
                👤 Approx. per person:
                ₹${perPerson}
            </p>

            <p>
                ✅ Expense plan generated successfully.
            </p>

        </div>

    `;

}


/* =========================================================
   SMART RECOMMENDATION
========================================================= */

function getSmartRecommendation() {

    const select =
        document.getElementById(
            "recommendationDestination"
        );

    const result =
        document.getElementById(
            "recommendationResult"
        );

    if (!select || !result)
        return;

    const destination =
        select.value;

    if (!destination) {

        result.innerHTML = `

            <div class="result-box">

                📍 Please select a destination first.

            </div>

        `;

        return;

    }

    const recommendations = {

        "Rishikesh":
            "🏨 Budget stays + River Rafting + Ganga Aarti + Riverside cafés.",

        "Manali":
            "🏔️ Mountain stay + Solang Valley + Mall Road + scenic cafés.",

        "Goa":
            "🏖️ Beach stay + sightseeing + cafés + evening experiences.",

        "Jaipur":
            "🏰 Heritage stay + Amber Fort + City Palace + local markets.",

        "Jammu & Kashmir":
            "🏔️ Hotel/houseboat + Dal Lake + Gulmarg + scenic sightseeing.",

        "Varanasi":
            "🛕 Guest house + Ghats + Ganga Aarti + cultural experiences.",

        "Ayodhya":
            "🛕 Comfortable stay + temple visits + Saryu Ghat + cultural exploration.",

        "Vrindavan":
            "🛕 Budget stay + temple visits + Prem Mandir + cultural exploration.",

        "Agra":
            "🏨 Hotel stay + Taj Mahal + Agra Fort + evening city exploration.",

        "Shimla":
            "🏔️ Mountain stay + Mall Road + Kufri + evening cafés.",

        "Kerala":
            "🌴 Resort/homestay + backwaters + Munnar + nature experiences.",

        "Udaipur":
            "🏰 Heritage stay + City Palace + Lake Pichola + lakeside evening."

    };

    result.innerHTML = `

        <div class="result-box">

            <h3>
                ✨ Smart Recommendation
            </h3>

            <p>
                <strong>
                    ${destination}
                </strong>
            </p>

            <p>
                ${recommendations[destination]}
            </p>

        </div>

    `;

}


/* =========================================================
   STAY MESSAGE
========================================================= */

function showStayMessage(type) {

    const message =
        document.getElementById(
            "stayMessage"
        );

    if (!message)
        return;

    const data = {

        "Budget":
            "🏨 Budget Stay — Affordable hotels, hostels and guest houses for smart travelers.",

        "Standard":
            "⭐ Standard Stay — Comfortable hotels with convenient locations and useful facilities.",

        "Premium":
            "💎 Premium Stay — Premium hotels and resorts for a comfortable travel experience."

    };

    message.innerHTML = `

        <div class="result-box">

            ${data[type] ||
            "Stay information coming soon."}

        </div>

    `;

}


/* =========================================================
   EVENING EXPERIENCE
========================================================= */

function showExperience(type) {

    alert(
        "🌆 " +
        type +
        "\n\n" +
        "SmartTour360 recommends exploring " +
        type +
        " according to your destination."
    );

}


/* =========================================================
   HOTEL MESSAGE
========================================================= */

function hotelMessage(type) {

    alert(
        "🏨 " +
        type +
        "\n\n" +
        "SmartTour360 can help you find suitable stays according to your travel budget."
    );

}


/* =========================================================
   AI ASSISTANT
========================================================= */

function sendMessage() {

    const input =
        document.getElementById(
            "chatInput"
        );

    if (!input)
        return;

    const message =
        input.value.trim();

    if (!message)
        return;

    addAIMessage(
        message,
        "user"
    );

    input.value = "";

    setTimeout(
        function () {

            processAIMessage(
                message
            );

        },
        400
    );

}


function addAIMessage(
    message,
    type
) {

    const chat =
        document.getElementById(
            "chatMessages"
        );

    if (!chat)
        return;

    const messageDiv =
        document.createElement(
            "div"
        );

    messageDiv.className =
        "chat-message";

    const avatar =
        type === "user"
            ? "👤"
            : "🤖";

    const name =
        type === "user"
            ? "You"
            : "SmartTour AI";

    messageDiv.innerHTML = `

        <div class="message-avatar">
            ${avatar}
        </div>

        <div class="message-content">

            <strong>
                ${name}
            </strong>

            <p></p>

        </div>

    `;

    messageDiv
        .querySelector("p")
        .textContent =
            message;

    chat.appendChild(
        messageDiv
    );

    chat.scrollTop =
        chat.scrollHeight;

}


function processAIMessage(message) {

    const text =
        message
            .toLowerCase()
            .trim();

    if (
        text === "hi" ||
        text === "hello" ||
        text === "hey" ||
        text.startsWith("hi ") ||
        text.startsWith("hello ")
    ) {

        aiStep = 1;

        addAIMessage(
            "Hello! 👋 Which destination are you planning to visit?",
            "bot"
        );

        return;

    }

    if (aiStep === 0) {

        aiStep = 1;

        addAIMessage(
            "Hello! 👋 Which destination are you planning to visit?",
            "bot"
        );

        return;

    }

    if (aiStep === 1) {

        aiDestination =
            message.trim();

        aiStep = 2;

        addAIMessage(
            `Great! ${aiDestination} sounds exciting. How many days are you planning to stay?`,
            "bot"
        );

        return;

    }

    if (aiStep === 2) {

        const days =
            parseInt(
                message
            );

        if (
            isNaN(days) ||
            days <= 0
        ) {

            addAIMessage(
                "Please enter the number of days, for example 3.",
                "bot"
            );

            return;

        }

        aiDays =
            days;

        aiStep = 3;

        addAIMessage(
            "Nice! 💰 What is your total travel budget in ₹?",
            "bot"
        );

        return;

    }

    if (aiStep === 3) {

        const budget =
            parseInt(
                message.replace(
                    /[^0-9]/g,
                    ""
                )
            );

        if (
            isNaN(budget) ||
            budget <= 0
        ) {

            addAIMessage(
                "Please enter a valid budget, for example ₹10000.",
                "bot"
            );

            return;

        }

        aiBudget =
            budget;

        aiStep = 4;

        generateAIPlan();

        return;

    }

    if (aiStep === 4) {

        if (
            text.includes("yes") ||
            text.includes("again") ||
            text.includes("new") ||
            text.includes("plan")
        ) {

            aiStep = 1;

            addAIMessage(
                "Sure! Which destination are you planning to visit?",
                "bot"
            );

        } else {

            addAIMessage(
                "I can create another trip plan anytime. Just say 'yes'. 😊",
                "bot"
            );

        }

    }

}


function generateAIPlan() {

    const stay =
        Math.round(
            aiBudget * 0.35
        );

    const food =
        Math.round(
            aiBudget * 0.20
        );

    const transport =
        Math.round(
            aiBudget * 0.20
        );

    const activities =
        Math.round(
            aiBudget * 0.15
        );

    const emergency =
        Math.round(
            aiBudget * 0.10
        );

    const plan = `

Your SmartTour360 plan is ready! 🧳

📍 Destination:
${aiDestination}

📅 Duration:
${aiDays} days

💰 Total Budget:
₹${aiBudget}

🏨 Stay:
₹${stay}

🍴 Food:
₹${food}

🚌 Transport:
₹${transport}

🎯 Activities:
₹${activities}

🛡️ Emergency:
₹${emergency}

Have a great trip! 🌍✨

Want to plan another trip? Say "yes".

`;

    addAIMessage(
        plan,
        "bot"
    );

}


/* =========================================================
   AI ENTER KEY
========================================================= */

document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key === "Enter" &&
            event.target.id === "chatInput"
        ) {

            event.preventDefault();

            sendMessage();

        }

    }
);


/* =========================================================
   ADMIN STATS
========================================================= */

async function getAdminStats() {

    try {

        const response =
            await fetch(
                `${API_BASE_URL}/api/admin/stats`,
                {
                    headers: {
                        "X-Admin-Key":
                            "smarttour360-admin"
                    }
                }
            );

        const data =
            await response.json();

        return data.success
            ? data
            : null;

    } catch (error) {

        console.error(
            "Admin stats error:",
            error
        );

        return null;

    }

}


async function getAdminUsers() {

    try {

        const response =
            await fetch(
                `${API_BASE_URL}/api/admin/users`,
                {
                    headers: {
                        "X-Admin-Key":
                            "smarttour360-admin"
                    }
                }
            );

        const data =
            await response.json();

        return data.success
            ? data.users || []
            : [];

    } catch (error) {

        console.error(
            "Admin users error:",
            error
        );

        return [];

    }

}


/* =========================================================
   CLOSE MODALS
========================================================= */

window.addEventListener(
    "click",
    function (event) {

        const destinationModal =
            document.getElementById(
                "destinationModal"
            );

        const accountModal =
            document.getElementById(
                "accountModal"
            );

        if (
            destinationModal &&
            event.target ===
                destinationModal
        ) {

            closeDestination();

        }

        if (
            accountModal &&
            event.target ===
                accountModal
        ) {

            closeAccountModal();

        }

    }
);


document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key === "Escape"
        ) {

            closeDestination();

            closeAccountModal();

        }

    }
);


/* =========================================================
   SCROLL TOP
========================================================= */

function scrollToTop() {

    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}


/* =========================================================
   EXPORT FUNCTIONS
========================================================= */

window.showDestination =
    showDestination;

window.closeDestination =
    closeDestination;

window.openAccountModal =
    openAccountModal;

window.closeAccountModal =
    closeAccountModal;

window.showLoginForm =
    showLoginForm;

window.showSignupForm =
    showSignupForm;

window.loginUser =
    loginUser;

window.signupUser =
    signupUser;

window.logoutUser =
    logoutUser;

window.uploadProfilePicture =
    uploadProfilePicture;

window.getAdminStats =
    getAdminStats;

window.getAdminUsers =
    getAdminUsers;

window.searchDestination =
    searchDestination;

window.searchDestinations =
    searchDestinations;

window.scrollToSection =
    scrollToSection;

window.createTripPlan =
    createTripPlan;

window.calculateTrip =
    createTripPlan;

window.calculateExpenseBreakdown =
    calculateExpenseBreakdown;

window.calculateExpenses =
    calculateExpenseBreakdown;

window.selectTripMode =
    selectTripMode;

window.getSmartRecommendation =
    getSmartRecommendation;

window.showStayMessage =
    showStayMessage;

window.showExperience =
    showExperience;

window.sendMessage =
    sendMessage;

window.sendAIMessage =
    sendMessage;

window.hotelMessage =
    hotelMessage;

window.scrollToTop =
    scrollToTop;


/* =========================================================
   SMART 5-DAY TRAVEL WEATHER
========================================================= */


/* =========================================================
   FIXED INDIAN DESTINATION LOCATIONS
   Prevents Goa -> Italy / wrong city problem
========================================================= */

const weatherLocations = {

    "rishikesh": {
        name: "Rishikesh",
        country: "India",
        latitude: 30.0869,
        longitude: 78.2676
    },

    "manali": {
        name: "Manali",
        country: "India",
        latitude: 32.2432,
        longitude: 77.1892
    },

    "goa": {
        name: "Goa",
        country: "India",
        latitude: 15.4909,
        longitude: 73.8278
    },

    "jaipur": {
        name: "Jaipur",
        country: "India",
        latitude: 26.9124,
        longitude: 75.7873
    },

    "jammu": {
        name: "Jammu",
        country: "India",
        latitude: 32.7266,
        longitude: 74.8570
    },

    "kashmir": {
        name: "Kashmir",
        country: "India",
        latitude: 34.0837,
        longitude: 74.7973
    },

    "jammu & kashmir": {
        name: "Jammu & Kashmir",
        country: "India",
        latitude: 34.0837,
        longitude: 74.7973
    },

    "varanasi": {
        name: "Varanasi",
        country: "India",
        latitude: 25.3176,
        longitude: 82.9739
    },

    "ayodhya": {
        name: "Ayodhya",
        country: "India",
        latitude: 26.7922,
        longitude: 82.1998
    },

    "vrindavan": {
        name: "Vrindavan",
        country: "India",
        latitude: 27.5806,
        longitude: 77.7006
    },

    "agra": {
        name: "Agra",
        country: "India",
        latitude: 27.1767,
        longitude: 78.0081
    },

    "shimla": {
        name: "Shimla",
        country: "India",
        latitude: 31.1048,
        longitude: 77.1734
    },

    "kerala": {
        name: "Kerala",
        country: "India",
        latitude: 10.8505,
        longitude: 76.2711
    },

    "udaipur": {
        name: "Udaipur",
        country: "India",
        latitude: 24.5854,
        longitude: 73.7125
    }

};


/* =========================================================
   CHECK TRIP WEATHER
========================================================= */

async function checkTripWeather() {

    const destinationInput =
        document.getElementById(
            "weatherDestination"
        );

    const dateInput =
        document.getElementById(
            "weatherStartDate"
        );

    const result =
        document.getElementById(
            "weatherResult"
        );

    if (
        !destinationInput ||
        !dateInput ||
        !result
    ) {

        console.error(
            "Weather HTML elements not found."
        );

        return;

    }


    const destination =
        destinationInput.value.trim();

    const startDate =
        dateInput.value;


    if (
        !destination ||
        !startDate
    ) {

        result.innerHTML = `

            <div class="weather-error">

                ⚠️ Please enter destination
                and trip start date.

            </div>

        `;

        return;

    }


    result.innerHTML = `

        <div class="weather-loading">

            🌦️ Checking weather for
            ${destination}...

        </div>

    `;


    try {

        /* =====================================================
           STEP 1: FIND INDIAN DESTINATION
        ===================================================== */

        const searchKey =
            destination
                .toLowerCase()
                .trim();


        let location =
            weatherLocations[searchKey];


        /* =====================================================
           SUPPORT COMMON DESTINATION VARIATIONS
        ===================================================== */

        if (!location) {

            if (
                searchKey.includes("goa")
            ) {

                location =
                    weatherLocations["goa"];

            }

            else if (
                searchKey.includes("varanasi") ||
                searchKey.includes("banaras") ||
                searchKey.includes("benares")
            ) {

                location =
                    weatherLocations["varanasi"];

            }

            else if (
                searchKey.includes("rishikesh")
            ) {

                location =
                    weatherLocations["rishikesh"];

            }

            else if (
                searchKey.includes("manali")
            ) {

                location =
                    weatherLocations["manali"];

            }

            else if (
                searchKey.includes("jaipur")
            ) {

                location =
                    weatherLocations["jaipur"];

            }

            else if (
                searchKey.includes("ayodhya")
            ) {

                location =
                    weatherLocations["ayodhya"];

            }

            else if (
                searchKey.includes("vrindavan")
            ) {

                location =
                    weatherLocations["vrindavan"];

            }

            else if (
                searchKey.includes("agra")
            ) {

                location =
                    weatherLocations["agra"];

            }

            else if (
                searchKey.includes("shimla")
            ) {

                location =
                    weatherLocations["shimla"];

            }

            else if (
                searchKey.includes("kerala")
            ) {

                location =
                    weatherLocations["kerala"];

            }

            else if (
                searchKey.includes("udaipur")
            ) {

                location =
                    weatherLocations["udaipur"];

            }

            else if (
                searchKey.includes("kashmir") ||
                searchKey.includes("jammu")
            ) {

                location =
                    weatherLocations["jammu & kashmir"];

            }

        }


        /* =====================================================
           DESTINATION NOT FOUND
        ===================================================== */

        if (!location) {

            throw new Error(
                "Destination not found."
            );

        }


        const latitude =
            location.latitude;

        const longitude =
            location.longitude;

        const placeName =
            location.name;

        const country =
            location.country;


        /* =====================================================
           STEP 2: GET WEATHER
        ===================================================== */

        const weatherURL =
            `https://api.open-meteo.com/v1/forecast` +
            `?latitude=${latitude}` +
            `&longitude=${longitude}` +
            `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max` +
            `&timezone=auto` +
            `&forecast_days=16`;


        const weatherResponse =
            await fetch(
                weatherURL
            );


        if (!weatherResponse.ok) {

            throw new Error(
                "Weather API failed."
            );

        }


        const weatherData =
            await weatherResponse.json();


        if (
            !weatherData.daily ||
            !weatherData.daily.time
        ) {

            throw new Error(
                "Weather information unavailable."
            );

        }


        /* =====================================================
           STEP 3: FIND SELECTED DATE
        ===================================================== */

        const dates =
            weatherData.daily.time;


        const startIndex =
            dates.indexOf(
                startDate
            );


        if (startIndex === -1) {

            result.innerHTML = `

                <div class="weather-error">

                    ⚠️ Weather forecast is not
                    available for
                    <b>${formatWeatherDate(startDate)}</b>.

                    <br><br>

                    Please choose a date within
                    the available forecast period.

                </div>

            `;

            return;

        }


        /* =====================================================
           STEP 4: CHECK 5 DAYS
        ===================================================== */

        if (
            startIndex + 5 >
            dates.length
        ) {

            result.innerHTML = `

                <div class="weather-error">

                    ⚠️ We don't have 5 complete
                    forecast days available
                    from this date.

                    <br><br>

                    Please select an earlier
                    trip date.

                </div>

            `;

            return;

        }


        /* =====================================================
           STEP 5: CREATE 5-DAY DATA
        ===================================================== */

        const fiveDays = [];


        for (
            let i = startIndex;
            i < startIndex + 5;
            i++
        ) {

            fiveDays.push({

                date:
                    dates[i],

                max:
                    weatherData.daily
                        .temperature_2m_max[i],

                min:
                    weatherData.daily
                        .temperature_2m_min[i],

                rain:
                    weatherData.daily
                        .precipitation_probability_max[i] ?? 0,

                wind:
                    weatherData.daily
                        .wind_speed_10m_max[i] ?? 0,

                code:
                    weatherData.daily
                        .weather_code[i]

            });

        }


        /* =====================================================
           STEP 6: WEATHER ALERT
        ===================================================== */

        const maxRain =
            Math.max(
                ...fiveDays.map(
                    day =>
                        day.rain || 0
                )
            );


        const maxWind =
            Math.max(
                ...fiveDays.map(
                    day =>
                        day.wind || 0
                )
            );


        let alertTitle = "";
        let alertText = "";


        if (
            maxRain >= 70
        ) {

            alertTitle =
                "🌧️ Rain Alert";

            alertText =
                "High chance of rain during your trip. Keep rain protection and check the forecast before travelling.";

        }

        else if (
            maxWind >= 40
        ) {

            alertTitle =
                "💨 Wind Alert";

            alertText =
                "Strong winds may occur during your trip. Stay updated with the latest forecast.";

        }

        else if (
            maxRain < 40 &&
            maxWind < 30
        ) {

            alertTitle =
                "✅ Favorable Weather";

            alertText =
                "Weather conditions look generally favorable for your planned trip.";

        }

        else {

            alertTitle =
                "🌤️ Moderate Weather";

            alertText =
                "Weather conditions are mixed. Keep checking the forecast before your journey.";

        }


        /* =====================================================
           STEP 7: SMART INSIGHTS
        ===================================================== */

        const bestDay =
            getBestTravelDay(
                fiveDays
            );


        const packingItems =
            getPackingSuggestions(
                fiveDays
            );


        const overallScore =
            Math.round(
                fiveDays.reduce(
                    (sum, day) =>
                        sum +
                        calculateTravelScore(day),
                    0
                ) /
                fiveDays.length
            );


        const overallRating =
            getTravelRating(
                overallScore
            );


        /* =====================================================
           STEP 8: DISPLAY RESULT
        ===================================================== */

        result.innerHTML = `

            <div class="weather-result-header">

                <div>

                    <span class="section-label">
                        SMART TRAVEL WEATHER
                    </span>

                    <h3>
                        ${placeName}, ${country}
                    </h3>

                    <p>
                        5-Day Forecast starting
                        ${formatWeatherDate(
                            startDate
                        )}
                    </p>

                </div>

            </div>


            <!-- TRAVEL SCORE -->

            <div class="weather-smart-score">

                <div class="score-circle">

                    <strong>
                        ${overallScore}
                    </strong>

                    <span>
                        /100
                    </span>

                </div>

                <div class="score-content">

                    <span class="section-label">
                        TRAVEL SCORE
                    </span>

                    <h3>
                        ${overallRating.icon}
                        ${overallRating.text}
                    </h3>

                    <p>
                        Based on temperature,
                        rain probability and wind
                        conditions.
                    </p>

                </div>

            </div>


            <!-- BEST DAY -->

            <div class="weather-best-day">

                <div class="best-day-icon">
                    ⭐
                </div>

                <div>

                    <span class="section-label">
                        RECOMMENDED TRAVEL DAY
                    </span>

                    <h3>
                        ${formatWeatherDate(
                            bestDay.day.date
                        )}
                    </h3>

                    <p>

                        Travel Score:

                        <strong>
                            ${bestDay.score}/100
                        </strong>

                    </p>

                </div>

            </div>


            <!-- WEATHER ALERT -->

            <div class="weather-alert">

                <div class="weather-alert-title">

                    ${alertTitle}

                </div>

                <p>

                    ${alertText}

                </p>

            </div>


            <!-- 5 DAY FORECAST -->

            <div class="weather-days">

                ${fiveDays.map(
                    function (day) {

                        const score =
                            calculateTravelScore(
                                day
                            );

                        const rating =
                            getTravelRating(
                                score
                            );

                        return `

                            <div
                                class="weather-day-card"
                            >

                                <div
                                    class="weather-day"
                                >
                                    ${formatWeatherDate(
                                        day.date
                                    )}
                                </div>


                                <div
                                    class="weather-big-icon"
                                >
                                    ${getWeatherIcon(
                                        day.code
                                    )}
                                </div>


                                <h4>
                                    ${getWeatherCondition(
                                        day.code
                                    )}
                                </h4>


                                <div
                                    class="weather-temp"
                                >
                                    ${Math.round(
                                        day.max
                                    )}°C
                                </div>


                                <div
                                    class="weather-min"
                                >
                                    Min
                                    ${Math.round(
                                        day.min
                                    )}°C
                                </div>


                                <div
                                    class="weather-info"
                                >
                                    🌧️ Rain:
                                    ${day.rain}%
                                </div>


                                <div
                                    class="weather-info"
                                >
                                    💨 Wind:
                                    ${Math.round(
                                        day.wind
                                    )} km/h
                                </div>


                                <div
                                    class="weather-score"
                                >

                                    ${rating.icon}

                                    ${score}/100

                                </div>

                            </div>

                        `;

                    }
                ).join("")}

            </div>


            <!-- SMART PACKING -->

            <div class="weather-packing">

                <div class="packing-heading">

                    🎒 Smart Packing Suggestions

                </div>

                <p>

                    Based on your 5-day
                    weather forecast:

                </p>


                <div class="packing-items">

                    ${packingItems.map(
                        item => `

                            <span>
                                ${item}
                            </span>

                        `
                    ).join("")}

                </div>

            </div>


            <!-- NOTE -->

            <div class="weather-note">

                ℹ️ Forecasts can change as your
                travel date gets closer.
                Check again before starting
                your journey.

            </div>

        `;

    }

    catch (error) {

        console.error(
            "Weather Error:",
            error
        );


        result.innerHTML = `

            <div class="weather-error">

                ⚠️ Unable to get weather information.

                <br><br>

                ${error.message ===
                    "Destination not found."
                    ? "Please enter one of the supported destinations: Rishikesh, Manali, Goa, Jaipur, Jammu & Kashmir, Varanasi, Ayodhya, Vrindavan, Agra, Shimla, Kerala or Udaipur."
                    : "Please check your internet connection and try again."
                }

            </div>

        `;

    }

}


/* =========================================================
   TRAVEL SCORE
========================================================= */

function calculateTravelScore(day) {

    let score = 100;

    const rain =
        day.rain || 0;

    const wind =
        day.wind || 0;


    /* Rain */

    if (
        rain >= 80
    )
        score -= 35;

    else if (
        rain >= 60
    )
        score -= 25;

    else if (
        rain >= 40
    )
        score -= 15;

    else if (
        rain >= 20
    )
        score -= 7;


    /* Wind */

    if (
        wind >= 50
    )
        score -= 25;

    else if (
        wind >= 40
    )
        score -= 15;

    else if (
        wind >= 30
    )
        score -= 8;


    /* Temperature */

    const temp =
        day.max;


    if (
        temp >= 20 &&
        temp <= 30
    ) {

        score += 0;

    }

    else if (
        temp < 10 ||
        temp > 38
    ) {

        score -= 15;

    }

    else if (
        temp < 15 ||
        temp > 34
    ) {

        score -= 7;

    }


    return Math.max(
        0,
        Math.min(
            100,
            score
        )
    );

}


/* =========================================================
   TRAVEL RATING
========================================================= */

function getTravelRating(score) {

    if (
        score >= 80
    ) {

        return {

            text:
                "Excellent",

            icon:
                "🟢"

        };

    }


    if (
        score >= 60
    ) {

        return {

            text:
                "Good",

            icon:
                "🟡"

        };

    }


    if (
        score >= 40
    ) {

        return {

            text:
                "Moderate",

            icon:
                "🟠"

        };

    }


    return {

        text:
            "Caution",

        icon:
            "🔴"

    };

}


/* =========================================================
   SMART PACKING
========================================================= */

function getPackingSuggestions(days) {

    const suggestions =
        new Set();


    const maxRain =
        Math.max(
            ...days.map(
                day =>
                    day.rain || 0
            )
        );


    const maxWind =
        Math.max(
            ...days.map(
                day =>
                    day.wind || 0
            )
        );


    const minTemp =
        Math.min(
            ...days.map(
                day =>
                    day.min
            )
        );


    const maxTemp =
        Math.max(
            ...days.map(
                day =>
                    day.max
            )
        );


    if (
        maxRain >= 40
    ) {

        suggestions.add(
            "☔ Rain protection"
        );

    }


    if (
        minTemp <= 15
    ) {

        suggestions.add(
            "🧥 Light jacket"
        );

    }


    if (
        minTemp <= 8
    ) {

        suggestions.add(
            "🧣 Warm clothes"
        );

    }


    if (
        maxTemp >= 30
    ) {

        suggestions.add(
            "🕶️ Sunglasses"
        );

        suggestions.add(
            "🧴 Sun protection"
        );

    }


    if (
        maxWind >= 35
    ) {

        suggestions.add(
            "🎒 Secure your luggage"
        );

    }


    suggestions.add(
        "👟 Comfortable shoes"
    );


    return [
        ...suggestions
    ];

}


/* =========================================================
   BEST TRAVEL DAY
========================================================= */

function getBestTravelDay(days) {

    let bestDay =
        days[0];


    let bestScore =
        calculateTravelScore(
            days[0]
        );


    days.forEach(
        function (day) {

            const score =
                calculateTravelScore(
                    day
                );


            if (
                score > bestScore
            ) {

                bestScore =
                    score;

                bestDay =
                    day;

            }

        }
    );


    return {

        day:
            bestDay,

        score:
            bestScore

    };

}


/* =========================================================
   WEATHER DATE
========================================================= */

function formatWeatherDate(
    dateString
) {

    const date =
        new Date(
            dateString +
            "T00:00:00"
        );


    return date.toLocaleDateString(
        "en-IN",
        {
            day:
                "numeric",

            month:
                "short",

            year:
                "numeric"
        }
    );

}


/* =========================================================
   WEATHER ICON
========================================================= */

function getWeatherIcon(code) {

    if (
        code === 0
    )
        return "☀️";


    if (
        code === 1 ||
        code === 2
    )
        return "🌤️";


    if (
        code === 3
    )
        return "☁️";


    if (
        [45, 48].includes(code)
    )
        return "🌫️";


    if (
        [51, 53, 55].includes(code)
    )
        return "🌦️";


    if (
        [61, 63, 65].includes(code)
    )
        return "🌧️";


    if (
        [66, 67].includes(code)
    )
        return "🌨️";


    if (
        [71, 73, 75, 77].includes(code)
    )
        return "❄️";


    if (
        [80, 81, 82].includes(code)
    )
        return "🌦️";


    if (
        [85, 86].includes(code)
    )
        return "🌨️";


    if (
        [95, 96, 99].includes(code)
    )
        return "⛈️";


    return "🌤️";

}


/* =========================================================
   WEATHER CONDITION
========================================================= */

function getWeatherCondition(code) {

    if (
        code === 0
    )
        return "Clear Sky";


    if (
        [1, 2].includes(code)
    )
        return "Partly Cloudy";


    if (
        code === 3
    )
        return "Cloudy";


    if (
        [45, 48].includes(code)
    )
        return "Foggy";


    if (
        [51, 53, 55].includes(code)
    )
        return "Drizzle";


    if (
        [61, 63, 65].includes(code)
    )
        return "Rain";


    if (
        [66, 67].includes(code)
    )
        return "Freezing Rain";


    if (
        [71, 73, 75, 77].includes(code)
    )
        return "Snow";


    if (
        [80, 81, 82].includes(code)
    )
        return "Rain Showers";


    if (
        [85, 86].includes(code)
    )
        return "Snow Showers";


    if (
        [95, 96, 99].includes(code)
    )
        return "Thunderstorm";


    return "Mixed Weather";

}


/* =========================================================
   WEATHER DATE MINIMUM
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const dateInput =
            document.getElementById(
                "weatherStartDate"
            );


        if (dateInput) {

            const today =
                new Date()
                    .toISOString()
                    .split("T")[0];


            dateInput.min =
                today;

        }

    }
);


/* =========================================================
   EXPORT WEATHER FUNCTION
========================================================= */

window.checkTripWeather =
    checkTripWeather;
    /* =========================================================
   SMARTTOUR360 - LOCATION BASED TRAIN FINDER
========================================================= */

/* =========================================================
   SMARTTOUR360 - SMART TRAIN + METRO FINDER
========================================================= */


/* =========================================================
   TRANSPORT MODE
========================================================= */

let selectedTransportMode = "railway";


/* =========================================================
   RAILWAY STATIONS
========================================================= */

const railwayStations = [

   {
    name: "Haridwar Junction",
    lat: 29.9457,
    lng: 78.1642
},
{
    name: "Rishikesh Railway Station",
    lat: 30.1087,
    lng: 78.2948
},
{
    name: "Dehradun Railway Station",
    lat: 30.3165,
    lng: 78.0322
},
{
    name: "New Delhi Railway Station",
    lat: 28.6431,
    lng: 77.2197
},
{
    name: "Lucknow Charbagh",
    lat: 26.8320,
    lng: 80.9210
},
{
    name: "Varanasi Junction",
    lat: 25.3176,
    lng: 82.9739
},
{
    name: "Bareilly Junction",
    lat: 28.3515,
    lng: 79.4307
}
];

/* =========================================================
   RAILWAY DATA
========================================================= */

const demoTrains = [

    {
        number: "12017",
        name: "Dehradun Shatabdi Express",
        from: "Dehradun Railway Station",
        to: "New Delhi Railway Station",
        departure: "05:50 AM",
        arrival: "11:00 AM",
        duration: "5h 10m",
        type: "Shatabdi",
        classes: "CC • EC",

        image: "transport-images/train1.jpg"
    },

    {
        number: "12055",
        name: "Dehradun Jan Shatabdi",
        from: "Dehradun Railway Station",
        to: "New Delhi Railway Station",
        departure: "03:55 PM",
        arrival: "09:10 PM",
        duration: "5h 15m",
        type: "Express",
        classes: "CC • 2S",

        image: "transport-images/train2.jpg"
    },

    {
        number: "12401",
        name: "Kota DDN Express",
        from: "Haridwar Junction",
        to: "New Delhi Railway Station",
        departure: "06:00 AM",
        arrival: "10:30 AM",
        duration: "4h 30m",
        type: "Express",
        classes: "SL • 3A • 2A",

        image: "transport-images/train3.jpg"
    },

    {
        number: "14309",
        name: "Ujjaini Express",
        from: "Haridwar Junction",
        to: "New Delhi Railway Station",
        departure: "04:45 PM",
        arrival: "09:25 PM",
        duration: "4h 40m",
        type: "Express",
        classes: "SL • 3A • 2A",

        image: "transport-images/train4.jpg"
    },

    {
        number: "22456",
        name: "Vande Bharat Express",
        from: "New Delhi Railway Station",
        to: "Varanasi Junction",
        departure: "06:00 AM",
        arrival: "02:00 PM",
        duration: "8h 00m",
        type: "Vande Bharat",
        classes: "CC • EC",

        image: "transport-images/train5.jpg"
    },

    {
        number: "12559",
        name: "Shiv Ganga Express",
        from: "New Delhi Railway Station",
        to: "Varanasi Junction",
        departure: "08:10 PM",
        arrival: "08:25 AM",
        duration: "12h 15m",
        type: "Superfast",
        classes: "SL • 3A • 2A",

        image: "transport-images/train6.jpg"
    }

];


/* =========================================================
   METRO DATA
========================================================= */

const demoMetro = [

    {
        number: "DM-101",
        name: "Delhi Metro Blue Line",
        from: "New Delhi",
        to: "Dwarka Sector 21",
        departure: "06:10 AM",
        arrival: "07:00 AM",
        duration: "50 min",
        type: "Metro",
        classes: "General",

        image:
            "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAIBAQEBAQIBAQECAgICAgQDAgICAgUEBAMEBgUGBgYFBgYGBwkIBgcJBwYGCAsICQoKCgoKBggLDAsKDAkKCgr/2wBDAQICAgICAgUDAwUKBwYHCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgr/wAARCAB8ATIDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD8aYwKUqsgO1xx1wc4ro/h/wCF7PVb0XupQ+dGjgQ2zISszehx2Hf617r46XT3+HWh61omnR2Nsb6SKWKKEIsb+UMrwBwCK9qvio0elzyKWHdTrY+ZvszAYJ/HNMe3x0wfxFez+F/FF0s5hW/S5DN8zBHAGNvqMV3Wh+IlkwPMhJ4/55n+lc7x8P5fx/4B0LBv+b8D5jhsZzhmjIB7kVObfy1y7j/vqvpfwVqPh/VPiBuaKNtoO8NGCN/A6Yx1xzXZzz+HtZ1qfUotUt4RD/otvFLaR7WVTyxBTklj19qlZml9n8f+AP6jf7X4f8E+LZLqJDgyL/31TDdR/wB9fxavs/V4dNsbQvbWmlzSOdkWzToyzMcAYwCKd4V8OaXYyQ2cSQRrpkRidn0xJVlmcguGYpxt6Z59qazJWvy/iCwD/mPixriLu4+uaWGe1LczoPq4r9Evh14R0++C6o2j6VdKOA1tYKyk8eq5BzxznNewfB39mfx/8Wdcni+H3wth1a6SNWmitNHVlt0yMF9qfKD69+wpxx/M7coPAuK+I/JZWsGHzX0APoZlB/nSGPT3XC6jbf8AgQn+Nf0xfALx18Cf2XvhTY+CfEv7JGlXN7aoZNY1S9sYDLcXDEb2zJbfImThQcAAYzXWXv7dv7Kc0R0/wt+yjosuqSxfLJNothLFak4wcxx/vD/s5FavHJacv4kfUpb8x/LRLPbRAkajbEA8kXKcfrUCa/Y27ZbU7b/wIT/Gv6uvh1+zx4G+KOp23xI+J/w78OwIWEtpaSaBaK7g9CyrEERT2VVz6k16rqHgT9nzTnXTfD/wD8LazqIXEVnZ+GLQsPd2MeI19zz7GtvaTte1n2MHGHNa9z+Pq38Q6ZcHy21S1565uU/xom/s6f8AeR6jasPa5Q/1r+vM/sn/AAk8X+Ibfxp8W/g34NnubUEabpFhoMKWlmD3dgga5k92+UfwqK3vHnij9kj4GaCs/wASPDfgXQ7dI8xQzaJaB2A/upsyR+FU67S+G7JVOLe9j+OpYI8/8fUOO2Jl/wAasQ20bnAuYSc9FlB/rX9LHx7/AOCw/wCx94fvP+EF+CnwF0Pxfqly4htYX8OQGNnJwoVEj3SEnsPzr4S/aB+MX7RP7T3xGufhPoHwDsrPUDPsufDvg/wjbtcQH+4/2eM7GGRncw29TUvEKC96NvmP2XN8LufkyLZUJzIo9csKimkt0O3zkz/vCv2Q8Nf8Ec/2s/EnhO113xF4CXQrUZ8u0tUsri/kx1EjbiqN/s8kegrxr44/Ajw38AtZfTPGvwV8QS3kIKhfEGpvHG/v5cCopB9OauFWrU+GP4kyhCD96X4H5mSXMCH55UGe5cD+dNM9ux+W5jPt5g/xr7Yb9oKL4e3E0vgH4KeCdLaUbZWOhJcMw9zLurC1n9tjx+bZ7G58EeDHibO4f8Inagn8Qmf1qpSlH4kChGWzPkmO0aQZBz9DTniMYwFJ/A19Bax+03petILfWvgz4ZlVSTmxhktGz/vQsufxqnonifw9471F7Xwx4H16ymSMyS/YNUW4jjX1InxjJ4ALcngZrCeIcdo/iaxoJ7s8F3ccDjue1AEfUOD+Ir2i803w3J4onjm8ayQXsU2ydNahkt7mEgHKiEnywfqfwrqbbQJLudbux0/UL9VGI7m+uEjhJ56ImAf1rBY53somn1RdZHzb5qbvLEiZ9Nwp5QAdQK+kNW0m9vrSTTtR120tldSpgsY9zAc+mCPzrJ8EeFotMnvFs7e+vbm3uTCy30qpDEQoIK9SchgTmqeNa3j+Ivqq6S/A8EKjHysp/GlWEk52/hX0bqXh/wAZ387XOp6tp1pbhSPJtonPGD/ESOfoaXT7K2tNCl0CPUpJyY5fs8sqbchgTgHBJweh6ipePS6fj/wBrCvufOn2Zzx5TZ7/ACmgQOg5jbP+6a9m8LaXrs+iwLfyiygRABLcSDfJ1554xT/iBYQy+DphZa2W8iRJWa3m+fCkkgFV/Q8dzWazOLfw/iX9SdviPFCCD82B9aMhiFJH517H4J8EfEbW9Cs5PDmgbY5IFdbrU9REkkmc/NtQEgexrR8e/DL4h6B4NudW8TeJpYLdI8yRafYmIMTngyEFv8aP7Tje3L+Ilgpdzwwrg7Tx9RQww3HJ7CvoHwZ8JNF8O6L5erXGtTX7DNzG18pjDcn5eM4AIqP4haHp8OgLJoujRSW4k230izy+fEDkcg5456jpTWZxbty/iH1F2+I+fzuJxt6eooZm6Y/IVZ03xZfWDtp8+oXQdWKqgkBzgkHJY5BqprmoeJpQ95Za+9sG6ltUI9egFV/aME/hD6lK24cjqh/I0VVifxPNEsv/AAmOofMoP/IRkPX8KKP7Rj/L+IfU5dz1j4M6wllp9tHKVCtcyhtw46rXt3xG1W2k+F1paLAN327fwOd3lnP4nivm7wVps17p0bjxTDp6rJICkucsSV5AFep6EutjwTJdXnjSz1nTrKeNTa25/fQu3CnB5x15rHFy+JGlBaRY7T0uFv8AdHDZTxTWdvO8c1r9wEFSCQPVf1rajfT/ACgyeG9OJA4eNyPT3qr4WaxubyCWO1ugrWAgkDRAngkj9GFbEfhm6WP5rKAKOhkBBxx2HFea3dI7UUvh3Z+HtH1O91mfSxDMXiSFvOdlLO2MAEHnp9elekqIbS3/ALFs/scyW67VBjIJ6Enn3J5qjLo3h3SPhto1pd+C9NvdRvtbWSC7keZJIlxuLEKcMAAoGe+az28HX8N4+sHxI5VnMrv9mJyMg8fT0PWhaooq6V4A8b678RJL/TrHBtIFh061tx8rXMgI8zGOdiAtn1Ir0LQvBPxG8HSW+mrb2TwoMec6yKzgkEksBySetavgjw3bpbW3nrcRzFQYpY7hkliJC85H97AOOwwK+wv2E/8AgnV8YP2zdVXUNT8W6hYeC9LlCX+uXMIkLsMZgg4+eXGMt0XPPPFc0KlWtWtFLlR1unSo0eaTfMzzv9jH4I+MfjB4sTw3/ZsltYC4Q61qtnpL3UenxHGXMca8vgfKhPJPPGc/s9+zxpn7MHwK+GZ8IfCvWNO0/T9NtftGrXF83kXcrbQXuLkyhWZj69BwBxgV4H8TrHw5/wAEvfgf5mkfHmwsdLhZjo/hu68KQPdajcHB5ZcSOSesjcDP4V+bf7VP/BSf4z/tMazbah4yitbHT7CJorPTdDi8uPDEbmc9ZWOP4uB2r0EvdscDaufZn/BRz/gqD4K8ZaXcfBv4B34k06WQprHiAw7ftwBx5EYK58k5yzHBbAAwOvxZpf7RfhX4X58Q65cxyx2mbh+QwG3BLkAdOwFfPPjX47eF7GBrnVtMu3YkKFf5Dk4x9f6VwPjv43eE4A+nKEvpJI9ps4iHXBHR2HGParhGSkmiZyXK10PsHx1/wcOeKfEGraR4O+G/gj+zdHSWKPWdSllzfXkeRvWE42wgrkhsZr7U+CH/AAWu/YzsNCj0G08daXo0EUIZn1FZfNkOBlpWOctk43E846CvxA+Bn7IPxv8A2uPHclt8EPhuFtbcbtQ1NmMGmaZFxuea4b5VA6kDLH0r9O/2Df8AgjV8EfB/hG1+MmoeMLb4meL4r1otPiuNNdNI0+5jYBpIYG5vNhziRyVPUV6brSl8etzzfYxh8Gh2f7Zf/BcL4mancJ4E/ZT+HniBY7tQE8VXnhueNbsHp9kV0Acf7dfPfgT9lL9tP9tXxUmr/Fy98TTS3TB49Dsj5+pzg4OZC37qxjPd5CWHZTX1v8Tdf/Z5/Zj8Wv8AEn9r/wCPT+LfE1tbeV4f8FaLdK8lgvcsUytqvp/EvpXz18bP+Cx3xA8ReE5fhj+zro8Xgbw2zMbg6VF5U9znrukOZJCepZySx6YHFZTxMo+5TOiGBlKPtauie1/0PbdV/Zn/AGEP+CeltF4o+KfjaC01i30sLdeGPD2oi71CeYqN4nvD8wH8JC7AeuK+Pfjl/wAFP/HPjtbv4d/s/aLa/DXwRLIyjS/C0X2e5vkzwbm5Ub5Ce4zg15H8RP7Z8V6zBJ4y1tri5ucTS2/mmU8ruUySc5JHVc8d67b9m/wDoXibXRoviDSIbqxuPkmgeMY2n09Djoa4a1HEYmm3CpZn0GS43KcpzCDxmG9tDqm7ad0rav1PYf8AglH+1b42+DP7UNt4B1fxRcSeD/GWnyvqdreXbm3injG4XWXyEdejHIBBr7L/AG7/AIpfsa/G74CeING1XxQddv7ewll0+78OaBdX7W06gnd5sce3bxz8xGK/JL9unwD4z/Z/8B614G0vWbq3+yeI4LVbuFyslzps67ljLDnDdD64r7u/4IM/t/aBrH7Ferfs/eNtH1fxP4i+HTS/ZdA0OwW4v9Q0ac4UqmBvVGZkOSTzSyrGTlhE6vxxbT9U7Ho8fZJgsu4jlDL3ehUjCpD/AA1IKS/FtH5RfEb4q/CuG4lGmvqt2AT88enbAf8Avpq8t1Xx/wCHNSae4tNPvUSBN8glC5xn0FfX3/BXX9jPT/2VP2gbrSfDmj3dr4f8RWo1rw/He2/lyQwT/OYHGOGjYlSO1fDbWe3X/sDjalyjwt/wIHH617FebaTT0Z8JSik2mtUS3fjXw8Rv23MeeheKu8/Zu/aM8C/DHxBqGn/ELw3NrvhPXYootd0qCJRK/kuJYZY3b7jpIAc9xkV037K3ws+E3xa0dtI+IOm3cDwaXP8A8TDTRmT7WjYRZCQQEIPWtDxl+yl8K/Ddn9ouPjBpkFwZI4ntL2xb5Zm3bo964zsAGTjvXzlfOMPQxjw0m+Zcr0i2tfRP59j3qOUYmthFiIJOLv8AaSenrb5Hnv7TfxL8G/F7xHb+N/Cl9BHczCSG5sF0r7KYow7NGzEErI2G2k8HgV53oXjXxv4NuvM0fXrq3Un5olkLRsPdTkV7/qH7BsGrjTYNA+JXhu/OszeXprWmqFFlOWGfmHyjI6mvOPiv+yFrPwp8T3/hPXNZnstU0+TZLHHcLPHuIyORwQRj86nDZrl+KreypVE5u7ts7J2emmz0HXy7HYal7SrTajor7rXbVd0dR8L/AI8eHriAWOuaRbW15I3/AB8MxELHnlj1X6dK988Afs4/GHxio1rwp4XkFtqAExurdAyzqRgOCAQRgcHPbtXwnbazfaPFBczQxyBi8VzE46SIcHB+nNfoF/wR0/aH8d+JrjxZ8BYL3WT4Xt/C99r0kdnYi8fSri3jLCUAkFLeTiOXaflyrAfLXZWclDm7HNQpe1qqnFXb0R6F4O/4JrfGz4j6rDoNkdPtryVC+dY1e3tEjUZyxeWQ46dAM1D+0D/wTftPghp+n6Hqv7QnhzUda1G4mS7i8NXYuk09EQkOZcfMSTjHt7V6bqOsw+K9Ij1WzuY5re7gWWCaKTcrIwyCGHUVwmq6SsOo2jTMAWu/mOOvytXG5SfU1aUeh554a/Z3+E3hR4rrxI9/rcsagO8MShCQDzmXd/LFa/xC07wFceGrz/hH/A4gSDT5mjbU7ozKhVGO5YkCx57cg9a7G5trQwtGmDlSAD+NZGp6FZav8NLk3LiLzrSeISyOqDdtcAZYipVyb3R5rpUnibwdoUes/DpIW0iW3W6fRliVWAZdzGF8ZBOfunjiuZ+OvjTw54x+Dl5rum61Pe/aLJkggkvAP3jZyGjI4wVI+uKvaL8UfAngX4YaRaeLfFtnbXcGnRwz2xuA7h1UqQdufSvnH4ieM/hpdfCqTwNpeo3U2uya5cXcl1p+mvLEbdt+EDdcgY7cZrRQlzbE30PddOubO4vJNNnIaaGCHzVI5UmNTjpTNS0yzcuq6WWMilGkVuMEHgg14PN+0XJ4Ike+8O/DPUo5Lm2iUy+ILlwJvLQqHUBRwcdvWvoz4WRal4++GekeMr+zWKfVtNW4kitwSkZYHIGecCq5ZXC6PlnxH4etfC2pSXl54USWIzsovhDvJYE5BHYj9azfE3jS1s7WOHS5IY3JJdVsBnHPr0r3bx74bi0vxTeWkkGYlumHI4D4G415j8W/Ab6sba60iw3yqxWQIACR6mhtc4K9jg1+It0qhWXJA5IgHNFWH+Gl+rlXsWyDg4IorT3QPqT9hX4WaN458Aajqmo6ekzQ6u0QMkQbHyIe/wBa+gPib8CPBPgn9j3xd41t9B0+1v8A/hItItob77KquimRywBHY4Fcn/wSg0+01D4M65LKUJXxKygHH/PFDXt/7eWnpo//AAT+8QvbuF3+NtIHX08w/wBK9bGxXsmzysNJ86R8RaFrej2OpQ2l3cpHNNyodwM8jI+uc13Gnyafqk0VjbT5eZ1SNd/ckCsC50DTtL+HPgy8sEgOt2umx6mkN7YhxdxzTSAgN/EAFHWvVPD/AIc1zTLm01jV9I09kRPOdILTYQwQMFB9c4rxoq69D1XzK3mU9c07w34q8QQ6fYeOFhj0KH7N9iSRV2Pwrtk9eOPwqh4a+GHiO68Q3fiLR7wzWXnhobdbsHzQpX5yh+6B1ArJnvtFt7yOR/B9pFqd9MZXkYEhNzg7mBPfjj1Ffoh/wTl/4Jla1+1Slh8SPGukr4X8Dafhby8jkC3mqOAhaGPnEYHGZGwAOOtQ7y91HTQlGleTOZ/YC/Y1tfj/AOKrDxV8Y11PSfB8U2Ly/ttPkIuypXdDG4GFBJ5f+EDjkV9q/tb/ALbf7DP7G3gmPwB8H/CsV14gtbURafaaPd3FrZWnAxJO4IDtnBKgbmI5ODXD/tb/APBQrw58NbC5/Y3+AHxlgt7HTNN+wW2uwaMgntyiqptoZAQkjBRzKQMk+vNfkX8av2jn8BXlzpWpeND4ru1lZpy7mUKScnLuTz6j8K6Y00opJWOSVRt3buz3T43ftH618fvEEni34l/EY6hPKu0T3t5uWGMYwgB+6o7Dv3r5j+Jfx28NeGIrjSvBGqHV5opCI53TbGmcHHuKofDL4F/taftseJLe9+E3wknsPD80qw3Gs3ObXTIxlQ0jTPgPjPIXJ44r7Y+BX/BFv4JfAXz/AIiftt/HHwzbaIY1+z3GviS2jnPykm2sgfPuTwQruFU54reNOMVeRm5Sk7RPgL4V/BD9pj9szxHcSeC9KE9pYcanrupXQtNL0xOOJJzxnkfIu5zkcV9v/wDBOP8A4ImeJtV1Wb4qftS+H4bvQtOl3abpRujaWN+FIxcXVxJgpbHkhB879eBXvDft8/sX/ADw7afCn9jD4D2+uQaJ/wAg/XPFtuI7WGQkfvoLJerE8+ZLuY+or5o/ac/bT+PPxrme5+LfxZumsy+YtMNyLazj9AsCkbvxzVc9tdgVLmlZs+8PGf7VX7Ff7OXh1/A2qeILTxpHZFRY+A/h7pMdnoVi642q8vHnsCOXckmvl/8AaS/4KmftG/G/TZfAHwqtLbwPoLxiCPSfC7EXEqHAWOS5xux2wuBXypGNb1WzUy2LgMflnuGIYocYRIxwoP8AePJqr4z1K80XwRrV8+tSW8lppUzQJZXCxmGUKNrHGSCCR1rzqjxlZ2S5V5n1OEnw/lTU5v21Ra6L3U/V6fcmdFrvhHUvCMmuah4s1dZ5tLgJvLiWXCeayqSS0hy5Gcc5yea8xuviVYYaPwfo19rsi4Ae0TZbg47yv1/Csf4EaJp3ijQBrnxHvtQ1zWLqXKyancSTRRqMdQTtJ9c163q3w4l/4QZ7/TLw2JnvUtIHiVR5KqjSylewyqEe2a6MPCcPdX3nj5ljVmFT2s279F0S0Od+FnxA+KVzcS2XifwzpyWTOnlw2l9iS2JyGc8fvDg42n619MfsoWsdr4hgBfO1wOa+Q/2Tte8VfELXPE19qy28NlClr/Z9lbRYWHdIwzuPLsVHJPevr39nmCew8TxKAR84x+dd1O1rHjzbck2af/BbzwGYvgxpfxF0+EbdR0mNLhh/z3tJAw/8cavg7/gnR+1v45/Zi/au0n4k/D7Tvs09xJ/Z15qJlmMUEEzBWkdU+8gyMqenWv1b/wCCm3wwvfil/wAE5dTutOt2luvD93HdqFGcQuvlyfzFfkv+yX420rwT4eXSdU0q4lv0vpld4oAwzkDr+HSuWlTVHETjbRu/3/8ADH0Wb4mti8pwOIv8MJUn/wBw5Nx/8lml8j9KP+C3en/H74ufAzwp8S/jD4W8PKnh/VmsbLV/Cl19sa+S6TeqlM5C8Bs9s1+TmveCkjkk1hpZ0ksl897e5sWiZlB5Izwa/oi8O+F/BX/BQj/gmZo9xZfD+10m7sdHaE6zM6LIL+yTqEU9GGAc881+NP7UHgH+zvC51NcFEv2s52zwnmqUPP8AvYH416jtOnorJdD5FTcKtpO9+p8nx/Ej4ifCvVb+DwB4kvdPiu5PMkjszkODyMjB9aoal+078Zry5S51XX5bl4pfMja605Hw/wDe5HWuh+EnjjRYfFK23iR54VvtJ8gzQWwlZJY2/un12kV6Fd2Hwtv0z/wnNypbtPoh/oK82dOlKXM0r+h6Ma1aEOVN29TyvTP2zPHthKr6hZaZO6jCu2lqrKPYqRjrVvWv2tYvGF82oeIdESS4kOZZoZ8M5wRk5711Or+B/AFyx8jxXYy5/wCemlsv/stcrq/hDwXpe+4u5rGZFz8sdgSWHPTisFQoQnzqKT72NHia848kpO3a55peX9zrV1qdzbWmy3mujcWwVwxQnOV/L+Vffv8AwQy8TeEvhJ4e+PfxO8XeKNNsryT4VT6LoNld3Ijlu7y+mWCNEz0AJ5J4r5f8ZfBjw5oPgOz8f6RpCwCby5XdVK7onOCCvsa+w/2Tvh34dX/gjx8bNQ8CeGVHiHX/AB/pth4q8RarChgs9KtjHPbW1iT832iSR3dwuAFRc9q0qpuhNX3X5nVlb/4UqMuXmSkm13SabX3Ip/8ABO/4i6fpegeJvhP8UvGEOkpoOpM1g92rz+WG3B4lWIEld65BHA3V6zceJdH8ZfE238B+Cg+rvHK039pWVtIlvsCvk5lAORjp718h/sxXWofsw/tO+DPG0+rvcaZqmqHTr+UrtOyXjbz65BHuK/TPxb+1X+xvHeyaNBo+p6rqgBWX7FokgkjfDcGU4Bxz+tcVSPsoptXfkViascViak4Kybb131OGg/Z502SQHVfG+q3Clcu1mqRKAd20jjODjHrXy1+1dYfD74S/tBiLxTp/2nwy+gDyLPXr6Wa3ubxYLjzHXbj5hJ5PHT5q+iPjp+2VP4HsbHW/Cvwlvb5pWube/juT5MaRAboWBUnLtkg57DFeG/F79or4efEZrbXvFBsr+S2RpILIWJlksCwJdTkYzxgn2rmc8VjarpuMqUGmrppP1Xn6k0sPH4YyUpHi/jTxv+zjpXivSJ/hHrF9KYnnt9XurTw8RA0P2fZFMkbgkymUyM3/AAH0q5Z+Lpf+E/8AFepab8Kdc8UWGs3ttcabc2enrYMfLjKMjjHyo4OCBjOM10dx8a9DE0VvoXhu5laeURw+TpyJlmJAAwPaoPEfxh+Imi6fc3/h7ww893aAs9rfAoAFzuBwewFdWKo4eWFjhak5S03crSeqd7qz3VtLaaDlh6uHq8z/AC/zPLfHPwJ+NHjfw9/ZkXwNsNPm2BY9Y1jxK0t0kYkd1VVPyxj5gpA7CvVPBXhfVfBfw00Xwnq/j6aK40/TY4Z7awUusbgHIVu496uab8bPG3jzwfYavpPhDSrZry381jJlyDzu/DNc9cXXxg17WLe3mvLXTreWUfaS0SQosYyWGXPJwDjHes44mnKp7JPX+u4OhNR5yvdeGPBk93JdajqOo3EjMSzSnbk9+9UdWtfhvZICLZye2+fNeZeNW+Iz6jqV/L4tlW1h1kWqLEynMZJ+bjqQKuJ4H0K5QNqXjDWrhgOTtIHem6kU2uwvZtRTvudM8/gMsT9hh6/3qKy4fg5pNxClxFeaoVkUMpM3UHmiq9ouxnY+3v8Aghr4L0nxF+zf4svL/T4pXTxyUV5EyQPssZxmvY/+ClvgnSrb9kh/DljpMcovPGenM0BnKgbUmy4HfArzj/ggsA/7MPjAoeR49P8A6SR19R/HjwtofjDRU0XxDZiYwf6VaK/RZAwXPX0JH419Xi6cZ4W3p+Z85RqShib+v5H5+ftjx+GPhT47+H3gW60wpMvw+0mCJ0kwISS52kZ5JZiPxr0f4kazquofCTytO1jyL24jhWG2t9gO3CEhWzx1wfwrq/29fgFq3i/4uzeIfDPirSrK7PhbTrG2t762EksLh2dZUyDsHYsOgzXp3/BPT/gnL8UP2ldO0T4jfHbw9qX/AArnSoJJtZu9LybvxC8CqPs0CoxIDsvLjGFDAYOK8CVGSqy7H0EZ03hYNv3vT9Tif+Cdf/BOnWv2iNZm/aR+Petnw98NfDTl7/xJfuoN20e0mCAHiRhjBwCASOpwK6P/AIKL/wDBWrwJ4c8Dt8A/2QJf+EO8H6WzQS2emzBJtVkOwb7hs7gGGMDOTk7vQdJ+3fr/AO1F+0hZ23hb4P8Awh074UfDbw0hs9CXxBq50+GGJGUeYtsWyZO5KozHnJyc18vfDP4Pfsdfs0awfiB8ZbK4+M3iCVA0GmT2ktlodtJ8hZ3MhElyOSCWAA4q40VTd2jP2ntFZM8P+Efgb9r39sXUwvwb8Ia1cWd9J5K6slu5a8bcqtFEw4wuRlsgKPvGvsD4df8ABLT9iP8AZ2+H0Gt/ttfGO21LxvcbZ5vCumT/AG1rJQVby0t7ck3MjKcMzMqoQTk1578Y/wDgoN8fPG3gyf4Z+B7q08D+GLGOC3sPCngeFbGEh8bIZHTEjHahJ5GeCc189vq/xKvbyK0t/Fd3au88USz6bJ5TzmXYGLuPmbK8cn19apt30LjGhC3M7+h9yeJf+Cq2m+GxF4Y/Zr+Glt4e03TbcW2h3dxBHeaiirsXMaEC3tG7AhSw5ySRXxn+0D8evG/xR+M8mi+JdEv9S14xC61bXtb115zHGwBwCMgAd8YA7CuY1ybW9Q0i78M27Lbwz6zNbzT2w2ST28fCxkg925yOtb/h3w+g8SeLLydyxsPD9vbMzNnnZjHJrN03KSbOiGPlh6UqdJJKSs9E397PP/EPjvXtIvU834jx2UU42xWfhlNzSLxnMhBbmuv+FHgTwr42+z+JrOynuJluQv2jUy0kyyAjP3yf0rlNQ+Enw/tHtHvdd1tJBaRuYdP02Jkj3YOAzSAk9ea9m+BWjWHhvwlDe6e8z2huJJYnugBIUXuwBIB47GqjHU4XKTZwWn+IvF3iDxrr1/J4guRb6TY3bx23nYRQvyKAO5BOcmue1fwzb+H/ANn7XPE2kahDcnUbaCK+eINvjndwpjkLfecBckjjmuj8LXvg+X4Y+Lde0201JdfdxBqE81yptnhnuCYxEg+ZWAT5iTz2rR8b6c6/s5aDoc0O2TVvENqGXbjckavKf0IBq1C87ApaXD4deC/EFl8LoNes4NltbanHBeSBhuLSIGQYzyMD0616x8VhN4E/Zos9du5B5qR6ldA56n7OI1/H95VLSPg3r13baZqcMEotAqC02yDYZsLl2G7ggHGcVN/wUEsrzw9+zlp3heC5Jkn05ohz/HNeJEPz2mpoRkpSk9UFVxtFI8q/YcsJtO8NeILzUrV4WbUbCJQ64JAVm/rmvrH4T3KQa1BcRjGWHOK8k+GEFnL8O7RYdFms5vtpiuop8b2khQJu+h7Cve/hJ4KlvNEtNXt4ydsmGxXVh4VJRTkrM5a00tnc+zdK0aD4ifsreMPBEsImbUfCt5HDGRndIIWZPxyK/n0+CHiuSwu9Zsbldjw6yfMVjypOVP6qa/ot/ZVsoFtLa1uzlGKrIrf3T8pH5Gv5+vjx4Gi+F37afxj+EcTLYpYeKb0wnbkqq3BZQBnoVenVilUubQqzqYP2Teid/nZJ/ofsL/wRJ+NEuvfA3x98Gb68wIIF1axR3wAjoYpgPx2mvzE/bQvF+xeKvhhD4maPUbTV/wC2rKxUcXUNvOxeMtnA4+b3xX1n/wAEFfGOgD9oXw/o/jLUImsJZ7m0vzcTBUeHyWb5znoMZP0r5F/4KB6novhn9tvXrLwxozaxa6heX9jo6WzlsRzMxjlUKTuARsgd609o+RpI4VT/AHqbfX/I+UNZt4tJ8Vx6pasAiaqk6kdPLlAf8vmIr0q809IpWVRwCQPpXkvjPUx9gjMZ+eKHyJPUPDIU/PArqNA+Mn9qzH7RYCS3UKhkhPzrheSQe2a4pHpJaHW29h5txHGoPzNiu08DeErDUZ7m21KzSRfLTG9QcZbHFZHhW2XVL+0ltNrpK+VI7jFen+FNDW0ublZRhhCpGfaQUoRu0Y1JaHcfGr9n2DXf2f8AUdL0aJRJb6WzW6qO6rvAH12j865D4NeJPH/gf9j0/C69vmTw/wCOdatfEUFuG/1z2nnWbHGe7hcjHYV9J6Ikcnw9ka5kDg2g3ZPUA4I/Kvkj9s/4qfE/wLp3g/4J2ulWmk2Hw/Gt6PolxZybrm9R703hlnDHCnEsYXH8I9658c4zqexi9bJ/j/wD6DIaVfBYCWZzjeHM6a23cenpdGf8c9Jkm+HuqHTQReaGYNStHU8qY3DE5+hNe5/ssx+PviT+014X8d+IVu7rwlr+kPe28pRFshi0fdCzcfvFmVhg/wBa8r8E3emePtE0yXUimPEXh3yrhcj53YNC+OexOfwr7O/4IV2fgb40/shfFT9m3xx8OtP1DX/BV5c3un+ILiTF1psLxNhIRkf8t4mz/vmrlTvBXPGp1eapKxt/ErwV4d1cxWIsUNvNEC6xcBg27JH4E/nXy5F8CPil8QfFer+CvD91o2kW0d7LAssgRPPhy+1HPLF2ya+4PGvg0240uaKIBXtFCqOnAX/4o191fsYfD2xvf2QNI1qL4TeArlP7OvEubu/0lWu52SSYM0j+Uctxxknt0rKtSTa8i6E2rvufjHp37CHiHwt4aGg2Hjmxglh1M363FrpcsstvOFIChyCSBgfWvP8A4heDfHdz4jvfDt34isblQxt59UFqUlnBDAtg8qRuI7V/SR8IvB1zY/D3w82g+C/B8du3h+1JuLm2xPI/lZJfbFg885zzzX4+ftx/CbxDrP7bPxPWDTdF0+OLxPJuis9+wkxKcqMDGe4wOc1ySwsI1fa8t5d7a/edTrTnHllLQ+Ff2TvB4sbbUbAw6prrRX0ttbaFaWsrybk34lJjBO3nGB1r6k+CFj8fPBfiHWdZ+H/7Il1qEt1F5N7HqHgCTU1syAxzGJ0IiOGyeK+pP+CJ/gjxLoP7Tnjaw8Mz6JZ3Z8NxyTXF7Yu/AmIPlbSNp5yT3r9JtK1f4l3Np4q06y8b6HEbTVbi3uJv7GlkPmeQrE/64c8j8quFCLm6rVm7kOrJR5L6H4m/Ef8AZL/br+O8L/ETWP2MNfu4n0x/s93H4Jgs4VgKMRIqRKi5xzuIzXw5rKWHw90WCLU7G9vJZH8tY7S1MjlhnIOPuge9f1I/C+9+LXiH4P6Fdf8ACV+Hwt3o0Q/e6HL8oMZHJExycda/nL8XeCfHUfiG9sdCvrHyf7Ru1aSSF93yySZwAenHHPepq01F3XUcZ6WPJdPsfGUthBLH4duolaFSscnDIMDgjPUUV6ZYeC/F99Yw3v8AwkEQ86JXwbFTjIz1zRWXMFj2z/ggO5P7M/jAED/kfjkf9uiV9RftMePtJ8BfYNQ1KF3imh8ghCAVZ5FAPJHANfMP/BALyx+zV4yDr08ejH/gIlez/wDBQu9l0nwK2rW/iu10WC3tN93qN4sZWOPzUHylyArZ6HrmvuqvJGgnNXWh8rDmliHGO547/wAFC/jlH8L/AI5TzPFHIln4bhuJ5mYBgFgYBQdw6sw475xUvgD/AIOIf2hfCHgnw9+zXo2oaND9m8NIqeI7CziBAwpEA2tgMAGGQAd2cmvlP9rfXfHP7RPxusfhr4f1yLxDZ6xpFncXOqeckrTQRE8+ahx/CoOMc4FfXPhL/gmz4D1H4PfBjx8fBtmbhPh5rVlfx+Qo8x0v8rI/OWcLIw3Ekj8K8WrFzqKSVkuh79CrCnhZUpK7bWvVW7ep5nqf7aXxV8faul/ceK2ZxKJHJYMWf5T/ABE9wCccGtif4++OvEl1p2keNPsmoQTW1xBi506NsgyLI74Hc8jNcN8Qv2d9b+CKTXE/g6XxF4et2JafTwTqFkgIPzRg/v1A/iXDADoaz/hra+CPHj6E3gDxzJcbLe8luHtpiWgdWUBGRvmRsEZBpe2cvkCoQZ6B4t8U/Crx9La+IH8J2eim71K6+2JZzf8ALWLT1SH5cjaAzZ4FaPhj4E6JHq+nyazfadEz69dajbGG6VxJYQWyuuPm9ccda462+FeuX/xVttIeaPUUtobqRo1wiyjbChBGRzg9a1PEGmN4a8XaNNe+GodOZbh4kWMnZJmBsggkYGF/nUc6buX9Vk0ow1H/AAb/AGRtY8Z694PXx7cS+HdI8WNdatpGrPb+cLm3Dv8AMiq2S29cbeoFZXgT4OW/iH4T/Ef4ut4s0+3tr7xudHsoHLmULGUTc6/wKS3GTng12vhzxnbaGlvqmlX2pQHRLW4ksI4dSIW2Gwuwg5ITLZJAH615P+y54q1DU/2V/EOk65ruoPFrerXN5Nb/AGkMZWLrh1Dc+ZlfvCrg4y0aMKlCtSb500/TzOk+IH7IHiHSNW8Sadpni3Srn/hFNJSW8S4laGWby4o2kREbqVDjrjNdVoPwctPDv7Mtr4qm1+F70aMkn9ngAMPPO1Rnd1BYV5lp+g+NLpDqZ8Yrf2epM7tNrFt5lyGYKrkyAncTtA5PavdLv40a14y+G6fC6eax+zpa29vaN9gi3x+S6MmSuCwyuCCeRmiM6Unp0JlTqwSb2Z5x41/Y6k+DGraN8MWbUNRvfFVzZtNZ/YHilJiklLLErnLg/wALDg1yn7UGgX3g/wAdeGfhzqOlT215py6rqeoafMAJLRUKwgOASARgfnXtutW/xFfxRoXxD0D+y7jXNLv7i/ms7W+ntoIkkyirC0ryMpAZiRnHJwBXgP7SzatqP7QEq32pMb8+A4zqMizsxLXF4XkBZjls4HJ60qsoxi5Le4oKbkk9j6c+HHgSK98BWnjqXUnicyQ2ptgPkcGMMDnP3gPbFeZf8FBtHt7rSfC3h9zu83UNBib5um66klIPPpiu78HXmr6bLb2bXUhso7IO0CudgcRqA2M9a2PEHwp+H37QvxA8WaF8RLG6eHRb/TrbSL2wvmhns5orZTuQ5Kk7mPDAiqjBwiooOdTd2YNz4JtrCyMsUseI7u4LKTznI96+gf2TtHtdU8IPYXUSn9+QDjp6V4p4o0PSfBQXwZpet32pw2NqoN/qcqvcXDlyC7lQAT24A6V79+xhPYz6YLd3AJlBxn3rspScp3Zy1I8sEj3z4aG58O3gtIlK7TgYr8cv+CqHwv1/w3/wWl8SaVoECJJ470qzvLMSICryTw4PBIBJZK/brUtH03QtVt7xQNku0g5r86P+C0vwOs/E3/BQP4OfFRWS308eCp7jXboybD5NjcAsAQQc7X7dqHDnqKK6jU1CjKT6I8+/Yd/Zh+Plh8Qr7UfDPhy11WLQ4Uvtd0zTZwk0lsHxNGu1gDKyZG0HJFYX7bb/AAJP/BUOw8WfBC/t28M3Ot2FxYxwoyfYvOiCPbFXOVMZ+Ur2IPWv0G/YR+Nn7PPhbxnqCaL8SfB2n6ZHoKkLBrVugcs+Rn58s+OvU18Ff8FIdI/Zo8P/ALT2o+IovivoWi3MWrDU7GaO7CLdxbiykg8FdxIyO9bezVOem1jho1PbUeZ73PzT/aB8ET+Ffid408I8IbDxLqSxr6ATmQf+OsK3PgR8I18Z+DV1/T9V0izdZZILiS9uJd7uMkBlVSMYPrUn7VXifw949/aN8WeMPBmuWup6VqGtROt7YzB4meaAB1DDqdw5rT/ZN8c+EPA/hPXNH8f+JLXToprpJbM3e8iV1BR1G0HtgmvLnGLqtdD2YykqKfXQ9E+G3w31zwlrUd3qXifSJrOEsUjt7iRmGQcAZQcV3EusadY38nnapGjSRcAKzceuQMdq4+3+PfwLtocXHxM09mBOFSOZuOfSOr2jftRfs+adcCaTWpryUSHMkGlSOWTGNvz4GK58ViHhaXNCDm+y3PTyXLKGb45UcTiI0I2bc53tp003b6H17+yd4fv/AI+6voXwm8IzRT3WsXpSW4cHy7W3TcZZXyR8qqHY4OcAetfNX/BbDRdP8J/tUXS+G/E+qT6Frz2GsW82oSqzxrLbfZnK46L/AKMGA46819i/8E/vitpGl/s5fFb9r7RvBevxeFNN0CTT/wDhLHs4ra1tHU7riOMNIGkkIKKAgJ+bBNfm3/wU1/bJ+Gv7V/i7StX+GUl6TpmjpZOl3amIssZYqVyenLHB6bq5cBSqVadTFYhcs5NJRe6S/wA9z2OKcVhMI8Pk2XVFUoUk5Smtp1J2cpeisor0Oi+GnhS88DeLdC0Ww1ibVbeK5kihuQvEaSNuQEBjjkZ/EV9J/wDBKD4yv8Bv+CiPxS+H8+pjT9N8X+EruRjI21SGCzDPI6bnFfDunftB/DvTPDU9rr+oarBq9lHHb7LSFmMsipkTI4cAHoDnn0r1v9nn4+eA/G/7Y/w08QaOt+/nWh0bWru6tfKErSB0jH3jkDIySe9dspqMVbU+ZwuG9pX952urfij9RL34oaF4x8Ixan4SvoZ/7JEts01whCGVEVckfe25APFfX/8AwT//AGr/AIVeAv2M7D4TfFjx/JeeKLaTVo7q4tNDnWGTzrieSIrwQFCSKOvavhv4H2Hh8eE9VgiaMkeILyOZN+QCGA29TjjtXi+qX/w90LxXq+mt4g09LmDVJ0lim1NN6NvPykM+R9KwqKTqKd+m36mkZKFJ07a336+h+uPjP9sz4X+F/AGjab4Z+J3iywv9O8PRWtvb6J4dFxCb1VwXnEgy0fAUYIxknNfnx8dfifN8Q/2o/HvjWG932+qaw00RMZQMNigHaScHg8V4Te33hzUkOy7spR0yk0bflzXMan4p8faN4YluvA72K3Ek5SOXUImeKKH5ssqqcEg4/Ckpcsrsl3a0PtL/AIJ8/H74VfAr9qnWNb+KvjO80W3vvDca2ktnYyz+a6yksjCMEgY74r7B+DH7XH7Nfg66+JuqeLv2j7jVU8WeO73V9CgufDt8hsLOW2jjjtwPK5Csjc+9fifqOnWl3Pp/iy+0eyttbu4w+pXmm7086Tb82DuzjPOK0nGpXUe17vUGHvdy/wCNK62H73Q/aL4Xftw/sp+CPDVk3iP47XkV0vh63sJdOOlXrW1uY1bLoBD95ieW+lfj3F4l0fUpZ7yC6HlyX1yyOQcsrPJg4PI4OcGuRuvDl24MzX96gBzg3cv9WrC0qy1GPwrZyaZqDxNvOWVucbjnvU1OVpWHBS6s9K0i0tIdJtYWuslLdFJyOyj/AGqK4R9G0t3LuWZicljIck/nRWPKjXU1v+CQn7W3wa/Zy+BfiPw/8T9fls7nUfFf2u1SKyeUNGIFQklenPFd3/wUJ/ai+D/7VH7POv8Ahf4X6zNdtpyWl5qrXNk8UUMKzr8xLEZ54x3r4G+FFwIfCIDHGbpz/KvoD9ljwXpnxP8ACXxM8F65eGCzv/DdvHPOr4KD7RnOR9BX3NaMP7P5mtUrnysIy+t6Pdl3/gnX4WbTvEmleNpdERtHTw7d2MV6ZQQZ/tYYqV3ZAI/Sv1x8FfFDwV4c+Gnwe0rUbCNLC4t9UsbyeWYfulmnABHPABwTntmvz1+C/wAHfCPwg0GPwp4PuZjbIfNQT3JkAZiC2CecEgnFe7eJfGMOq/CDwr4fg1GUz6PNdLLGyYWMO4IIIPzV88qqqTuz2lBwhY9S+Lvwls/D/iu6tb+MmESEHaOAueHXn0/Svkn9oz9gvw5qnigfEj4Z6tL4S8VIRPb6xpWVgvcYIMsa8NnuRz65r7r8MX9p8ZfgvY+JLbTpBdaRbx22qXEtzveY9FYjr2HPvXnPiWLTjC/hTVF2IWJtJT1if0+hrixnPTtWhqluvLudVBqX7qTtfZ/ofm637SnxU/Zt+LWkxftH+CpreFftFpPr9uC1rerKI9sqSfcVgyDKttPzdK9I8dfHL4d/E+Tw1deHvE8NwU8RxK8TNskXdbTfKytyO1ey/Fr4aWWvWd54X8UaXb3tncqUntbmESRSqeOVbgiviT40fsHeOPhrq8Xjb4FXF1qmk2Nz9q/4ROW7xPbMARm0mP3gASRE/wBAaIVFOKnF3TKalCdno0fQWsW2nQaFqU1lF5bNp1yMKeDmFh0rgP2OYZ779njw7O+npOjwyPuV9sgzIc9683+C/wC0prfiD7d4N1KS4vZIrOaO5tLm2aK/s38sjbLCeTyeoyK7/wDYu8WWdl8CNC0zG5re3ZJIjwwO89jyD7UnOTeh2UMbXoT5r30trrp8z1bUdEsv7LOmtBMkDrnYFwyDP16Z/rWTpNnB4Y1iC/02JJD127jtK4HJBPDY7101vrltf7jBcI5cYZJeGx6fSqV5pllLdo07MjuGyyHBPA60YecIOTn1dztrYyhiKdOEoWsmnbZl+38fyNqN3JLHNbjZHEnHmBNq5IOOuSa8Cm8ZaHq/7fWu6Z4luIrqybw3BAI7lvkYrGjAHPoSa9Y1Gyure+uxp115xD7nWQ7ScqOcivlHXZbib9vLxFFNbuUhs1MvyFto8lOTivQ9nRruKjLc5KuFw6nH2b309Ln29D4uc2bGzuCm6HAZBkbQBgccdq2fgZ4t1WfX/HOsy6h+9l8YzByOc7YkA7+1fMkOtNZ2rNYXUqqUwslpOVKnjsD/ADr0/wDZq1rV9S0jxte3HiCUXA8X3rWwmjRo5AkSEhz1BPPPrVYunLB+9N6GNXLZ05qnF3bu+21juvij4umbxFd5VcxxQplf4uNxJ9+a9f8A2PfGVyLyKBGI3SDqa+RfiT8XY9N+Kt54W8QW6wqSipdq+FDbRhWHbOeucV9Gfsm61Da6nbOXA/eDJzV0lKE4yktGrrzR5WIpSjHlZ+gXizVJrvSNPVmO4Bec18O/8HEfhnx/ovwM+Evxy+G1zfQatoXiq6sTPYwmRxDcW+SCoB3LkcgjFfZF54gs59KsmMoJCjvXmH/BYa18U6h/wTY1fx98Or82+t+DNY03XLGZYw+1UlCSAqeGUq2CD1FXXmkicDSnUxEYLeTS+8+If+CNvwA+MnhXwHq/xR8WeJNK0G48baobq2TW/Cq3d7JGqnEq7yBGjkkgfnWf/wAFYP2HNc+Pfxoj8Yaj8ZYdTvbTQYra3R9FhgiiUEsYysRwDk896wPhH/wUl+K/wTs00r4v/BXSrS5u4AYbnS/E4tDJEQcF7dy4VTnOBtBqp4g/bz+HfjnxPcX174o8hrlslL+6VyG553r27DilQrYSpFRbVi8dgMxwVaUZwakmfBnxC+Gfj/8AZ/um8BeK/DEVvZ3OqRXS3yISJzGSBtfOMYPI61z3i3UI/D+oahosmmW11E8rPAbjOYS+DuXB6ketff3j698G/Ffw1PZ3thYa/YuhaSGKVJRjnkYOUPvXx9+0z8I531G58Q+ENLcWlpcC2mt1+Zok8tShPJJ4yM1NfDRgrwd0YUMVOfuzVmeIXWu+Q5C2kYP97n/GtvwBb+JvEs839jaE1x5a4LRR7gpPQEkge+Pasyx8E6jq+qW+kxIfNublIUBIBLM20DB+tfp9/wAE5/gfpnij9q3QPgtZ29r4Z+HvhG3eTxT4qu9NSSK4uYoCxhZ5PkLPIcbTknnOOK8XE1qsK8KVOKcpX3dkkt29G/kj6/JcowuNwdfG4qo40qXKnyx5pSlO9oxV0tottt/mesfGT9jb9m/9nj/gnxomneNPEWvatqVzp1vcpp0viSZNOe6kiEkkkVpG/lFQTjJzyD6V+S/jp9FtvGskfhzT7S0gafY3lRAgKxIIyT05/Kv0e/4Kk6TJ4WbxF4Q8Dwa3a6J4RvPsbQ396J4LmRnffLa4YiGP50JiJyu4djX5l6noV9f3Ms0+oWtvuctuluRnv2GTXesXRxNP92tU7P1/4Y8nNMlxeUYmEarvGpFTg/5ovrbo00010aI7/wAO6zqt7LoumaYZ5hKUuGtoy7SuuRknOenfivo79nbwXefBa10jxT4jt0TWX1C2NtascyoPPU9AeAACS1eV/D3wld6nqd74xtdQu/IgOJ/sh2F32HIDHoDjPryK+gvE/wCy5+2Bpv7LWiftmeG/hncWXw51nUDaW2vWk6zz7xM0IabJLqjyAoG6E+lYqvGM5Rgrvr5f8E0pZbUlClVxEuSEnePeVn08r9T7U8ReEPid4d13VZfhz8RoNDtr/U5bma2i0KCQmRicsWYEknAr3L4Lf8Ey/AXx78CWvjHxx4P0TU9W1OFri/1SfT4kku5fm3SMVxhjj9K5NNPufE2nw32k20crPGokjE6Bw+DkbSc9RX3z+x5Z6XoXwO0ay8TQ3djdxWTB827FQMvgZXI6GsaWKw7rSpqS5l0vsYYrD1uZuS0ufDfi7/gkn+zppVlJc3Hw3stozuMaFex9DXzZrH7HPgnQNZ1HRPCWtazpFrDcusdpa6tKEUc8BSxx1r9j/E+geDtY0aBIvF2nh50Y+XcSmMrw3BzX5p/tH2WpeHPjDr8FlG8kIv32TQ5ZG9wRwa6KjpNI5YxnE8Bm/YE8PfFaSHR9f8b+Ir1dPDfZF/tVlMQPXBXGeg61W1H/AIJe6VoMLy6R498YW4jBOY9ckIH5mvrD9iextfGXxEuNK1GOZcWxfCwkng19j6d8D/CWreFtQa6SIMrspE6mM4Cn+8K0hGm43InKXNofjNqv7Dfj3RrRr3Sfjb4wVEGQr6luBx25rzO7+EP7SOmSSxab8Zb+OFZG8qKWzhfaMn1Wv3F1X9mrwdd/DWYQ6TA0ps2KOs6luh96/MLxhENO8SXun4wIrp0Ib2YiorUobodKpUW58xP4D/am3nHxpl6/9AiD/wCJor6ThstPaJWcLkqCeaKw5Ebe0Z8JeALoweGo03ctcSHGfpX0r+wrr1ta3vjKynkGbjR4Btz1Hnc/zr5o+HHwv8Z+PNChvfDWrx20UdzLHKJIyxJ+UgivpL9kT9mzx34Y8RanrV54zEouLBYpo5LXaoXeG49+K+hrY+EaDo2d9jyqeGcpqpc+gdP1iIXAK3QUBensKmtfHZdBam8+QNwpPvVMeArOxLtd6pJI8cZJ2gAZxUfhXR9ESZWeLzMN/H9a8NNqR6fKmj63/YK+JCxavP4NvBB9l1mPyTLeNhIjkfN9e1dP8dfh7Ha6tO63cLqrHa8L5U+4rwn4Qa9baBrlpcwoAkcqnHqARx9K+1Pixp3hjxt8LbDxb4ZggFzLAC9rDyVHGcjtzXUnb5nPJXXofK8ulaf4osm0m/kKXcKk28xH3h/X3rzfxP4Rvba6ksbzMbqcEKvb69xXq2p6NrRvfMt5orV4nDB3Tc2R2xV3XNE0rxjo4niWFLqMYJVsgN3X/dPavncVJ5RXUv8AlzJ6/wB19/R/15+zh0swocv/AC8jt/eX+aPir4/fse+B/inNF4lhnutF8SWXzab4l0h/Lubd+o3Ef6xc9VavjfxdZftH/si687fET7RfaRPckxa/aqXtpyTnLEcxMepB796/UrxBot4jyW32Eq6kqwfsa818T+DptdsbrSNZ062uba4DRzWtzGHSRTxhlPBr0U/tLY5La2e58rfCr9r7w54nt44NQ1BGcY++3IP1r0mX4v6eJre5iu/NidtpYNnbkd68C/aU/wCCdureGr2fxz+zpcNAwYyTeGJJSB6n7O5/9Ab8DXnnwC+KM1hf6j4L+MGr3mkXsLrHbJcWpJhYfe85D8208YZemCaPdY1zI+3dJ8S22o6hcBLoM8kasFPUjGK8P0dBZf8ABQrXpH4+26FbuM9wYx/hW54R8Qahouo2Wo6hLHNaSxhbfUbWXzIJ14wVccZ9jg+1c74y1u00f9s/RvExgkkS98LRhkiGWYqxXilaxSk7nvPiPwH4c1i1aZ9LiilLJ+/txsb769ccGqP7PTy2Og+Lo7WaFlvPEupRMlwuQMkKHBHIYYFXLjxXaz2AmtZu6HawwfvDqO1cf8CNanGh67bg8p4pvg3PP36ftJyjytto0dWakpJ6r9Tlf2hrDWrrx5qetXGlSmBhEDNGpdchAOvbpXr37B3xutdS1q3+H3iC/CX0bAadLI//AB8oP4Ae7j07isqZJrjWrwSYYO6Eq3IIK+hqew+CfgnxBqEd9bB9JvldWju7I7drg8NgdCPUc169LMITw8aNZbbNdPkXGGExS5ar5H33XzS1+65+k1hrBk0q2zcdEHGa7T4veFZPjB+yx4t+FAZXbxB4YurOANyPNKEx/wDj4FfHPw5+Kvxl8GaVBoXxE0tvENlEoW38Q6X80u3t58fUn/aHNfVPw0+IVn4h8BwTWl6rHb1DYK/UHkGhSjVW5x4jLsZl01VjaUVqpxfNH71s/KST8j87f+CAf/BN/wCBH7dvxr8ZSfta6hNq9/4Qs3a/8JT3DJc3tyJvIcyHO/yYyPur3IzWX/wU7/4JD+Avhr/wU00v9lP9jy7jJ8XWttNZ+Hrq+VfsVxIGLWySOeCVBIDc9K97/ae/YC+I1r8aZv2uP2F/irP4C8f3DNJqtrbXrWkN/KVw0scycRO4ADqwKMRnrXwx8cP2cv8AgqBp3xST4x+J/ht401LxHbakuoJ4lsNRS/mNyhyswkDBiR/LivPr06jjyK514bEYdY1Yirqm7tP11W6v9439ub9jH4ofsBaxol3rGl3/AIW1iaMSRQ/bFdpogxjM6sh2kb8Bh05Ncb8GP21fFPgq98ReI/8AhDfC2pX+sTxR3ya3ocd1FE0aYLRo/CluM1tftdftGftn/tQ6xP4l/am8BeLLjXG0X+zLdrjwVLDbW6bCokGwHDAkvxwW5NeOeC/gD8a/EFzq2reGPg54tv7A3KE3FtoMzBW2Y5GARnHpXPlnt8LJUpzct3r+R7vF+IyvN4/X8LShTa5YyUFZN63aTbaWiuu+vU9Z8Q/tl+MPFErmHwF4C055M5n0jwRawSr/ALrgZU+45r6/+E37aOhfBfwlrmr+LdJtbTRb7RcaK1xA0sNxqZtQk0DxLyzuJCwk/hZBXxD8OPgN8SNK1p9f8X/BvxcLbTYjOlqfD84a5lH3Ix8vTPJ9hWlfa7+1ReTXNrcfs561qVjO5aLS9S8OSPDC2CA6Hgq2MDPeujH0alScK0Vdxurd0zzuG84wuDwuIwGKk406zhLmWvLKDbTtpe6bTsZfxs+OHxK+M1h4w8e+JvEl/PpNjoiaLpzXMhBuZWkAV3AOGuGUbnPPQDtXzHBbG3lMhYE56mvp/W/2df20vjjZ2mjS/CIaJpNtKXtrKYRWMEbnq2zJJOO55roPDX/BJH4iXkS3fj/4t6NpYPL22lWz3Uo9txwua5sHRrRUpTWrey6K1vIviPNcFjqtKnh5OUacWuZq125OTstbLWyXlfqd7/wR18T/ALEmjXniCP8Abilt/wCwX024OmG6LGH7SSiM0iodxZYvMMfbfjNeg+A/+Cknx8/aM/Zp8O/8EuPhl8LNJh8BaRryeZ4mtoJWvrrS4dQe7iWbPyR8lckctgCuV+DX/BNP4YaNqsuxL7W5bWYJJdarjD5XcCI1+UD/AAr7D+F/gD4dfA3wvcf2Rp1vp8MSZ1DUfKVceiLjq3YCuuGHjSg5zkkm726t3OH22Ix9WnCEW3CKV2/dSXXy7s+V/wBtLxT4E+EPxG0+7+JVxd2q6zayfYLiLzCqmFsODsYbT86nP1rn/Af7a/hPwhKlp4F/al17RZMfJHF4mniUdeznH4VX/wCCjGuS/G3xXpGpaS8NrZ6YJ4LO2kTdhGwSzHu5KjNfJuufBbUJ5DcPoNhdNkkuvDd65K0YOu5Sh95nJtO0J381sfoZ4U/4KO/tHTrNYaL+1e2sQRybVj1J7e6OMHkk81X1b9rj4+6pc3F7rkOg6oJHJWT7M0bEc/3eK/NXUvAEA1N5JdEuLaW3G2dbVCgdiCQSUPBwak03VfFfhmeU+HfiLrlnuU+Xb/bmADc4Hz5yK56lHD1VacQhVrU3eLP0u+GP/BQfxP8ACXxNL4m8Q/B572KGJtw0XXTbSKACSckdPavor4e/8FzPg7qGjJP4r+FnxR0lbiI4WDWLe9UAg4O1gM/Svxg0j4y/Ha0tUW9+IkMxcEPDqNsJABz1YDkVp2/7RPxTsQILrwpo+opGMBrK42ZHsKdOjGlpTk0vX/MVSftPjSbP3M8K/wDBWf8AYj8T6Quka58Ztb0KQwlB/wAJR4HBjBweC8J/Wvg/4g+O/APiTxbqGr+EviRpd7BPeSPE9vdqgYFjghWOV+lfFn/DX9rZyrY+JvAmo2bsOFVlkU/QHrWfP8dfg3q6ypchrWSVyzGey2nJ9xWtT280rS/AiCowesb/ADPsweKZkG1det8Dgf6Uv+NFfE3/AAn/AMKf4fEFljtl5P8AGis+TEfz/gXej/KfRf7C+l2978OLyaRQ23WXHTp8iV9W+BPsmkWkwWPAdBn3r5X/AGBST8NL7n/mOP8A+i1r6csriSHSzJHgHYeMcV7ddWqs8mnrBIZ4k8TGJLx4ouHGFJP6Vi+GdYvJJAvkADPJzVDVbqa8jZZm4MgzgVb8LQIt2pBNcF7yO6K0PVfAt5qNwsMkVuVJONxHoR+Vfc/7KHxD0KX4bXfg7xFF5s8qD7P5ar5jHgYJPQc18E+G9SvLQGGCXau70+lez/A7xLrFlrls1vdlf3q9s9xXVT96NjGaUZXPS/jFoUPh7Vri3ltvmZidmOa8lbxHf6DrK3ttYv8AZ2O26jDZLJ6geo7V9LftP+HtPtdN0/W13vcXduGmdyDk4HtXzJrt7JHcyKI0OD3WpxFCliKMqdRXT0ZNGtOjWU4OzR0XiDwtbeLLRdT0ucCRow0Uo+7IvYH/ADxXmWpeGnS7kS6kZHVyHVh0Nei/BjW73U49Q0262GG3dWhULjbu6j6d6h+Ltha28cOqQxBZnkEbsB94e/vXxGW4qvl+YvLaj5o3919tL/db7nsfU4uhTxmDWNguWXXz6Hjuu+FtKIdZcMT1yOteC/tHfslfDH436eU1rSjbapAP9B1zTwFubdu3zfxr/st+BFfSGsOGDb41bC/xLXJajIgywto+evy/Svqmjwrn5zeINH/aI/Y61SS18Rb9V8Mzy4TVrWAyQOM9JojwrY9cH0JrVtvjn8OPGmqaD4mg0NV1fTpHjkvEv2Ki1YZEQjIyCHJOfQ4r7i8W6Rpeq6dNaX+nwyxSQ4likjDLID1DK2QR7Gvz2/bt+DPgb4JeJ9G8R/DWzm03+2g0lzZRzZgjbPWNSMp9M49qSetmHQ9/0zx+uuWuyy1E3CuAFTGZAcjABHU5xxW58JxdeGNZ8T6Ffshx4juHG18sjkLuDDqOTXyZ8HvGPiC6jKSXzAp910JDDHIOR396+hPhp4g1LxvrY0nxFKss625kXVUXZd5x/FIuPM9y4Yn1pu1wWqPW49WVtTaeOT7yJvz6gYxXQaF4ljhukVW5z1rxjw34n1nVLnUPtt0Ga2ufKRwgBYLwCccE11fhDUbufUEWSXIzmrhqyZaI+tfhj4kkltoHWcgjGDnFfU/wu8XWGkeHBczadayO6fO00IJPHevib4Y3dxFaxukhBB4r3zSPEOqQ+GAscwGUweK9ak04pNHFGrVoz54Safk7HpWr/HTwNa3zwap4VeBAxBm024/9kbik0/xN8KPGrhNI8bWsM5/5Yagpt3z9Twa+cvEus6hLeOHmzknNYov7of8ALUnnvSd1K8XY6Xjfa6VoRl57P71+qPsMfCLXp7QXFtcSTQMMq8F35iY/AkVw7eH/ABF4Q+Md7YQG7j/tDwrHMFSVlDmG4Ck8YBID14Do/wAU/iD4Scz+GfFl9Ysp/wCXe4ZQfqM4/SvQPgX+0D8S/in8fvDOh+NtUhu1i0zUYFn+zhZTGUVyCw68qO1KVScFdlYXL8PjpONNuLs3rrsr7/8AAO28Qa1rybo57u8X2aZ/8a878bSa1e2sotprlpSp2fvXODg+9fWF/wCGNFntTLc2ayHHIfkV4/8AHPxPF8PbGSXQ/DGlOwUkG6t2f+TCtZVF7M4vqLjXSufKHw+8DeM7Xw1Hb6tLPdTfaZiktxuL4Lngk8nnOPavRfBfwf8AEetTLJqgaKEHnK84/p9a868bftZfFlr6Sz0s6TpyjIBsdMRSOvdt1cZr3xb+JviEEa3441G4Q9YvtBRDnPZNorzqcmoqK6Hr42lTrYudaWnM27Lpc+mPEnjf4JfAzUH0nXL77XfyWCTQ6XpzK8kmC6nzJB8sQzjOeT2r58+Ovx51T4kXTKHgs7OEkWmmWefLiHP4sfVjya4m9VJ5/tE6ByLaZ9p6EgZ57nmsTwdNP4mEkt1KYFV2AjtFCDHPfBP61STjK73MK+JnKmqS0jp8/U8/+L9trklrFrF1YTx2UU+DcyptTcRwMnqa4ttVtUjwz8+uOte9+N9c0/w54euNHj8G6NerfRmGWbUrVriRA2VJQu5CsM5Bxwa+dvi94Nsvhzf+RoGpXjxsgJS7kWQd/wDZBrkxDftLvqTQs4FI3FjNqd8d65Zkz2z8g5qpfaDo97k3MEbZH8S1yltrN5ea5dmQIDlBlRjolWl1jUIZWQTkqWxhhkVka2JtT8E6CqFoVMWW4KHA/Kuc1nwLA0m5Js+haIZH5Vu3WqXM8Ko4T/Wg8CmXkrmXaTxtpPQOlzz3W/B93FcRhE80hyY381gUI7jOQKxNUsdYhDpcxF85B86AP+o5r0jVZCtxa4A+aVgcj2qjqEEUkpLIOaqNxHlZ0jJybaL8mFFd+1pb5P7vvRViP//Z"
    },

    {
        number: "DM-202",
        name: "Delhi Metro Yellow Line",
        from: "New Delhi",
        to: "Hauz Khas",
        departure: "07:15 AM",
        arrival: "07:45 AM",
        duration: "30 min",
        type: "Metro",
        classes: "General",

        image:
            "data:image/jpeg;base64,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"
    },

    {
        number: "DM-303",
        name: "Delhi Metro Airport Express",
        from: "New Delhi",
        to: "IGI Airport",
        departure: "08:00 AM",
        arrival: "08:25 AM",
        duration: "25 min",
        type: "Metro",
        classes: "General",

        image:
            "data:image/jpeg;base64,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"
    },

    {
        number: "DM-404",
        name: "Delhi Metro Magenta Line",
        from: "Janakpuri West",
        to: "Botanical Garden",
        departure: "07:40 AM",
        arrival: "08:30 AM",
        duration: "50 min",
        type: "Metro",
        classes: "General",

        image:
            "data:image/jpeg;base64,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"
    }

];


/* =========================================================
   SWITCH RAILWAY / METRO
========================================================= */

function switchTransportMode(mode) {

    selectedTransportMode = mode;

    const railwayTab =
        document.getElementById("railwayTab");

    const metroTab =
        document.getElementById("metroTab");

    const filter =
        document.getElementById("trainTypeFilter");

    if (railwayTab) {

        railwayTab.classList.toggle(
            "active",
            mode === "railway"
        );

    }

    if (metroTab) {

        metroTab.classList.toggle(
            "active",
            mode === "metro"
        );

    }

    if (filter) {
        filter.value = mode;
    }
}

function swapTransportStations() {
    const fromInput = document.getElementById("trainFrom");
    const toInput = document.getElementById("trainTo");

    if (!fromInput || !toInput) return;

    const oldFrom = fromInput.value;
    fromInput.value = toInput.value;
    toInput.value = oldFrom;
}

/* =========================================================
   FIND SMART TRANSPORT
========================================================= */

/* =========================================================
   FIND SMART TRANSPORT - FIXED VERSION
========================================================= */

async function findSmartTrains() {
    const from = document.getElementById("trainFrom")?.value.trim();
    const to = document.getElementById("trainTo")?.value.trim();
    const date = document.getElementById("trainDate")?.value;
    const filter = document.getElementById("trainTypeFilter")?.value || "all";
    const results = document.getElementById("trainResults");
    const recommendation = document.getElementById("smartRecommendation");

    if (!from || !to || !date) {
        alert("Please enter From, To and Travel Date.");
        return;
    }

    if (from.toLowerCase() === to.toLowerCase()) {
        alert("From and To cannot be the same.");
        return;
    }

    const selectedMode = document.getElementById("trainTypeFilter")?.value;
    const mode = selectedMode === "metro" ? "metro" : "railway";
    selectedTransportMode = mode;
    const demoSource = mode === "metro" ? demoMetro : demoTrains;

    if (results) {
        results.style.display = "block";
        results.innerHTML = `
            <div class="transport-loading">
                🔎 Searching ${mode === "railway" ? "railway" : "metro"} options for
                <strong>${escapeHtml(from)} → ${escapeHtml(to)}</strong>...
            </div>
        `;
    }

    if (recommendation) recommendation.style.display = "none";

    /*
     * Smart demo fallback:
     * The old version depended on the Flask API response shape. If the API
     * returned an empty/invalid payload, another renderer could receive []
     * and show "No matching option found". We now guarantee a demo dataset
     * whenever the API cannot provide usable transport data.
     */
    let data = [];

    try {
        const params = new URLSearchParams({
            mode,
            from,
            to,
            date,
            filter
        });

        const response = await fetch(`/api/trains?${params.toString()}`, {
            headers: { "Accept": "application/json" }
        });

        if (response.ok) {
            const payload = await response.json();
            if (Array.isArray(payload?.data)) {
                data = payload.data.filter(Boolean);
            }
        }
    } catch (error) {
        console.warn("Transport API unavailable; using SmartTour360 demo data.", error);
    }

    /*
     * If API data is empty, ALWAYS show demo transport cards.
     * The entered route is displayed on the demo cards so every station pair
     * can be demonstrated without pretending the timetable is live.
     */
    if (!data.length) {
        data = demoSource.map(item => ({
            ...item,
            from,
            to
        }));
    }

    /*
     * Apply the selected transport filter, but never allow a valid demo/API
     * result to disappear because of a type-label mismatch.
     */
    // Train / Metro is already selected through the transport mode.

    renderSmartTransportResults(
        data,
        from,
        to,
        date,
        data.length && data[0]?.from === from && data[0]?.to === to
            ? "SmartTour360 Demo / API"
            : "SmartTour360 Demo"
    );
}

/* =========================================================
   RAIL → METRO JOURNEY
========================================================= */

function updateRailMetroJourney(
    from,
    to,
    train
) {

    const journey =
        document.getElementById(
            "railMetroJourney"
        );


    const message =
        document.getElementById(
            "journeyMessage"
        );


    if (!journey || !message)
        return;


    journey.style.display =
        "block";


    message.innerHTML = `

        🚆 Take
        <strong>
            ${train.name}
        </strong>

        from
        <strong>
            ${from}
        </strong>

        toward
        <strong>
            ${to}
        </strong>.

        <br><br>

        🚇 After reaching the city,
        SmartTour360 recommends checking
        the nearest metro connection
        for your final destination.

    `;

}


/* =========================================================
   TRAIN DETAILS + DEMO LIVE STATUS
========================================================= */

function showTrainDetails(
    name,
    number,
    from,
    to
) {
    showLiveTrainStatus(name, number, from, to);
}


function showLiveTrainStatus(
    name,
    number,
    from,
    to
) {
    const modal = document.getElementById("trainStatusModal");
    const title = document.getElementById("trainStatusTitle");
    const route = document.getElementById("trainStatusRoute");
    const numberEl = document.getElementById("trainStatusNumber");
    const updated = document.getElementById("trainStatusUpdated");
    const current = document.getElementById("trainStatusCurrent");
    const timeline = document.getElementById("trainStatusTimeline");

    if (!modal || !timeline) return;

    title.textContent = name || "Train";
    numberEl.textContent = "Train No. " + (number || "N/A");
    route.textContent = (from || "Origin") + " → " + (to || "Destination");

    const now = new Date();
    updated.textContent =
        "Updated: " +
        now.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        });

    current.textContent =
        "🚆 En route from " +
        (from || "origin") +
        " toward " +
        (to || "destination");

    const stops = [
        {
            station: from || "Origin",
            label: "Departure",
            icon: "🟢"
        },
        {
            station: "En Route",
            label: "Current Journey",
            icon: "🚆"
        },
        {
            station: to || "Destination",
            label: "Destination",
            icon: "🎯"
        }
    ];

    timeline.innerHTML = stops.map((stop, index) => `
        <div class="train-status-stop ${index === 1 ? "current" : ""}">
            <div class="train-status-dot">${stop.icon}</div>
            <div class="train-status-stop-line"></div>
            <div class="train-status-stop-content">
                <strong>${stop.station}</strong>
                <span>${stop.label}</span>
                ${
                    index === 1
                    ? `<small>Demo journey position</small>`
                    : `<small>SmartTour360 demo timeline</small>`
                }
            </div>
        </div>
    `).join("");

    modal.classList.add("active");
    document.body.classList.add("train-status-open");
}


function closeTrainStatus() {
    const modal = document.getElementById("trainStatusModal");

    if (modal) {
        modal.classList.remove("active");
    }

    document.body.classList.remove("train-status-open");
}


/* =========================================================
   MINIMUM DATE
========================================================= */

function setTrainMinimumDate() {

    const dateInput =
        document.getElementById(
            "trainDate"
        );


    if (!dateInput)
        return;


    const today =
        new Date()
            .toISOString()
            .split("T")[0];


    dateInput.min =
        today;

}


/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        setTrainMinimumDate();


        const locationButton =
            document.getElementById(
                "useLocationBtn"
            );


        if (locationButton) {

            locationButton.addEventListener(
                "click",
                detectTrainLocation
            );

        }


        const findButton =
            document.getElementById(
                "findTrainBtn"
            );


        if (findButton) {

            findButton.addEventListener(
                "click",
                findSmartTrains
            );

        }


        switchTransportMode(
            "railway"
        );

    }
);


/* =========================================================
   SMARTTOUR360 - LIVE TRAIN MAP
========================================================= */

let smartTrainMap = null;
let currentLocationMarker = null;
let destinationMarker = null;
let routeLine = null;


/* ---------------------------------------------------------
   INITIALIZE MAP
--------------------------------------------------------- */

function initializeSmartTrainMap(lat = 29.9457, lng = 78.1642) {

    const mapElement = document.getElementById("smartTrainMap");

    if (!mapElement) return;

    if (smartTrainMap) {
        smartTrainMap.remove();
    }

    smartTrainMap = L.map("smartTrainMap").setView(
        [lat, lng],
        10
    );

    L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            maxZoom: 19,
            attribution: "&copy; OpenStreetMap contributors"
        }
    ).addTo(smartTrainMap);
}


/* ---------------------------------------------------------
   DISTANCE CALCULATOR
--------------------------------------------------------- */

function calculateMapDistance(lat1, lon1, lat2, lon2) {

    const earthRadius = 6371;

    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;

    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) ** 2;

    const c =
        2 * Math.atan2(
            Math.sqrt(a),
            Math.sqrt(1 - a)
        );

    return earthRadius * c;
}


/* ---------------------------------------------------------
   FIND NEAREST STATION FOR MAP
--------------------------------------------------------- */

function findNearestMapStation(lat, lng) {

    if (
        typeof railwayStations === "undefined" ||
        !railwayStations.length
    ) {
        return null;
    }

    let nearest = null;
    let shortestDistance = Infinity;

    railwayStations.forEach(station => {

        if (
            typeof station.lat !== "number" ||
            typeof station.lng !== "number"
        ) {
            return;
        }

        const distance = calculateMapDistance(
            lat,
            lng,
            station.lat,
            station.lng
        );

        if (distance < shortestDistance) {
            shortestDistance = distance;
            nearest = {
                ...station,
                distance: distance
            };
        }
    });

    return nearest;
}


/* ---------------------------------------------------------
   SHOW CURRENT LOCATION
--------------------------------------------------------- */

function showLiveTrainLocation() {

    if (!navigator.geolocation) {

        document.getElementById("currentLocationName").textContent =
            "Location unavailable";

        return;
    }

    navigator.geolocation.getCurrentPosition(

        function(position) {

            const lat = position.coords.latitude;
            const lng = position.coords.longitude;

            initializeSmartTrainMap(lat, lng);

            if (currentLocationMarker) {
                currentLocationMarker.remove();
            }

            currentLocationMarker = L.marker([lat, lng])
                .addTo(smartTrainMap)
                .bindPopup("📍 You are here")
                .openPopup();


            /* FIND NEAREST STATION */

            const nearestStation =
                findNearestMapStation(lat, lng);

            if (nearestStation) {

                document.getElementById(
                    "nearestStationName"
                ).textContent = nearestStation.name;

                const stationDistance =
                    calculateMapDistance(
                        lat,
                        lng,
                        nearestStation.lat,
                        nearestStation.lng
                    );

                document.getElementById(
                    "journeyDistance"
                ).textContent =
                    stationDistance.toFixed(1) + " KM";

                L.marker([
                    nearestStation.lat,
                    nearestStation.lng
                ])
                .addTo(smartTrainMap)
                .bindPopup(
                    "🚉 " + nearestStation.name
                );


                routeLine = L.polyline(
                    [
                        [lat, lng],
                        [
                            nearestStation.lat,
                            nearestStation.lng
                        ]
                    ],
                    {
                        weight: 4,
                        dashArray: "8,8"
                    }
                ).addTo(smartTrainMap);


                smartTrainMap.fitBounds(
                    routeLine.getBounds(),
                    {
                        padding: [40, 40]
                    }
                );
            }


            document.getElementById(
                "currentLocationName"
            ).textContent =
                "Current Location";


            /* SAVE LOCATION */

            window.smartTourCurrentLocation = {
                lat: lat,
                lng: lng
            };

        },

        function(error) {

            console.log(
                "Location error:",
                error.message
            );

            initializeSmartTrainMap();

            document.getElementById(
                "currentLocationName"
            ).textContent =
                "Location permission needed";
        },

        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000
        }
    );
}


/* ---------------------------------------------------------
   SHOW DESTINATION ON MAP
--------------------------------------------------------- */

function showTrainDestinationOnMap(
    destinationLat,
    destinationLng,
    destinationName
) {

    if (!smartTrainMap) {
        initializeSmartTrainMap();
    }

    if (destinationMarker) {
        destinationMarker.remove();
    }

    destinationMarker = L.marker([
        destinationLat,
        destinationLng
    ])
    .addTo(smartTrainMap)
    .bindPopup(
        "🎯 " + destinationName
    )
    .openPopup();


    document.getElementById(
        "mapDestinationName"
    ).textContent =
        destinationName;


    /* CURRENT LOCATION */

    if (window.smartTourCurrentLocation) {

        const current =
            window.smartTourCurrentLocation;

        const distance =
            calculateMapDistance(
                current.lat,
                current.lng,
                destinationLat,
                destinationLng
            );

        document.getElementById(
            "journeyDistance"
        ).textContent =
            distance.toFixed(1) + " KM";


        if (routeLine) {
            routeLine.remove();
        }

        routeLine = L.polyline(
            [
                [current.lat, current.lng],
                [destinationLat, destinationLng]
            ],
            {
                weight: 5,
                dashArray: "10,10"
            }
        ).addTo(smartTrainMap);


        smartTrainMap.fitBounds(
            routeLine.getBounds(),
            {
                padding: [50, 50]
            }
        );


        /* ESTIMATED TIME */

        const estimatedMinutes =
            Math.max(
                10,
                Math.round(distance / 45 * 60)
            );

        document.getElementById(
            "estimatedJourneyTime"
        ).textContent =
            estimatedMinutes + " min";
    }
}


/* ---------------------------------------------------------
   MAP START
--------------------------------------------------------- */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        setTimeout(function() {

            initializeSmartTrainMap();

        }, 500);


        const locationButton =
            document.getElementById(
                "useLocationBtn"
            );

        if (locationButton) {

            locationButton.addEventListener(
                "click",
                function() {

                    setTimeout(
                        showLiveTrainLocation,
                        300
                    );

                }
            );
        }

    }
);
/* =========================================================
   SMARTTOUR360 - FINAL DESTINATION + ITINERARY + POLISH
========================================================= */
(function(){
    const smartPlaces = {
      "rishikesh": {food:"Aloo Puri, local Garhwali meals", transport:"Haridwar/Rishikesh rail + local cab", highlights:"Triveni Ghat, Laxman Jhula area, Ganga riverside"},
      "manali": {food:"Siddu, Himachali dham, local tea", transport:"Volvo/bus + local taxi", highlights:"Solang Valley, Old Manali, Hadimba Temple"},
      "goa": {food:"Goan thali, poi, seafood options", transport:"Airport/rail + local taxi/bus", highlights:"Baga, Panjim, Fort Aguada, beaches"},
      "jaipur": {food:"Dal Baati Churma, Ghewar, Rajasthani thali", transport:"Rail + metro/cab/auto", highlights:"Amber Fort, City Palace, Hawa Mahal"},
      "jammu & kashmir": {food:"Rogan josh, kahwa, local breads", transport:"Jammu rail/air + local cab", highlights:"Srinagar lakes, valleys, Mughal gardens"},
      "varanasi": {food:"Kachori Sabzi, Banarasi lassi, local sweets", transport:"Varanasi rail/air + e-rickshaw/cab", highlights:"Ghats, Ganga Aarti, Sarnath"},
      "ayodhya": {food:"Kachori, jalebi, local vegetarian dishes", transport:"Rail + local e-rickshaw/cab", highlights:"Ram Mandir area, Saryu riverfront, Hanuman Garhi"},
      "vrindavan": {food:"Pedas, kachori, traditional vegetarian food", transport:"Rail to nearby Mathura + local auto/cab", highlights:"Banke Bihari Temple, Prem Mandir, ISKCON area"},
      "agra": {food:"Petha, Mughlai cuisine, local snacks", transport:"Rail + city cab/auto", highlights:"Taj Mahal, Agra Fort, Mehtab Bagh"},
      "shimla": {food:"Himachali dham, siddu, local bakery", transport:"Train to nearby station + bus/cab", highlights:"Mall Road, Ridge, Kufri, Jakhoo"},
      "kerala": {food:"Appam, puttu, Kerala sadya", transport:"Rail/air + bus/cab/boat", highlights:"Munnar, Alleppey backwaters, Kochi"},
      "udaipur": {food:"Dal baati, gatte, Rajasthani thali", transport:"Rail/air + cab/auto", highlights:"City Palace, Lake Pichola, Fateh Sagar"}
    };
    const aliases = {"jammu and kashmir":"jammu & kashmir","jammu & kashmir":"jammu & kashmir"};
    function keyOf(v){const k=(v||'').toLowerCase().trim();return aliases[k]||k}
    window.smartPlaceData=smartPlaces;

    window.planDestinationFromModal=function(){
      const title=document.getElementById('modalTitle')?.textContent?.trim();
      if(!title)return;
      const input=document.getElementById('tripDestination'); if(input) input.value=title;
      closeDestination();
      document.getElementById('planner')?.scrollIntoView({behavior:'smooth',block:'start'});
      showSmartToast('📍 '+title+' selected in Smart Trip Planner');
    };

    const oldShow=window.showDestination;
    if(typeof oldShow==='function'){
      window.showDestination=function(destination){
        oldShow(destination);
        setTimeout(()=>{
          const modal=document.getElementById('destinationModal');
          const content=modal?.querySelector('.modal-content'); if(!content)return;
          let extra=document.getElementById('destinationExtraDetails');
          if(!extra){extra=document.createElement('div');extra.id='destinationExtraDetails';const tip=content.querySelector('.modal-tip');tip?.before(extra);}
          const d=smartPlaces[keyOf(destination)]||{};
          extra.className='destination-extra-grid';
          extra.innerHTML=`<div class="destination-extra-card"><span>🍽️</span><small>Local Food</small><p>${d.food||'Explore local cuisine'}</p></div><div class="destination-extra-card"><span>🚆</span><small>Connectivity</small><p>${d.transport||'Check SmartTour360 transport options'}</p></div><div class="destination-extra-card"><span>📸</span><small>Smart Highlights</small><p>${d.highlights||'Top local attractions'}</p></div>`;
        },30);
      };
    }

    window.showSmartToast=function(msg){
      const t=document.getElementById('smartToast');if(!t)return;t.textContent=msg;t.classList.add('show');clearTimeout(window.__smartToastTimer);window.__smartToastTimer=setTimeout(()=>t.classList.remove('show'),3000);
    };
    window.setSmartLoading=function(on){document.getElementById('smartLoading')?.classList.toggle('show',!!on)};

    window.createTripPlan=function(){
      const placeInput=document.getElementById('tripDestination'), daysInput=document.getElementById('tripDays'), budgetInput=document.getElementById('tripBudget'), result=document.getElementById('plannerResult');
      if(!placeInput||!daysInput||!budgetInput||!result)return;
      const place=placeInput.value.trim(), key=keyOf(place), days=Math.max(1,parseInt(daysInput.value)||0), budget=parseInt(budgetInput.value)||0;
      const valid=['rishikesh','manali','goa','jaipur','jammu & kashmir','varanasi','ayodhya','vrindavan','agra','shimla','kerala','udaipur'];
      if(!valid.includes(key)||days<1||days>14||budget<=0){result.innerHTML='<div class="result-box">⚠️ Please select one of the 12 SmartTour360 destinations, enter 1–14 days and a valid budget.</div>';showSmartToast('Please complete the trip details correctly');return;}
      let travelers=1;if(selectedTripMode==='family')travelers=parseInt(document.getElementById('familyMembers')?.value)||1;else if(selectedTripMode==='friends')travelers=parseInt(document.getElementById('friendsMembers')?.value)||2;
      const mode=selectedTripMode==='family'?'Family Trip':selectedTripMode==='friends'?'Friends Trip':'Solo Trip';
      setSmartLoading(true);
      setTimeout(()=>{
        const stay=Math.round(budget*.35),food=Math.round(budget*.20),transport=Math.round(budget*.20),activities=Math.round(budget*.15),emergency=budget-stay-food-transport-activities;
        const d=smartPlaces[key]||{};
        const attraction=(d.highlights||'top attractions').split(',').map(x=>x.trim());
        const daysHtml=Array.from({length:days},(_,i)=>{let title=i===0?'Arrival + local orientation':i===days-1?'Final sightseeing + departure':`Explore ${attraction[(i-1)%Math.max(attraction.length,1)]||'top attractions'}`;let act=i===0?`Arrive in ${place}, check-in and enjoy a relaxed local walk.`:i===days-1?`Visit a nearby highlight, shop for souvenirs and prepare for departure.`:`Discover ${title.replace('Explore ','')}. Add local food and a flexible rest break.`;return `<div class="itinerary-day"><h4>Day ${i+1} — ${title}</h4><p>🌅 Morning: ${i===0?'Arrival, check-in and breakfast.':'Start with a comfortable morning visit.'}</p><p>🗺️ Afternoon: ${act}</p><p>🌙 Evening: Local experience, dinner and rest.</p></div>`}).join('');
        result.innerHTML=`<div class="result-box"><h3>🧳 Smart Trip Plan — ${place}</h3><p><strong>Travel Type:</strong> ${mode} &nbsp; • &nbsp; <strong>Travelers:</strong> ${travelers} &nbsp; • &nbsp; <strong>Duration:</strong> ${days} days</p><div class="itinerary-wrap"><div class="itinerary-head"><h3>🗓️ Personalized ${days}-Day Itinerary</h3><div class="itinerary-actions"><button class="itinerary-action" onclick="printSmartPlan()">🖨️ Print / Save PDF</button><button class="itinerary-action" onclick="copySmartPlan()">📋 Copy Plan</button></div></div><div class="itinerary-days">${daysHtml}</div><div class="budget-mini"><div>🏨 Stay<strong>₹${stay}</strong></div><div>🍴 Food<strong>₹${food}</strong></div><div>🚌 Transport<strong>₹${transport}</strong></div><div>🎯 Activities<strong>₹${activities}</strong></div><div>🛡️ Buffer<strong>₹${emergency}</strong></div></div><p style="margin-top:14px"><strong>💰 Total Estimated Budget:</strong> ₹${budget} &nbsp; | &nbsp; <strong>Per person:</strong> ₹${Math.round(budget/travelers)}</p><p>💡 <strong>Smart Tip:</strong> ${d.food||'Try local food'} and keep the itinerary flexible for weather and transport changes.</p><div class="planner-checkout"><div><strong>Ready to continue?</strong><small>Use the demo checkout to simulate your trip reservation.</small></div><button class="planner-payment-btn" onclick="openPaymentModal('Smart Trip Booking — ${place}', ${budget})">💳 Proceed to Demo Payment — ₹${budget}</button></div></div></div>`;
        setSmartLoading(false);showSmartToast('✨ Your personalized itinerary is ready!');
      },500);
    };
    window.printSmartPlan=function(){window.print()};
    window.copySmartPlan=function(){const text=document.getElementById('plannerResult')?.innerText||'';navigator.clipboard?.writeText(text).then(()=>showSmartToast('📋 Plan copied to clipboard')).catch(()=>showSmartToast('Select and copy the plan manually'))};
})();

/* =========================================================
   SMARTTOUR360 - FINAL HACKATHON UI POLISH
========================================================= */
(function(){
  const navLinks = Array.from(document.querySelectorAll('.navbar nav a[href^="#"]'));

  function addUtilityUI(){
    if(!document.querySelector('.smart-scroll-progress')){
      const bar=document.createElement('div');
      bar.className='smart-scroll-progress';
      bar.setAttribute('aria-hidden','true');
      document.body.appendChild(bar);
    }
    if(!document.querySelector('.smart-back-top')){
      const btn=document.createElement('button');
      btn.className='smart-back-top';
      btn.type='button';
      btn.setAttribute('aria-label','Back to top');
      btn.title='Back to top';
      btn.textContent='↑';
      btn.addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));
      document.body.appendChild(btn);
    }
  }

  function updateScrollUI(){
    const h=document.documentElement;
    const max=h.scrollHeight-h.clientHeight;
    const pct=max>0?(window.scrollY/max)*100:0;
    const bar=document.querySelector('.smart-scroll-progress');
    if(bar) bar.style.width=pct+'%';
    const top=document.querySelector('.smart-back-top');
    if(top) top.classList.toggle('show',window.scrollY>500);
  }

  function updateActiveNav(){
    let current='';
    navLinks.forEach(link=>{
      const id=link.getAttribute('href');
      const section=id&&document.querySelector(id);
      if(section && window.scrollY+140>=section.offsetTop) current=id;
    });
    navLinks.forEach(link=>link.classList.toggle('active',link.getAttribute('href')===current));
  }

  function setupNav(){
    navLinks.forEach(link=>link.addEventListener('click',()=>{
      navLinks.forEach(x=>x.classList.remove('active'));
      link.classList.add('active');
    }));
  }

  function patchPlannerValidation(){
    const original=window.createTripPlan;
    if(typeof original!=='function') return;
    window.createTripPlan=function(){
      const daysInput=document.getElementById('tripDays');
      if(daysInput){
        const raw=daysInput.value.trim();
        const parsed=Number(raw);
        if(!raw || !Number.isFinite(parsed) || parsed<1 || parsed>14){
          const result=document.getElementById('plannerResult');
          if(result) result.innerHTML='<div class="result-box">⚠️ Please enter a valid trip duration between 1 and 14 days.</div>';
          if(window.showSmartToast) window.showSmartToast('Please enter 1–14 days');
          daysInput.focus();
          return;
        }
      }
      original();
    };
  }

  function patchClipboard(){
    window.copySmartPlan=function(){
      const text=document.getElementById('plannerResult')?.innerText||'';
      if(!text.trim()){
        if(window.showSmartToast) window.showSmartToast('Create a trip plan first');
        return;
      }
      if(navigator.clipboard && typeof navigator.clipboard.writeText==='function'){
        navigator.clipboard.writeText(text)
          .then(()=>window.showSmartToast&&window.showSmartToast('📋 Plan copied to clipboard'))
          .catch(()=>window.showSmartToast&&window.showSmartToast('Select and copy the plan manually'));
      }else{
        const area=document.createElement('textarea');
        area.value=text; area.style.position='fixed'; area.style.opacity='0';
        document.body.appendChild(area); area.select();
        try{document.execCommand('copy');window.showSmartToast&&window.showSmartToast('📋 Plan copied to clipboard');}
        catch(e){window.showSmartToast&&window.showSmartToast('Select and copy the plan manually');}
        area.remove();
      }
    };
  }

  function improveButtons(){
    const buttons=document.querySelectorAll('button');
    buttons.forEach(btn=>{
      if(!btn.getAttribute('aria-label') && btn.textContent.trim()) btn.setAttribute('aria-label',btn.textContent.trim().replace(/\s+/g,' '));
    });
  }

  document.addEventListener('DOMContentLoaded',function(){
    addUtilityUI();
    setupNav();
    improveButtons();
    patchPlannerValidation();
    patchClipboard();
    updateScrollUI();
    updateActiveNav();
    window.addEventListener('scroll',()=>{updateScrollUI();updateActiveNav();},{passive:true});
    window.addEventListener('resize',updateActiveNav);
  });
})();


/* =========================================================
   SMARTTOUR360 - DEMO PAYMENT SYSTEM
   Prototype only - No real payment
========================================================= */

let demoPaymentMethod = "UPI";
let demoPaymentAmount = 0;
let demoPaymentService = "Travel Booking";


/* ================= OPEN PAYMENT ================= */

function openPaymentModal(service, amount) {

    const modal = document.getElementById("paymentModal");

    if (!modal) return;

    demoPaymentService = service || "Travel Booking";
    demoPaymentAmount = Number(amount) || 0;
    demoPaymentMethod = "UPI";

    const serviceEl = document.getElementById("paymentService");
    const amountEl = document.getElementById("paymentAmount");
    const buttonAmount = document.getElementById("payButtonAmount");
    const status = document.getElementById("paymentStatus");

    const name = document.getElementById("demoPayerName");
    const ref = document.getElementById("demoPaymentRef");

    if (serviceEl) {
        serviceEl.textContent = demoPaymentService;
    }

    if (amountEl) {
        amountEl.textContent =
            "₹" + demoPaymentAmount.toLocaleString("en-IN");
    }

    if (buttonAmount) {
        buttonAmount.textContent =
            "₹" + demoPaymentAmount.toLocaleString("en-IN");
    }

    if (status) {
        status.textContent = "";
        status.className = "payment-status";
    }

    if (name) {
        name.value =
            typeof currentUser !== "undefined" && currentUser?.name
                ? currentUser.name
                : "";
    }

    if (ref) {
        ref.value = "";
    }

    document
        .querySelectorAll(".payment-method")
        .forEach(function (item) {
            item.classList.remove("active");
        });

    const firstMethod =
        document.querySelector(".payment-method");

    if (firstMethod) {
        firstMethod.classList.add("active");
    }

    const payBtn =
        document.querySelector(".demo-pay-btn");

    if (payBtn) {
        payBtn.disabled = false;

        payBtn.innerHTML =
            `Pay <span id="payButtonAmount">₹${demoPaymentAmount.toLocaleString("en-IN")}</span> — Demo`;
    }

    modal.classList.add("active");
    modal.setAttribute("aria-hidden", "false");
}


/* ================= CLOSE PAYMENT ================= */

function closePaymentModal() {

    const modal =
        document.getElementById("paymentModal");

    if (!modal) return;

    modal.classList.remove("active");
    modal.setAttribute("aria-hidden", "true");
}


/* ================= SELECT METHOD ================= */

function selectPaymentMethod(method, button) {

    demoPaymentMethod = method;

    document
        .querySelectorAll(".payment-method")
        .forEach(function (item) {
            item.classList.remove("active");
        });

    if (button) {
        button.classList.add("active");
    }

    const label =
        document.querySelector('label[for="demoPaymentRef"]');

    const input =
        document.getElementById("demoPaymentRef");

    if (label) {
        label.textContent =
            method === "UPI"
                ? "Demo UPI Reference"
                : method === "Card"
                    ? "Demo Card Reference"
                    : "Demo Bank Reference";
    }

    if (input) {
        input.placeholder =
            method === "UPI"
                ? "e.g. DEMO-UPI-1234"
                : method === "Card"
                    ? "e.g. DEMO-CARD-4242"
                    : "e.g. DEMO-BANK-5678";
    }
}


/* =========================================================
   PROCESS DEMO PAYMENT
========================================================= */

function processDemoPayment(event) {

    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }

    const name = document.getElementById("demoPayerName");
    const ref = document.getElementById("demoPaymentRef");
    const status = document.getElementById("paymentStatus");
    const button = document.querySelector(".demo-pay-btn");

    if (!name || !name.value.trim()) {
        if (status) {
            status.textContent = "⚠️ Please enter the traveler name.";
            status.className = "payment-status error";
        }
        if (name) name.focus();
        return false;
    }

    if (!ref || !ref.value.trim()) {
        if (status) {
            status.textContent = "⚠️ Enter a demo reference such as DEMO-UPI-1234.";
            status.className = "payment-status error";
        }
        if (ref) ref.focus();
        return false;
    }

    if (button) {
        button.disabled = true;
        button.textContent = "Processing Demo Payment...";
    }

    if (status) {
        status.className = "payment-status processing";
        status.textContent = "⏳ Verifying demo transaction...";
    }

    window.setTimeout(function () {
        const transactionId =
            "ST360-DEMO-" + Math.floor(10000000 + Math.random() * 90000000);

        // Never navigate away or leave the user on the booking page after payment.
        // The success modal becomes the only visible payment state.
        try {
            showPaymentSuccess(demoPaymentAmount, transactionId);
        } catch (error) {
            console.error("SmartTour360 payment success error:", error);

            // Last-resort UI fallback: still show a proper success screen.
            const successModal = document.getElementById("paymentSuccessModal");
            if (successModal) {
                successModal.classList.add("active");
                successModal.setAttribute("aria-hidden", "false");
                successModal.style.display = "flex";
                document.body.classList.add("st360-payment-success-open");
            }
        }

        closePaymentModal();

        if (button) {
            button.disabled = false;
            button.textContent = "✓ Demo Payment Completed";
        }
    }, 900);

    return false;
}


/* =========================================================
   SMARTTOUR360 - PAYMENT SUCCESS + BOOKING VERIFICATION
========================================================= */

function showPaymentSuccess(amount, transactionId) {

    const modal = document.getElementById("paymentSuccessModal");
    if (!modal) return;

    const nameInput = document.getElementById("demoPayerName");
    const travelerName = nameInput && nameInput.value.trim()
        ? nameInput.value.trim()
        : "Demo Traveler";

    const finalAmount = Number(demoPaymentAmount || amount || 0);
    const bookingId =
        "ST360-BK-" + Math.floor(10000 + Math.random() * 90000);

    const today = new Date().toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });

    const setText = (id, value) => {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    };

    setText("receiptTravelerName", travelerName);
    setText("receiptService", demoPaymentService);
    setText("receiptAmount", "₹" + finalAmount.toLocaleString("en-IN"));
    setText("receiptPaymentMethod", demoPaymentMethod);
    setText("receiptTransactionId", transactionId || "ST360-DEMO");
    setText("receiptBookingId", bookingId);
    setText("receiptDate", today);

    /* Keep the latest demo booking available to the verification page. */
    const bookingData = {
        travelerName,
        service: demoPaymentService,
        amount: finalAmount,
        paymentMethod: demoPaymentMethod,
        transactionId: transactionId || "ST360-DEMO",
        bookingId,
        date: today,
        status: "DEMO VERIFIED"
    };

    try {
        localStorage.setItem("smarttour360_last_booking", JSON.stringify(bookingData));
    } catch (error) {
        console.warn("Unable to save demo booking locally.", error);
    }

    /* Show the success screen FIRST. QR generation is secondary and must never block it. */
    modal.classList.add("active");
    modal.setAttribute("aria-hidden", "false");
    modal.style.display = "flex";
    document.body.classList.add("st360-payment-success-open");

    /* Generate a QR that opens verify.html with this exact booking. */
    const qrBox = document.getElementById("receiptQRCode");
    if (qrBox) {
        qrBox.innerHTML = "";

        const verifyURL = new URL("verify.html", window.location.href);
        verifyURL.searchParams.set("name", travelerName);
        verifyURL.searchParams.set("service", demoPaymentService);
        verifyURL.searchParams.set("amount", String(finalAmount));
        verifyURL.searchParams.set("method", demoPaymentMethod);
        verifyURL.searchParams.set("transaction", transactionId || "ST360-DEMO");
        verifyURL.searchParams.set("booking", bookingId);
        verifyURL.searchParams.set("date", today);

        const verificationText = verifyURL.toString();

        /*
         * Phone-scan fix for local demos:
         * file:// and localhost URLs point to the laptop, so a phone cannot
         * open verify.html from them. In that situation encode the booking
         * record itself in the QR. A phone QR scanner can then display the
         * complete booking details immediately. Once the site is deployed
         * on HTTP/HTTPS, the QR switches back to the full verify.html page.
         */
        const isLocalOnly =
            window.location.protocol === "file:" ||
            window.location.hostname === "localhost" ||
            window.location.hostname === "127.0.0.1" ||
            window.location.hostname === "0.0.0.0";

        /*
         * Local-file QR fix: a file:// verification URL cannot be opened by a
         * phone because it points to the laptop's filesystem. Encode a small
         * self-contained HTML verification page instead. On scan, compatible
         * phone QR scanners can open it directly and show the exact booking
         * details without depending on the laptop or localStorage.
         */
        const localVerificationHtml = [
            "<!doctype html><html><head><meta charset='utf-8'><meta name='viewport' content='width=device-width,initial-scale=1'>",
            "<title>SmartTour360 Booking</title><style>body{font-family:Arial,sans-serif;background:#061525;color:#fff;padding:22px}main{max-width:520px;margin:auto;background:#0b2037;border-radius:18px;padding:24px}h1{margin:0 0 14px}div{padding:9px 0;border-bottom:1px solid #ffffff22}b{display:inline-block;min-width:125px;color:#9bb3c7}</style></head><body><main>",
            "<h1>🌍 SmartTour360</h1><p>✓ DEMO VERIFIED BOOKING</p>",
            "<div><b>Traveler Name</b>" + escapeHtml(travelerName) + "</div>",
            "<div><b>Booking ID</b>" + escapeHtml(bookingId) + "</div>",
            "<div><b>Service</b>" + escapeHtml(demoPaymentService) + "</div>",
            "<div><b>Amount</b>₹" + finalAmount.toLocaleString("en-IN") + "</div>",
            "<div><b>Payment Method</b>" + escapeHtml(demoPaymentMethod) + "</div>",
            "<div><b>Transaction ID</b>" + escapeHtml(transactionId || "ST360-DEMO") + "</div>",
            "<div><b>Booking Date</b>" + escapeHtml(today) + "</div>",
            "<p style='color:#86efac;font-weight:700'>✓ Booking details verified</p><small>SmartTour360 • YatraTech • Demo only</small>",
            "</main></body></html>"
        ].join("");
        const qrPayload = isLocalOnly
            ? "data:text/html;charset=utf-8," + encodeURIComponent(localVerificationHtml)
            : verificationText;

        if (typeof QRCode !== "undefined") {
            try {
                new QRCode(qrBox, {
                    text: qrPayload,
                    width: 150,
                    height: 150,
                    correctLevel: QRCode.CorrectLevel.M
                });
            } catch (qrError) {
                console.warn("qrcodejs failed; using image QR fallback.", qrError);
            }
        }

        if (!qrBox.querySelector("canvas") && !qrBox.querySelector("img")) {
            const img = document.createElement("img");
            img.alt = "SmartTour360 booking verification QR code";
            img.width = 150;
            img.height = 150;
            img.loading = "eager";
            img.referrerPolicy = "no-referrer";

            const encoded = encodeURIComponent(qrPayload);
            img.src = "https://quickchart.io/qr?size=180&margin=2&ecLevel=M&text=" + encoded + "&_=" + Date.now();

            img.onerror = function () {
                if (img.dataset.fallbackTried !== "1") {
                    img.dataset.fallbackTried = "1";
                    img.src = "https://api.qrserver.com/v1/create-qr-code/?size=180x180&margin=8&data=" + encoded + "&_=" + Date.now();
                    return;
                }
                img.style.display = "none";
                const note = document.createElement("div");
                note.className = "qr-unavailable";
                note.textContent = "QR image could not load. Use the verification page link below.";
                qrBox.appendChild(note);
            };

            qrBox.appendChild(img);
        }

        const verifyLink = document.getElementById("receiptVerifyLink");
        if (verifyLink) {
            verifyLink.href = verificationText;
            verifyLink.textContent = isLocalOnly
                ? "Open Verification Page on This Device →"
                : "Open Verification Page →";
        }

    }

    requestAnimationFrame(() => {
        const box = modal.querySelector(".payment-success-box");
        if (box) box.scrollTop = 0;
    });
}


/* ================= CLOSE SUCCESS ================= */

function closePaymentSuccess() {

    const modal =
        document.getElementById("paymentSuccessModal");

    if (modal) {
        modal.classList.remove("active");
        modal.setAttribute("aria-hidden", "true");
        modal.style.display = "";
    }
    document.body.classList.remove("st360-payment-success-open");

}


/* ================= OUTSIDE CLICK ================= */

window.addEventListener("click", function (event) {

    const paymentModal =
        document.getElementById("paymentModal");

    const successModal =
        document.getElementById("paymentSuccessModal");


    if (
        paymentModal &&
        event.target === paymentModal
    ) {
        closePaymentModal();
    }


    if (
        successModal &&
        event.target === successModal
    ) {
        closePaymentSuccess();
    }

});


/* ================= ESC KEY ================= */

document.addEventListener("keydown", function (event) {

    if (event.key === "Escape") {

        closePaymentModal();
        closePaymentSuccess();

    }

});


/* ================= GLOBAL FUNCTIONS ================= */

window.openPaymentModal =
    openPaymentModal;

window.closePaymentModal =
    closePaymentModal;

window.selectPaymentMethod =
    selectPaymentMethod;

window.processDemoPayment =
    processDemoPayment;

window.showPaymentSuccess =
    showPaymentSuccess;

window.closePaymentSuccess =
    closePaymentSuccess;
    /* =========================================================
   DOWNLOAD / SAVE RECEIPT AS PDF
========================================================= */

function downloadBookingReceipt() {

    const receipt =
        document.getElementById("bookingReceipt");

    if (!receipt) {
        alert("Receipt not found.");
        return;
    }

    const receiptHTML = receipt.outerHTML;

    const printWindow =
        window.open("", "_blank", "width=700,height=800");

    if (!printWindow) {
        alert("Please allow pop-ups to download the receipt.");
        return;
    }

    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>

            <title>SmartTour360 Booking Receipt</title>

            <style>

                body {
                    font-family: Arial, sans-serif;
                    background: #f8fafc;
                    padding: 30px;
                }

                .booking-receipt {
                    max-width: 500px;
                    margin: auto;
                    padding: 25px;
                    background: white;
                    border: 1px solid #ddd;
                    border-radius: 18px;
                }

                .receipt-header {
                    display: flex;
                    justify-content: space-between;
                }

                .receipt-header h3 {
                    margin: 0;
                    color: #16a34a;
                }

                .receipt-paid {
                    background: #dcfce7;
                    color: #15803d;
                    padding: 6px 10px;
                    border-radius: 20px;
                    font-weight: bold;
                }

                .receipt-divider {
                    height: 1px;
                    background: #ddd;
                    margin: 15px 0;
                }

                .receipt-info {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 12px;
                }

                .receipt-info div {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .receipt-info small {
                    color: #64748b;
                }

                .receipt-qr-section {
                    text-align: center;
                    margin-top: 20px;
                }

                .receipt-footer {
                    text-align: center;
                    margin-top: 20px;
                    color: #64748b;
                    font-size: 11px;
                }

                img {
                    max-width: 130px;
                }

                @media print {
                    body {
                        background: white;
                    }
                }

            </style>

        </head>

        <body>

            ${receiptHTML}

            <script>
                window.onload = function() {
                    window.print();
                };
            <\/script>

        </body>
        </html>
    `);

    printWindow.document.close();
}


/* ================= GLOBAL ================= */

window.downloadBookingReceipt =
    downloadBookingReceipt;
    /* =========================================================
   SMARTTOUR360 - SMART ROUTE OPTIMIZER
   Version: 1.0
========================================================= */

(function () {

    "use strict";


    /* =====================================================
       ROUTE STATE
    ===================================================== */

    let smartRouteState = {
        from: "",
        destination: "",
        date: "",
        preference: "balanced",
        recommended: null,
        options: []
    };


    /* =====================================================
       HELPERS
    ===================================================== */

    function routeEscape(value) {

        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    function routeDurationToMinutes(duration) {

        if (!duration) {
            return 120;
        }

        const text = String(duration)
            .toLowerCase()
            .replace(/\s+/g, " ");

        let hours = 0;
        let minutes = 0;

        const hourMatch =
            text.match(/(\d+(?:\.\d+)?)\s*h/);

        const minuteMatch =
            text.match(/(\d+)\s*min/);

        if (hourMatch) {
            hours =
                parseFloat(hourMatch[1]);
        }

        if (minuteMatch) {
            minutes =
                parseInt(minuteMatch[1], 10);
        }

        return Math.round(
            hours * 60 + minutes
        ) || 120;
    }


    function formatMinutes(minutes) {

        minutes =
            Math.max(
                0,
                Math.round(minutes)
            );

        const hours =
            Math.floor(minutes / 60);

        const mins =
            minutes % 60;

        if (hours === 0) {
            return `${mins} min`;
        }

        if (mins === 0) {
            return `${hours}h`;
        }

        return `${hours}h ${mins}m`;
    }


    function normalizeRouteText(value) {

        return String(value || "")
            .toLowerCase()
            .trim();
    }


    function routeMatches(item, from, destination) {

        if (!item) {
            return false;
        }

        const itemFrom =
            normalizeRouteText(item.from);

        const itemTo =
            normalizeRouteText(item.to);

        const searchFrom =
            normalizeRouteText(from);

        const searchDestination =
            normalizeRouteText(destination);


        const fromMatch =
            itemFrom.includes(searchFrom) ||
            searchFrom.includes(itemFrom);

        const destinationMatch =
            itemTo.includes(searchDestination) ||
            searchDestination.includes(itemTo);


        return fromMatch &&
               destinationMatch;
    }


    /* =====================================================
       COST ESTIMATION
    ===================================================== */

    function estimateRailCost(train) {

        if (!train) {
            return 650;
        }

        const type =
            normalizeRouteText(train.type);

        if (type.includes("vande")) {
            return 1100;
        }

        if (type.includes("shatabdi")) {
            return 950;
        }

        if (type.includes("superfast")) {
            return 700;
        }

        return 550;
    }


    function estimateMetroCost(metro) {

        if (!metro) {
            return 60;
        }

        const duration =
            routeDurationToMinutes(
                metro.duration
            );

        if (duration <= 30) {
            return 30;
        }

        if (duration <= 60) {
            return 50;
        }

        return 70;
    }


    /* =====================================================
       CREATE ROUTE OPTIONS
    ===================================================== */

    function createSmartRouteOptions(
        from,
        destination
    ) {

        const options = [];


        /* -------------------------------------------------
           RAILWAY OPTIONS
        ------------------------------------------------- */

        let railwayData = [];

        if (
            typeof demoTrains !== "undefined" &&
            Array.isArray(demoTrains)
        ) {

            railwayData =
                demoTrains.filter(
                    function (train) {

                        return routeMatches(
                            train,
                            from,
                            destination
                        );

                    }
                );
        }


        /*
         * If exact route is unavailable,
         * use demo railway options.
         */

        if (
            railwayData.length === 0 &&
            typeof demoTrains !== "undefined" &&
            Array.isArray(demoTrains)
        ) {

            railwayData =
                demoTrains.slice(0, 3);
        }


        if (railwayData.length > 0) {

            const train =
                railwayData[0];

            const duration =
                routeDurationToMinutes(
                    train.duration
                );

            const cost =
                estimateRailCost(train);

            options.push({

                id: "railway",

                mode: "Railway",

                icon: "🚆",

                title:
                    train.name ||
                    "Smart Railway Route",

                subtitle:
                    `${train.from} → ${train.to}`,

                duration:
                    duration,

                cost:
                    cost,

                transfers:
                    0,

                service:
                    train.type ||
                    "Express",

                vehicle:
                    train,

                reason:
                    "Direct railway journey with no transfer."

            });
        }


        /* -------------------------------------------------
           METRO OPTIONS
        ------------------------------------------------- */

        let metroData = [];

        if (
            typeof demoMetro !== "undefined" &&
            Array.isArray(demoMetro)
        ) {

            metroData =
                demoMetro.filter(
                    function (metro) {

                        return routeMatches(
                            metro,
                            from,
                            destination
                        );

                    }
                );
        }


        if (
            metroData.length === 0 &&
            typeof demoMetro !== "undefined" &&
            Array.isArray(demoMetro)
        ) {

            metroData =
                demoMetro.slice(0, 2);
        }


        if (metroData.length > 0) {

            const metro =
                metroData[0];

            const duration =
                routeDurationToMinutes(
                    metro.duration
                );

            const cost =
                estimateMetroCost(metro);

            options.push({

                id: "metro",

                mode: "Metro",

                icon: "🚇",

                title:
                    metro.name ||
                    "Smart Metro Route",

                subtitle:
                    `${metro.from} → ${metro.to}`,

                duration:
                    duration,

                cost:
                    cost,

                transfers:
                    0,

                service:
                    "Metro",

                vehicle:
                    metro,

                reason:
                    "Fast city connectivity with low estimated cost."

            });
        }


        /* -------------------------------------------------
           RAIL → METRO
        ------------------------------------------------- */

        if (
            railwayData.length > 0 &&
            metroData.length > 0
        ) {

            const train =
                railwayData[0];

            const metro =
                metroData[0];


            const trainDuration =
                routeDurationToMinutes(
                    train.duration
                );

            const metroDuration =
                routeDurationToMinutes(
                    metro.duration
                );


            const totalDuration =
                trainDuration +
                metroDuration +
                25;


            const totalCost =
                estimateRailCost(train) +
                estimateMetroCost(metro);


            options.push({

                id: "rail-metro",

                mode: "Rail → Metro",

                icon: "🚆🚇",

                title:
                    "Smart Rail → Metro Connection",

                subtitle:
                    `${from} → ${destination}`,

                duration:
                    totalDuration,

                cost:
                    totalCost,

                transfers:
                    1,

                service:
                    `${train.name} + ${metro.name}`,

                train:
                    train,

                metro:
                    metro,

                reason:
                    "Best multimodal option for combining long-distance rail with city metro connectivity."

            });
        }


        /* -------------------------------------------------
           LOCAL SMART ROUTE
        ------------------------------------------------- */

        options.push({

            id: "local",

            mode: "Road",

            icon: "🚕",

            title:
                "Smart Local Road Route",

            subtitle:
                `${from} → ${destination}`,

            duration:
                90,

            cost:
                300,

            transfers:
                0,

            service:
                "Cab / Local Transport",

            reason:
                "Direct road journey without changing transport modes."

        });


        return options;
    }


    /* =====================================================
       SCORE ROUTES
    ===================================================== */

    function scoreSmartRoutes(
        options,
        preference
    ) {

        if (!options.length) {
            return [];
        }


        const maxDuration =
            Math.max(
                ...options.map(
                    r => r.duration
                )
            );

        const maxCost =
            Math.max(
                ...options.map(
                    r => r.cost
                )
            );

        const maxTransfers =
            Math.max(
                1,
                ...options.map(
                    r => r.transfers
                )
            );


        return options
            .map(
                function (route) {

                    const timeScore =
                        1 -
                        (
                            route.duration /
                            maxDuration
                        );

                    const costScore =
                        1 -
                        (
                            route.cost /
                            maxCost
                        );

                    const transferScore =
                        1 -
                        (
                            route.transfers /
                            maxTransfers
                        );


                    let score = 0;


                    if (
                        preference ===
                        "fastest"
                    ) {

                        score =
                            timeScore * 0.70 +
                            costScore * 0.15 +
                            transferScore * 0.15;

                    }

                    else if (
                        preference ===
                        "cheapest"
                    ) {

                        score =
                            timeScore * 0.15 +
                            costScore * 0.70 +
                            transferScore * 0.15;

                    }

                    else if (
                        preference ===
                        "transfers"
                    ) {

                        score =
                            timeScore * 0.20 +
                            costScore * 0.15 +
                            transferScore * 0.65;

                    }

                    else {

                        score =
                            timeScore * 0.40 +
                            costScore * 0.35 +
                            transferScore * 0.25;

                    }


                    return {
                        ...route,
                        score:
                            Math.round(
                                score * 100
                            )
                    };

                }
            )
            .sort(
                function (a, b) {

                    return b.score -
                           a.score;

                }
            );
    }


    /* =====================================================
       RECOMMENDATION REASON
    ===================================================== */

    function getRouteRecommendationReason(
        route,
        preference
    ) {

        if (
            preference ===
            "fastest"
        ) {

            return `
                ⚡ Recommended because it has
                one of the shortest estimated travel times.
            `;

        }


        if (
            preference ===
            "cheapest"
        ) {

            return `
                💰 Recommended because it offers
                the lowest estimated travel cost.
            `;

        }


        if (
            preference ===
            "transfers"
        ) {

            return `
                🔄 Recommended because it minimizes
                transport changes.
            `;

        }


        if (
            route.id ===
            "rail-metro"
        ) {

            return `
                🤖 Recommended because SmartTour360
                balances long-distance travel with
                convenient city connectivity.
            `;

        }


        return `
            ⭐ Recommended as the best overall
            balance of time, cost and convenience.
        `;
    }


    /* =====================================================
       RENDER RESULTS
    ===================================================== */

    function renderSmartRouteResults(
        routes,
        from,
        destination,
        preference
    ) {

        const results =
            document.getElementById(
                "smartRouteResults"
            );

        const timeline =
            document.getElementById(
                "smartRouteTimeline"
            );


        if (!results) {
            return;
        }


        if (!routes.length) {

            results.style.display =
                "block";

            results.innerHTML = `
                <div class="route-reason">
                    ❌ No route could be generated.
                    Please try another destination.
                </div>
            `;

            return;
        }


        const recommended =
            routes[0];


        smartRouteState.recommended =
            recommended;

        smartRouteState.options =
            routes;


        let html = `

            <div class="route-result-header">
                ⭐ Best Route for You
            </div>


            <div class="route-recommended-card">

                <div class="route-recommended-top">

                    <div class="route-mode-icon">
                        ${recommended.icon}
                    </div>

                    <div class="route-recommended-info">

                        <h3>
                            ${routeEscape(
                                recommended.title
                            )}
                        </h3>

                        <p>
                            ${routeEscape(
                                recommended.subtitle
                            )}
                        </p>

                    </div>

                    <span class="route-best-badge">
                        ⭐ BEST MATCH
                    </span>

                </div>


                <div class="route-stats">

                    <div class="route-stat">
                        <strong>
                            ${formatMinutes(
                                recommended.duration
                            )}
                        </strong>
                        <span>
                            Travel Time
                        </span>
                    </div>


                    <div class="route-stat">
                        <strong>
                            ₹${recommended.cost}
                        </strong>
                        <span>
                            Est. Cost
                        </span>
                    </div>


                    <div class="route-stat">
                        <strong>
                            ${recommended.transfers}
                        </strong>
                        <span>
                            Transfers
                        </span>
                    </div>


                    <div class="route-stat">
                        <strong>
                            ${recommended.score}%
                        </strong>
                        <span>
                            Smart Score
                        </span>
                    </div>

                </div>


                <div class="route-reason">

                    ${getRouteRecommendationReason(
                        recommended,
                        preference
                    )}

                </div>

            </div>


            <div class="route-options-title">
                🛣️ Other Available Routes
            </div>


            <div class="route-option-list">
        `;


        routes.forEach(
            function (route, index) {

                html += `

                    <div class="route-option-card">

                        <div class="route-option-top">

                            <div class="route-option-icon">
                                ${route.icon}
                            </div>

                            <div>

                                <h4>
                                    ${routeEscape(
                                        route.mode
                                    )}
                                </h4>

                                <span>
                                    ${routeEscape(
                                        route.service
                                    )}
                                </span>

                            </div>

                        </div>


                        <div class="route-option-stats">

                            <span>
                                ⏱ ${formatMinutes(
                                    route.duration
                                )}
                            </span>

                            <span>
                                💰 ₹${route.cost}
                            </span>

                            <span>
                                🔄 ${route.transfers}
                                transfer
                            </span>

                            <span>
                                ⭐ ${route.score}%
                            </span>

                        </div>

                    </div>

                `;

            }
        );


        html += `
            </div>
        `;


        results.innerHTML =
            html;

        results.style.display =
            "block";


        renderSmartRouteTimeline(
            recommended,
            from,
            destination
        );


        results.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }


    /* =====================================================
       TIMELINE
    ===================================================== */

    function renderSmartRouteTimeline(
        route,
        from,
        destination
    ) {

        const timeline =
            document.getElementById(
                "smartRouteTimeline"
            );


        if (!timeline) {
            return;
        }


        let steps = [];


        if (
            route.id ===
            "rail-metro"
        ) {

            steps = [

                {
                    icon: "📍",
                    title: from,
                    subtitle: "Starting Point"
                },

                {
                    icon: "🚆",
                    title: "Railway Station",
                    subtitle: "Train Journey"
                },

                {
                    icon: "🚇",
                    title: "Metro",
                    subtitle: "City Connectivity"
                },

                {
                    icon: "🎯",
                    title: destination,
                    subtitle: "Final Destination"
                }

            ];

        }

        else if (
            route.id ===
            "railway"
        ) {

            steps = [

                {
                    icon: "📍",
                    title: from,
                    subtitle: "Starting Point"
                },

                {
                    icon: "🚆",
                    title: "Railway",
                    subtitle: "Direct Journey"
                },

                {
                    icon: "🎯",
                    title: destination,
                    subtitle: "Destination"
                }

            ];

        }

        else if (
            route.id ===
            "metro"
        ) {

            steps = [

                {
                    icon: "📍",
                    title: from,
                    subtitle: "Starting Point"
                },

                {
                    icon: "🚇",
                    title: "Metro",
                    subtitle: "City Connectivity"
                },

                {
                    icon: "🎯",
                    title: destination,
                    subtitle: "Destination"
                }

            ];

        }

        else {

            steps = [

                {
                    icon: "📍",
                    title: from,
                    subtitle: "Starting Point"
                },

                {
                    icon: "🚕",
                    title: "Road Transport",
                    subtitle: "Direct Route"
                },

                {
                    icon: "🎯",
                    title: destination,
                    subtitle: "Destination"
                }

            ];

        }


        let html = `

            <div class="route-timeline-title">
                🧭 Your Smart Journey
            </div>

            <div class="route-timeline-flow">
        `;


        steps.forEach(
            function (step, index) {

                html += `

                    <div class="route-timeline-step">

                        <div class="icon">
                            ${step.icon}
                        </div>

                        <strong>
                            ${routeEscape(
                                step.title
                            )}
                        </strong>

                        <small>
                            ${routeEscape(
                                step.subtitle
                            )}
                        </small>

                    </div>
                `;


                if (
                    index <
                    steps.length - 1
                ) {

                    html += `

                        <div class="route-timeline-arrow">
                            →
                        </div>

                    `;

                }

            }
        );


        html += `
            </div>
        `;


        timeline.innerHTML =
            html;

        timeline.style.display =
            "block";
    }


    /* =====================================================
       RUN OPTIMIZER
    ===================================================== */

    function runSmartRouteOptimizer() {

        const fromInput =
            document.getElementById(
                "routeFrom"
            );

        const destinationInput =
            document.getElementById(
                "routeDestination"
            );

        const dateInput =
            document.getElementById(
                "routeDate"
            );

        const preferenceInput =
            document.getElementById(
                "routePreference"
            );

        const loading =
            document.getElementById(
                "routeOptimizerLoading"
            );

        const results =
            document.getElementById(
                "smartRouteResults"
            );

        const timeline =
            document.getElementById(
                "smartRouteTimeline"
            );


        const from =
            fromInput?.value.trim();

        const destination =
            destinationInput?.value.trim();

        const date =
            dateInput?.value || "";

        const preference =
            preferenceInput?.value ||
            "balanced";


        /* -------------------------------------------------
           VALIDATION
        ------------------------------------------------- */

        if (!from || !destination) {

            alert(
                "Please enter From and Destination."
            );

            return;
        }


        if (
            normalizeRouteText(from) ===
            normalizeRouteText(destination)
        ) {

            alert(
                "From and Destination cannot be the same."
            );

            return;
        }


        /* -------------------------------------------------
           SAVE STATE
        ------------------------------------------------- */

        smartRouteState.from =
            from;

        smartRouteState.destination =
            destination;

        smartRouteState.date =
            date;

        smartRouteState.preference =
            preference;


        /* -------------------------------------------------
           LOADING
        ------------------------------------------------- */

        if (results) {

            results.style.display =
                "none";

            results.innerHTML =
                "";

        }


        if (timeline) {

            timeline.style.display =
                "none";

            timeline.innerHTML =
                "";

        }


        if (loading) {

            loading.style.display =
                "block";

            loading.innerHTML = `
                🤖 Analyzing Railway,
                Metro and Road routes...
            `;

        }


        /* -------------------------------------------------
           SMALL DELAY FOR PREMIUM FEEL
        ------------------------------------------------- */

        setTimeout(
            function () {

                const options =
                    createSmartRouteOptions(
                        from,
                        destination
                    );


                const scoredRoutes =
                    scoreSmartRoutes(
                        options,
                        preference
                    );


                if (loading) {

                    loading.style.display =
                        "none";

                }


                renderSmartRouteResults(
                    scoredRoutes,
                    from,
                    destination,
                    preference
                );


                /*
                 * Sync with existing transport
                 * finder where possible.
                 */

                syncSmartRouteWithTransport(
                    smartRouteState.recommended
                );

            },
            650
        );
    }


    /* =====================================================
       SYNC WITH EXISTING TRAIN / METRO FINDER
    ===================================================== */

    function syncSmartRouteWithTransport(
        route
    ) {

        if (!route) {
            return;
        }


        const fromInput =
            document.getElementById(
                "trainFrom"
            );

        const toInput =
            document.getElementById(
                "trainTo"
            );


        if (fromInput) {

            fromInput.value =
                smartRouteState.from;

        }


        if (toInput) {

            toInput.value =
                smartRouteState.destination;

        }


        /*
         * Existing transport section
         * remains independent.
         *
         * We only synchronize location
         * fields so user can continue
         * with Railway / Metro search.
         */

        if (
            route.id ===
            "railway" ||
            route.id ===
            "rail-metro"
        ) {

            if (
                typeof switchTransportMode ===
                "function"
            ) {

                switchTransportMode(
                    "railway"
                );

            }

        }

        else if (
            route.id ===
            "metro"
        ) {

            if (
                typeof switchTransportMode ===
                "function"
            ) {

                switchTransportMode(
                    "metro"
                );

            }

        }

    }


    /* =====================================================
       COPY ROUTE TO EXISTING FINDER
    ===================================================== */

    window.useSmartRouteInTransportFinder =
        function () {

            const fromInput =
                document.getElementById(
                    "trainFrom"
                );

            const toInput =
                document.getElementById(
                    "trainTo"
                );


            if (fromInput) {

                fromInput.value =
                    smartRouteState.from;

            }


            if (toInput) {

                toInput.value =
                    smartRouteState.destination;

            }


            const finder =
                document.getElementById(
                    "findTrainBtn"
                );


            if (finder) {

                finder.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });

            }

        };


    /* =====================================================
       MINIMUM DATE
    ===================================================== */

    function setSmartRouteMinimumDate() {

        const dateInput =
            document.getElementById(
                "routeDate"
            );


        if (!dateInput) {
            return;
        }


        const today =
            new Date()
                .toISOString()
                .split("T")[0];


        dateInput.min =
            today;

    }


    /* =====================================================
       INITIALIZATION
    ===================================================== */

    document.addEventListener(
        "DOMContentLoaded",
        function () {

            setSmartRouteMinimumDate();


            const button =
                document.getElementById(
                    "optimizeRouteBtn"
                );


            if (button) {

                button.addEventListener(
                    "click",
                    runSmartRouteOptimizer
                );

            }


            /*
             * If existing train location
             * button fills trainFrom,
             * mirror it into optimizer.
             */

            const locationButton =
                document.getElementById(
                    "useLocationBtn"
                );


            if (locationButton) {

                locationButton.addEventListener(
                    "click",
                    function () {

                        setTimeout(
                            function () {

                                const trainFrom =
                                    document.getElementById(
                                        "trainFrom"
                                    );

                                const routeFrom =
                                    document.getElementById(
                                        "routeFrom"
                                    );


                                if (
                                    trainFrom &&
                                    routeFrom &&
                                    trainFrom.value
                                ) {

                                    routeFrom.value =
                                        trainFrom.value;

                                }

                            },
                            500
                        );

                    }
                );

            }

        }
    );


})();
/* =========================================================
   SMARTTOUR360 - PREMIUM LIVE TRAIN MAP UPGRADE
   Demo / Simulation mode
========================================================= */

(function () {

    "use strict";

    let st360DemoTrainMarker = null;
    let st360AnimationTimer = null;

    let st360CurrentLat = null;
    let st360CurrentLng = null;

    /* ---------------------------------------------------------
       SAFE ELEMENT HELPER
    --------------------------------------------------------- */

    function st360Get(id) {
        return document.getElementById(id);
    }


    /* ---------------------------------------------------------
       CREATE PREMIUM MAP CONTROL PANEL
    --------------------------------------------------------- */

    function st360CreatePanel() {

        const mapSection = st360Get("liveTrainMap");

        if (!mapSection) return;

        if (st360Get("st360MapUpgradePanel")) return;

        const mapElement = st360Get("smartTrainMap");

        if (!mapElement) return;

        const panel = document.createElement("div");

        panel.id = "st360MapUpgradePanel";

        panel.className = "st360-map-upgrade-panel";

        panel.innerHTML = `

            <div class="st360-map-topbar">

                <div class="st360-map-live-status">

                    <span
                        id="st360LiveDot"
                        class="st360-live-dot">
                    </span>

                    <span id="st360MapStatusText">
                        Map Ready
                    </span>

                </div>

                <div class="st360-demo-badge">
                    DEMO / SIMULATION
                </div>

            </div>


            <div class="st360-map-actions">

                <button
                    type="button"
                    class="st360-map-action-btn primary"
                    id="st360DetectLocationBtn">

                    📍 Detect My Location

                </button>


                <button
                    type="button"
                    class="st360-map-action-btn"
                    id="st360NearestStationBtn">

                    🚉 Nearest Station

                </button>


                <button
                    type="button"
                    class="st360-map-action-btn"
                    id="st360FitRouteBtn">

                    🗺️ Fit Route

                </button>

            </div>


            <div class="st360-map-status-grid">

                <div class="st360-map-status-card">

                    <span>GPS Status</span>

                    <strong id="st360GPSStatus">
                        Waiting...
                    </strong>

                </div>


                <div class="st360-map-status-card">

                    <span>Nearest Station</span>

                    <strong id="st360StationStatus">
                        --
                    </strong>

                </div>


                <div class="st360-map-status-card">

                    <span>Route Distance</span>

                    <strong id="st360DistanceStatus">
                        --
                    </strong>

                </div>

            </div>


            <div
                class="st360-map-message"
                id="st360MapMessage">

                💡 Click "Detect My Location" to find your
                nearest railway station.

            </div>


            <div class="st360-map-section-note">

                ℹ️ Train movement shown on this map is a
                demonstration simulation. Real-time railway
                tracking API can be connected later.

            </div>

        `;

        mapElement.parentNode.insertBefore(
            panel,
            mapElement
        );


        /* BUTTON EVENTS */

        const detectBtn =
            st360Get("st360DetectLocationBtn");

        const nearestBtn =
            st360Get("st360NearestStationBtn");

        const fitBtn =
            st360Get("st360FitRouteBtn");


        if (detectBtn) {

            detectBtn.addEventListener(
                "click",
                st360DetectLocation
            );

        }


        if (nearestBtn) {

            nearestBtn.addEventListener(
                "click",
                st360FindNearestStation
            );

        }


        if (fitBtn) {

            fitBtn.addEventListener(
                "click",
                st360FitRoute
            );

        }

    }


    /* ---------------------------------------------------------
       STATUS MESSAGE
    --------------------------------------------------------- */

    function st360SetMessage(message) {

        const box =
            st360Get("st360MapMessage");

        if (box) {

            box.textContent = message;

        }

    }


    /* ---------------------------------------------------------
       GPS STATUS
    --------------------------------------------------------- */

    function st360SetGPSStatus(
        text,
        warning = false
    ) {

        const status =
            st360Get("st360GPSStatus");

        const dot =
            st360Get("st360LiveDot");

        const topText =
            st360Get("st360MapStatusText");


        if (status) {

            status.textContent = text;

        }


        if (dot) {

            dot.classList.toggle(
                "warning",
                warning
            );

        }


        if (topText) {

            topText.textContent =
                warning
                    ? "GPS Needs Permission"
                    : text;

        }

    }


    /* ---------------------------------------------------------
       DETECT LOCATION
    --------------------------------------------------------- */

    function st360DetectLocation() {

        if (
            !navigator.geolocation
        ) {

            st360SetGPSStatus(
                "Not Supported",
                true
            );

            st360SetMessage(
                "⚠️ Your browser does not support location services."
            );

            return;

        }


        st360SetGPSStatus(
            "Detecting...",
            false
        );


        st360SetMessage(
            "📍 Requesting your current location..."
        );


        navigator.geolocation.getCurrentPosition(

            function (position) {

                const lat =
                    position.coords.latitude;

                const lng =
                    position.coords.longitude;


                st360CurrentLat = lat;
                st360CurrentLng = lng;


                window.smartTourCurrentLocation = {
                    lat: lat,
                    lng: lng
                };


                /* USE EXISTING MAP */

                if (
                    typeof initializeSmartTrainMap ===
                    "function"
                ) {

                    initializeSmartTrainMap(
                        lat,
                        lng
                    );

                }


                /* CURRENT MARKER */

                if (
                    typeof currentLocationMarker !==
                    "undefined"
                ) {

                    if (currentLocationMarker) {

                        currentLocationMarker.remove();

                    }

                }


                if (
                    typeof smartTrainMap !==
                    "undefined" &&
                    smartTrainMap &&
                    typeof L !== "undefined"
                ) {

                    currentLocationMarker =
                        L.marker([
                            lat,
                            lng
                        ])
                        .addTo(smartTrainMap)
                        .bindPopup(
                            "📍 <b>You are here</b>"
                        )
                        .openPopup();

                }


                st360SetGPSStatus(
                    "GPS Active",
                    false
                );


                st360SetMessage(
                    "✅ Your location detected successfully."
                );


                const currentLocationName =
                    st360Get(
                        "currentLocationName"
                    );


                if (currentLocationName) {

                    currentLocationName.textContent =
                        "Current Location";

                }


                st360FindNearestStation();

            },

            function (error) {

                console.log(
                    "SmartTour360 GPS:",
                    error.message
                );


                st360SetGPSStatus(
                    "Permission Needed",
                    true
                );


                st360SetMessage(
                    "⚠️ Location permission was not available. Please allow location access in your browser."
                );


                if (
                    typeof initializeSmartTrainMap ===
                    "function"
                ) {

                    initializeSmartTrainMap();

                }

            },

            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 60000
            }

        );

    }


    /* ---------------------------------------------------------
       FIND NEAREST STATION
    --------------------------------------------------------- */

    function st360FindNearestStation() {

        if (
            st360CurrentLat === null ||
            st360CurrentLng === null
        ) {

            if (
                window.smartTourCurrentLocation
            ) {

                st360CurrentLat =
                    window.smartTourCurrentLocation.lat;

                st360CurrentLng =
                    window.smartTourCurrentLocation.lng;

            }

        }


        if (
            st360CurrentLat === null ||
            st360CurrentLng === null
        ) {

            st360SetMessage(
                "📍 First detect your location."
            );

            return;

        }


        if (
            typeof findNearestMapStation !==
            "function"
        ) {

            st360SetMessage(
                "⚠️ Railway station data is not available."
            );

            return;

        }


        const nearest =
            findNearestMapStation(
                st360CurrentLat,
                st360CurrentLng
            );


        if (!nearest) {

            st360SetMessage(
                "⚠️ No nearby railway station found in the available data."
            );

            return;

        }


        const distance =
            Number(nearest.distance || 0);


        /* UPDATE CARDS */

        const stationStatus =
            st360Get(
                "st360StationStatus"
            );

        const distanceStatus =
            st360Get(
                "st360DistanceStatus"
            );


        if (stationStatus) {

            stationStatus.textContent =
                nearest.name || "Nearest Station";

        }


        if (distanceStatus) {

            distanceStatus.textContent =
                distance.toFixed(1) + " KM";

        }


        const stationName =
            st360Get(
                "nearestStationName"
            );


        if (stationName) {

            stationName.textContent =
                nearest.name || "--";

        }


        const journeyDistance =
            st360Get(
                "journeyDistance"
            );


        if (journeyDistance) {

            journeyDistance.textContent =
                distance.toFixed(1) + " KM";

        }


        /* STATION MARKER */

        if (
            typeof smartTrainMap !==
            "undefined" &&
            smartTrainMap &&
            typeof L !== "undefined"
        ) {

            st360DrawStation(
                nearest
            );

        }


        st360SetMessage(
            "🚉 Nearest station: " +
            (nearest.name || "Railway Station") +
            " • " +
            distance.toFixed(1) +
            " KM away."
        );


        /* START DEMO TRAIN */

        st360StartDemoTrain(
            nearest
        );

    }


    /* ---------------------------------------------------------
       DRAW STATION
    --------------------------------------------------------- */

    function st360DrawStation(
        station
    ) {

        if (
            typeof smartTrainMap ===
            "undefined" ||
            !smartTrainMap
        ) {

            return;

        }


        if (
            typeof destinationMarker !==
            "undefined" &&
            destinationMarker
        ) {

            destinationMarker.remove();

        }


        destinationMarker =
            L.marker([
                station.lat,
                station.lng
            ])
            .addTo(smartTrainMap)
            .bindPopup(
                "🚉 <b>" +
                (station.name || "Railway Station") +
                "</b>"
            );


        if (
            typeof routeLine !==
            "undefined" &&
            routeLine
        ) {

            routeLine.remove();

        }


        routeLine =
            L.polyline(
                [
                    [
                        st360CurrentLat,
                        st360CurrentLng
                    ],
                    [
                        station.lat,
                        station.lng
                    ]
                ],
                {
                    weight: 5,
                    dashArray: "10,10"
                }
            )
            .addTo(smartTrainMap);


        st360FitRoute();

    }


    /* ---------------------------------------------------------
       FIT ROUTE
    --------------------------------------------------------- */

    function st360FitRoute() {

        if (
            typeof smartTrainMap ===
            "undefined" ||
            !smartTrainMap
        ) {

            return;

        }


        if (
            typeof routeLine !==
            "undefined" &&
            routeLine
        ) {

            smartTrainMap.fitBounds(
                routeLine.getBounds(),
                {
                    padding: [
                        45,
                        45
                    ]
                }
            );

            return;

        }


        if (
            st360CurrentLat !== null &&
            st360CurrentLng !== null
        ) {

            smartTrainMap.setView(
                [
                    st360CurrentLat,
                    st360CurrentLng
                ],
                12
            );

        }

    }


    /* ---------------------------------------------------------
       CREATE TRAIN ICON
    --------------------------------------------------------- */

    function st360CreateTrainIcon() {

        return L.divIcon({

            className: "",

            html: `
                <div class="st360-train-marker">
                    🚆
                </div>
            `,

            iconSize: [
                42,
                42
            ],

            iconAnchor: [
                21,
                21
            ]

        });

    }


    /* ---------------------------------------------------------
       DEMO TRAIN MOVEMENT
    --------------------------------------------------------- */

    function st360StartDemoTrain(
        station
    ) {

        if (
            typeof L === "undefined" ||
            typeof smartTrainMap ===
            "undefined" ||
            !smartTrainMap
        ) {

            return;

        }


        if (
            st360DemoTrainMarker
        ) {

            st360DemoTrainMarker.remove();

        }


        if (
            st360AnimationTimer
        ) {

            clearInterval(
                st360AnimationTimer
            );

        }


        const startLat =
            st360CurrentLat;

        const startLng =
            st360CurrentLng;


        const endLat =
            Number(station.lat);

        const endLng =
            Number(station.lng);


        if (
            !Number.isFinite(startLat) ||
            !Number.isFinite(startLng) ||
            !Number.isFinite(endLat) ||
            !Number.isFinite(endLng)
        ) {

            return;

        }


        st360DemoTrainMarker =
            L.marker(
                [
                    startLat,
                    startLng
                ],
                {
                    icon:
                        st360CreateTrainIcon(),
                    zIndexOffset: 1000
                }
            )
            .addTo(smartTrainMap)
            .bindPopup(`
                <div class="st360-train-popup">

                    <div class="st360-train-popup-title">
                        🚆 SmartTour360 Demo Train
                    </div>

                    <div class="st360-train-popup-sub">
                        Simulated movement toward
                        ${station.name || "station"}
                    </div>

                </div>
            `);


        let progress = 0;


        st360SetMessage(
            "🚆 Demo train simulation started toward " +
            (station.name || "nearest station") +
            "."
        );


        st360AnimationTimer =
            setInterval(
                function () {

                    progress += 0.025;


                    if (
                        progress >= 1
                    ) {

                        progress = 1;

                    }


                    const lat =
                        startLat +
                        (
                            endLat -
                            startLat
                        ) *
                        progress;


                    const lng =
                        startLng +
                        (
                            endLng -
                            startLng
                        ) *
                        progress;


                    st360DemoTrainMarker.setLatLng(
                        [
                            lat,
                            lng
                        ]
                    );


                    if (
                        progress >= 1
                    ) {

                        clearInterval(
                            st360AnimationTimer
                        );


                        st360SetMessage(
                            "🏁 Demo train reached " +
                            (station.name ||
                                "the nearest station") +
                            "."
                        );

                    }

                },
                150
            );

    }


    /* ---------------------------------------------------------
       INITIALIZE
    --------------------------------------------------------- */

    function st360InitializeMapUpgrade() {

        const map =
            st360Get(
                "smartTrainMap"
            );

        if (!map) return;


        st360CreatePanel();


        /* If old location exists */

        if (
            window.smartTourCurrentLocation
        ) {

            st360CurrentLat =
                window.smartTourCurrentLocation.lat;

            st360CurrentLng =
                window.smartTourCurrentLocation.lng;

        }

    }


    /* ---------------------------------------------------------
       PAGE LOAD
    --------------------------------------------------------- */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            function () {

                setTimeout(
                    st360InitializeMapUpgrade,
                    800
                );

            }
        );

    } else {

        setTimeout(
            st360InitializeMapUpgrade,
            800
        );

    }


})();
/* =========================================================
   SMARTTOUR360 - PREMIUM RAILWAY + METRO POLISH
   APPEND-ONLY UPGRADE
========================================================= */

(function () {
    "use strict";

    function st360Safe(value) {
        if (typeof escapeHtml === "function") {
            return escapeHtml(value);
        }

        return String(value ?? "").replace(
            /[&<>'"]/g,
            ch => ({
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                "'": "&#39;",
                '"': "&quot;"
            }[ch])
        );
    }

    function st360EstimateFare(item) {
        const duration = String(item?.duration || "").toLowerCase();

        if (duration.includes("8h")) return "₹750–₹1,100";
        if (duration.includes("12h")) return "₹600–₹950";
        if (duration.includes("5h")) return "₹450–₹850";
        if (duration.includes("4h")) return "₹350–₹700";
        if (duration.includes("50")) return "₹40–₹70";
        if (duration.includes("30")) return "₹30–₹50";
        if (duration.includes("25")) return "₹30–₹50";

        return "₹50–₹500";
    }

    function st360Transfers(item) {
        const type = String(item?.type || "").toLowerCase();

        if (type.includes("metro")) {
            return "0";
        }

        return "1";
    }

    function st360BuildTimeline(from, to, isMetro) {
        const transportIcon = isMetro ? "🚇" : "🚆";
        const transportName = isMetro ? "Metro" : "Train";

        return `
            <div class="st360-route-timeline">
                <h4>🧭 Smart Journey Timeline</h4>

                <div class="st360-timeline">

                    <div class="st360-timeline-item">
                        <div class="st360-timeline-icon">📍</div>
                        <strong>Start</strong>
                        <span>${st360Safe(from)}</span>
                    </div>

                    <div class="st360-timeline-item">
                        <div class="st360-timeline-icon">
                            ${isMetro ? "🚇" : "🚉"}
                        </div>
                        <strong>${isMetro ? "Metro Station" : "Railway Station"}</strong>
                        <span>Board here</span>
                    </div>

                    <div class="st360-timeline-item">
                        <div class="st360-timeline-icon">
                            ${transportIcon}
                        </div>
                        <strong>${transportName}</strong>
                        <span>Journey</span>
                    </div>

                    ${
                        !isMetro
                        ? `
                        <div class="st360-timeline-item">
                            <div class="st360-timeline-icon">🚇</div>
                            <strong>Metro</strong>
                            <span>Final connection</span>
                        </div>
                        `
                        : ""
                    }

                    <div class="st360-timeline-item">
                        <div class="st360-timeline-icon">🎯</div>
                        <strong>Destination</strong>
                        <span>${st360Safe(to)}</span>
                    </div>

                </div>
            </div>
        `;
    }

    function st360BuildConnection(item, to) {

        const station =
            item?.to ||
            "Nearest Railway Station";

        let metroName = "Nearest Metro Connection";

        const destination =
            String(to || "").toLowerCase();

        if (
            destination.includes("delhi") ||
            destination.includes("new delhi")
        ) {
            metroName = "Delhi Metro Network";
        } else if (
            destination.includes("varanasi")
        ) {
            metroName = "Local Metro / City Transit";
        }

        return `
            <div class="st360-connection-card">

                <div class="st360-connection-head">
                    <span>🔗</span>
                    <strong>Smart Railway → Metro Connection</strong>
                </div>

                <div class="st360-connection-grid">

                    <div class="st360-connection-item">
                        <small>Railway Arrival</small>
                        <strong>${st360Safe(station)}</strong>
                    </div>

                    <div class="st360-connection-item">
                        <small>Metro Network</small>
                        <strong>${st360Safe(metroName)}</strong>
                    </div>

                    <div class="st360-connection-item">
                        <small>Transfer Estimate</small>
                        <strong>15–25 min</strong>
                    </div>

                </div>

                <div style="
                    margin-top:10px;
                    font-size:9px;
                    opacity:.52;
                ">
                    Demo estimate • Actual metro connection depends on
                    station, traffic and service availability.
                </div>

            </div>
        `;
    }

    function st360UpgradeResults(data, from, to, date, source) {

        const results =
            document.getElementById("trainResults");

        if (!results) return;

        const isMetro =
            typeof selectedTransportMode !== "undefined" &&
            selectedTransportMode === "metro";

        if (!Array.isArray(data) || !data.length) {

            results.innerHTML = `
                <div class="st360-transport-empty">

                    <div class="st360-empty-icon">
                        ${isMetro ? "🚇" : "🚆"}
                    </div>

                    <h4>
                        No matching
                        ${isMetro ? "metro" : "railway"}
                        option found
                    </h4>

                    <p>
                        ${st360Safe(from)}
                        →
                        ${st360Safe(to)}
                    </p>

                    <p style="margin-top:8px;">
                        Try another station or supported demo route.
                    </p>

                </div>
            `;

            return;
        }

        const finalData =
            typeof filterMatches === "function"
                ? data.filter(item => filterMatches(item)).length
                    ? data.filter(item => filterMatches(item))
                    : data
                : data;

        const recommended = finalData[0];

        let html = `
            <div class="st360-transport-premium">

                <div class="st360-transport-head">

                    <div>
                        <div class="st360-transport-title">
                            ${isMetro ? "🚇 Smart Metro Options" : "🚆 Smart Railway Options"}
                        </div>

                        <div class="st360-transport-subtitle">
                            ${st360Safe(from)}
                            →
                            ${st360Safe(to)}
                            •
                            ${st360Safe(date)}
                        </div>
                    </div>

                    <div class="st360-source-pill">
                        ${st360Safe(source)}
                    </div>

                </div>

                <div class="st360-premium-results">
        `;

        finalData.forEach((item, index) => {

            const fare = st360EstimateFare(item);
            const transfers = st360Transfers(item);

            const image =
                item.image ||
                (
                    isMetro
                        ? "data:image/png;base64,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"
                        : "data:image/png;base64,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"
                );

            html += `
                <article class="st360-premium-card">

                    <div class="st360-premium-image-wrap">

                        <img
                            class="st360-premium-image"
                            src="${st360Safe(image)}"
                            alt="${st360Safe(item.name || "Transport")}"
                            onerror="this.onerror=null;this.src='${
                                isMetro
                                    ? "data:image/png;base64,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"
                                    : "data:image/png;base64,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"
                            }';"
                        >

                        ${
                            index === 0
                                ? `<span class="st360-best-match">⭐ BEST MATCH</span>`
                                : ""
                        }

                        <span class="st360-transport-badge">
                            ${isMetro ? "🚇 METRO" : "🚆 TRAIN"}
                        </span>

                    </div>

                    <div class="st360-premium-body">

                        <div class="st360-card-number">
                            ${st360Safe(item.number || "—")}
                        </div>

                        <div class="st360-card-name">
                            ${st360Safe(item.name || "Transport Option")}
                        </div>

                        <div class="st360-card-route">

                            <div class="st360-route-place">
                                ${st360Safe(item.from || from)}
                            </div>

                            <div class="st360-route-arrow">
                                →
                            </div>

                            <div class="st360-route-place">
                                ${st360Safe(item.to || to)}
                            </div>

                        </div>

                        <div class="st360-time-row">
                            <span>
                                🕐 ${st360Safe(item.departure || "—")}
                            </span>

                            <span>
                                🕐 ${st360Safe(item.arrival || "—")}
                            </span>
                        </div>

                        <div class="st360-card-stats">

                            <div class="st360-stat">
                                <small>Duration</small>
                                <strong>
                                    ${st360Safe(item.duration || "—")}
                                </strong>
                            </div>

                            <div class="st360-stat">
                                <small>Type</small>
                                <strong>
                                    ${st360Safe(item.type || "Standard")}
                                </strong>
                            </div>

                            <div class="st360-stat">
                                <small>Class / Pass</small>
                                <strong>
                                    ${st360Safe(item.classes || (isMetro ? "General" : "Standard"))}
                                </strong>
                            </div>

                        </div>

                        <div class="st360-live-row">
                            <span class="st360-status-dot">●</span>
                            <strong>Scheduled</strong>
                            <span>SmartTour360 demo timetable</span>
                        </div>

                        <div class="st360-card-footer">

                            <div class="st360-fare">
                                ${fare}
                                <small>Estimated fare</small>
                            </div>

                            <button
                                class="st360-details-btn"
                                type="button"
                                onclick='st360TransportDetails(${JSON.stringify({
                                    name: item.name || "Transport",
                                    number: item.number || "",
                                    from: item.from || from,
                                    to: item.to || to,
                                    duration: item.duration || "",
                                    type: item.type || ""
                                }).replace(/'/g, "&#39;")})'
                            >
                                View Details →
                            </button>

                        </div>

                    </div>

                </article>
            `;
        });

        html += `
                </div>

                ${st360BuildTimeline(
                    from,
                    to,
                    isMetro
                )}

                ${
                    !isMetro
                        ? st360BuildConnection(
                            recommended,
                            to
                        )
                        : ""
                }

            </div>
        `;

        results.innerHTML = html;
    }

    window.st360TransportDetails = function (item) {

        if (!item) return;

        if (
            typeof showTrainDetails === "function" &&
            !String(item.type).toLowerCase().includes("metro")
        ) {
            showTrainDetails(
                item.name,
                item.number,
                item.from,
                item.to
            );
            return;
        }

        const message =
            `🚇 ${item.name}\n\n` +
            `${item.from} → ${item.to}\n` +
            `Duration: ${item.duration || "—"}\n` +
            `Type: ${item.type || "Metro"}\n\n` +
            `SmartTour360 demo information.`;

        alert(message);
    };

    /*
       Override result renderer safely.
       Existing findSmartTrains() continues working.
    */
    const originalRenderer =
        window.renderSmartTransportResults;

    window.renderSmartTransportResults =
        function (data, from, to, date, source) {

            st360UpgradeResults(
                data,
                from,
                to,
                date,
                source
            );
        };

    /*
       Also expose renderer globally in case
       existing code calls it directly.
    */
    if (typeof originalRenderer === "function") {
        window.renderSmartTransportResults =
            function (data, from, to, date, source) {
                st360UpgradeResults(
                    data,
                    from,
                    to,
                    date,
                    source
                );
            };
    }

    /*
       Loading state enhancement
    */
    const trainButton =
        document.getElementById("findTrainBtn");

    if (trainButton) {

        trainButton.addEventListener("click", function () {

            const results =
                document.getElementById("trainResults");

            if (!results) return;

            setTimeout(() => {

                if (
                    results.innerHTML.includes("Searching")
                ) {

                    results.innerHTML = `
                        <div class="st360-loading">
                            <span class="st360-loading-dot">
                                🔎
                            </span>
                            Searching smart transport options...
                        </div>
                    `;
                }

            }, 20);

        });

    }

})();

/* =========================================================
   SMARTTOUR360 - EMERGENCY + NEARBY + MAP + PACKING + REVIEWS
========================================================= */

const st360FeaturePlaces = {
    "rishikesh": {
        center: [30.0869, 78.2676],
        places: [
            ["🏛️ Laxman Jhula", "Tourist Place", 1.2],
            ["🏛️ Triveni Ghat", "Tourist Place", 2.1],
            ["🏥 AIIMS Rishikesh", "Hospital", 5.4],
            ["👮 Rishikesh Police Station", "Police", 2.7],
            ["🏨 Riverside Stay Area", "Hotel", 1.5],
            ["🍴 Tapovan Food Street", "Restaurant", 2.8]
        ]
    },
    "manali": {
        center: [32.2432, 77.1892],
        places: [
            ["🏛️ Hadimba Temple", "Tourist Place", 1.8],
            ["🏛️ Solang Valley", "Tourist Place", 13.0],
            ["🏥 Civil Hospital Manali", "Hospital", 1.6],
            ["👮 Manali Police Station", "Police", 1.9],
            ["🏨 Mall Road Hotels", "Hotel", 1.2],
            ["🍴 Old Manali Cafés", "Restaurant", 2.0]
        ]
    },
    "goa": {
        center: [15.4909, 73.8278],
        places: [
            ["🏛️ Fort Aguada", "Tourist Place", 12.0],
            ["🏛️ Calangute Beach", "Tourist Place", 10.0],
            ["🏥 Goa Medical College", "Hospital", 9.8],
            ["👮 Panaji Police Station", "Police", 1.4],
            ["🏨 Panaji Hotels", "Hotel", 1.2],
            ["🍴 Panaji Food Street", "Restaurant", 1.0]
        ]
    },
    "jaipur": {
        center: [26.9124, 75.7873],
        places: [
            ["🏛️ Hawa Mahal", "Tourist Place", 3.0],
            ["🏛️ Amber Fort", "Tourist Place", 11.0],
            ["🏥 SMS Hospital", "Hospital", 2.4],
            ["👮 Jaipur Police Station", "Police", 2.0],
            ["🏨 MI Road Hotels", "Hotel", 1.5],
            ["🍴 C-Scheme Restaurants", "Restaurant", 2.2]
        ]
    },
    "varanasi": {
        center: [25.3176, 82.9739],
        places: [
            ["🏛️ Dashashwamedh Ghat", "Tourist Place", 1.2],
            ["🏛️ Sarnath", "Tourist Place", 10.5],
            ["🏥 BHU Hospital", "Hospital", 6.5],
            ["👮 Varanasi Police Station", "Police", 1.7],
            ["🏨 Godowlia Hotels", "Hotel", 1.1],
            ["🍴 Godowlia Food Area", "Restaurant", 1.3]
        ]
    },
    "agra": {
        center: [27.1767, 78.0081],
        places: [
            ["🏛️ Taj Mahal", "Tourist Place", 2.8],
            ["🏛️ Agra Fort", "Tourist Place", 3.4],
            ["🏥 SN Medical College", "Hospital", 3.8],
            ["👮 Agra Police Station", "Police", 2.1],
            ["🏨 Taj Ganj Hotels", "Hotel", 1.0],
            ["🍴 Sadar Bazaar Restaurants", "Restaurant", 4.2]
        ]
    },
    "shimla": {
        center: [31.1048, 77.1734],
        places: [
            ["🏛️ The Ridge", "Tourist Place", 1.0],
            ["🏛️ Kufri", "Tourist Place", 16.0],
            ["🏥 IGMC Shimla", "Hospital", 2.3],
            ["👮 Shimla Police Station", "Police", 1.4],
            ["🏨 Mall Road Hotels", "Hotel", 1.0],
            ["🍴 Mall Road Cafés", "Restaurant", 1.0]
        ]
    },
    "udaipur": {
        center: [24.5854, 73.7125],
        places: [
            ["🏛️ City Palace", "Tourist Place", 1.5],
            ["🏛️ Lake Pichola", "Tourist Place", 1.8],
            ["🏥 Maharana Bhopal Hospital", "Hospital", 3.2],
            ["👮 Udaipur Police Station", "Police", 2.0],
            ["🏨 Lake Pichola Hotels", "Hotel", 1.2],
            ["🍴 Old City Restaurants", "Restaurant", 1.1]
        ]
    },
    "kerala": {
        center: [9.9312, 76.2673],
        places: [
            ["🏛️ Fort Kochi", "Tourist Place", 5.4],
            ["🏛️ Marine Drive Kochi", "Tourist Place", 1.8],
            ["🏥 General Hospital Ernakulam", "Hospital", 2.2],
            ["👮 Kochi Police Station", "Police", 2.0],
            ["🏨 Fort Kochi Hotels", "Hotel", 5.0],
            ["🍴 Fort Kochi Cafés", "Restaurant", 5.0]
        ]
    },
    "ayodhya": {
        center: [26.7990, 82.2040],
        places: [
            ["🏛️ Ram Mandir", "Tourist Place", 2.0],
            ["🏛️ Saryu Ghat", "Tourist Place", 2.5],
            ["🏥 District Hospital Ayodhya", "Hospital", 3.0],
            ["👮 Ayodhya Police Station", "Police", 2.2],
            ["🏨 Ram Path Hotels", "Hotel", 1.8],
            ["🍴 Local Food Area", "Restaurant", 2.0]
        ]
    },
    "vrindavan": {
        center: [27.5811, 77.7060],
        places: [
            ["🏛️ Prem Mandir", "Tourist Place", 2.0],
            ["🏛️ Banke Bihari Temple", "Tourist Place", 1.5],
            ["🏥 District Hospital Mathura", "Hospital", 12.0],
            ["👮 Vrindavan Police Station", "Police", 2.0],
            ["🏨 Vrindavan Hotels", "Hotel", 1.0],
            ["🍴 Vrindavan Food Area", "Restaurant", 1.4]
        ]
    },
    "jammu & kashmir": {
        center: [34.0837, 74.7973],
        places: [
            ["🏛️ Dal Lake", "Tourist Place", 4.0],
            ["🏛️ Mughal Gardens", "Tourist Place", 9.0],
            ["🏥 SMHS Hospital", "Hospital", 2.7],
            ["👮 Srinagar Police Station", "Police", 2.0],
            ["🏨 Dal Lake Hotels", "Hotel", 4.0],
            ["🍴 Boulevard Restaurants", "Restaurant", 4.0]
        ]
    }
};

const st360DefaultReviews = [
    { name: "Aarav", destination: "Rishikesh", rating: 5, text: "Beautiful destination and very easy to plan with SmartTour360." },
    { name: "Priya", destination: "Jaipur", rating: 5, text: "Loved the heritage places and the trip planning tools." },
    { name: "Rahul", destination: "Varanasi", rating: 4, text: "Useful travel information and a clean tourism experience." }
];

function openEmergencySafety() {
    const modal = document.getElementById("emergencySafetyModal");
    if (!modal) return;
    modal.classList.add("active");
    modal.setAttribute("aria-hidden", "false");
}

function closeEmergencySafety() {
    const modal = document.getElementById("emergencySafetyModal");
    if (!modal) return;
    modal.classList.remove("active");
    modal.setAttribute("aria-hidden", "true");
}

function confirmTouristSOS() {
    const ok = confirm(
        "SOS is an emergency action. Do you want to call India's emergency number 112?"
    );
    if (ok) {
        window.location.href = "tel:112";
    }
}

function shareTouristLocation() {
    if (!navigator.geolocation) {
        alert("Location services are not supported by this browser.");
        return;
    }

    navigator.geolocation.getCurrentPosition(
        position => {
            const lat = position.coords.latitude.toFixed(6);
            const lng = position.coords.longitude.toFixed(6);
            const mapLink = `https://www.google.com/maps?q=${lat},${lng}`;

            if (navigator.share) {
                navigator.share({
                    title: "My SmartTour360 Location",
                    text: `My current travel location: ${lat}, ${lng}`,
                    url: mapLink
                }).catch(() => {});
            } else if (navigator.clipboard) {
                navigator.clipboard.writeText(mapLink)
                    .then(() => alert("Location link copied to clipboard."))
                    .catch(() => alert(`Your location: ${lat}, ${lng}`));
            } else {
                alert(`Your location: ${lat}, ${lng}`);
            }
        },
        () => alert("Unable to access your location. Please allow location permission.")
    );
}

function findNearbyHospital() {
    document.getElementById("nearbyPlaceType").value = "hospital";
    document.getElementById("smartTools")?.scrollIntoView({ behavior: "smooth" });
    setTimeout(findNearbyPlaces, 450);
}

function getSt360DestinationKey(value) {
    const text = String(value || "").toLowerCase().trim();
    if (text === "jammu" || text === "kashmir" || text.includes("jammu")) {
        return "jammu & kashmir";
    }
    return text;
}

function findNearbyPlaces() {
    const key = getSt360DestinationKey(
        document.getElementById("smartMapDestination")?.value ||
        document.getElementById("packingDestination")?.value ||
        document.getElementById("recommendationDestination")?.value
    );
    const type = document.getElementById("nearbyPlaceType")?.value || "tourist";
    const box = document.getElementById("nearbyPlacesResults");

    if (!box) return;

    const data = st360FeaturePlaces[key];
    if (!data) {
        box.innerHTML = `<div class="st360-nearby-item"><strong>Choose a supported destination first.</strong><span>Try Rishikesh, Manali, Goa, Jaipur, Varanasi, Agra, Shimla, Kerala, Udaipur, Ayodhya, Vrindavan or Jammu & Kashmir.</span></div>`;
        return;
    }

    const labels = {
        tourist: "Tourist Place",
        hospital: "Hospital",
        police: "Police",
        hotel: "Hotel",
        restaurant: "Restaurant"
    };

    const matches = data.places.filter(item => item[1].toLowerCase() === labels[type].toLowerCase());

    box.innerHTML = matches.map(item => `
        <div class="st360-nearby-item">
            <strong>${escapeHtml(item[0])}</strong>
            <span>${escapeHtml(item[1])} • Approx. ${escapeHtml(item[2])} km from destination centre</span>
        </div>
    `).join("") || `<div class="st360-nearby-item"><strong>No demo place found.</strong><span>Try another category.</span></div>`;
}

function st360LoadLeaflet(callback) {
    if (window.L) {
        callback();
        return;
    }

    if (document.getElementById("st360LeafletLoader")) {
        const wait = setInterval(() => {
            if (window.L) {
                clearInterval(wait);
                callback();
            }
        }, 100);
        setTimeout(() => clearInterval(wait), 8000);
        return;
    }

    const script = document.createElement("script");
    script.id = "st360LeafletLoader";
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.onload = callback;
    script.onerror = () => alert("Map library could not be loaded. Check your internet connection.");
    document.head.appendChild(script);
}

let st360SmartMap = null;

function showSmartTourMap(destination) {
    const input = document.getElementById("smartMapDestination");
    const key = getSt360DestinationKey(destination || input?.value);

    if (!st360FeaturePlaces[key]) {
        alert("Please enter a supported destination such as Rishikesh, Manali, Goa, Jaipur or Varanasi.");
        return;
    }

    if (input) input.value = st360FeaturePlaces[key] ? (
        key === "jammu & kashmir" ? "Jammu & Kashmir" :
        key.charAt(0).toUpperCase() + key.slice(1)
    ) : "";

    const center = st360FeaturePlaces[key].center;

    st360LoadLeaflet(() => {
        const mapElement = document.getElementById("smartTourMap");
        if (!mapElement) return;

        if (!st360SmartMap) {
            st360SmartMap = L.map(mapElement).setView(center, 12);
            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                maxZoom: 19,
                attribution: "&copy; OpenStreetMap contributors"
            }).addTo(st360SmartMap);
        } else {
            st360SmartMap.setView(center, 12);
            st360SmartMap.eachLayer(layer => {
                if (layer instanceof L.Marker || layer instanceof L.CircleMarker) {
                    st360SmartMap.removeLayer(layer);
                }
            });
        }

        L.marker(center)
            .addTo(st360SmartMap)
            .bindPopup(`<b>${escapeHtml(input?.value || "Destination")}</b><br>SmartTour360 destination centre`)
            .openPopup();

        st360FeaturePlaces[key].places.forEach(item => {
            L.circleMarker(
                [center[0] + (Math.random() - .5) * .04, center[1] + (Math.random() - .5) * .04],
                { radius: 7 }
            ).addTo(st360SmartMap).bindPopup(
                `<b>${escapeHtml(item[0])}</b><br>${escapeHtml(item[1])} • approx. ${escapeHtml(item[2])} km`
            );
        });

        setTimeout(() => st360SmartMap.invalidateSize(), 100);
    });
}

function useMyMapLocation() {
    if (!navigator.geolocation) {
        alert("Location services are not supported by this browser.");
        return;
    }

    navigator.geolocation.getCurrentPosition(
        position => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;

            st360LoadLeaflet(() => {
                const mapElement = document.getElementById("smartTourMap");
                if (!mapElement) return;

                if (!st360SmartMap) {
                    st360SmartMap = L.map(mapElement).setView([lat, lng], 14);
                    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                        maxZoom: 19,
                        attribution: "&copy; OpenStreetMap contributors"
                    }).addTo(st360SmartMap);
                } else {
                    st360SmartMap.setView([lat, lng], 14);
                }

                L.marker([lat, lng])
                    .addTo(st360SmartMap)
                    .bindPopup("<b>📍 Your Current Location</b>")
                    .openPopup();

                setTimeout(() => st360SmartMap.invalidateSize(), 100);
            });
        },
        () => alert("Unable to access your location. Please allow location permission.")
    );
}

// Safe HTML helper used by the Smart Packing Assistant and review cards.
// The older project did not always define escapeHtml, which stopped the
// packing list from rendering after the button was clicked.
if (typeof window.escapeHtml !== "function") {
    window.escapeHtml = function (value) {
        const div = document.createElement("div");
        div.textContent = value == null ? "" : String(value);
        return div.innerHTML;
    };
}

function generatePackingList() {
    const destination = document.getElementById("packingDestination")?.value.trim();
    const days = Math.max(1, Math.min(30, Number(document.getElementById("packingDays")?.value || 3)));
    const box = document.getElementById("packingResults");

    if (!box) {
        alert("Packing result area is missing. Please refresh the page.");
        return;
    }

    if (!destination) {
        alert("Please select a destination.");
        return;
    }

    const key = getSt360DestinationKey(destination);
    const cold = ["manali", "shimla", "jammu & kashmir"].includes(key);
    const beach = ["goa", "kerala"].includes(key);
    const mountain = ["rishikesh", "manali", "shimla", "jammu & kashmir"].includes(key);

    const clothing = cold
        ? ["Warm jacket", "Sweater / thermal layer", "Comfortable trousers", "Warm socks", "Comfortable shoes"]
        : beach
            ? ["Light comfortable clothes", "Sun hat / cap", "Comfortable footwear", "Light evening layer"]
            : ["Comfortable clothes", "Light jacket", "Walking shoes", "Extra socks"];

    const essentials = [
        "Phone + charger",
        "Power bank",
        "Wallet / required travel documents",
        "Reusable water bottle",
        "Basic personal-care kit",
        "Small day bag"
    ];

    const special = [];
    if (mountain) special.push("Light rain/wind protection", "Small first-aid kit");
    if (beach) special.push("Sunglasses", "Sun protection");
    if (key === "jaipur" || key === "agra" || key === "varanasi" || key === "ayodhya" || key === "vrindavan") {
        special.push("Comfortable walking footwear", "Respectful clothing for religious/heritage sites");
    }
    if (!special.length) special.push("Small umbrella", "Travel-size essentials");

    const quantityClothes = Math.max(2, Math.min(days + 1, 8));

    box.innerHTML = `
        <div class="st360-pack-group">
            <h4>👕 Clothing</h4>
            ${clothing.map((x, i) => `<label><input type="checkbox"> ${escapeHtml(x)}${i === 0 ? ` (${quantityClothes})` : ""}</label>`).join("")}
        </div>
        <div class="st360-pack-group">
            <h4>🎒 Essentials</h4>
            ${essentials.map(x => `<label><input type="checkbox"> ${escapeHtml(x)}</label>`).join("")}
        </div>
        <div class="st360-pack-group">
            <h4>✨ Destination Extras</h4>
            ${special.map(x => `<label><input type="checkbox"> ${escapeHtml(x)}</label>`).join("")}
        </div>
    `;
}

function st360GetReviews() {
    // Public display is intentionally fixed to the curated SmartTour360 reviews.
    // Visitor-submitted ratings are sent privately to YatraTech and are not added here.
    return [...st360DefaultReviews];
}

function st360SaveReviews(reviews) {
    // Kept for compatibility with older code; visitor reviews are not stored/displayed publicly.
    return;
}

function renderTouristReviews() {
    const reviews = st360GetReviews();
    const list = document.getElementById("touristReviewsList");
    const avg = reviews.reduce((sum, item) => sum + Number(item.rating || 0), 0) / reviews.length;

    const averageEl = document.getElementById("reviewAverage");
    const countEl = document.getElementById("reviewCount");

    if (averageEl) averageEl.textContent = avg.toFixed(1);
    if (countEl) countEl.textContent = `${reviews.length} traveller review${reviews.length === 1 ? "" : "s"}`;

    if (!list) return;

    list.innerHTML = reviews.slice().reverse().map(review => `
        <article class="st360-review-card">
            <div class="st360-review-card-top">
                <strong>${escapeHtml(review.name)} • ${escapeHtml(review.destination)}</strong>
                <span>${"★".repeat(Number(review.rating))}${"☆".repeat(5 - Number(review.rating))}</span>
            </div>
            <p>${escapeHtml(review.text)}</p>
            ${review.submittedAt ? `<small class="st360-review-date">🕒 ${escapeHtml(review.submittedAt)}</small>` : ""}
        </article>
    `).join("");
}

async function submitTouristReview(event) {
    event.preventDefault();

    const destination = document.getElementById("reviewDestination")?.value?.trim() || "General";
    const rating = document.getElementById("reviewRating")?.value || "5";
    const name = document.getElementById("reviewName")?.value?.trim() || "Anonymous Traveller";
    const email = document.getElementById("reviewEmail")?.value?.trim() || "";
    const text = document.getElementById("reviewText")?.value?.trim() || "";
    const submitButton = event.submitter || document.querySelector('.st360-review-form button[type="submit"]');

    if (!email || !text) {
        alert("Please enter your email and review.");
        return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        alert("Please enter a valid email address.");
        return;
    }

    if (submitButton) {
        submitButton.disabled = true;
        submitButton.dataset.originalText = submitButton.innerHTML;
        submitButton.innerHTML = "Sending...";
    }

    const submittedAt = new Date().toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short"
    });

    try {
        if (typeof emailjs === "undefined") {
            throw new Error("EmailJS SDK not loaded.");
        }

        await emailjs.send(
            "smarttour360_gmail",
            "template_2r2u3i9",
            {
                user_name: name,
                user_email: email,
                destination: destination,
                rating: rating,
                review: text,
                submitted_at: submittedAt
            }
        );

        alert("Thank you! Your review has been submitted successfully.");
        const form = document.querySelector('.st360-review-form');
        if (form) form.reset();
    } catch (error) {
        console.error("EmailJS review submission failed:", error);
        alert("Review submit nahi ho paya. Please check your internet connection and try again.");
    } finally {
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.innerHTML = submitButton.dataset.originalText || "Submit Review";
        }
    }
}

document.addEventListener("DOMContentLoaded", function () {
    renderTouristReviews();

    const emergencyModal = document.getElementById("emergencySafetyModal");
    if (emergencyModal) {
        emergencyModal.addEventListener("keydown", event => {
            if (event.key === "Escape") closeEmergencySafety();
        });
    }
});


/* =========================================================
   SMARTTOUR360 - VIRTUAL GROUP TOUR + SEAT TRACKER + CRIME SAFETY
========================================================= */
const st360GroupTours = {
  "Rishikesh Ganga Experience": { members: 18, guide: "Aarav Travel Guide", next: "Ganga Aarti highlights" },
  "Jaipur Heritage Walk": { members: 24, guide: "Meera Heritage Guide", next: "City Palace highlights" },
  "Goa Beach Explorer": { members: 16, guide: "Kabir Coastal Guide", next: "Beach & local culture" }
};
function joinVirtualTour(name){
  const room=st360GroupTours[name]||{members:12,guide:"SmartTour Guide",next:"Destination highlights"};
  const title=document.getElementById('virtualTourTitle');
  const status=document.getElementById('virtualTourStatus');
  if(title) title.textContent=name;
  if(status) status.innerHTML=`✅ <strong>Joined demo room.</strong> ${room.members} travellers are connected. Guide: ${room.guide}. Next: ${room.next}.`;
  showSmartToast?.(`👥 Joined ${name}`);
}
function startVirtualTourDemo(){
  const first=Object.keys(st360GroupTours)[0];
  joinVirtualTour(first);
  const el=document.getElementById('virtualTourStatus');
  if(el) el.innerHTML += ' ▶ Virtual walkthrough started — this is a front-end demo experience.';
}

const st360SeatData={
  train:[
    {route:'Dehradun → New Delhi',capacity:60,available:18,className:'AC Chair Car'},
    {route:'New Delhi → Varanasi',capacity:72,available:31,className:'AC 3 Tier'},
    {route:'Delhi → IGI Airport',capacity:50,available:22,className:'Express Coach'}
  ],
  metro:[
    {route:'Delhi Metro Blue Line',capacity:48,available:17,className:'General Coach'},
    {route:'Delhi Metro Yellow Line',capacity:48,available:29,className:'General Coach'}
  ]
};
function checkSeatAvailability(){
  const type=document.getElementById('seatTransportType')?.value||'train';
  const route=document.getElementById('seatRoute')?.value||'';
  const group=Math.max(1,Number(document.getElementById('seatGroupSize')?.value)||1);
  const pool=st360SeatData[type]||[];
  const item=pool.find(x=>x.route===route)||pool[0];
  const box=document.getElementById('seatAvailabilityResult');
  if(!box||!item)return;
  const enough=item.available>=group;
  const percent=Math.round((item.available/item.capacity)*100);
  box.innerHTML=`<div class="st360-seat-card"><div class="st360-seat-meta"><span>🚆/🚇 <strong>${item.route}</strong></span><span>Class: ${item.className}</span></div><h3 style="margin:12px 0 4px">${item.available} seats available</h3><p>${enough?'✅ Your group of '+group+' can be accommodated in this demo availability.':'⚠️ Not enough seats for a group of '+group+' in this demo result.'}</p><div class="st360-seat-meter"><span style="width:${percent}%"></span></div><div class="st360-seat-meta"><span>Capacity: ${item.capacity}</span><span>Available: ${percent}%</span></div></div>`;
}
function checkCrimeSafety(){
  const place=document.getElementById('crimeDestination')?.value||'Delhi';
  const data={
    Rishikesh:{level:'Moderate awareness',alert:'Crowded tourist zones may require extra care with personal belongings.',tip:'Keep valuables secure and stay with your group.'},
    Jaipur:{level:'Moderate awareness',alert:'Busy heritage areas can have occasional pickpocketing complaints.',tip:'Use secure bags and remain alert in crowded markets.'},
    Goa:{level:'Moderate awareness',alert:'Popular nightlife and beach areas can become crowded.',tip:'Stay with trusted companions and use known transport.'},
    Varanasi:{level:'Moderate awareness',alert:'Crowded lanes and market areas require normal tourist precautions.',tip:'Keep your phone and wallet secure in busy areas.'},
    Delhi:{level:'High awareness',alert:'Large crowded areas and transit hubs require extra situational awareness.',tip:'Prefer well-lit populated routes and keep emergency contacts ready.'}
  }[place]||{level:'General awareness',alert:'Follow standard tourist safety precautions.',tip:'Stay aware of your surroundings.'};
  const box=document.getElementById('crimeSafetyResult');
  if(box) box.innerHTML=`<div class="st360-crime-card"><span class="st360-risk-badge">🛡️ ${data.level}</span><h3 style="margin:12px 0 7px">${place} Safety Alert</h3><p>${data.alert}</p><strong>Smart precaution:</strong> ${data.tip}</div>`;
}


/* =========================================================
   SMARTTOUR360 - AI MOOD PERSONALIZATION
   Privacy-first hackathon demo
========================================================= */
(function () {
    let moodStream = null;
    let moodScanTimer = null;
    let faceApiReady = false;
    let lastExpression = "neutral";
    let demoMoodTimer = null;

    const MODEL_URL = "https://justadudewhohacks.github.io/face-api.js/models";

    function moodLabel(expression) {
        const map = {
            happy: "Positive / Energetic",
            neutral: "Balanced / Neutral",
            sad: "Quiet / Relaxed",
            angry: "High-energy / Active",
            fearful: "Calm / Easy-going",
            disgusted: "Calm / Easy-going",
            surprised: "Curious / Energetic"
        };
        return map[expression] || "Balanced / Neutral";
    }

    function moodRecommendation(expression) {
        const recs = {
            happy: { title: "⚡ Adventure Mode", text: "You appear to be showing a positive expression. SmartTour360 suggests sightseeing, light adventure and interactive local experiences.", tags: "Adventure • Sightseeing • Local experiences" },
            neutral: { title: "🧭 Balanced Mode", text: "Your expression signal looks neutral. A balanced itinerary with sightseeing, food and comfortable breaks may suit you.", tags: "Sightseeing • Food • Flexible pace" },
            sad: { title: "😌 Relaxed Mode", text: "Your expression signal looks quieter. Consider a slower itinerary with nature, peaceful places and extra rest time.", tags: "Nature • Peaceful places • Rest" },
            angry: { title: "🏃 Active Reset Mode", text: "The expression signal looks intense. SmartTour360 suggests open spaces, short activities and a flexible schedule rather than a packed itinerary.", tags: "Open spaces • Short activities • Flexible plan" },
            fearful: { title: "🛡️ Comfort Mode", text: "The expression signal may indicate a need for a calmer experience. Prefer familiar routes, group travel and well-populated attractions.", tags: "Comfort • Group travel • Safer routes" },
            disgusted: { title: "🌿 Refresh Mode", text: "A calm, low-pressure plan may be more suitable. Try nature, cultural spaces and a flexible food itinerary.", tags: "Nature • Culture • Flexible food" },
            surprised: { title: "✨ Explore Mode", text: "The expression signal looks curious or surprised. SmartTour360 suggests new attractions, heritage walks and discovery-focused activities.", tags: "Heritage • Discovery • New experiences" }
        };
        return recs[expression] || recs.neutral;
    }

    function renderMood(expression, source = "AI") {
        lastExpression = expression || "neutral";
        const signal = document.getElementById("moodSignal");
        const recommendation = document.getElementById("moodRecommendation");
        if (signal) signal.textContent = `${moodLabel(lastExpression)} • ${source}`;
        if (recommendation) {
            const rec = moodRecommendation(lastExpression);
            recommendation.innerHTML = `<h3>${rec.title}</h3><p>${escapeHtml(rec.text)}</p><span>${escapeHtml(rec.tags)}</span>`;
        }
    }

    function waitForFaceApi(timeoutMs = 15000) {
        return new Promise(resolve => {
            if (window.faceapi) { faceApiReady = true; resolve(true); return; }
            const started = Date.now();
            const timer = setInterval(() => {
                if (window.faceapi) { clearInterval(timer); faceApiReady = true; resolve(true); }
                else if (Date.now() - started >= timeoutMs) { clearInterval(timer); resolve(false); }
            }, 200);
        });
    }

    function startDemoMoodFallback(reason) {
        clearInterval(demoMoodTimer);
        const status = document.getElementById("moodPrivacyStatus");
        const badge = document.getElementById("moodFaceBadge");
        const startButton = document.getElementById("startMoodBtn");
        const expressions = ["happy", "neutral", "surprised", "relaxed" === "relaxed" ? "sad" : "neutral"];
        let i = 0;
        renderMood("neutral", "Demo AI fallback");
        if (badge) badge.textContent = "Demo AI active";
        if (status) status.textContent = reason || "Camera/AI model unavailable. SmartTour360 demo mood mode is active.";
        if (startButton) { startButton.disabled = false; startButton.textContent = "📷 AI Mood Scan Active"; }
        demoMoodTimer = setInterval(() => {
            const expression = expressions[i++ % expressions.length];
            renderMood(expression, "Demo AI fallback");
        }, 2600);
    }

    async function startAIMoodScan() {
        const video = document.getElementById("moodVideo");
        const placeholder = document.getElementById("moodCameraPlaceholder");
        const badge = document.getElementById("moodFaceBadge");
        const status = document.getElementById("moodPrivacyStatus");
        const startButton = document.getElementById("startMoodBtn");
        if (!video) return;

        clearInterval(demoMoodTimer);
        if (startButton) { startButton.disabled = true; startButton.textContent = "⏳ Starting AI Mood…"; }
        if (status) status.textContent = "Preparing camera and AI mood engine…";

        try {
            const secure = window.isSecureContext || location.hostname === "localhost" || location.hostname === "127.0.0.1";
            const canCamera = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
            if (!secure || !canCamera) {
                startDemoMoodFallback("Camera needs HTTPS/localhost in Chrome. SmartTour360 demo AI mood mode is active here.");
                return;
            }

            /* Open camera first so the feature visibly starts even if model loading is slow. */
            moodStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
                audio: false
            });
            video.srcObject = moodStream;
            video.muted = true;
            video.setAttribute("playsinline", "true");
            try { await video.play(); } catch (_) {}
            if (placeholder) placeholder.style.display = "none";
            if (badge) badge.textContent = "Camera active • Loading AI…";

            const libraryReady = await waitForFaceApi(15000);
            if (!libraryReady) {
                startDemoMoodFallback("Camera is active, but the AI library could not load. Demo AI mood mode is active.");
                return;
            }

            try {
                if (!window.faceapi.nets.tinyFaceDetector.isLoaded) {
                    if (status) status.textContent = "Loading expression model…";
                    await window.faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
                    await window.faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);
                }
                if (status) status.textContent = "AI Mood active: expression analysis runs in this browser.";
                if (badge) badge.textContent = "Scanning for face…";
                clearInterval(moodScanTimer);
                moodScanTimer = setInterval(scanMoodFrame, 1200);
                renderMood("neutral", "AI ready");
                if (startButton) { startButton.disabled = false; startButton.textContent = "📷 AI Mood Scan Active"; }
            } catch (modelError) {
                console.warn("Mood model error:", modelError);
                startDemoMoodFallback("Camera is active, but the expression model could not load. Demo AI mood mode is active.");
            }
        } catch (error) {
            console.warn("Mood camera error:", error);
            if (moodStream) moodStream.getTracks().forEach(track => track.stop());
            moodStream = null;
            if (placeholder) placeholder.style.display = "grid";
            startDemoMoodFallback("Camera permission was not available. SmartTour360 demo AI mood mode is active; you can still use the mood controls below.");
        }
    }

    async function scanMoodFrame() {
        const video = document.getElementById("moodVideo");
        const badge = document.getElementById("moodFaceBadge");
        if (!video || !window.faceapi || video.readyState < 2) return;
        try {
            const result = await window.faceapi.detectSingleFace(video, new window.faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.5 })).withFaceExpressions();
            if (!result) { if (badge) badge.textContent = "Face not detected — move closer"; return; }
            const expressions = result.expressions;
            const best = Object.keys(expressions).reduce((a, b) => expressions[a] > expressions[b] ? a : b);
            if (badge) badge.textContent = `Face detected • ${Math.round((result.detection.score || 0) * 100)}% detection`;
            renderMood(best, "AI estimate");
        } catch (error) { console.warn("Mood scan error:", error); }
    }

    function stopAIMoodScan() {
        clearInterval(moodScanTimer); moodScanTimer = null;
        clearInterval(demoMoodTimer); demoMoodTimer = null;
        if (moodStream) moodStream.getTracks().forEach(track => track.stop());
        moodStream = null;
        const video = document.getElementById("moodVideo");
        const placeholder = document.getElementById("moodCameraPlaceholder");
        const badge = document.getElementById("moodFaceBadge");
        if (video) video.srcObject = null;
        if (placeholder) placeholder.style.display = "grid";
        if (badge) badge.textContent = "Face not detected";
        const status = document.getElementById("moodPrivacyStatus");
        if (status) status.textContent = "Camera stopped. No camera image is stored by this feature.";
        const startButton = document.getElementById("startMoodBtn");
        if (startButton) { startButton.disabled = false; startButton.textContent = "📷 Start AI Mood Scan"; }
        renderMood("neutral", "Waiting");
    }

    function setMoodPreference(preference) {
        const map = { relaxed: "sad", energetic: "happy", balanced: "neutral" };
        clearInterval(demoMoodTimer);
        renderMood(map[preference] || "neutral", "Your choice");
    }

    window.startAIMoodScan = startAIMoodScan;
    window.stopAIMoodScan = stopAIMoodScan;
    window.setMoodPreference = setMoodPreference;
})();

/* face-api.js is loaded only when the user starts the optional camera feature. */
(function loadMoodLibrary() {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js";
    script.async = true;
    script.onload = () => { console.log("SmartTour360 AI mood library ready."); };
    script.onerror = () => { console.warn("SmartTour360 AI mood library could not be loaded; manual mood mode remains available."); };
    document.head.appendChild(script);
})();

/* =========================================================
   SMARTTOUR360 - REFRESH YOUR TRAVEL MOOD LINKS
   External experience shortcuts only; existing UI/features unchanged.
========================================================= */
(function setupTravelMoodLinks(){
    const moodLinks = {
        'Live Music': 'https://open.spotify.com/search/live%20music',
        'Evening Cafés': 'https://www.google.com/maps/search/evening+cafes+near+me',
        'Night Markets': 'https://www.google.com/maps/search/night+markets+near+me',
        'Cultural Shows': 'https://www.google.com/search?q=cultural+shows+near+me',
        'Entertainment Zones': 'https://www.google.com/maps/search/entertainment+zones+near+me',
        'City Exploration': 'https://www.google.com/maps/search/tourist+attractions+near+me'
    };

    function getMoodDestinationUrl(title){
        return moodLinks[title] || '';
    }

    function bindMoodCards(){
        document.querySelectorAll('.entertainment-card').forEach(card => {
            const heading = card.querySelector('h3');
            if (!heading) return;
            const title = heading.textContent.trim();
            const url = getMoodDestinationUrl(title);
            if (!url) return;

            card.setAttribute('role', 'link');
            card.setAttribute('tabindex', '0');
            card.setAttribute('title', 'Open ' + title);
            card.style.cursor = 'pointer';

            const openMood = () => window.open(url, '_blank', 'noopener,noreferrer');
            card.addEventListener('click', openMood);
            card.addEventListener('keydown', event => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    openMood();
                }
            });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bindMoodCards);
    } else {
        bindMoodCards();
    }
})();
