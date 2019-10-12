const { toData } = require('../auth/jwt');
const User = require('../models/userModel');

function identity(req, res, next) {
  // Check if Authorization header is send
  // Split Authorization header if header was send
  const auth = req.headers.authorization && req.headers.authorization.split(' ')

  // Check if splitting the header was successful
  // Check if the first part of the body from the header is the correct type (should be Bearer)
  // Check if there is a second part of the body from the header (should be the jwt token)
  if (auth && auth[0] === 'Bearer' && auth[1]) {
    // Request header checks were OK
    // Try to decode the jwt token
    try {
      const data = toData(auth[1])
      // const data should now be an object that contains a userId property. We can use that to check if the user really exist
      User.findByPk(data.userId)
        .then(user => {
          if (user) {
            // We found the user that matched the userId
            // We will pass the username through
            res.locals.identity = 'verified'
            next();
          } else {
            // There was no user with that userId
            // We consider that the request is from an anonymous source
            res.locals.identity = 'anonymous';
            next();
          }
        })
        .catch(next)
    } catch {
      // Could not decode the jwt token
      res.locals.identity = 'anonymous';
      next();
    }
  } else {
    // No or incorrect header was send
    // Identity of user is unknown (anonymous)
    res.locals.identity = 'anonymous';
    next();
  }
}

module.exports = identity