require ('dotenv').config();

const express = require('express');
const app = express();
const pg = require('pg');
const fs = require('fs');
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


// query to endpoint that will retrieve a single book based on an id
// app.get('/api/v1/books/:id', (req, res) => {
//     client.query(`;`)
//         .then(data => res.send(data.rows));
// });
// app.get('/api/v1/about', (req, res) => {
//     client.query()
// });

function loadBooks() {
    fs.readFile('/books.json', function(err, fd) {
        JSON.parse(fd.toString()).forEach(function(ele) {
            client.query(
                'INSERT INTO books (author, title, isbn, image_url, description) VALUES ($1, $2, $3, $4, $5) ON CONFLICT DO NOTHING',
                [ele.author, ele.title, ele.isbn, ele.image_url, ele.description]
            );
        });
    });
}
loadBooks();