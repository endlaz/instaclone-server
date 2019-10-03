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
const bcrypt = require('bcrypt');
const User = require('./user/userModel');
db.sync({force: true})
    .then(() => {
        console.log('Database connected');
        // Add/create a default user for testing
        User.create({
            email: "test@test.com",
            password: bcrypt.hashSync("123456", 10),
            username: "AwesomeUsername",
            name: "Test user",
            bio: "Welcome to my InstaClone profile"
        })
    })
    .catch(console.error);

// Routes
const authRouter = require('./auth/router');
const userRouter = require('./user/userRouter');
app.use(authRouter, userRouter);