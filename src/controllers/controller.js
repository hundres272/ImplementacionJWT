const {Router} = require('express');
const router = Router();
const User = require('../models/User');

const jwt = require('jsonwebtoken');
const config = require('../config');
const verifyToken = require('./verifyToken');

router.post('/signin',async (req,res,next)=>{
    const {username,email,password} = req.body;
    const user = new User({
        username: username,
        email: email,
        password: password
    })
    user.password = await user.encryptPassword(user.password);
    await user.save();
    const token = jwt.sign({id: user._id}, config.secret,{
        expiresIn: 60*60*24
    });
    console.log(user);
    res.json({auth: true, token: token});
    // res.json('signin');
})
router.post('/signup',async (req,res,next)=>{
    const {email,password} = req.body;
    const user = User.findOne({email:email});
    if(!user){
        return res.status(404).send('El email no está registrado');
    }
    const validPassword = await user.validatePassword(password);
    if(!validPassword){
        return res.status(401).json({
            auth: false,
            token: null
        })
    }
    jwt.sign({id: user._id}, config.secret,{
        expiresIn: 60*60*24
    });
    res.json({auth: true, token});
    
})
router.get('/profile', verifyToken, async (req,res,next)=>{
    
    const user = await User.findById(req.userId, {password:0});
    if(!user){
        return res.status(401).send('No se encontró el usuario');
    }
    res.json(user);

})

module.exports = router;