require ('dotenv').config();

const bp = require('body-parser');
const express = require('express');
const app = express();
const pg = require('pg');
const fs = require('fs');
const PORT = process.env.PORT;
const cors = require('cors');
const superagent = require('superagent');
const G_API_KEY = process.env.GOOGLE_API_KEY;
app.use(cors());
app.use(bp.json());
app.use(bp.urlencoded({extended: true}));
const client = new pg.Client(process.env.DATABASE_URL);

client.connect();

app.get('/api/v1/books/search', (req, res) => {
    const googleUrl = 'https://www.googleapis.com/books/v1/volumes?q=';
    const searchFor = req.query.search;

    superagent
        .get(`${googleUrl}intitle:${searchFor}&key=${G_API_KEY}`)
        .end((err,resp)=> {
            const smallBooks = resp.body.items.slice(0,10).map(book => {
                return{
                    title: book.volumeInfo.title,
                    description: book.volumeInfo.description,
                    author: book.volumeInfo.authors[0],
                    isbn: book.volumeInfo.industryIdentifiers[0].identifier,
                    image_url: book.volumeInfo.imageLinks.thumbnail
                };
            });
            res.send(smallBooks);
        });

});

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

app.get('/api/v1/books/new', (req, res) => {
    console.log('Heard the request', req);
    console.log(res);
});

app.get('*', (req, res) => {
    console.log('-----------------------hello!');
    res.send('Nothing currently on this page!');
});

app.post('/api/v1/books', (req, res) => {
    client.query(`
        INSERT INTO books (title, author, isbn, image_url, description) VALUES ($1, $2, $3, $4, $5);
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
