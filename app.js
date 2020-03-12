var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var app = express();
var express_handlebars_sections = require("express-handlebars-sections");
var hbs = require("express-handlebars");
// require("dotenv").config();
app.engine(
  "hbs",
  hbs({
    section: express_handlebars_sections(),
    extname: "hbs",
    defaultLayout: "layout",
    layoutsDir: __dirname + "/views/",
    partialsDir: __dirname + "/views/partials/",
    helpers: {
      section: function(name, options) {
        if (!this._sections) {
          this._sections = {};
        }
        this._sections[name] = options.fn(this);
        return null;
      },
      if_eq: (arg1, arg2) => {
        return arg1 === arg2;
      },
      if_not_eq: (arg1, arg2, options) => {
        return arg1 !== arg2 ? options.fn(this) : options.inverse(this);
      }
    }
  })
);

// require("./middleware/session")(app);
// require("./middleware/passport")(app);
// view engine setups
app.set("views", path.join(__dirname, "views/"));
app.set("view engine", "hbs");

// setting
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

//routes
// require("./routes")(app);
app.use('/', require('./routes/index'));
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handlerhd
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  if (err.status === 404) {
    res.render("error/404");
    return;
  }
  if (err.status === 403) {
    res.render("error/403");
    return;
  }
  console.log(err);

  res.render("error/normalError", { message: err });
});

module.exports = app;
