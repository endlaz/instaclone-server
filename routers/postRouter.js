const { Router } = require('express');
const Post = require('../models/postModel');
const User = require('../models/userModel');
const Comment = require('../models/commentModel');
const router = new Router();
const auth = require('../middleware/authMiddleware');

// All posts
// router.get('/posts', (req, res, next) => {
// 	Post.findAll({
// 		include: [
// 			{
// 				model: User,
// 				attributes: ['username', 'avatar']
// 			}
// 		],
// 		order: [
// 			['createdAt', 'DESC']
// 		]
// 	})
// 		.then(result => {
// 			res.status(200).send(result);
// 		})
// 		.catch(console.error)
// });

// Add new post
router.post('/post', auth, (req, res, next) => {
	if (req.body.picture) {
		Post.create(req.body)
			.then(result => {
				res.status(201).send(result);
			})
			.catch(console.error);
	} else {
		res.status(400).end();
	}
})

// Add comment to a post
router.post('/post/:id/comment', auth, (req, res, next) => {
	const comment = req.body.comment;
	const postId = req.params.id;
	const userId = req.user.id;

	if (comment) {
		Comment.create({ comment, postId, userId })
			.then(() => {
				res.status(201).send({ message: "Comment added" });
			})
			.catch(next);
	} else {
		res.status(400).send({ message: "Can't add an empty comment" });
	}
})

// Get one post
router.get('/post/:id', auth, (req, res, next) => {
	Post.findByPk(req.params.id, {
		include: [
			{
				model: User,
				attributes: ['username']
			},
			{
				model: Comment,
				include: [
					{
						model: User,
						attributes: ['username']
					}
				]
			}
		]
	})
		.then(post => {
			if (post) {
				res.status(200).send(post);
			} else {
				res.status(404).send({ message: "Post not found" });
			}
		})
		.catch(next);
})

module.exports = router;