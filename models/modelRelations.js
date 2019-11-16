const User = require('./userModel');
const Post = require('./postModel');
const Comment = require('./commentModel');

Comment.belongsTo(User);
User.hasMany(Comment);

Comment.belongsTo(Post);
Post.hasMany(Comment);