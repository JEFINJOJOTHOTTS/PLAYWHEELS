const nodemailer = require("nodemailer");


//nodemailer
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,

    service: "Gmail",
    auth: {
        user: process.env.NODEMAILER_EMAIL,
        pass: process.env.NODEMAILER_PASSWORD
    }
});


//sendMail
function sendMail(subject, content, Email,){
    transporter.sendMail({
        from: process.env.NODEMAILER_EMAIL, // sender address
        to: Email, // list of receivers
        subject: subject, // Subject line
       // text: content, // plain text body
       html: content   , // html body
    }).then((info) => {
        console.log("Email sent: ", info.response);
    }).catch((error) => {
        console.error("Error sending email: ", error);
    })
    console.log("sendMail")
}

module.exports = {sendMail}