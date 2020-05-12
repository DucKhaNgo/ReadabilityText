var express = require('express');
var router = express.Router();
var checkReadabilytyController = require('../controller/checkReadabilty.controller');
var multer = require('multer');
var textract = require('textract');
var axios = require('axios');
var http = require('http');
var FormData = require('form-data');
var fetch = require('fetch').fetchUrl;
var fileName = '';
const PATH = "./uploads";
var Storage = multer.diskStorage({
  destination: function (req, file, callback) {
    console.log('destination----');
    console.log(' destination file------: ', file);
    callback(null, PATH);
  },
  filename: function (req, file, callback) {
    console.log("hahahaahahaha: ", file);
    fileName = file.fieldname + "_" + Date.now() + "_" + file.originalname;
    callback(null, fileName);
  }
});

var upload = multer({
  storage: Storage
}) //Field name and max count

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index');
  // res.send('sadasdsadd');
});

function handleData(directInput, res, checkBy) {
  axios({
    method: 'post',
    url: 'http://localhost:8000/text_analysis/',
    data: `input_text=${directInput}`,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }).then(result => {
    console.log(result.data);
    const {
      posTag
    } = result.data;
    const arrTextInput = [];
    posTag.forEach(element => {
      const obj = {
        text: element[0],
        type: element[1]
      }
      arrTextInput.push(obj);
    });
    console.log('arrText-----', arrTextInput);
    res.render('index', {
      ischecked: true,
      arrTextInput,
      checkBy
    });
  });
}
router.post('/checkByDirect', function (req, res, next) {
  console.log('req.body------', req.body);
  // do something
  try {

    const {
      directInput
    } = req.body;
    handleData(directInput, res, 'direct');
  } catch (error) {
    console.log('error---', error);
    res.send(400);
  }
});
router.post('/checkByFile', upload.single('fileData'), (req, res) => {
  try {
    textract.fromFileWithPath(`${PATH}/${fileName}`, function (err, text) {
      console.log('text-------', text);
      handleData(text, res, 'file');
    });
  } catch (err) {
    res.send(400);
  }
});
module.exports = router;