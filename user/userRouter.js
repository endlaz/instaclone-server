const { Router } = require('express');
const User = require('./userModel');
const router = new Router();
const bcrypt = require('bcrypt');

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
                    where: { username },
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

module.exports = router;