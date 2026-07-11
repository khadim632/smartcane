const express = require('express')
const router  = express.Router()
const { loginLimiter, forgotPasswordLimiter } = require('../middlewares/rateLimiter')
const validate = require('../middlewares/validate')
const {
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateResetPassword
} = require('../middlewares/validators')
const {
  register, login, refresh, logout,
  forgotPassword, resetPassword
} = require('../controllers/authController')

router.post('/register',        validateRegister,        validate, register)
router.post('/login',           loginLimiter, validateLogin, validate, login)
router.post('/refresh',         refresh)
router.post('/logout',          logout)
router.post('/forgot-password', forgotPasswordLimiter, validateForgotPassword, validate, forgotPassword)
router.post('/reset-password',  validateResetPassword, validate, resetPassword)

module.exports = router
