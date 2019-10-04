// Server
const { app, io } = require('./server');

io.on("connection", socket => {
    console.log("New client connected");
    socket.on('testClient', (data) => {
        console.log('Data from client', data);
    })
    socket.on("disconnect", () => {
        console.log("Client disconnected");
    });
});

// Middleware
const cors = require('cors');
const corsMiddleware = cors();
const bodyParser = require('body-parser').json();
app.use(corsMiddleware, bodyParser);

// Database
const db = require('./db');
const bcrypt = require('bcrypt');
const User = require('./user/userModel');
const Post = require('./post/postModel');
db.sync({ force: true })
    .then(() => {
        console.log('Database connected');
        // Add/create a default user and posts for testing
        User.create({
            email: "test@test.com",
            password: bcrypt.hashSync("123456", 10),
            username: "AwesomeUsername",
            name: "Test user",
            bio: "Welcome to my InstaClone profile"
        });
        Post.create({
            picture: "https://thenypost.files.wordpress.com/2019/09/instagram-private-stories-01.jpg?quality=90&strip=all&w=618&h=410&crop=1",
            description: "Some random image from the web",
            userId: 1
        });
        Post.create({
            picture: "https://thenypost.files.wordpress.com/2019/09/instagram-private-stories-01.jpg?quality=90&strip=all&w=618&h=410&crop=1",
            description: "Another random but the same image from the web",
            userId: 1
        });
    })
    .catch(console.error);

// Routes
const authRouter = require('./auth/router');
const userRouter = require('./user/userRouter');
const postRouter = require('./post/postRouter');
app.use(authRouter, userRouter, postRouter);