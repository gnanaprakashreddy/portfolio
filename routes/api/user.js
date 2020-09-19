const express = require('express');
const {check, validationResult} = require('express-validator');
const bcrypt = require('bcryptjs');
const gravatar = require('gravatar');
const jwt = require('jsonwebtoken');
const config = require('config');
const User = require('../../modals/User');

const router = express.Router();

router.post('/',[
    check('name','Name is required').not().isEmpty(),
    check('email','Email is required').isEmail(),
    check('password','Please enter the password').isLength({min:6})
],async (req,res)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()});
    }

    const {name,email,password} = req.body;

    try{

        let user = await User.findOne({email});
        //if user exits already
        if(user){
            return res.status(400).json({error:[{msg: 'User already exits'}]})
        }

        const avatar = await gravatar.url(email,{
            s:'200',
            r:'pg',
            d:'mm'
        })

        user = new User({name,email,avatar,password});
        
        //bcrypt rounds
        const salt = await bcrypt.genSalt(10);
        //password encryption
        user.password = await bcrypt.hash(password,salt);
        
        await user.save();   //saving the user to the db

        const payload = {
            user:{
                id:user.id
            }
        }

        jwt.sign(
            payload, 
            config.get('jwtSecret'),
            {expiresIn:360000},
            (err,token)=>{
                if(err) throw err
                return res.json({token});
            })
    }catch(err){
        return res.status(500).send('server error');
    }
    
})

module.exports = router;