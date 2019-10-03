const Sequelize = require('sequelize');
const db = require('../db');

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
    name: {
        type: Sequelize.STRING
    },
    bio: {
        type: Sequelize.TEXT
    }
});

module.exports = User