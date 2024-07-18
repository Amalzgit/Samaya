const otpGenerator = require('otp-generator');
const nodemailer = require('nodemailer')
if(process.env.NOD_ENV !=='production'){
    require('dotenv').config();
}

//transporting the otp to the email
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.APP_EMAIL,
        pass: process.env.APP_EMAIL_PASSWORD
    }
})

//generating a random otp
const generateOtp = () => {

    return  otpGenerator.generate(6,{digits:true,alphabets:false,upperCaseAlphabets:false,lowerCaseAlphabets:false, specialChars:false})
    
}

//sending the otp via email
const sendOtpEmail = async (email,otp) =>{

    try {

        await transporter.sendMail({
            to: email,
            subject: 'OTP for Registration',
            text: `Your OTP is ${otp} . Please do not share this otp with anyone`
        });

        console.log("email send");

    } catch (error) {

        console.log(`error in sending the otp`,error.message);
        
    }
}




module.exports = {

    generateOtp,
    sendOtpEmail
}