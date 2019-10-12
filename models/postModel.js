const Sequelize = require('sequelize');
const db = require('../db');
const User = require('./userModel');

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

// A Post belongs to a user. A user can have many posts
// This 1-many relation is made with .belongsTo and .hasMany in file:
// ../user/userModel.js

module.exports = Post