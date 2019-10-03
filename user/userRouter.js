const { Router } = require('express');
const User = require('./userModel');
const router = new Router();
const bcrypt = require('bcrypt');

// Create new user
router.post('/user', (req, res, next) => {
    const user = {
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 10),
        phone: req.body.phone
    };
    User.create(user)
    .then(() => res.status(201).end())
    .catch(console.error);
});

module.exports = router;