const express = require('express');

const router = express.Router();

router.get('/',(req,res)=>{
    res.send("In posts route...");
})

module.exports= router;