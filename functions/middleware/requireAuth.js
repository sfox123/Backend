const jwt = require('jsonwebtoken')
const mongoose = require('mongoose');
const User = mongoose.model('User')

module.exports = (req, res, next) => {
    const { authorization } = req.headers;
    
    
    if (!authorization) {
            return res.status(401).send({ error: 'You Must be Logged In 1.' })
        }
        
    const token = authorization.replace('Bearer ', '')
    

    jwt.verify(token, '123', async (err, payload) => {
        if (err) {
            return res.status(401).send({ error: 'You must be logged in 2.' })
        }
        const { userId } = payload
        const user = await User.findById(userId)
        req.user = user;
        next();
    })
    
}