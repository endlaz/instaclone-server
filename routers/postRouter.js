const { Router } = require('express');
const Post = require('../models/postModel');
const User = require('../models/userModel');
const router = new Router();
const auth = require('../middleware/authMiddleware');

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
			});
	} else {
		res.status(400).end();
	}
})

module.exports = router;