const { Router } = require('express');
const Post = require('./postModel');
const User = require('../user/userModel');
const router = new Router();
const { io } = require('../server');
const auth = require('../auth/middleware');

// All posts
router.get('/posts', (req, res, next) => {
    Post.findAll({
        include: [
            {
                model: User,
                attributes: ['username', 'avatar']
            }
        ],
        order: [
            ['createdAt', 'DESC']
        ]
    })
        .then(result => {
            res.status(200).send(result);
        })
        .catch(console.error)
});

router.post('/post', auth, (req, res, next) => {
    if (req.body.picture) {
        Post.create(req.body)
            .then(result => {
                res.status(201).send(result);
                io.emit("postAdded", '');
            });
    } else {
        res.status(400).end();
    }
})

module.exports = router;