const { Schema, default: mongoose, isObjectIdOrHexString } = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const dotenv = require('dotenv');

dotenv.config();
mongoose.connect(process.env.DATABASE_URL)
// Mongoose Schemas
const userSchema = new Schema({
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    firstName: String,
    lastName: String
});

const adminSchema = new Schema({
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    firstName: String,
    lastName: String,
    
});

const courseSchema = new Schema({
    title: String,
    description: String,
    price: Number,
    imageUrl: String,
    creatorId: ObjectId
});

const purchaseSchema = new Schema({
    userId: ObjectId,
    courseId: ObjectId
});

// Model Creation
const userModel = mongoose.model("user", userSchema);
const adminModel = mongoose.model("admin", adminSchema);
const courseModel = mongoose.model("course", courseSchema);
const purchaseModel = mongoose.model("purchase", purchaseSchema);

// Exporting Models and Functions
module.exports = {
    userModel,
    courseModel,
    adminModel,
    purchaseModel, 
};