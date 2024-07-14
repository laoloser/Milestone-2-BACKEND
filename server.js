const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

// Set up PostgreSQL connection
const pool = new Pool({
    connectionString: 'postgresql://postgres:sEljjAcZNbzsugXOnnvxswmLmwpBcbXx@monorail.proxy.rlwy.net:51657/railway',
});

const app = express();
app.use(cors());
app.use(express.json());

// Endpoint to receive votes
app.post('/vote', async (req, res) => {
    const { choice, state } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO votes (choice, state) VALUES ($1, $2) RETURNING *',
            [choice, state]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Endpoint to get votes
app.get('/votes', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM votes');
        res.status(200).json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
