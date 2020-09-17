const express = require('express');

const router = express.Router();

router.get('/profile',(req,res)=>{
    res.send("In profile route...");
})

module.exports= router;