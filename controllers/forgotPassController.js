const User = require('../models/userModel');
const { generateOtp, sendOtpEmail } = require('../utils/otpUtil'); 

const forgotPassword = (req, res) => {
    res.render('forgotPassword', { errorMessage: null, successMessage: null });
};

const sendOtp = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.render('forgotPassword', { errorMessage: 'No account with this email found', successMessage: null });
        }

        const otp = generateOtp();
        console.log(otp);
        
        user.resetPasswordToken = otp;
        await user.save();

        req.session.email = email;

        await sendOtpEmail(email, otp);

        res.render('verifyOtp', { errorMessage: null, successMessage: 'OTP sent to your email' });
    } catch (error) {
        console.error(error);
        res.render('forgotPassword', { errorMessage: 'An error occurred', successMessage: null });
    }
};

const verifyOtp = async (req, res) => {
    const { otp } = req.body;
    const email = req.session.email;

    try {
        const user = await User.findOne({ email });
        if (!user || user.resetPasswordToken !== otp) {
            return res.render('verifyOtp', { errorMessage: 'Invalid OTP', successMessage: null });
        }

        res.render('updatePassword', { email, errorMessage: null, successMessage: null });
    } catch (error) {
        console.error(error);
        res.render('verifyOtp', { errorMessage: 'An error occurred', successMessage: null });
    }
};

const updatePassword = async (req, res) => {
    const { email, newPassword } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            req.flash('error', 'User not found');
            return res.redirect('/updatePassword');
        }

        user.password = newPassword;
        user.resetPasswordToken = undefined; 
        await user.save();
        return res.redirect('/login?success=Password updated successfully');
    } catch (err) {
        console.error(err);
        return res.redirect('/login?error=An error occurred');
    }
};

module.exports = {
    forgotPassword,
    sendOtp,
    verifyOtp,
    updatePassword
};
