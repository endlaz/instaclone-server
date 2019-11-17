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
		Comment.create({comment, postId, userId})
			.then(() => {
				res.status(201).send({ message: "Comment added" });
			})
			.catch(next);
	} else {
		res.status(400).send({ message: "Can't add an empty comment" });
	}
 })

module.exports = router;