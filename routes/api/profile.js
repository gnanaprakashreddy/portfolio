const express = require('express');
const auth = require('../../middleware/auth');
const router = express.Router();
const {check, validationResult} = require('express-validator');
const Profile = require('../../modals/Profile');
const User = require('../../modals/User');


router.get('/profile/me',auth, async (req,res)=>{
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

router.post('/profile',
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


module.exports= router;