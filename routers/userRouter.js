const { Router } = require('express');
const User = require('../models/userModel');
const Post = require('../models/postModel');
const router = new Router();
const bcrypt = require('bcrypt');
const db = require('../db');
const auth = require('../middleware/authMiddleware');
const { toData } = require('../auth/jwt');
const Sequelize = require('sequelize');
const identity = require('../middleware/identityMiddleware');

// CREATE NEW USER
router.post('/user', (req, res, next) => {
	const { email, password, name, username } = req.body;

	// All data should be provided
	if (email && password && name && username) {
		const user = {
			email,
			password: bcrypt.hashSync(password, 10),
			name,
			username
		};
		console.log(user);

		// check if email or username is already used
		User.findOne({
			where: { email },
			attributes: ['email']
		})
			.then(result => {
				if (result) {
					res.status(400).send({ "message": "Email already in use" });
				}
			})
			// Email not in use, check username
			.then(() => {
				return User.findOne({
					where: { username: { [Sequelize.Op.iLike]: username } },
					attributes: ['username']
				})
			})
			.then(result => {
				if (result) {
					res.status(400).send({ "message": "Username already in use" });
				}
			})
			// Username also not in use, create user
			.then(() => {
				return User.create(user)
			})
			.then(() => {
				res.status(201).end()
			})
			.catch(console.error);
	} else {
		res.status(400).send({ "message": "Not all data provided" });
	}
});

// GET FEED OF USER
// Feed only shows posts from users whom the user is following
router.get('/user/:id/feed', auth, async (req, res, next) => {
	// Convert the request URL param id into a number
	const userId = parseInt(req.params.id);

	// Check if converted URL param is a valid number
	if (userId > 0) {
		// Check if the request feed belongs to the logged in user
		if (userId === req.user.id) {
			//Pagination setup
			// I'm not going to explaining this in the source code
			// This is some basic logic. Try to understand it by yourself.
			// If you get stuck for too long, you can ask for an explanation
			const page = parseInt(req.query.page) || 1;
			const limit = 5;
			let offset = 0;
			if (page > 1) {
				offset = (page - 1) * limit;
			}
			// Select all the posts from users that the logged in user is following
			const query = `SELECT username, posts.*, count(comments.*) as comments FROM users
                INNER JOIN user_relations ur ON users.id=ur.followed_id
								INNER JOIN posts ON posts."userId"=ur.followed_id
								LEFT JOIN comments ON comments."postId"=posts.id
								WHERE ur.follower_id=${userId}
								GROUP BY username, posts.id
								ORDER BY posts."createdAt" DESC
								OFFSET ${offset} LIMIT ${limit}`;
			const feed = await db.query(query);

			const queryTotal = `SELECT COUNT(posts.*) AS totalPost FROM users
			INNER JOIN user_relations ur ON users.id=ur.followed_id
			INNER JOIN posts ON posts."userId"=ur.followed_id
			WHERE ur.follower_id=${userId}`;
			const totalPost = await db.query(queryTotal);

			res.status(200).send({
				posts: feed[0],
				totalPost: totalPost[0][0].totalpost,
				numPages: Math.ceil(totalPost[0][0].totalpost / limit)
			})
		} else {
			// Request feed does not belong to logged in user
			// Request/Access denied
			res.status(401).end();
		}
	} else {
		// The url param id was not a valid number
		// Respond with a 400 bad request status
		res.status(400).end();
	}
});

// GET USER PROFILE
// Everybody can make a GET request for a user profile, but only authenticated users can get the posts, followers and following data of that profile
// To make this possible, we use middleware to check if the request is from a logged in user with a jwt token or from an anonymous user
router.get('/user/:username', identity, (req, res, next) => {
	let modelsToInclude;
	if (res.locals.identity === 'verified') {
		modelsToInclude = [
			{ model: Post },
			{ model: User, as: 'following', attributes: ['id'] },
			{ model: User, as: 'followers', attributes: ['id'] }
		]
	}
	const username = req.params.username.replace(/[^a-zA-Z0-9_.-]/g, '');
	console.log(username)
	User.findOne({
		where: {
			username: { [Sequelize.Op.iLike]: username }
		},
		attributes: {
			exclude: ['password']
		},
		include: modelsToInclude
	})
		.then(result => {
			if (result) {
				res.status(200).send(result);
			} else {
				res.status(404).end();
			}
		})
		.catch(console.error)
});

router.get('/user/:username/following', auth, (req, res, next) => {
	const username = req.params.username.replace(/[^a-zA-Z0-9_.-]/g, '');
	User.findOne({
		where: {
			username: { [Sequelize.Op.iLike]: username }
		},
		attributes: ['username'],
		include: [
			{ model: User, as: 'following', attributes: ['avatar', 'username'] },
		]
	})
		.then(result => {
			res.send(result)
		})
})

router.get('/user/:username/followers', auth, (req, res, next) => {
	const username = req.params.username.replace(/[^a-zA-Z0-9_.-]/g, '');
	User.findOne({
		where: {
			username: { [Sequelize.Op.iLike]: username }
		},
		attributes: ['username'],
		include: [
			{ model: User, as: 'followers', attributes: ['avatar', 'username'] }
		]
	})
		.then(result => {
			res.send(result)
		})
})
module.exports = router;