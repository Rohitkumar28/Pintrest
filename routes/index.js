var express = require('express');
var router = express.Router();
const userModel = require('./users');
const passport = require('passport');
const upload =require("./multer");
const postModel = require('./post');

const localStrategy = require("passport-local");
passport.use(new localStrategy(userModel.authenticate()))


router.get('/', function(req, res, next) {
  res.render('index', {error : req.flash('error') , nav: false} );
});

router.get('/login', function(req, res, next) {
  res.render('login', {error : req.flash('error') , nav: false});
});

router.get('/profile', isLoggedIn,async function(req, res, next) {
  const user = await userModel.findOne({username : req.session.passport.user})
  .populate("posts")
  res.render('profile', {user, posts: user.posts, nav:true});
});

router.get('/edit',isLoggedIn, async function(req, res) {
  const user = await userModel.findOne({
    username : req.session.passport.user
  })
  res.render('edit', {user , nav:true} );
});

router.get('/feed', isLoggedIn,async function(req, res, next) {
  const user = await userModel.findOne({username : req.session.passport.user})
  const posts = await postModel.find()
  .populate("user")
  res.render('feed', {user, posts, nav:true });
});

router.get('/show/posts', isLoggedIn, async function(req, res, next) {
  const user = await userModel.findOne({username : req.session.passport.user})
  .populate("posts")
  res.render('show', {user, posts: user.posts, nav:true});
});

router.get('/add', isLoggedIn,async function(req, res, next) {
  const user = await userModel.findOne({username : req.session.passport.user});
  res.render('add', {user, nav:true});
});

router.post('/createpost', isLoggedIn, upload.single("postimage"),async function(req, res, next) {
  const user = await userModel.findOne({username : req.session.passport.user});
  const post = await postModel.create({
    user: user._id,
    image: req.file.filename,
    title: req.body.title,
    description : req.body.description
  });
  user.posts.push(post._id);
  await user.save();
  res.redirect("/profile");
});

router.post('/fileupload', isLoggedIn, upload.single("image"), async function(req, res, next) {
 const user = await userModel.findOne({username : req.session.passport.user});
 user.profileImage = req.file.filename ;
 await user.save();
 res.redirect('/profile')
});

router.post("/register", function(req, res) {
  const { username, email, name, contact } = req.body;
  const userData = new userModel({ username, email, name, contact});
  
  userModel.register(userData, req.body.password)
  .then(function(){
    passport.authenticate("local")(req, res, function(){
      res.redirect("/profile");
    })
  })
});

router.post('/update',  async function(req, res){
  const user = await userModel.findOneAndUpdate(
    {username : req.session.passport.user},
    {username : req.body.username , name : req.body.name},
    {new : true}
  );
  await user.save() ;
  res.redirect('/profile');
})

router.post("/login", passport.authenticate("local", {
  successRedirect: "/profile",
  failureRedirect: "/login",
  failureFlash: true
}), function(req, res, next){
});

router.get("/logout", function(req, res, next){
  req.logout(function(err){
    if (err) { return next(err); }
    res.redirect('/');
  })
});

function isLoggedIn(req, res, next){
  if(req.isAuthenticated()) return next();
  res.redirect('/login');
}

module.exports = router;
