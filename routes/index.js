var express = require('express');
var router = express.Router();
/*const {getRecentPosts, getPostById, getPostsByUserId, getAllPosts} = require('../middleware/posts');*/


router.get('/', function(req, res, next) {
  res.render('utama', {
    showMainHeader:true,
    showMainBody:true,
    showMainFooter:true

  });
});

router.get('/utama', function(req, res, next) {
  res.render('utama', {
    showMainHeader:true,
    showMainBody:true,
    showMainFooter:true

  });
});

router.get('/comingsoonpartial', function(req, res, next) {
  res.render('comingsoonpartial', {
    title: 'comingsoon',
    showMainHeader:true,
    showMainBody:false,
    showMainFooter:false,
    showcomingsoon:true
  });
});

/**
/* GET home page.
router.get('/', getRecentPosts, function(req, res, next) {
  res.render('index', {
    title: 'CSC 317 App',
    showNav:true,
    showHeader: false,
    name:"Gets Subroto",
    showThumb:true
  });
});

/** /home
router.get('/home', getRecentPosts, function(req, res, next) {
  res.render('index', {
    title: 'Home',
    showNav:true,
    showHeader: false,
    showThumb:true

  });
});
/** /login
router.get('/login',function(req,res,next){
  res.render('login', {
    title: 'Log-in',
    showHeader: true,
    showThumb:false


  });
});

/** /register
router.get('/register',function(req,res,next){
  res.render('register', {
    title: 'Register',
    showHeader: true,

  });
});
router.get('/registration',function(req,res,next){
  res.render('register', {
    title: 'Register',
    showHeader: true,
  });
});



router.get('/profile', getRecentPosts, function(req,res,next){
  res.render('profile', {
    title: 'Profile',
    showNav:true,
    showHeader: false,
    showThumbBottom:true

  });
});

/** post
router.get('/postvideo',function(req,res,next){
  res.render('postvideo', {
    title: 'Upload',
    showNav:true,
    showHeader: false
  });
});

/**
 * write

router.get('/write', function (req, res, next) {
    res.render('write',{
      title: 'Write Something',
      showNav:true,
      showHeader: false
    });
});



/**
 * map

router.get('/map', function (req, res, next) {
  res.render('map',{
    title: 'map',
    showNav:true,
    showHeader: false
  });
});

router.get('/upload',function(req,res,next){
  res.render('postvideo', {
    title: 'Upload',
    showNav:true,
    showHeader: false
  });
});

router.get('/viewpost',getRecentPosts,function(req,res,next){
  res.render('viewpost', {
    title: 'View Post',
    showNav:true,
    showHeader: false,
    showThumbBottom:true
  });
});

router.get('/post',getRecentPosts,function(req,res,next){
  res.render('postvideo', {
    title: 'Upload',
    showNav:true,
    showHeader: false,
    showThumbBottom:true
  });
});

router.get('/about',getRecentPosts,function(req,res,next){
  res.render('about',{
    showNav:true
  });
});

**/

module.exports = router;
