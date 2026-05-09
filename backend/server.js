const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();

const app = express();

const PORT = process.env.PORT || 3000;


app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json());


const db = new sqlite3.Database('./homefinder.db', (err) => {
    if (err) console.error("Database connection error:", err.message);
    else {
        console.log("Connected to SQLite database (homefinder.db).");
        db.run("PRAGMA foreign_keys = ON");
    }
});

db.serialize(() => {
    
    db.run(`CREATE TABLE IF NOT EXISTS User (
        UserID INTEGER PRIMARY KEY AUTOINCREMENT,
        UserName VARCHAR(255) NOT NULL,
        Email VARCHAR(255) NOT NULL UNIQUE,
        Password VARCHAR(255) NOT NULL,
        Phone VARCHAR(255) UNIQUE,
        DateOfBirth DATE
    )`);

    
    db.run(`CREATE TABLE IF NOT EXISTS Property (
        PropertyID INTEGER PRIMARY KEY AUTOINCREMENT,
        OwnerID INTEGER NOT NULL,
        PropertyType VARCHAR(50) NOT NULL,
        SqMeters INTEGER NOT NULL,
        Price DECIMAL(12,2) NOT NULL,
        PropertyStatus VARCHAR(255) NOT NULL,
        YearOfManufacture INTEGER,
        Bedrooms INTEGER,
        Description TEXT,
        ImageURL TEXT,
        Address TEXT,
        FOREIGN KEY (OwnerID) REFERENCES User(UserID)
    )`);

    
    db.run(`CREATE TABLE IF NOT EXISTS Appointment (
        AppointmentID INTEGER PRIMARY KEY AUTOINCREMENT,
        ClientID INTEGER NOT NULL,
        PropertyID INTEGER NOT NULL,
        AppDate DATE NOT NULL,
        AppTime TIME NOT NULL,
        Status VARCHAR(255) NOT NULL,
        FOREIGN KEY (ClientID) REFERENCES User(UserID),
        FOREIGN KEY (PropertyID) REFERENCES Property(PropertyID)
    )`);

    
    db.get("SELECT COUNT(*) as count FROM User", (err, row) => {
        if (row && row.count === 0) {
            console.log("Adding default admin user...");
            db.run(`INSERT INTO User (UserName, Email, Password, Phone) VALUES ('Admin', 'admin@homefinder.gr', '123456', '2101234567')`);
        }
    });

    
    db.get("SELECT COUNT(*) as count FROM Property", (err, row) => {
        if (row && row.count === 0) {
            console.log("Seeding initial properties...");
            const stmt = db.prepare(`INSERT INTO Property 
                (OwnerID, PropertyType, SqMeters, Price, PropertyStatus, YearOfManufacture, Bedrooms, Description, ImageURL, Address) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

            const initialData = [
                [1, "Apartment", 102, 850, "Rent", 1985, 3, "Renovated 3-bedroom apartment, perfect for families.", "image4.1.png", "Themistokleous 42, Exarcheia"],
                [1, "Flat", 75, 100000, "Sale", 1978, 2, "Affordable 2-bedroom home in the heart of Kypseli.", "image5.1.png", "Fokionos Negri 15, Kypseli"],
                [1, "Studio", 28, 300, "Rent", 1980, 1, "Minimalist studio near transport. Great for students.", "image6.1.png", "3rd Septemvriou 84, Victoria"],
                [1, "Apartment", 55, 65000, "Sale", 1975, 1, "Ideal first home with state grant eligibility.", "image7.1.png", "Patision 210, Patisia"],
                [1, "House", 90, 500, "Rent", 1992, 2, "Spacious ground floor house with a garden.", "image8.1.png", "Panagi Tsaldari 12, Peristeri"],
                [1, "Apartment", 68, 120000, "Sale", 1982, 2, "Safe neighborhood, close to schools.", "image9.1.png", "Eftychidou 18, Pagrati"],
                [1, "Shared Space", 150, 200, "Rent", 1960, 5, "Temporary shared housing for immediate need.", "image10.1.png", "Leonidou 25, Metaxourgeio"],
                [1, "Apartment", 115, 135000, "Sale", 1988, 3, "Traditional Athenian apartment, well-maintained.", "image11.1.png", "Panormou 33, Ampelokipoi"]
            ];

            initialData.forEach(p => stmt.run(p));
            stmt.finalize();
            console.log("Database seeded successfully!");
        }
    });
});

// Routes
app.post('/api/register', (req, res) => {
    const { userName, email, password, phone } = req.body;
    const sql = `INSERT INTO User (UserName, Email, Password, Phone) VALUES (?, ?, ?, ?)`;
    
    db.run(sql, [userName, email, password, phone], function(err) {
        if (err) {
            if (err.message.includes("UNIQUE")) {
                return res.status(400).json({ error: "Email or Phone already exists!" });
            }
            return res.status(400).json({ error: err.message });
        }
        res.json({ message: "User registered successfully!", userID: this.lastID });
    });
});

app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    const sql = `SELECT UserID, UserName, Email FROM User WHERE Email = ? AND Password = ?`;

    db.get(sql, [email, password], (err, user) => {
        if (err) return res.status(400).json({ error: err.message });
        if (user) {
            res.json({ message: "Login successful!", user });
        } else {
            res.status(401).json({ error: "Invalid email or password" });
        }
    });
});

app.get('/api/properties', (req, res) => {
    db.all("SELECT * FROM Property", [], (err, rows) => {
        if (err) return res.status(400).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/appointments', (req, res) => {
    const { clientID, propertyID, date, time } = req.body;
    const sql = `INSERT INTO Appointment (ClientID, PropertyID, AppDate, AppTime, Status) VALUES (?, ?, ?, ?, ?)`;
    const params = [clientID || 1, propertyID || 1, date, time, 'Pending'];

    db.run(sql, params, function(err) {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ message: "Appointment booked and saved!", id: this.lastID });
    });
});


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});