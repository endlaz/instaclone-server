const Sequelize = require('sequelize');
const db = require('../db');

const UserRelation = db.define('user_relations', {
    follower_id: {
		type: Sequelize.INTEGER,
	},
	followed_id: {
		type: Sequelize.INTEGER,
	}
});

module.exports = UserRelation;