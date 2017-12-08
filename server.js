require ('dotenv').config();

const express = require('express');
const app = express();
const pg = require('pg');
const fs = require('fs');
const PORT = process.env.PORT;
const cors = require('cors');

app.use(cors);
const client = new pg.Client(process.env.DATABASE_URL);

client.connect();

app.get('/api/v1/books', (req, res) => {
    client.query(`SELECT * FROM books;`)
        .then(data => res.send(data.rows));
});

app.get('*', (req, res) => {
    console.log('-----------------------hello!');
    res.send('goodbye');
})

// loadDB();

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
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
    fs.readFile('./books.json', function(err, fd) {
        JSON.parse(fd.toString()).forEach(function(ele) {
            client.query(
                'INSERT INTO books (author, title, isbn, image_url, description) VALUES ($1, $2, $3, $4, $5) ON CONFLICT DO NOTHING',
                [ele.author, ele.title, ele.isbn, ele.image_url, ele.description]
            );
        });
    });
}

function loadDB() {
    client.query(`
    CREATE TABLE IF NOT EXISTS
    books (
      id SERIAL PRIMARY KEY,
      author VARCHAR(255) UNIQUE NOT NULL,
      title VARCHAR(255) NOT NULL,
      isbn VARCHAR(300) NOT NULL,
      image_url VARCHAR(300) NOT NULL,
      description TEXT NOT NULL
    );`
    )
        .then(data => {
            loadBooks(data);
        })
        .catch(err => {
            console.error(err);
        });
}
