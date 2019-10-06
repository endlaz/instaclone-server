const Sequelize = require('sequelize');
const db = require('../db');
const Post = require('../post/postModel');
const userRelation = require('./userRelationModel');

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
        defaultValue: "http://i.imgur.com/HQ3YU7n.gif"
    }
});
User.hasMany(Post);
Post.belongsTo(User);

User.belongsToMany(User, {
    as: 'following',
    through: userRelation,
    foreignKey: 'follower_id',
    onDelete: 'cascade',
    hooks: true
});
User.belongsToMany(User, {
    as: 'followers',
    through: userRelation,
    foreignKey: 'followed_id',
    onDelete: 'cascade',
    hooks: true
});
userRelation.belongsTo(User, { as: 'follower', foreignKey: 'follower_id' });
userRelation.belongsTo(User, { as: 'followed', foreignKey: 'followed_id' });

module.exports = User;