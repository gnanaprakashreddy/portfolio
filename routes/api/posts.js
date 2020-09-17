const express = require('express');

const router = express.Router();

router.get('/posts',(req,res)=>{
    res.send("In posts route...");
})

module.exports= router;