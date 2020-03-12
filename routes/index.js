var express = require('express');
var router = express.Router();
var checkReadabilytyController = require('../controller/checkReadabilty.controller');
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
  // res.send('sadasdsadd');
});

router.get('/checkByUrl', function(req, res, next){
  console.log('req.body------', req.body);
  console.log('hahahha');
  // do something
  checkReadabilytyController.checkByUrl('data1', 'data2');
  //return data
  res.render('index', {ischecked: true});
});
router.post('/checkByDirect', function(req, res, next){
  console.log('req.body------', req.body);
  console.log('hahahha');
  // do something
  checkReadabilytyController.checkByDirect('data');
  //return data
  res.render('index', {ischecked: true});
});
router.post('/checkByFile', function(req, res ,next){
  console.log('req.body------', req.body);
  console.log('hahahha');
  // do something
  checkReadabilytyController.checkByDirect('data');
  //return data
  res.render('index', {ischecked: true});
});
module.exports = router;
