require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'submissions.json');

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('✅ Connected to MongoDB successfully!');
    })
    .catch((err) => {
        console.error('❌ MongoDB connection error:', err);
        console.log('⚠️  Falling back to file-based storage');
    });

// Mongoose Schema for Bookings
const bookingSchema = new mongoose.Schema({
    package: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    cardNumber: {
        type: String,
        required: true
    },
    expiry: {
        type: String,
        required: true
    },
    cvv: {
        type: String,
        required: true
    },
    submissionDate: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

const Booking = mongoose.model('Booking', bookingSchema);

// Ensure data directory exists for backup
if (!fs.existsSync(path.join(__dirname, 'data'))) {
    fs.mkdirSync(path.join(__dirname, 'data'));
}

// Ensure data file exists for backup
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, '[]');
}

// Submit Endpoint
app.post('/api/submit', async (req, res) => {
    const newData = req.body;
    newData.submissionDate = new Date().toISOString();

    try {
        // Save to MongoDB
        if (mongoose.connection.readyState === 1) {
            const booking = new Booking(newData);
            await booking.save();
            console.log('✅ Booking saved to MongoDB:', newData.email);
        } else {
            console.log('⚠️  MongoDB not connected, using file backup');
        }

        // Also save to file as backup
        fs.readFile(DATA_FILE, 'utf8', (err, data) => {
            let submissions = [];
            if (!err) {
                try {
                    submissions = JSON.parse(data);
                } catch (parseError) {
                    submissions = [];
                }
            }

            submissions.push(newData);

            fs.writeFile(DATA_FILE, JSON.stringify(submissions, null, 2), (writeErr) => {
                if (writeErr) {
                    console.error('Error writing backup file:', writeErr);
                }
            });
        });

        res.json({ success: true, message: 'Booking confirmed successfully!' });

    } catch (error) {
        console.error('❌ Error saving booking:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again.'
        });
    }
});

// Get all bookings (optional - for admin purposes)
app.get('/api/bookings', async (req, res) => {
    try {
        if (mongoose.connection.readyState === 1) {
            const bookings = await Booking.find().sort({ createdAt: -1 });
            res.json({ success: true, bookings });
        } else {
            // Fallback to file
            const data = fs.readFileSync(DATA_FILE, 'utf8');
            const bookings = JSON.parse(data);
            res.json({ success: true, bookings });
        }
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).json({ success: false, message: 'Error fetching bookings' });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});
