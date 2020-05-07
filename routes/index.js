var express = require('express');
var router = express.Router();
var checkReadabilytyController = require('../controller/checkReadabilty.controller');
var multer = require('multer');
var textract = require('textract');
var fileName = '';
const PATH = "./uploads";
var Storage = multer.diskStorage({
  destination: function(req, file, callback) {
    console.log('destination----');
    console.log(' destination file------: ', file);
      callback(null, PATH);
  },
  filename: function(req, file, callback) {
    console.log("hahahaahahaha: ", file);
    fileName = file.fieldname + "_" + Date.now() + "_" + file.originalname;
    callback(null, fileName);
  }
});

var upload = multer({
  storage: Storage
}) //Field name and max count

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
  // res.send('sadasdsadd');
});

router.post('/checkByDirect', function(req, res, next){
  console.log('req.body------', req.body);
  // do something
  try {
    checkReadabilytyController.checkByDirect('data');
    const { directInput } = req.body;
    res.render('index', {ischecked: true, text: req.body.directInput});
  } catch (error) {
    res.send(400);    
  }
});
router.post('/checkByFile', upload.single('fileData'), (req, res) => {
  try {
    textract.fromFileWithPath(`${PATH}/${fileName}`, function(err, text) {
      console.log('text-------', text);
    })

    res.render('index', {ischecked: true});
  }catch(err) {
    res.send(400);
  }
});
module.exports = router;
