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

const DATATYPE = {
  A: 'Tính từ',
  Ab: 'Tính từ mượn',
  B: 'Từ mượn',
  C: 'Liên từ',
  Cc: 'Liên từ đẳng lập',
  CH: 'Dấu câu',
  E: 'Giới từ',
  Fw: 'Từ nước ngoài',
  FW: 'Từ nước ngoài',
  I: 'Thán từ',
  L: 'Định từ',
  M: 'Số từ',
  N: 'Danh từ',
  Nb: 'Danh từ mượn',
  Nc: 'Danh từ chỉ loại',
  Ne: '',
  Ni: 'Danh từ kí hiệu',
  Np: 'Danh từ riêng',
  NNP: '',
  Ns: '',
  Nu: 'Danh từ đơn vị',
  Ny: 'Danh từ viết tắt',
  P: 'Đại từ',
  R: 'Phó từ',
  S: '',
  T: 'Trợ từ',
  V: 'Động từ',
  Vb: 'Động từ mượn',
  Vy: 'Động từ viết tắt',
  X: 'Không phân loại',
  Y: '',
  Z: ''
}
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
    url: 'https://readabilityhcmus.herokuapp.com/text_analysis/',
    data: `input_text=${directInput}`,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }).then(result => {
    result = result.data;
    const {
      posTag,
      wordCounter
    } = result;

    // mapping posTag and wordCounter
    const arrTextInput = [];
    posTag.forEach(element => {
      const numberExist = wordCounter[element[0]];
      const type = DATATYPE[element[1]];
      const obj = {
        text: element[0],
        type,
        numberExist
      }
      arrTextInput.push(obj);
    });
    // convert float numbet to 3 number after .
    for (const key in result) {
      if (typeof result[key] === 'number') {
        result[key] = Math.round(result[key]*1000)/1000;
      }
    }

    res.render('index', {
      ischecked: true,
      arrTextInput,
      checkBy,
      dataResponse: result
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
      text = text.slice(0, text.length - 2);
      console.log('text-------', text);
      handleData(text, res, 'file');
    });
  } catch (err) {
    res.send(400);
  }
});
module.exports = router;