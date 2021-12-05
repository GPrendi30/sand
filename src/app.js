const createError = require('http-errors')
const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const methodOverride = require('method-override');
const fileUpload = require('express-fileupload');
const session = require('express-session');




const indexRouter = require('./routes/index')
const graphRouter = require('./routes/graph')
const chatRouter = require('./routes/chat')
const userRouter = require('./routes/user')
const exchangeRouter = require('./routes/exchange')
const loginRouter = require('./routes/login')
const signupRouter = require('./routes/signup')
const logoutRouter = require('./routes/logout')

require('./models'); // run database

const app = express()
const { passport } = require('./login')
/*  passportjs
  Local authentication
 */


app.use(session({
  secret: 'sandsandsandsand', // TODO update to using env.SESSION_SECRET
  resave: false,
  saveUninitialized: true
}));

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
app.use('/', indexRouter)
app.use('/graph', graphRouter)
app.use('/chat', chatRouter)
app.use('/user', userRouter)
app.use('/exchange', exchangeRouter)
app.use('/login', loginRouter);
app.use('/signup', signupRouter);
app.use('/logout', logoutRouter);


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
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message
    res.locals.error = req.app.get('env') === 'development' ? err : {}

    // render the error page
    res.status(err.status || 500)
    res.render('error')
})

module.exports = app
