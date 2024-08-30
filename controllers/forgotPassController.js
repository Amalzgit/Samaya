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
        user.resetPasswordToken = otp; 
        console.log(otp)
        await user.save();

        await sendOtpEmail(email, otp);

        res.render('verifyOtp', { errorMessage: null, successMessage: 'OTP sent to your email' });
    } catch (error) {
        console.error(error);
        res.render('forgotPassword', { errorMessage: 'An error occurred', successMessage: null });
    }
};

const verifyOtp = async (req, res) => {
    const { email, otp } = req.body;

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
            return res.render('updatePassword', { email, errorMessage: 'User not found', successMessage: null });
        }

        user.password = newPassword;
        user.resetPasswordToken = undefined; 
        await user.save();

        res.render('userLogin', { errorMessage: null, successMessage: 'Password updated successfully. You can now log in.' });
    } catch (error) {
        console.error(error);
        res.render('updatePassword', { email, errorMessage: 'An error occurred', successMessage: null });
    }
};

module.exports = {
    forgotPassword,
    sendOtp,
    verifyOtp,
    updatePassword
};
