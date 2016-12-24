const express = require('express')
const path = require('path')
const handlebars = require('express-handlebars').create({ defaultLayout: 'main' })
const bodyParser = require('body-parser')
const formidable = require('formidable')
const fs = require('fs')

const getFortune = require('./lib/fortune.js')
const getWeatherDate = require('./lib/getWeatherData.js')
const credentials = require('./lib/credentials.js')
const MyModel = require('./models/mymodel.js')
const sendMail = require('./lib/mail.js')


const app = express()

// not use morgan for now
// app.use(require('morgan')('combined'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static(__dirname + '/public'))
app.set('port', process.env.PORT || 3000)
app.engine('handlebars', handlebars.engine)
app.set('view engine', 'handlebars')

// set cookie middleware
app.use(require('cookie-parser')(credentials.cookieSecret))
// sesstion cookie
app.use(require('express-session')({
  resave: true,
  saveUninitialized: true,
  secret: credentials.cookieSecret
}))


// test
app.use(function(req, res, next) {
  res.locals.showTests = app.get('env') !== 'production' && req.query.test === '1'
  next()
})

// middleware getWeatherData
app.use(function(req, res, next) {
  if (!res.locals.partials) res.locals.partials = {}
  res.locals.partials.weather = getWeatherDate()
  next()
})

// flash message
app.use((req, res, next) => {
  if (req.session.flash) {
    res.locals.flash = req.session.flash
    delete req.session.flash
  }
  next()
})


// get /
app.get('/', function(req, res) {
  res.cookie('monster', 'monster name')
  res.cookie('signed monster', 'signed moinster fcuking name', { signed: true })
  res.render('home')
})

// get /cookies
app.get('/cookies', (req, res) => {
  res.send('cookie in node console')
  console.log(req.cookies)
  console.log(req.signedCookies)
  console.log(req.signedCookies['signed monster'])
})

// get /about
app.get('/about', function(req, res) {
  res.render('about', {
    fortune: getFortune(),
    pageTestScript: '/qa/tests-about.js'
  })
})

// get /tours/hood-river
app.get('/tours/hood-river', (req, res) => {
  res.render('tours/hood-river')
})

// get /tours/request-group-rate
app.get('/tours/request-group-rate', (req, res) => {
  res.render('tours/request-group-rate')
})

// get /newsletter
app.get('/newsletter', (req, res) => {
  res.render('newsletter', { csrf: 'CSRF token here' })
})

// get /newsletter-ajax
app.get('/newsletter-ajax', (req, res) => {
  res.render('newsletter-ajax')
})

// process form from /newsletter
app.post('/process', (req, res) => {
  let name = req.body.name || ''
  let email = req.body.email || ''
  // store the name-email
  MyModel.push({
    email: email,
    id: name
  })
  
  // if using ajax
  if (req.xhr) {
    return res.json({ success: true })
  } else {
    // not ajax form
    req.session.flash = {
      intro: 'Thank you',
      type: 'success',
      message: 'You have signde up for newsletters!'
    }
  }
  return res.redirect(303, '/thank-you')
})

// process form from /newsletter-ajax
app.post('/ajax-process', (req, res) => {
  if (req.xhr) {
    res.send(Object.assign({ success: true }, MyModel))
  } else {
    res.redirect(303, '/thank-you')
  }
})



// get /thank-you
app.get('/thank-you', (req, res) => {
  res.render('thank-you')
})

// make sure dir exists
const dataDir = path.join(__dirname, 'data')
const vacationPhotoDir = path.join(dataDir, 'vacation-photo')
fs.existsSync(dataDir) || fs.mkdirSync(dataDir)
fs.existsSync(vacationPhotoDir) || fs.mkdirSync(vacationPhotoDir)

const saveContestEntry = function saveContestEntry(contestName, email, year, month, photoPath) {
  // TODO
}


// get /contest/vacation-photo
app.get('/contest/vacation-photo', (req, res, next) => {
  let now = new Date()
  res.render('contest/vacation-photo', {
    year: now.getFullYear(),
    month: now.getMonth()
  })
})

// post handle uploaded photo
app.post('/contest/vacation-photo/:year/:month', (req, res) => {
  let form = new formidable.IncomingForm()
  form.parse(req, function (err, fields, files) {
    // if (err) return res.redirect(303, '/error')
    if (err) {
      req.session.flash = {
        intro: 'Oops',
        type: 'danage',
        message: 'Error whil uploading file'
      }  
      return res.redirect(303, '/error')
    }
    const 

    saveContestEntry('vacation-photo', fields.email, req.params.year, req.params.month, )

  })
})



let apiResult = [
  { id: 'hhs', age: 18 },
  { id: 'xxx', age: 11 }
]

// get /api
app.get('/api', (req, res) => {

  res.format({
    'application/json': function() {
      res.json(apiResult)
    }
  })
})

// put /api
app.get('/api/:id', (req, res) => {
  let findData = null
  apiResult.forEach(x => {
    if (x.id === req.params.id) {
      findData = x
    }
  })

  if (findData) {
    if (req.query.age) findData.age = req.query.age
    res.json({ suceess: true})
  } else { 
    res.json({ Error: 'no such exists'})
  }
})

// get /api/all/users 
app.get('/api/all/users', (req, res) => {
  res.json(MyModel)
})

// /test 
app.get('/test/:name', (req, res) => {
  res.send(req.params.name)
})

// get /cart
app.get('/cart', (req, res) => {
  req.session.cart = {}
  res.render('cart')
})

// post /cart/checkout
app.post('/cart/checkout', (req, res, next) => {
  let cart = req.session.cart
  if (!cart) return next(new Error('cart not exist'))

  let name = req.body.name || ''
  let email = req.body.email || ''
  cart.number = Math.random().toString().replace(/0\.0*/, '')
  cart.billing = {
    name,
    email
  }

  res.render('email/cart-thank-you',
    { layout: null, cart: cart }, (err, html) => {
      if (err) return console.log('err in html template')
      sendMail(email, html)
    })

  res.render('cart-thank-you', { cart })
})



// 404
app.use(function(req, res) {
  res.status(404).render('404')
})

// 500
app.use(function(err, req, res, next) {
  console.log(err.stack)
  res.status(500)
  res.render('500')

})


app.listen(app.get('port'), () => {
  console.log(`App is listening ${app.get('port')}`)
})
