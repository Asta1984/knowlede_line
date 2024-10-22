const { Router } = require("express");
const { userModel, purchaseModel, courseModel } = require("../db");
const userRouter = Router();
const { userMiddleware } = require("../middleware/user")
const jwt = require("jsonwebtoken");
const { JWT_USER_PASSWORD } = require("../config")
const bcrypt = require('bcrypt');
const { z } = require('zod');



userRouter.post('/signup', async function (req, res) {
    const userValidationSchema = z.object({
        email: z.string().min(3).max(100).email(),
        password: z.string().min(8, 'Password should be at least 8 characters long').max(16),
        firstName: z.string().min(3).max(40),
        lastName: z.string().min(3).max(40)
    });
    const parsedDataWithSucess = userValidationSchema.safeParse(req.body);
    if (!parsedDataWithSucess.success) {
        res.json({
            message: "Incorrect format",
            error: parsedDataWithSucess.error.errors
        })
        return
    }

    const { email, password, firstName, lastName } = req.body;
    let errorThrown = false;
    try{
        const hashed_password = await bcrypt.hash(password, 5);
        
        await userModel.create({
            email: email,
            password: hashed_password,
            firstName: firstName,
            lastName:lastName
        })
    }catch(e) {
        res.json({
            message: "User already exists"
        })
        errorThrown = true;
    }
    if (!errorThrown) {
        res.json({
            message: "signup succeeded"
        })
    }
});
  
userRouter.post('/signin', async function (req, res) {
    const { email, password } = req.body;

    const user = await userModel.findOne({
        email: email
    })

    if (!user) {
        res.status(403).json({
            message: "The user does not exist."
        });
        return
    }
    const pass_match = await bcrypt.compare(password, user.password);
    if (pass_match) {
        const token = jwt.sign({
            id: user._id
        }, JWT_USER_PASSWORD);
    
        res.json({
            token: token
            })
    } else {
        res.status(403).json({
            message: "Invalid Credentials"
        })
    }
});
  
userRouter.get('/purchases', userMiddleware, async function (req, res) {
    const userId = req.userId;

    const purchases = await purchaseModel.find({
        userId
    })
    const courseData = await courseModel.find({
        _id: {$in: purchases.map(x => x.courseId)}
    })
    res.json({
        purchases,
        courseData
    })
})

module.exports = {
    userRouter: userRouter
};