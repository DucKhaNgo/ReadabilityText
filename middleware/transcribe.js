var request = require("request");
var keyModel = require("../model/key.model");
exports.uploadSingleFile = async (req, res, next) => {
  console.log("dcfvgbhnnhhhhhhhhhhhh");
  let wdRes = res;
  let wdReq = req;

  const url = "https://server-sound-api.herokuapp.com";
  let jsonData = "";
  const file = req.file;
  console.log('file in request---', file);
  if (file.mimetype !== "audio/wav" && file.mimetype !== "audio/wave" && file.mimetype !== "audio/x-wav") {
    const error = new Error("Chỉ chấp nhận file .wav");
    error.httpStatusCode = 400;
    return next(error);
  }
  if (!file) {
    const error = new Error("Please upload a file");
    error.httpStatusCode = 400;
    return next(error);
  }
  console.log("file", file);
  var formData = {
    voice: {
      value: file.buffer,
      options: {
        filename: file.originalname,
        contentType: file.mimetype
      }
    }
  };
  //form.append(data);
  request.post({ url: url, formData: formData }, async (err, res, body) => {
    if (err) {
      return console.error("upload failed:", err);
    } else {
      jsonData = JSON.parse(body);
      console.log("Upload successful!  Server responded with:", jsonData);
      wdReq.session.filename = file.originalname;
      wdReq.session.jsonData = jsonData["text"];
      wdRes.redirect("/demo");
    }
  });
};

exports.index = async (req, res, next) => {
  let jsonData = "";
  let descriptionFile = "";
  if (req.session.filename) {
    jsonData = req.session.jsonData;
    descriptionFile = req.session.filename;
  }
  res.render("./demo/demo", {
    title: "Phiên dịch",
    jsonData: jsonData,
    descriptionFile: descriptionFile,
    user: req.user
  });
};
