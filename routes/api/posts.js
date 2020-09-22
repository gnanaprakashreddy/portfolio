const express = require('express');
const auth = require('../../middleware/auth');
const {check, validationResult} = require('express-validator');
const Post = require('../../modals/Post')
const Profile = require('../../modals/Profile')
const User = require('../../modals/User')
const router = express.Router();

router.post('/',[
    auth,
    [
        check('text','Text is required').not().isEmpty()
    ]
], async (req,res)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(401).json({errors:errors.array()})
    }
    try {
        const user = await User.findById(req.user.id).select('-password');
        
        const newPost = new Post({
            text:req.body.text,
            name:user.name,
            avatar:user.avatar,
            user:req.user.id
        })

        const post = await newPost.save();
        res.json(post)
    } catch (err) {
        console.log(err.message);
        res.status(500).send('Server Error')
    }
})

router.get('/',auth,async(req,res)=>{
    try {
        const posts = await Post.find().sort({date:-1});
        res.json(posts) 
    } catch (err) {
        console.log(err.message);
        res.status(500).send('Server Error')
    }
})

router.get('/:id',auth,async(req,res)=>{
    try {
        const post = await Post.findById(req.params.id);
        if(!post){
            return res.status(404).json({msg:'Post Not Found'});
        }
        res.json(post) 
    } catch (err) {
        console.log(err.message);
        if(err.kind === 'ObjectId'){
            return res.status(404).json({msg:'Post Not Found'});
        }
        res.status(500).send('Server Error')
    }
})


router.delete('/:id',auth,async(req,res)=>{
    try {
        const post = await Post.findById(req.params.id);
        if(!post){
            return res.status(404).json({msg:'Post not found'})
        }
        if(post.user.toString() !== req.user.id){
            return res.status(404).json({msg:'User is not Authorized'})
        }
        await post.remove();
        res.json({msg:'Removed Successfully'});
    } catch (err) {
        console.log(err.message);
        if(err.kind === 'ObjectId'){
            return res.status(404).json({msg:'Post Not Found'});
        }
        res.status(500).send('Server Error');
    }
})

router.put('/like/:id',auth,async(req,res)=>{
    try {
        const post = await Post.findById(req.params.id);
        if(post.likes.filter(like => like.user.toString() === req.user.id).length>0){
            return res.status(400).json({msg:'Post already liked'})
        }
        post.likes.unshift({user: req.user.id});
        await post.save();
        res.json(post.likes);
    } catch (err) {
        console.log(err.message);
        res.status(500).send('Server Error');
    }
})

router.put('/unlike/:id',auth,async(req,res)=>{
    try {
        const post = await Post.findById(req.params.id);
        if(post.likes.filter(like => like.user.toString() === req.user.id).length===0){
            return res.status(400).json({msg:'Post has not been liked yet'})
        }

        const removeInd = post.likes.map(like => like.user.toString()).indexOf(req.user.id);

        post.likes.splice(removeInd,1);

        await post.save();

        res.json(post.likes);
    } catch (err) {
        console.log(err.message);
        res.status(500).send('Server Error');
    }
})

router.post('/comments/:id',[
    auth,
    [
        check('text','Text is required').not().isEmpty()
    ]
], async (req,res)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(401).json({errors:errors.array()})
    }
    try {
        const user = await User.findById(req.user.id).select('-password');
        const post = await Post.findById(req.params.id);

        const newComment = {
            text:req.body.text,
            name:user.name,
            avatar:user.avatar,
            user:req.user.id
        }
        post.comments.unshift(newComment);
        await post.save();

        res.json(post.comments)
    } catch (err) {
        console.log(err.message);
        res.status(500).send('Server Error')
    }
})

router.delete('/comments/:id/:comment_id', auth , async(req,res)=>{
    try {
        const post = await Post.findById(req.params.id);
        const comment = post.comments.find(comment=> comment.id === req.params.comment_id)

        if(!comment){
            return res.status(404).json({msg:'Comment Does not Exist'})
        }
        if(comment.user.toString() !== req.user.id){
            return res.status(401).json({msg:'User is not authorized'})
        }

        const removeInd = post.comments.map(comment => comment.user.toString()).indexOf(req.user.id);
        post.comments.splice(removeInd,1);

        await post.save();

        res.json(post.comments);
    } catch (err) {
        console.log(err.message);
        res.status(500).send('Server Error')
    }
})

module.exports= router;