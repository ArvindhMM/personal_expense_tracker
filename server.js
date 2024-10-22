const express = require('express');
const db = require('./db'); // Import the database
const app = express();
const PORT = 3000;

app.use(express.json());

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });

// Add a new transaction
app.post('/transactions', (req, res) => {
  const { type, category, amount, date, description } = req.body;
  if (!type || !category || !amount || !date) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  const query = `INSERT INTO transactions (type, category, amount, date, description) VALUES (?, ?, ?, ?, ?)`;
  db.run(query, [type, category, amount, date, description], function (err) {
    if (err) {
      return res.status(500).json({ error: 'Error adding transaction' });
    }
    res.status(201).json({ id: this.lastID, message: 'Transaction added successfully' });
  });
});

//Get all transactions
app.get('/transactions', (req, res) => {
  db.all(`SELECT * FROM transactions`, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Error getting all transactions' });
    }
    res.status(200).json(rows);
  });
});

// Get transaction by ID
app.get('/transactions/:id', (req, res) => {
  const { id } = req.params;
  db.get(`SELECT * FROM transactions WHERE id = ?`, [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Error getting transaction' });
    }
    if (!row) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    res.status(200).json(row);
  });
});

// Update transaction by ID
app.put('/transactions/:id', (req, res) => {
  const { id } = req.params;
  const { type, category, amount, date, description } = req.body;
  if (!type || !category || !amount || !date) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  const query = `UPDATE transactions SET type = ?, category = ?, amount = ?, date = ?, description = ? WHERE id = ?`;
  db.run(query, [type, category, amount, date, description, id], function (err) {
    if (err) {
      return res.status(500).json({ error: 'Error updating transaction' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    res.status(200).json({ message: 'Transaction updated successfully' });
  });
});

// DELETE Delete transaction by ID
app.delete('/transactions/:id', (req, res) => {
  const { id } = req.params;
  const query = `DELETE FROM transactions WHERE id = ?`;
  db.run(query, [id], function (err) {
    if (err) {
      return res.status(500).json({ error: 'Error deleting transaction' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    res.status(200).json({ message: 'Transaction deleted successfully' });
  });
});

//Get the summary of all transactions (total income, total expenses, balance)
app.get('/summary', (req, res) => {
    const summaryQuery = `
      SELECT 
        (SELECT IFNULL(SUM(amount), 0) FROM transactions WHERE type = 'income') AS total_income,
        (SELECT IFNULL(SUM(amount), 0) FROM transactions WHERE type = 'expense') AS total_expense
    `;
  
    db.get(summaryQuery, [], (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Error retrieving summary' });
      }
  
      const balance = row.total_income - row.total_expense;
      res.status(200).json({
        total_income: row.total_income,
        total_expense: row.total_expense,
        balance: balance
      });
    });
  });
  

