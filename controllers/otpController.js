const utils = require('../utils/otpUtil');
const OTP = require('../models/otpModel');
const Users =require('../models/userModel')

const generateOtp = async (req,res) => {

    req.session.formData = req.body
    const {email} = req.session.formData
   

    try {

        const otp = await utils.generateOtp()

        console.log(`first otp form generate otp `,otp)

        const otpDocument = new OTP({ email, otp })

        await otpDocument.save() //saving the otp to database 

        await utils.sendOtpEmail(email,otp)

        return res.status(200).redirect('/verifyOtp')
        
    } catch (error) {

        console.log(`cannot render otpverification page or generate otp`,error.message);

        return res.status(500).send("Internal server Error")

        
    }
}

//loading the otp verification page 
const otpVPage = async (req, res) => {
    try {

        return res.status(200).render('otp')

    } catch (error) {

        console.error('Error loading the OTP verification page:', error.message)

        return res.status(500).send('Internal Server Error')
        
    }
}

//resend otp function

const resendOtp = async (req,res) =>{

    const {email} = req.session.formData

    try {

        const otp = await utils.generateOtp()

        console.log(`resend otp`,otp)

        const otpDocument = new OTP({ email, otp })

        await otpDocument.save() //saving the otp to database 

        await utils.sendOtpEmail(email,otp)

        return res.status(200).json({success:true,message : "OTP send to your email"})
        
    } catch (error) {

        console.log(`error while resending the otp`,error.message)
        
        return res.status(500).json({ success: false, message: "Error sending OTP. Please try again" })
    }
}

//verifying the otp 

const verifyOtp = async (req,res) => {
   
    try {

        const otp    = req.body.otp
        
        const email  = req.session.formData.email

        const userDataSession = req.session.formData

        const otpDataBase = await OTP.findOne({email,otp})

        if(otpDataBase){
    
            // const hashedPassword = await securePassword(userDataSession.password)

            const user = new Users({
                

                firstName:userDataSession.firstName,
                lastName:userDataSession.lastName,
                email:userDataSession.email,
                phone:userDataSession.phone,
                password:userDataSession.password    
                
                
            });

           
            
           const userData = await user.save()
           

            if(userData){

                return res.status(200).json({success :true, message:"otp validaton successfull"})

            }else{

                return res.status(500).json({ success: false, message: "Something went wrong while registering" })

            }
        }else{

            return res.status(401).json({success:false,message:"Invalid OTP or Expired"})
        }
        
    } catch (error) {

        console.log(`otp verification is not working`,error.message)
        
        return res.status(500).json({ success: false, message: "Error during OTP verification" })
        
    }

}



module.exports = {
    generateOtp,
    resendOtp,
    verifyOtp,
    otpVPage
     };