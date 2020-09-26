const express = require('express');
const auth = require('../../middleware/auth');
const User = require('../../modals/User');
const jwt = require('jsonwebtoken');
const config = require('config');
const {check, validationResult} = require('express-validator');
const bcrypt = require('bcryptjs');
const router = express.Router();

router.get('/',auth , async (req, res) => {
    try{
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    }catch(err){
        console.log(err.message);
        return res.status(500).send('Server Error')
    }
})

router.post('/',[
    check('email','Email is required').isEmail(),
    check('password','Please enter the password').exists()  
],async (req,res)=>{

    const errors = validationResult(req);
    
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()});
    }

    const {email,password} = req.body;

    try{

        let user = await User.findOne({email});
        //if user doesnot exits
        if(!user){
            return res.status(400).json({errors:[{msg: 'User does not exist'}]})
        }

        const isMatch = await bcrypt.compare(password,user.password);
        if(!isMatch){
            return res.status(400).json({errors:[{msg: 'Incorrect Password..! Please try again'}]})
        }

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