// middlewares.js
module.exports.isLoggedIn = function (req, res, next) {
    if (req.session.loggedIn) {
        return next();
    } else {
        return res.redirect('/login');
    }
};
