const express = require('express');

const router = express.Router();

router.get('/user',(req,res)=>{
    res.send("In user route...");
})

module.exports= router;