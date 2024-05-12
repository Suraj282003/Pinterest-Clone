var express = require('express');
var router = express.Router();
const userModel = require('./users');
const passport = require('passport');
const upload = require('./multer');
const postModel = require('./post');

const localStratage = require('passport-local');
passport.use(new localStratage(userModel.authenticate()));

/* GET home page. */
router.get('/', async function(req, res, next) {

  const loggedIn = req.isAuthenticated();
  if(req.isAuthenticated()){
    const user = await userModel.findOne({username: req.session.passport.user})
    const posts = await postModel.find().populate('user')
    res.render('index', {nav: true, loggedIn: loggedIn, user, posts})
  }else{
    const posts = await postModel.find().populate('user')
  res.render('index', {nav: true, loggedIn: loggedIn, posts});
  }
});

router.get('/createpins', isLoggedIn, async function(req, res, next){
  const user = await userModel.findOne({username: req.session.passport.user});
  res.render('createpins', {nav: true, loggedIn: true, user});
})

router.post('/createpost', isLoggedIn, upload.single('postimage'), async function(req, res, next){
  const user = await userModel.findOne({username: req.session.passport.user}).populate('posts');
  const post = await postModel.create({
    user: user._id,
    title: req.body.title,
    description: req.body.description,
    link: req.body.link,
    image: req.file.filename,
  });

  user.posts.push(post._id);
  await user.save();
  res.redirect('/profile');
})

router.get('/register', function(req, res, next) {
  res.render('register', {nav: false, loggedIn: false});
});

router.get('/login', function(req, res, next) {
  res.render('login', {nav: false, loggedIn: false, error: req.flash('error')});
});

router.get('/profile', isLoggedIn, async function(req, res, next) {
  const user = await userModel.findOne({username: req.session.passport.user}).populate('posts')
  res.render('profile', {nav: true, loggedIn: true, user});
});

router.get('/show-posts/:id', async function(req, res, next) {
  const postId = req.params.id

  const loggedIn = req.isAuthenticated();
  if(req.isAuthenticated()){
    const user = await userModel.findOne({username: req.session.passport.user})
    const posts = await postModel.findById(postId).populate('user')
    res.render('show-posts', {nav: true, loggedIn: loggedIn, user, posts})
  }else{
    const posts = await postModel.findById(postId).populate('user')
  res.render('show-posts', {nav: true, loggedIn: loggedIn, posts});
  }
});

router.get('/my-pins', isLoggedIn, async function(req, res, next){
  const user = await userModel.findOne({username: req.session.passport.user}).populate('posts');
  res.render('allpins', {nav: true, loggedIn: true, user});
})

router.post('/fileupload', isLoggedIn, upload.single('image'), async function(req, res, next){
  const user = await userModel.findOne({username: req.session.passport.user})

  user.Imagetext = req.file.filename
  await user.save();
  res.redirect('/profile');
})

router.post('/register', async function(req, res, next){
  const userData = await userModel({
    username : req.body.username,
    email: req.body.email,
    fullname: req.body.fullname
  });

  userModel.register(userData, req.body.password)
  .then(function(){
    passport.authenticate('local')(req, res, function(){
      res.redirect('/profile');
    })
  })
})

router.post('/login', passport.authenticate("local", {
  successRedirect: '/profile',
  failureRedirect: '/login',
}), function(req, res){});

router.get('/logout', function(req, res){
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

function isLoggedIn(req, res, next){
  if(req.isAuthenticated()) return next();
  res.redirect('/');
}

module.exports = router;
