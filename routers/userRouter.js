const { Router } = require('express');
const User = require('../models/userModel');
const userRelation = require('../models/userRelationModel');
const Post = require('../models/postModel');
const router = new Router();
const bcrypt = require('bcrypt');
const db = require('../db');
const auth = require('../middleware/authMiddleware');
const { toData } = require('../auth/jwt');
const Sequelize = require('sequelize');
const identity = require('../middleware/identityMiddleware');

// Create new user
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

// Get feed of a user
// Feed only shows posts from users whom the user is following
router.get('/user/:id/feed', auth, (req, res, next) => {
	// Split auth type and token from header
	const auth = req.headers.authorization && req.headers.authorization.split(' ');
	// Convert token to readable data and store only the userId in a var
	const loggedUserId = toData(auth[1]).userId;
	// (Try to) Convert the request URL param id into a number
	const userId = parseInt(req.params.id);

	// Check if converted URL param is a valid number
	if (userId !== 'NaN' && userId > 0) {
		// Check if the request feed belongs to the logged in user
		if (userId === loggedUserId) {
			// Select all the posts from users that the logged in user is following
			const query = `SELECT username, posts.* FROM users
                INNER JOIN user_relations ur ON users.id=ur.followed_id
                INNER JOIN posts ON posts."userId"=ur.followed_id
                WHERE ur.follower_id=${userId}
                ORDER BY "createdAt" DESC`;
			db.query(query)
				.then(result => {
					// Send the array of object back as the response
					res.status(200).send(result[0]);
				});
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