require ('dotenv').config();

const express = require('express');
const app = express();
const pg = require('pg');
const PORT = process.env.PORT;

const client = new pg.Client(process.env.DATABASE_URL);

client.connect();

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});

app.get('/api/v1/books', (req, res) => {
    client.query(`SELECT * FROM books;`)
        .then(data => res.send(data.rows));
});

// app.get('/api/v1/about', (req, res) => {
//     client.query()
// });