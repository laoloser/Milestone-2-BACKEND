const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

// Set up PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/api/hand-dominance', async (req, res) => {
  try {
    const result = await pool.query('SELECT state, choice, COUNT(*) as count FROM votes GROUP BY state, choice');
    res.json(result.rows);
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/vote', async (req, res) => {
  const { email, choice, state } = req.body;
  try {
    const existingVote = await pool.query('SELECT email FROM votes WHERE email = $1', [email]);
    if (existingVote.rows.length > 0) {
      return res.status(409).json({ error: 'Email already exists' });
    }

    await pool.query('INSERT INTO votes (email, choice, state) VALUES ($1, $2, $3)', [email, choice, state]);
    res.status(200).json({ message: 'Vote recorded' });
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});