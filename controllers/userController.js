const crypto = require('crypto')
require('dotenv').config()
const jwt = require('jsonwebtoken');
const userHelpers = require('../helpers/userHelpers/userHelper')
const bcrypt = require('bcrypt')
const Mail = require('../helpers/email')

//db-model
const User = require('../models/userModel')


//token creation
//let maxAge = 60 * 60 * 100
const createToken = (id) => {
    console.log("yfffggggggg")
    return jwt.sign({ id }, process.env.JWT_SECRET_KEY,
        { expiresIn: '120d' } // expires in 120 days
    );

};


//otpGenerator
const otpGenerator = require('otp-generator');
const categoryHelper = require('../helpers/adminHelpers/categoryHelper');
function generateOtp() {
    return otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false });
}


//signup-get
const loadSignup = async (req, res) => {
    try {
        res.render('user/signUp', { message: null, title: 'SignUp' })
    } catch (err) {
        res.render('error404', { title: 'Error' })
    }
}


//signup-post
const signup = async (req, res) => {
    try {
        let message = ''
        //check user exist
        userHelpers.fetchUser(req.body.Email).then(async (userData) => {
            console.log("   <<<<<<<>>>>>>>>>>>>")
            //userExist - render login
            message = 'User Exist : Login'
            if (userData) {
                res.render('user/signUp', { message: 'User Exist : Login', title: 'Signup' })
            } else {
                //createUser
                userHelpers.createUser(req.body).then((Email) => {
                    //Email kept in session                
                    req.session.Email = Email
                    //redirect to emailVerification
                    res.redirect(`/emailVerification`);
                })
            }


        })
    }
    catch (err) {
        console.log("Error   :   ", err)
        res.redirect('/login')
    }
}


//update address
const updateAddress = async (req, res) => {
    try {
        console.log("          ffffffffffffffffff     ")
        console.log("res.locals")
        await userHelpers.updateAddress(req.body, res.locals.user._id)
        console.log("          ffffffffffffffffff     ")
        res.redirect('/userProfile')
    }
    catch (err) {
        console.log("Error   :   ", err)
        res.redirect('/login')

    }
}


//emailVerification-get
const loadEmailVerification = async (req, res) => {
    try {
        const Email = req.session.Email
        req.session.otp = await generateOtp();
        console.log(req.session.otp)

        //otpTimer
        setTimeout(() => {
            console.log('OTP cleared from the session.');
            delete req.session.Email
            delete req.session.otp;
        }, 180000);

        //render -emailVerification
        res.render('user/emailVerification', { message: null, title: 'Email Verification', Email })

        //sendMail
        const subject = "PLAYWHEELS : Email Verification OTP"
        const content = `<b>Verification code OTP for PLAYWHEELS :` + req.session.otp + `</b>`
        Mail.sendMail(subject, content, Email)
    }
    catch (err) {
        res.render('error404', { title: 'Error' })
    }
}


//emailVerification-Post
const emailVerification = async (req, res) => {
    try {
        if (req.session.otp === req.body.Otp) {

            //update-verification-mongoose
            userHelpers.emailVerification(req.session.Email).then(async (id) => {
                //jwt
                const token = await createToken(id)
                res.cookie('jwt', token, { httpOnly: true, maxAge: 60 * 60 * 100 * 1000 });

                console.log(token)
                //redirect - home
                res.redirect('/shop')
            })
        } else {
            //Wrong OTP - render
            res.render('user/emailVerification', { message: "Wrong OTP; New OTP send to Email", title: "Email Verification", Email: req.session.Email })
        }
    } catch (err) {
        res.render('error404', { title: 'Error' })
    }
}


//login-get
const loadLogin = async (req, res) => {
    try {
        res.render('user/login', { message: null, title: "Login" })
    } catch (err) {
        res.render('error404', { title: 'Error' })
    }
}


