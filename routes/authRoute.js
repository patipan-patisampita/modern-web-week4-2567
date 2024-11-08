import express from 'express'
import User from '../models/userModel.js'
import bcrypt from 'bcryptjs'
import { guestRoute, protectedRoute } from '../middleware/authMiddleware.js'

const router = express.Router()

//Route for the Login page
router.get('/login', guestRoute, (req, res) => {
    res.render('login', { title: 'Login Page', active: 'login' })
})

//Route for the Register page
router.get('/register', guestRoute, (req, res) => {
    res.render('register', { title: 'Register Page', active: 'register' })
})

//Route for the Forgot Password page
router.get('/forgot-password', guestRoute, (req, res) => {
    res.render('forgot-password', { title: 'Forgot-password Page', active: 'forgot' })
})

//Route for the Reset Password page
router.get('/reset-password', guestRoute, (req, res) => {
    res.render('reset-password', { title: 'Reset-password Page', active: 'reset' })
})

//Route: Handle user for the register page
router.post('/register', guestRoute, async (req, res) => {
    // console.log(req.body)
    const { name, email, password } = req.body
    try {
        const userExists = await User.findOne({ email })
        if (userExists) {
            req.flash('error', 'User already exists with this email')
            return res.redirect('/register')
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            name,
            email,
            password: hashedPassword,
        })
        user.save()
        req.flash('success', 'User registered successfully!,you can login now')
        return res.redirect('/login')
    } catch (error) {
        console.log(error)
        req.flash('error', 'Something went wrong,try again!')
        return res.redirect('/login')
    }
})

//Route: Handle user for the login page
router.post('/login', guestRoute, async (req, res) => {
    const { email, password } = req.body

    try {
        const user = await User.findOne({ email })

        if (user && bcrypt.compare(password, user.password)) {
            req.session.user = user
            return res.redirect('/profile')
        }
        else {
            req.flash('error', 'Invalid email or password!')
            return res.redirect('/login')
        }

    } catch (error) {
        console.log(error)
        req.flash('error', 'Something wnt wrong,try again!')
        return res.redirect('/login')
    }
})

//Route for the Profile page
router.get('/profile', protectedRoute, (req, res) => {
    return res.render('profile', { title: 'Profile Page', active: 'profile' })
})

//Handle user logout
router.post('/logout', (req, res) => {
    req.session.destroy()
    return res.redirect('/login')
})

export default router