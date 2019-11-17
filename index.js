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
const User = require('./models/userModel');
const UserRelation = require('./models/userRelationModel');
const Post = require('./models/postModel');
const Comment = require('./models/commentModel');
require('./models/modelRelations');
// Why is db.sync not inside the db.js file?
// To add/create default data in the database after the database is sync, we need the models
// But to be able to setup/define the models, we need the database
// In other words, to create the tables we need to import db.js inside any model.js file
// And to use model.create we need to import any model.js inside db.js
// After we imported the necessary files in each file we can use db.sync to create all the tables and data
// But if we put db.sync in the db.js file, we'll get a order problem. It's like: who was first? The chicken or the egg?
// If you don't want to insert any default data into your database, then you can put the db.sync inside your db.js file
// Force: true is still there for my testing purposes. If i change server code, i don't want to insert all the default data again, so i overwrite everything. The default data contains all data for testing
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
		await UserRelation.create({
			follower_id: 2,
			followed_id: 1
		});
		await Post.create({
			picture: "https://thenypost.files.wordpress.com/2019/09/instagram-private-stories-01.jpg?quality=90&strip=all&w=618&h=410&crop=1",
			description: "Some random image from the web",
			userId: 1
		});
		await Post.create({
			picture: "https://thenypost.files.wordpress.com/2019/09/instagram-private-stories-01.jpg?quality=90&strip=all&w=618&h=410&crop=1",
			description: "Post 1",
			userId: 2
		});
		await Post.create({
			picture: "https://petapixel.com/assets/uploads/2019/06/manipulatedelephant-800x534.jpg",
			description: "Post 2",
			userId: 2
		});
		await Post.create({
			picture: "https://petapixel.com/assets/uploads/2019/06/manipulatedelephant-800x534.jpg",
			description: "Post 3",
			userId: 2
		});
		await Post.create({
			picture: "https://petapixel.com/assets/uploads/2019/06/manipulatedelephant-800x534.jpg",
			description: "Post 4",
			userId: 2
		});
		await Post.create({
			picture: "https://petapixel.com/assets/uploads/2019/06/manipulatedelephant-800x534.jpg",
			description: "Post 5",
			userId: 2
		});
		await Post.create({
			picture: "https://petapixel.com/assets/uploads/2019/06/manipulatedelephant-800x534.jpg",
			description: "Post 6",
			userId: 2
		});
		await Post.create({
			picture: "https://petapixel.com/assets/uploads/2019/06/manipulatedelephant-800x534.jpg",
			description: "Post 7",
			userId: 2
		});
		await Post.create({
			picture: "https://petapixel.com/assets/uploads/2019/06/manipulatedelephant-800x534.jpg",
			description: "Post 8",
			userId: 2
		});
		await Post.create({
			picture: "https://petapixel.com/assets/uploads/2019/06/manipulatedelephant-800x534.jpg",
			description: "Post 9",
			userId: 2
		});
		await Post.create({
			picture: "https://petapixel.com/assets/uploads/2019/06/manipulatedelephant-800x534.jpg",
			description: "Post 10",
			userId: 2
		});
		await Post.create({
			picture: "https://petapixel.com/assets/uploads/2019/06/manipulatedelephant-800x534.jpg",
			description: "Post 11",
			userId: 2
		});
	})
	.catch(console.error);

// Routes
const authRouter = require('./routers/authRouter');
const userRouter = require('./routers/userRouter');
const postRouter = require('./routers/postRouter');
app.use(authRouter, userRouter, postRouter);