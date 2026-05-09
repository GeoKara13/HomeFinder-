
let properties = []; 
let favorites = []; 
let currentCalDate = new Date();
const itemsPerPage = 6;


async function fetchProperties() {
    try {
        const response = await fetch('https://homefinder-backend-5aho.onrender.com/api/properties');
        properties = await response.json();
        
        if (properties.length > 0) {
            renderPage(1); 
        } else {
            document.getElementById('propertyGrid').innerHTML = "<p>No properties found in database.</p>";
        }
    } catch (error) {
        console.error("Error fetching properties:", error);
        document.getElementById('propertyGrid').innerHTML = "<p>Server connection error.</p>";
    }
}


function renderPage(pageNum) {
    const pagination = document.querySelector('.pagination');
    if (pagination) pagination.style.display = 'flex';
    
    const start = (pageNum - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    displayList(properties.slice(start, end));
}

function displayList(data) {
    const grid = document.getElementById('propertyGrid');
    if (!grid) return;
    grid.innerHTML = "";
    
    data.forEach(p => {
        const isFav = favorites.includes(p.PropertyID.toString());
        const suffix = p.PropertyStatus === 'Rent' ? '/mo' : '';
        
        grid.innerHTML += `
            <div class="property-card" onclick="openDetails('${p.PropertyID}')">
                <div class="card-image-placeholder" style="background-image: url('${p.ImageURL}')">
                    <span class="badge">${p.PropertyStatus}</span>
                    <div class="heart-btn ${isFav ? 'active' : ''}" onclick="toggleFavorite('${p.PropertyID}', event)">❤</div>
                </div>
                <div class="card-desc">
                    <span class="cat-label">${p.PropertyType.toUpperCase()}</span>
                    <h4>${p.Address}</h4>
                    <p class="price">€${Number(p.Price).toLocaleString()}${suffix}</p>
                    <button class="view-btn">View Details</button>
                </div>
            </div>`;
    });
}


function openDetails(id) {
    const p = properties.find(item => item.PropertyID == id);
    const modal = document.getElementById('appointmentModal');
    const modalData = document.getElementById('modalData');
    if (!p) return;
    
    modalData.innerHTML = `
        <div class="property-details-container">
            <span class="close" onclick="closeModal()">&times;</span>
            <h2>${p.PropertyType} in ${p.Address}</h2>
            <p class="modal-price">€${Number(p.Price).toLocaleString()} ${p.PropertyStatus === 'Rent' ? '/ month' : ''}</p>
            
            <div class="modal-gallery">
                <img src="${p.ImageURL}" class="main-modal-img" style="width:100%; border-radius:10px;">
            </div>

            <div class="info-grid">
                <div class="info-item"><strong> Area:</strong> ${p.SqMeters} sq.m.</div>
                <div class="info-item"><strong> Bedrooms:</strong> ${p.Bedrooms}</div>
                <div class="info-item"><strong> Year:</strong> ${p.YearOfManufacture}</div>
                <div class="info-item"><strong> Status:</strong> ${p.PropertyStatus}</div>
            </div>

            <div class="description-section">
                <h4>Description</h4>
                <p>${p.Description}</p>
            </div>

            <hr style="margin: 25px 0; border:0; border-top:1px solid #eee;">

            <h3>Book a Viewing</h3>
            <form onsubmit="confirmBooking(event, '${p.PropertyID}', '${p.Address}')" class="booking-form">
                <input type="text" id="formName" placeholder="Full Name" required class="modal-input">
                <input type="tel" id="formPhone" placeholder="Phone Number" required class="modal-input">
                <div style="display:flex; gap:10px;">
                    <input type="date" id="formDate" required class="modal-input" min="2026-05-08" style="flex:1;">
                    <select id="formTime" class="modal-input" style="flex:1;">
                        <option>Morning (10:00 - 12:00)</option>
                        <option>Afternoon (14:00 - 16:00)</option>
                        <option>Evening (17:00 - 19:00)</option>
                    </select>
                </div>
                <button type="submit" class="view-btn">Confirm Appointment</button>
            </form>
        </div>
    `;
    modal.style.display = "block";
}


async function confirmBooking(e, propertyID, address) { 
    e.preventDefault(); 

    
    const currentUserID = localStorage.getItem('userID');

    if (!currentUserID) {
        alert("We must to connect to book an appointment!");
        window.location.href = 'login.html';
        return;
    }

    const appointmentData = {
        clientID: currentUserID, 
        propertyID: propertyID,
        fullName: document.getElementById('formName').value,
        phone: document.getElementById('formPhone').value,
        date: document.getElementById('formDate').value,
        time: document.getElementById('formTime').value
    };

    try {
        const response = await fetch('https://homefinder-backend-5aho.onrender.com/api/appointments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(appointmentData)
        });

        const result = await response.json();
        
        if (response.ok) {
            alert("Success: Appointment saved in the database");
            closeModal();
        } else {
            alert("Error: " + result.error);
        }
    } catch (error) {
        alert("Server is offline.");
    }
}


document.getElementById('searchInput').addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = properties.filter(p => 
        p.Address.toLowerCase().includes(term) || 
        p.PropertyType.toLowerCase().includes(term)
    );
    displayList(filtered);
});

function toggleFavorite(id, event) {
    event.stopPropagation();
    const idStr = id.toString();
    const index = favorites.indexOf(idStr);
    if (index === -1) favorites.push(idStr);
    else favorites.splice(index, 1);
    renderPage(1);
}

function showFavorites() {
    const filtered = properties.filter(p => favorites.includes(p.PropertyID.toString()));
    displayList(filtered);
}

function filterCategory(cat) {
    const filtered = properties.filter(p => p.PropertyStatus === cat);
    displayList(filtered);
}

function showAll() { renderPage(1); }
function closeModal() { document.getElementById('appointmentModal').style.display = "none"; }


function renderCalendar() {
    const monthDisplay = document.getElementById('monthDisplay');
    const calendarGrid = document.getElementById('calendarGrid');
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    monthDisplay.innerText = `${months[currentCalDate.getMonth()]} ${currentCalDate.getFullYear()}`;
    calendarGrid.innerHTML = "<span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span><span>Su</span>";

    const year = currentCalDate.getFullYear();
    const month = currentCalDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    let startingDay = (firstDay === 0) ? 6 : firstDay - 1;
    for (let i = 0; i < startingDay; i++) calendarGrid.innerHTML += "<span></span>";
    for (let day = 1; day <= daysInMonth; day++) {
        calendarGrid.innerHTML += `<span>${day}</span>`;
    }
}

function changeMonth(dir) { currentCalDate.setMonth(currentCalDate.getMonth() + dir); renderCalendar(); }


document.addEventListener('DOMContentLoaded', () => { 
    fetchProperties(); 
    renderCalendar(); 

    
    const username = localStorage.getItem('userName');
    const nav = document.querySelector('nav');
    if (username && nav) {
        nav.innerHTML += `<span style="margin-left:20px; font-weight:bold; color:#28a745;">👤 ${username}</span>`;
    }
});