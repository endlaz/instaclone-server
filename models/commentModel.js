const Sequelize = require('sequelize');
const db = require('../db');

const Comment = db.define('comments', {
    comment: Sequelize.TEXT
});

module.exports = Comment