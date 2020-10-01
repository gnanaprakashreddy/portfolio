const express = require('express');
const connectDB = require('./config/db');
const path = require('path');
const app = express();
//connceting data base
connectDB();

//bodyparser
app.use(express.json({
    extended: false
}))


app.use('/user', require('./routes/api/user'));
app.use('/auth', require('./routes/api/auth'));
app.use('/profile',require('./routes/api/profile'));
app.use('/posts', require('./routes/api/posts'));

if(process.env.NODE_ENV === 'production'){
    app.use(express.static('client/build'))
    app.get('*',(req,res)=>{
        res.sendFile(path.resolve(__dirname,'client/build'))
    })
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log('server running'));