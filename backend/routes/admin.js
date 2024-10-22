const { Router } = require("express");
const adminRouter = Router();
const { adminModel, courseModel } = require("../db");
const jwt = require("jsonwebtoken")
const { JWT_ADMIN_PASSWORD } = require("../config")
const { adminMiddleware } = require("../middleware/admin")
const bcrypt = require('bcrypt');
const { z } = require('zod');

adminRouter.post('/signup', async function (req, res) {

    const adminValidationSchema = z.object({
        email: z.string().min(3).max(100).email(),
        password: z.string().min(8, 'Password should be at least 8 characters long').max(16),
        firstName: z.string().min(3).max(40),
        lastName: z.string().min(3).max(40)
    });
    const parsedDataWithSucess = adminValidationSchema.safeParse(req.body);
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
        
        await adminModel.create({
            email: email,
            password: hashed_password,
            firstName: firstName,
            lastName:lastName
        })
    }catch(e) {
        res.json({
            message: "Admin already exists"
        })
        errorThrown = true;
    }
    if (!errorThrown) {
        res.json({
            message: "signup succeeded"
        })
    }
});
  
adminRouter.post('/signin', async function (req, res) {
    const { email, password } = req.body;
    const admin = await adminModel.findOne({
        email: email
    })
    
    if (!admin) {
        res.status(403).json({
            message: "The admin does not exist."
        });
        return
    }
    const pass_match = await bcrypt.compare(password, admin.password);
    if (pass_match) {
        const token = jwt.sign({
            id: admin._id
        }, JWT_ADMIN_PASSWORD);
    
        res.json({
            token: token
            })
    } else {
        res.status(403).json({
            message: "Invalid Credentials"
        })
    }
});
  
adminRouter.post('/course', adminMiddleware, async function (req, res) {

    const adminId = req.userId;
    const { title, description, imageUrl, price } = req.body;

    const course = await courseModel.create({
        title: title,
        description: description,
        imageUrl: imageUrl,
        price: price,
        creatorId: adminId

    });
    res.json({
        message : "Course Created",
        courseId: course._id
        })
});

adminRouter.put('/course', adminMiddleware, async function (req, res) {
    const adminId = req.userId;
    const { title, description, imageUrl, price, courseId } = req.body;

    const course = await courseModel.updateOne({
        _id: courseId,
        creatorId: adminId
    },{
        title: title,
        description: description,
        imageUrl: imageUrl,
        price: price,

    });
    res.json({
        message : "Course Updated",
        courseId: course._id
    })
});

adminRouter.get('/course/bulk', adminMiddleware, async function (req, res) {

    const adminId = req.userId;
    const courses = await courseModel.find({
        creatorId: adminId
    });
    res.json({
        message : "Course Updated",
        courses
    })
});


module.exports = {
    adminRouter: adminRouter
};