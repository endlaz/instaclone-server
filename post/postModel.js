const Sequelize = require('sequelize');
const db = require('../db');
const User = require('../user/userModel');

const Post = db.define('posts', {
    picture: {
        type: Sequelize.TEXT,
        allowNull: false,
    },
    description: {
        type: Sequelize.TEXT
    },
    likes: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
    }
});
Post.belongsTo(User);

module.exports = Post