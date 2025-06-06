const createError = require("http-errors");
const express = require("express");
const favicon = require('serve-favicon');
const path = require("path");
const logger = require("morgan");
const handlebars = require("express-handlebars");


const indexRouter = require("./routes/index");

const app = express();




app.engine(
  "hbs",
  handlebars({
    layoutsDir: path.join(__dirname, "views/layouts"), //where to look for layouts
    partialsDir: path.join(__dirname, "views/partials"), // where to look for partials
    extname: ".hbs", //expected file extension for handlebars files
    defaultLayout: "layout", //default layout for app, general template for all pages in app
    helpers: {
        nonEmptyObject: function(obj){
            return obj && obj.constructor  === Object && Object.keys(obj).length > 0;
        },
        formatDate: function(dateTimeString){
            return new Date(dateTimeString).toLocaleString("en",{
                dateStyle:"full",
                timeStyle:"full",
            })
        }
    }, //adding new helpers to handlebars for extra functionality
  })
);


// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(favicon(__dirname + '/public/favicon.ico'));

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(express.static(path.join(__dirname, 'public')));



app.use("/", indexRouter); // route middleware from ./routes/index.js




/**
 * Catch all route, if we get to here then the
 * resource requested could not be found.
 */
app.use((req,res,next) => {
  next(createError(404, `The route ${req.method} : ${req.url} does not exist.`));
})


/**
 * Error Handler, used to render the error html file
 * with relevant error information.
 */
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = err;
  console.log(err);
  // render the error page
  res.status(err.status || 500);
  res.render("error");
});


module.exports = app;
