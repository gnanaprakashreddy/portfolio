const express = require('express');

const router = express.Router();

router.get('/auth',(req,res)=>{
    res.send("In auth route...");
})

module.exports= router;