//login-post
const login = async (req, res) => {
    try {
        let message = ""
        let user = await User.findOne({ Email: req.body.Email })
        console.log("aaaaaaaaaaaaaa")
        //user Exist
        if (user) {
            console.log("bbbbbbbbbbb")

            //check User Blocked 
            if (!user.Block) {

                //check Verified
                let status = await bcrypt.compare(req.body.Password, user.Password)
                if (status) {

                    if (user.Verified) {
                        console.log("login")
                        // console.log(user._id)
                        //jwt
                        const token = await createToken(user._id)
                        await res.cookie('jwt', token, { httpOnly: true, maxAge: 60 * 60 * 100 * 1000 });

                        console.log("   >>>>>>>><<<<<<<<<<<<    ")

                        res.redirect('/shop')
                    }
                    else res.redirect('/emailVerification')
                } else {
                    message = "Incorrect Email or Password"
                    res.render('user/login', { title: "Login", message: message })
                }
            } else {
                message = "Contact Customer care"
                res.render('user/login', { title: "Login", message: message })
            }
        } else {
            message = "Incorrect Email or Password"
            res.render('user/login', { title: "Login", message: message })
        }
    }
    catch (err) {
        console.log("Error   :   ", err)
        res.redirect('/admin/login')
    }
}


//forget-password-get
const loadForgetPassword = async (req, res) => {
    try {
        res.render('user/forgetPassword', { message: null, title: "Forget Password" })
    }
    catch (err) {
        console.log("Error   :   ", err)
        res.redirect('/login')

    }
}


//forget-password-post
const forgetPassword = async (req, res) => {
    try {
        //generator-randomString
        const randomString = crypto.randomBytes(32).toString('hex')
        console.log("random string", randomString)
        let user = await User.findOneAndUpdate({ Email: req.body.Email }, { Token: randomString, TokenTime: new Date() }, { new: true })
        console.log("usrtoken", user.Token)
        if (user) {
            res.render('user/checkMail', { message: null, title: "Forget Password" })

            //sendMail
            const Email = user.Email
            const subject = "PLAYWHEELS : Reset Password"
            const href = `${process.env.BASE_URL}/resetPassword/${Email}/${randomString}`
            console.log(href)
            const content = `<b>Link for Password Reset (valid for only 3 mints) Click Here : </b> ` + href
            Mail.sendMail(subject, content, Email)
        }
    }
    catch (err) {
        console.log("Error   :   ", err)
        res.redirect('/login')

    }
}


//reset-Password-get
const loadResetPassword = async (req, res) => {
    try {
        const Email = req.params.Email
        const randomString = req.params.randomString
        const user = await User.findOne({ Email: Email, Token: randomString })
        if (user.Token === randomString) {
            if (user.TokenTime) {
                const time = (new Date() - user.TokenTime) / (1000 * 60)
                console.log(time)
                if (time < 3) {
                    res.render('user/resetPassword', { message: null, title: "Forget Password", Email, randomString })
                }
            }
        }
    }
    catch (err) {
        console.log("Error   :   ", err)
        res.redirect('/login')

    }
}


//reset-Password-post
const resetPassword = async (req, res) => {
    try {
        const Email = req.body.Email
        const Password = req.body.Password
        const randomString = req.body.randomString
        const bcryptPassword = await bcrypt.hash(Password, 10)

        const user = await User.findOne({ Email: Email, Token: randomString })
        if (user.Token === randomString) {
            if (user.TokenTime) {
                let time = new Date() - user.TokenTime
                console.log(time)
                time = time / (1000 * 60)
                if (time < 6) {
                    const user = await User.findOneAndUpdate({ Email: Email }, { $set: { Password: bcryptPassword, Token: null } })
                    res.redirect('/login')
                    // res.render('user/login', { message: null, title: "Login" })
                }
            }
        }
    }
    catch {

    }
}


//logout
const logout = async (req, res) => {
    try {
        res.cookie('jwt', '', { maxAge: 1 })

        res.redirect('/login')
    }
    catch (err) {
        res.render('error404', { title: 'Error' })
    }
}


const changePassword = async (req, res) => {
    try {
        // console.log(res.locals.user)
        const response = await userHelpers.changePassword(res.locals.user._id, req.body)
        res.json(response)
    }
    catch (err) {
        console.log("Error   :   ", err)
        res.redirect('/login')
    }
}


const addAddress = async (req, res) => {
    try {
        console.log("req.body   ", req.body)
        const address = await userHelpers.addAddress(res.locals.user._id, req.body)
        console.log(address)
        res.redirect('/placeOrder')
    }
    catch (err) {
        console.log("error   :  ", err)
        res.redirect('/login')
    }
}


module.exports = {
    loadSignup,
    signup,
    loadEmailVerification,
    emailVerification,
    login,
    loadLogin,
    logout,
    loadForgetPassword,
    forgetPassword,
    loadResetPassword,
    resetPassword,
    updateAddress,
    changePassword,
    addAddress
}