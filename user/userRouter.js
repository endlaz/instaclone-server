const { Router } = require('express');
const User = require('./userModel');
const Post = require('../post/postModel');
const router = new Router();
const bcrypt = require('bcrypt');
const db = require('../db');
const auth = require('../auth/middleware');
const { toData } = require('../auth/jwt');
const Sequelize = require('sequelize');

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

// Get user profile
router.get('/user/:username', (req, res, next) => {
    const username = req.params.username.replace(/[^a-zA-Z0-9_.-]/g,'');
    console.log(username)
    User.findOne({
        where: {
            username: { [Sequelize.Op.iLike]: username }
        },
        include: [
            { model: Post }
        ],
        attributes: {
            exclude: ['password']
        }
    })
    .then(result => {
        if(result) {
            res.status(200).send(result);
        } else {
            res.status(404).end();
        }
    })
    .catch(error => console.error)
})

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

module.exports = router;