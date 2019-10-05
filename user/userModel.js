const Sequelize = require('sequelize');
const db = require('../db');
const Post = require('../post/postModel');

const User = db.define('users', {
    email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false
    },
    username: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
    },
    name: {
        type: Sequelize.STRING
    },
    bio: {
        type: Sequelize.TEXT
    },
    avatar: {
        type: Sequelize.TEXT,
        defaultValue: "https://avatars3.githubusercontent.com/u/54072649?s=460&v=4"
    }
});
User.hasMany(Post);
Post.belongsTo(User);

module.exports = User;