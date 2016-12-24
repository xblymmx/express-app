const nodemailer = require('nodemailer')
const credentials = require('./credentials.js')

let mailTransporter = nodemailer.createTransport({
    service: '163',
    secure: true,
    auth: {
        user: credentials.user,
        pass: credentials.pass
    }
})


module.exports = function (to, html='') {
    mailTransporter.sendMail({
        from: `huangshuai <13881989579@163.com>`,
        to: to,
        subject: 'fking subject title',
        text: 'text content there',
        html: html
    }, (err, info) => {
        if (err) console.log('err in mailing: ', err)
        if (info) console.log('info in mailing: ', info)
    })
}