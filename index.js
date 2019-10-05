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
const UserRelation = require('./user/userRelationModel');
const Post = require('./post/postModel');
db.sync({ force: true })
    .then(async () => {
        console.log('Database connected');
        // Add/create a default user and posts for testing
        await User.create({
            email: "test@test.com",
            password: bcrypt.hashSync("123456", 10),
            username: "InstaClone",
            name: "Test user",
            bio: "Welcome to my InstaClone profile"
        });
        await User.create({
            email: "test1@test.com",
            password: bcrypt.hashSync("123456", 10),
            username: "AwesomeUsername",
            name: "Test user",
            bio: "Welcome to my InstaClone profile"
        });
        await User.create({
            email: "test2@test.com",
            password: bcrypt.hashSync("123456", 10),
            username: "Newbie",
            name: "Henk",
            bio: "Welcome to my InstaClone profile"
        });
        await UserRelation.create({
            follower_id: 1,
            followed_id: 2
        });
        await UserRelation.create({
            follower_id: 1,
            followed_id: 3
        });
        await Post.create({
            picture: "https://thenypost.files.wordpress.com/2019/09/instagram-private-stories-01.jpg?quality=90&strip=all&w=618&h=410&crop=1",
            description: "Some random image from the web",
            userId: 1
        });
        await Post.create({
            picture: "https://thenypost.files.wordpress.com/2019/09/instagram-private-stories-01.jpg?quality=90&strip=all&w=618&h=410&crop=1",
            description: "Another random but the same image from the web",
            userId: 2
        });
        await Post.create({
            picture: "https://petapixel.com/assets/uploads/2019/06/manipulatedelephant-800x534.jpg",
            description: "Another random but the same image from the web",
            userId: 2
        });
    })
    .catch(console.error);

// Routes
const authRouter = require('./auth/router');
const userRouter = require('./user/userRouter');
const postRouter = require('./post/postRouter');
app.use(authRouter, userRouter, postRouter);