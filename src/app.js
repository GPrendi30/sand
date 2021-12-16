const createError = require('http-errors')
const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const methodOverride = require('method-override');
const fileUpload = require('express-fileupload');
const session = require('express-session');
const store = require('./redis').store;

const routers = require('./routes');
require('./models'); // run database

require('./ejs-compile')

const app = express()


const { passport } = require('./login');


const mySession = session({
    secret: 'sandsandsandsand', // TODO update to using env.SESSION_SECRET
    resave: true,
    saveUninitialized: false,
    store: store,  // using the redis store
    cookie: {
        maxAge: 1000 * 60 * 30, // 30 minutes
        expires: new Date(Date.now() + 1000 * 60 * 30), // 30 minutes
        httpOnly: true
    }
})

app.use(mySession);

/*  passportjs
  Local authentication
  Redis cache
*/
app.use(passport.initialize());
app.use(passport.session());

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.use(logger('dev'))
app.use(express.json({ limit: '4MB' }));
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 }, safeFileNames: true, preserveExtension: 4, debug: false
}))
app.use(methodOverride('_method'));

app.use(express.static(path.join(__dirname, 'public')))

// routers
app.use('/', routers.dashboard)
app.use('/home', routers.dashboard)
app.use('/graph', routers.graph)
app.use('/chat', routers.chat)
app.use('/user', routers.user)
app.use('/exchange', routers.exchange)
app.use('/login', routers.login);
app.use('/signup', routers.signup);
app.use('/logout', routers.logout);
app.use('/follow', routers.follow);
app.use('/discover', routers.discover);
app.use('/friendlist', routers.friendlist);
app.use('/rooms', routers.rooms);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404))
})

// error handler
/**
 * Middleware that handles the errors.
 * @param {object} err
 * @param {object} req
 * @param {object} res
 * @param {object} next
 * @returns renders the error page.
 */
app.use(function (req, res, next) {
    // set locals, only providing error in development
    // res.locals.message = err.message
    // res.locals.error = req.app.get('env') === 'development' ? err : {}

    // render the error page
    res.status(500).end();
})

module.exports.app = app
module.exports.session = mySession
