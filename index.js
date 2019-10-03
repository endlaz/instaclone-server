// Server
const express = require('express');
const app = express();
const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`App server up and running on port ${port}`));

// Middleware
const cors = require('cors');
const corsMiddleware = cors();
const bodyParser = require('body-parser').json();
app.use(corsMiddleware, bodyParser);

// Database
const db = require('./db');
db.sync({force: true})
    .then(() => {
        console.log('Database connected')
    })
    .catch(console.error);