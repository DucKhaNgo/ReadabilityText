var express = require('express');
var router = express.Router();
var checkReadabilytyController = require('../controller/checkReadabilty.controller');
var multer = require('multer');
var textract = require('textract');
var axios = require('axios');
var fs = require('fs');
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
    callback(null, PATH);
  },
  filename: function (req, file, callback) {
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
  console.log(encodeURIComponent(directInput));
  axios({
    method: 'post',
    url: 'http://localhost:8000/text_analysis/',
    data: 'input_text=' + encodeURIComponent(directInput),
    headers: {
      // 'Content-Type': 'application/x-www-form-urlencoded'
      'accept': '*'
    }
  }).then(result => {
    result = result.data;
    const {
      posTag,
      wordCounter,
      wordRanking,
      SyllableRanking,
      syllableCounter
    } = result;

    // mapping posTag and wordCounter
    const arrTextInput = [];
    const arrSylableInput = [];
    posTag.forEach(element => {
      const numberExist = wordCounter[element[0]];
      const dataType = DATATYPE[element[1]];
      const ranking = wordRanking[element[0].toLowerCase()];
      if (dataType.type !== 'Dấu câu') {
        const sylableArr = element[0].split(' ');
        sylableArr.forEach(sylable => {
          sylable = sylable.toLowerCase();
          const objSylable = {
            text: sylable,
            numberExist: syllableCounter[sylable],
            ranking: SyllableRanking[sylable]
          };
          arrSylableInput.push(objSylable);
        })
        

      }
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
      arrSylableInput,
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
  if (!req.body || !req.body.directInput || !req.body.directInput.trim()) {
    res.redirect('/');
    return;
  }
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
      if (!text || !text.trim()) {
        res.redirect('/');
        return;
      }
      handleData(text, res, 'file');
    });
  } catch (err) {
    console.log('error---', error);
    res.send(400);
  }
});
router.get('/show-ranking-sylable', function(req, res, next) {
  const currentRanking = req.query.ranking ? parseInt(req.query.ranking) : 1;
  var data = fs.readFileSync('TanSoTieng.txt', 'utf8');
  var listWord = data.toString().split('\n');
  listWord= listWord.map((word, index) => {
    let ranking = parseInt(index / 600) + 1;
    return {text: word.split('\t')[0], ranking}
  });
  let listRanking = new Array(listWord[listWord.length - 1].ranking).fill(Object.assign({}, {}));
  listRanking = listRanking.map((elem,index) => {
    elem = index + 1;
    return elem;
  });
  listWord = listWord.slice((currentRanking-1)*600,currentRanking*600);
  res.render('showRanking', {
    listWord,
    listRanking,
    title: 'âm tiết'
  });
});
router.get('/show-ranking-word', function(req, res, next) {
  const currentRanking = req.query.ranking ? parseInt(req.query.ranking) : 1;
  var data = fs.readFileSync('TanSoTu.txt', 'utf8');
  var listWord = data.toString().split('\n');
  listWord= listWord.map((word, index) => {
    let ranking = parseInt(index / 600) + 1;
    return {text: word.split('\t')[0], ranking}
  });
  let listRanking = new Array(listWord[listWord.length - 1].ranking).fill(Object.assign({}, {}));
  listRanking = listRanking.map((elem,index) => {
    elem = index + 1;
    return elem;
  });
  listWord = listWord.slice((currentRanking-1)*600,currentRanking*600);
  res.render('showRanking', {
    listWord,
    listRanking,
    title: 'từ'
  });
});
router.get('/han-viet', function(req, res, next) {
  var data = fs.readFileSync('han_viet.txt', 'utf8');
  var listWord = data.toString().split('\n');
  listWord= listWord.map(word => {
    return {text: word.split('\r')[0]}
  });
  res.render('showListWord', {
    listWord,
    title: 'Danh sách các từ Hán - Việt'
  });
});
router.get('/phuong-ngu', function(req, res, next) {
  var data = fs.readFileSync('phuong_ngu.txt', 'utf8');
  var listWord = data.toString().split('\n');
  listWord= listWord.map(word => {
    return {text: word.split('\r')[0]}
  });
  res.render('showListWord', {
    listWord,
    title: 'Danh sách các phương ngữ tiếng Việt'
  });
});
router.get('/am-tiet-thong-dung', function(req, res, next) {
  var data = fs.readFileSync('3000_most_syllable.txt', 'utf8');
  var listWord = data.toString().split('\n');
  listWord= listWord.map(word => {
    return {text: word.split('\r')[0]}
  });
  res.render('showListWord', {
    listWord,
    title: 'Danh sách 3000 âm tiết thông dụng trong tiếng Việt'
  });
});
router.get('/tu-thong-dung', function(req, res, next) {
  var data = fs.readFileSync('3000_most_word.txt', 'utf8');
  var listWord = data.toString().split('\n');
  listWord= listWord.map(word => {
    return {text: word.split('\r')[0]}
  });
  res.render('showListWord', {
    listWord,
    title: 'Danh sách 3000 từ thông dụng trong tiếng Việt'
  });
});
module.exports = router;