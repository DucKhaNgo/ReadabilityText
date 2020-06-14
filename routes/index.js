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
  A: {
    type: 'Tính từ',
    class: 'Adjective'
  },
  Ab: {
    type: 'Tính từ mượn',
    class: 'Adjective'
  },
  B: {
    type: 'Từ mượn',
    class: 'Borrow'
  },
  C: {
    type: 'Liên từ',
    class: 'Coordinating'
  },
  Cc: {
    type: 'Liên từ đẳng lập',
    class: 'Subordinating'
  },
  CH: {
    type: 'Dấu câu',
    class: 'Chunk'
  },
  E: {
    type: 'Giới từ',
    class: 'Adposition'
  },
  Fw: {
    type: 'Từ nước ngoài',
    class: 'ForeignWord'
  },
  FW: {
    type: 'Từ nước ngoài',
    class: 'ForeignWord'
  },
  I: {
    type: 'Thán từ',
    class: 'Interjection'
  },
  L: {
    type: 'Định từ',
    class: 'Determiner'
  },
  M: {
    type: 'Số từ',
    class: 'Numeral'
  },
  N: {
    type: 'Danh từ',
    class: 'Noun'
  },
  Nb: {
    type: 'Danh từ mượn',
    class: 'Noun'
  },
  Nc: {
    type: 'Danh từ chỉ loại',
    class: 'Noun'
  },
  Ne: {
    type: '',
    class: ''
  },
  Ni: {
    type: 'Danh từ kí hiệu',
    class: 'Noun'
  },
  Np: {
    type: 'Danh từ riêng',
    class: 'Noun'
  },
  NNP: {
    type: '',
    class: ''
  },
  Ns: {
    type: '',
    class: ''
  },
  Nu: {
    type: 'Danh từ đơn vị',
    class: 'Noun'
  },
  Ny: {
    type: 'Danh từ viết tắt',
    class: 'Noun'
  },
  P: {
    type: 'Đại từ',
    class: 'Pronoun'
  },
  R: {
    type: 'Phó từ',
    class: 'PronounR'
  },
  S: {
    type: '',
    class: ''
  },
  T: {
    type: 'Trợ từ',
    class: 'Particle'
  },
  V: {
    type: 'Động từ',
    class: 'Verb'
  },
  Vb: {
    type: 'Động từ mượn',
    class: 'Verb'
  },
  Vy: {
    type: 'Động từ viết tắt',
    class: 'Verb'
  },
  X: {
    type: 'Không phân loại',
    class: 'null'
  },
  Y: {
    type: '',
    class: ''
  },
  Z: {
    type: '',
    class: ''
  }
};
const ReadabilityTextLevel = ['', {
  ability: 'từ lớp 2 tới lớp 5',
  age: 'từ 7 tới 10 tuổi'
}, {
  ability: 'từ lớp 6 tới lớp 9',
  age: 'từ 11 tới 14 tuổi'
}, {
  ability: 'từ lớp 10 trở lên',
  age: 'từ 16 tuổi trở lên'
}];
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
      wordCounter,
      wordRanking
    } = result;

    // mapping posTag and wordCounter
    const arrTextInput = [];
    posTag.forEach(element => {
      const numberExist = wordCounter[element[0]];
      const dataType = DATATYPE[element[1]];
      const ranking = wordRanking[element[0].toLowerCase()];
      console.log('word----',element[0], ', ranking-----', ranking);
      console.log('word---', )
      const obj = {
        text: element[0],
        dataType,
        numberExist,
        ranking
      }
      arrTextInput.push(obj);
    });
    // convert float numbet to 3 number after .
    for (const key in result) {
      if (typeof result[key] === 'number') {
        result[key] = Math.round(result[key] * 1000) / 1000;
      }
    }
    const level = result.readabiity;

    res.render('index', {
      ischecked: true,
      arrTextInput,
      checkBy,
      dataResponse: result,
      readabilityLevel: ReadabilityTextLevel[level]
    });
  }).catch(error => {
    console.log('error----', error);
    res.send(400, error);
  });
}
router.post('/checkByDirect', function (req, res, next) {
  console.log('req.body------', req.body);
  // do something
  try {

    const {
      directInput
    } = req.body;
    if (directInput) {
      handleData(directInput, res, 'direct');
    }
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
    console.log('error---', error);
    res.send(400);
  }
});
module.exports = router;
