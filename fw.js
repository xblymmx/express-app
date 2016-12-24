const superagent = require('superagent')
const fs = require('fs')
const fortune = require('./lib/fortune.js')
const expect = require('chai').expect
const nodemailer = require('nodemailer')
const stream = require('stream')
const path = require('path')


const getTopics = 'https://cnodejs.org/ap1/v1/topics'
const page = 'https://cnodejs.org/api/v1/topic/5433d5e4e737cbe96dcef312'
const ws = fs.createWriteStream('fw.json')
const credentials = require('./lib/credentials.js')

superagent.get(page)
  .set('accept', 'application/json')
  .end((err, res) => {
    // console.log(res.body)
    // console.log(res.header['content-type'])
    // console.log(res.header)
  })


let mailTransporter = nodemailer.createTransport({
  service: '163',  
  secure: true,
  auth: {
    user: credentials.user,
    pass: credentials.password
  }
})

let mailOptions = {
  from: '"huangshuai" <13881989579@163.com>',
  to: '13881989579@163.com',
  subject: 'fking subject',
  text: 'someeee texttt from hs',
  html: '<h1>some header html content</h1>'
}

mailTransporter.sendMail(mailOptions, (err, info) => {
  if (err) console.log(err)
  if (info) console.log(info)
})