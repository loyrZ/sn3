var express = require('express');
var router = express.Router();
/*const {getRecentPosts, getPostById, getPostsByUserId, getAllPosts} = require('../middleware/posts');*/


router.get('/', function(req, res, next) {
  res.render('comingsoonpartial', {
    showMainHeader:true,
    showMainBody:true,
    showMainFooter:true

  });
});

router.get('/utama', function(req, res, next) {
  res.render('comingsoonpartial', {
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

module.exports = router;
