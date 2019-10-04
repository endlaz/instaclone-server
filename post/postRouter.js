const { Router } = require('express');
const Post = require('./postModel');
const User = require('../user/userModel');
const router = new Router();
const { io } = require('../server');

// Create new user
router.get('/posts', (req, res, next) => {
    Post.findAll({
        include: [
            {model: User,
                attributes: ['username', 'avatar']}
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

router.post('/posts', (req, res, next) => {
    if (req.body.picture) {
        Post.create({...req.body, userId: 1})
            .then(result => {
                return Post.findOne({
                    where: {id: result.id},
                    include: [
                        {model: User,
                            attributes: ['username', 'avatar']}
                    ]
                })
            })
            .then(result => {
                res.status(201).send(result);
                io.emit("feed", result);
            });
    } else {
        res.status(400).end();
    }
})

module.exports = router;