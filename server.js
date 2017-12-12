require ('dotenv').config();

const bp = require('body-parser');
const express = require('express');
const app = express();
const pg = require('pg');
const fs = require('fs');
const PORT = process.env.PORT;
const cors = require('cors');

app.use(cors());
app.use(bp.json());
app.use(bp.urlencoded({extended: true}));
const client = new pg.Client(process.env.DATABASE_URL);

client.connect();

app.get('/api/v1/books', (req, res) => {
    client.query(`SELECT * FROM books;`)
        .then(data => res.send(data.rows));
});

app.get('/api/v1/books/:id', (req, res) => {
    client.query(
        `SELECT * FROM books WHERE id = $1`, [req.params.id])
        .then(data => res.send(data.rows))
        .catch(console.error);
});

app.put('/api/v1/books/:id', (req, res) => {
    client.query(`
        UPDATE books SET title=$1, author=$2, isbn=$3, image_url=$4, description=$5 WHERE id=$6;
        `,[
            req.body.title,
            req.body.author,
            req.body.isbn,
            req.body.image_url,
            req.body.description,
            req.params.id
        ])
        .then(data => res.status(204).send('Book Updated!'))
        .catch(console.error);
});

app.get('*', (req, res) => {
    console.log('-----------------------hello!');
    res.send('goodbye');
});

// this set of functions is not working.... This query, Book.protoype.toHtml, and bookView.submit
// app.post('/api/v1/books', (req, res) => {
//     client.query(`INSERT INTO books (author, title, isbn, image_url, description) VALUES ($1, $2, $3, $4, $5)`,
//         [req.body.author, req.body.title, req.body.isbn, req.body.image_url, req.body.description]);
// });

loadDB();

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});

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
