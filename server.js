const express = require('express');
const connectDB = require('./config/db');

const app = express();
//connceting data base
connectDB();

app.get('/',(req,res)=>{
    res.send('API running');
});


app.get('/user',require('./routes/api/user'));
app.get('/auth',require('./routes/api/auth'));
app.get('/profile',require('./routes/api/profile'));
app.get('/posts',require('./routes/api/posts'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, ()=> console.log('server running'));