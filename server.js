const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'data', 'submissions.json');

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Ensure data directory exists
if (!fs.existsSync(path.join(__dirname, 'data'))) {
    fs.mkdirSync(path.join(__dirname, 'data'));
}

// Ensure data file exists
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, '[]');
}

// Submit Endpoint
app.post('/api/submit', (req, res) => {
    const newData = req.body;

    // Add timestamp
    newData.submissionDate = new Date().toISOString();

    // Read existing data
    fs.readFile(DATA_FILE, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading data:', err);
            return res.status(500).json({ success: false, message: 'Server error' });
        }

        let submissions = [];
        try {
            submissions = JSON.parse(data);
        } catch (parseError) {
            console.error('Error parsing JSON:', parseError);
            submissions = [];
        }

        // Add new submission
        submissions.push(newData);

        // Write back to file
        fs.writeFile(DATA_FILE, JSON.stringify(submissions, null, 2), (writeErr) => {
            if (writeErr) {
                console.error('Error writing data:', writeErr);
                return res.status(500).json({ success: false, message: 'Server error' });
            }

            console.log('New submission received:', newData.email);
            res.json({ success: true, message: 'Submission successful' });
        });
    });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
