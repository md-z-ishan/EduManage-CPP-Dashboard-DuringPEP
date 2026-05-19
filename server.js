const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Helper to run C++ backend
const runBackend = (args) => {
    return new Promise((resolve, reject) => {
        exec(`./backend ${args}`, (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
                return reject(error);
            }
            try {
                const data = JSON.parse(stdout);
                resolve(data);
            } catch(e) {
                console.error("Failed to parse C++ output:", stdout);
                resolve([]);
            }
        });
    });
};

// API: Get all students
app.get('/api/students', async (req, res) => {
    try {
        const students = await runBackend('list');
        res.json(students);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch students' });
    }
});

// API: Add or Update student
app.post('/api/students', async (req, res) => {
    const { rollno, name, maths, science, english, history } = req.body;
    
    // Validate required fields
    if (!rollno || !name) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        // Run: ./backend add <rollno> "<name>" <maths> <science> <english> <history>
        const args = `add ${rollno} "${name}" ${maths || 0} ${science || 0} ${english || 0} ${history || 0}`;
        const students = await runBackend(args);
        res.json(students);
    } catch (err) {
        res.status(500).json({ error: 'Failed to save student' });
    }
});

// API: Delete student
app.delete('/api/students/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const students = await runBackend(`delete ${id}`);
        res.json(students);
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete student' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
