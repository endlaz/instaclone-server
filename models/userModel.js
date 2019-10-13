const Sequelize = require('sequelize');
const db = require('../db');
const Post = require('./postModel');
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

// RELATIONS BETWEEN TABLES
// one-to-many
User.hasMany(Post);
Post.belongsTo(User);

// Advanced relation
// many-to-many
// A user can follow many users
// A user has many followers
// To keep track of who is following who, we've created a user_relation table with columns follower_id and followed_id that both refers to an user id from the user table
// We want to know that Piet is following Henk, Johan, Jack and Sofie instead of userId 1 is following id's 2, 3, 4 and 5
// Piet is the follower
// Henk, Johan, Jack and Sofie are followed
// We want to say that the table users has a relation with itself. Thats weird and impossible to say without help from another table
// In our relation table we have to say that the follower_id and follow_id are foreign keys that refers to an users from the User table
// But because we cant make 2 relations to the same table, we have to give the relations an alias so Sequelize sees them as different relations
userRelation.belongsTo(User, { as: 'follower', foreignKey: 'follower_id' });
userRelation.belongsTo(User, { as: 'followed', foreignKey: 'followed_id' });
// Now we can say that a user is following many users, and that a user is followed by many users through our relation table
User.belongsToMany(User, {
    as: 'following',
    through: userRelation,
    foreignKey: 'follower_id'
});
User.belongsToMany(User, {
    as: 'followers',
    through: userRelation,
    foreignKey: 'followed_id'
});
// To see how this relation is working and what data you can get with a query
// test and analyze the 3 GET endpoints at the bottom of file ../routers/userRouter.js

module.exports = User;