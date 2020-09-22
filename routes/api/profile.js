const express = require('express');
const auth = require('../../middleware/auth');
const request = require('request');
const config = require('config');
const router = express.Router();
const {check, validationResult} = require('express-validator');
const Profile = require('../../modals/Profile');
const User = require('../../modals/User');
const { response } = require('express');


router.get('/me',auth, async (req,res)=>{
    try{
        const profile =  await Profile.findOne({user:req.user.id}).populate('user',['name','avatar']);
        if(!profile){
            return res.status(400).json({msg:'Profile doesnot exist'});
        }
        res.send(profile);
    }catch(err){
        console.log(err.message);
        res.status(500).send('Server Error');
    }
})

router.post('/',
    [auth,
        [
            check('status','status is required').not().isEmpty(),
            check('skills','Skills are required').not().isEmpty()
        ]
    ],
    async(req,res)=> {
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({errors:errors.array()});
        }
        const {
            company,
            website,
            location,
            bio,
            status,
            githubusername,
            skills,
            youtube,
            facebook,
            twitter,
            instagram,
            linkedin
        } = req.body;

        const profilefields = {};

        profilefields.user = req.user.id;
        if(company) profilefields.company = company
        if(website) profilefields.website = website
        if(location) profilefields.location = location
        if(bio) profilefields.bio = bio
        if(status) profilefields.status = status
        if(githubusername) profilefields.githubusername = githubusername
        if(skills) profilefields.skills = skills.split(',').map(skill=> skill.trim())

        profilefields.social ={}
        if(youtube) profilefields.social.youtube = youtube;
        if(twitter) profilefields.social.twitter = twitter;
        if(facebook) profilefields.social.facebook = facebook;
        if(linkedin) profilefields.social.linkedin = linkedin;
        if(instagram) profilefields.social.instagram = instagram

        try{
            let profile = await Profile.findOne({user : req.user.id});
            if(profile){
                profile = await Profile.findOneAndUpdate({user:req.user.id},{$set: profilefields},{new : true});
                return res.json(profile);
            }
            profile = new Profile(profilefields);
            
            await profile.save();

            res.json(profile)

        }catch(err){
            console.log(err.message)
            res.status(500).send('Server Error')
        }

    }
)


router.get('/',async (req,res)=>{
    try {
        const profiles = await Profile.find().populate('user',['name','avatar']);
        if(!profiles){
            return res.status(400).json({msg:'Profile not found'})
        }
        res.json(profiles);
    } catch (err) {
        console.log(err.message);
        res.status(500).send('Server Error');
    }
})

router.get('/user/:user_id',async (req,res)=>{
    try {
        const profile = await Profile.findOne({user : req.params.user_id}).populate('user',['name','avatar']);
        if(!profile){
            return res.status(400).json({msg:'Profile not found'})
        }
        res.json(profile);
    } catch (err) {
        console.log(err.message);
        if(err.kind == 'ObjectId')
            return res.status(400).json({msg:'Profile not found'})
        res.status(500).send('Server Error');
    }
})

router.delete('/',auth, async(req,res)=>{
    try {
        await Profile.findOneAndDelete({user:req.user.id})

        await User.findOneAndDelete({_id:req.user.id})
        res.json({msg:'Deleted Successfully'});
    } catch (err) {
        console.log(err.message);
        res.status(500).send('Server Error');
    }
})


router.put('/experience',
    [auth, 
        [
            check('title','title is required').not().isEmpty(),
            check('company','Company is required').not().isEmpty(),
            check('from','from date is required').not().isEmpty()
        ]
    ], async(req,res)=>{
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({errors:errors.array()})
        }
        const {
            title,
            company,
            from,
            to,
            location,
            current,
            description
        } = req.body

        const newExp ={title,company, from, to, location, current,description}
        try{
            let profile = await Profile.findOne({user:req.user.id})

            profile.experience.unshift(newExp);

            await profile.save();

            res.json(profile);
        }catch(err){
            console.log(err.message);
            res.status(500).send('Server Error')
        }
})

router.delete('/experience/:exp_id',auth, async(req,res)=>{
    try{
        let profile = await Profile.findOne({user:req.user.id})

        const removeInd = profile.experience.map(item => item.id).indexOf(req.params.exp_id);

        profile.experience.splice(removeInd,1);
        await profile.save();

        res.json(profile);
    }catch(err){
        console.log(err.message);
        res.status(500).send('Server Error')
    }
})

router.put('/education',
    [auth, 
        [
            check('school','School is required').not().isEmpty(),
            check('degree','Degree is required').not().isEmpty(),
            check('fieldofstudy','Field Of Study date is required').not().isEmpty()
        ]
    ], async(req,res)=>{
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({errors:errors.array()})
        }
        const {
            school,
            degree,
            fieldofstudy,
            from,
            to,
            current,
            description
        } = req.body

        const newEdu ={school,degree, from, to, fieldofstudy, current,description}
        try{
            let profile = await Profile.findOne({user:req.user.id})

            profile.education.unshift(newEdu);

            await profile.save();

            res.json(profile);
        }catch(err){
            console.log(err.message);
            res.status(500).send('Server Error')
        }
})

router.delete('/education/:edu_id',auth, async(req,res)=>{
    try{
        let profile = await Profile.findOne({user:req.user.id})

        const removeInd = profile.education.map(item => item.id).indexOf(req.params.edu_id);

        profile.education.splice(removeInd,1);
        await profile.save();

        res.json(profile);
    }catch(err){
        console.log(err.message);
        res.status(500).send('Server Error')
    }
})

router.get('/github/:username',(req,res)=>{
    try {
        const options ={
            uri:`https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc&client_id=${config.get('githubClientId')}&client_secret=${config.get('githubSecret')}`,
            method:'GET',
            headers:{'user-agent':'node.js'}
        };
        request(options,(error,response,body)=>{
            if(error){
                console.log(error.message)
            }
            if(response.statusCode!==200)
                return res.status(404).json({msg:'Profile not found'})

            res.json(JSON.parse(body))
        })
    } catch (err) {
        console.log(err.message);
        res.status(500).send('Server Error');
    }
})

module.exports= router;