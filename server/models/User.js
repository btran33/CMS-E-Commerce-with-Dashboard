import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
    {
        clerkUserId: { type: String, unique: true,required: true },
        firstName: String,
        lastName: String,
        username: String,
        email: String
    },
    { timestamps: true }
)

const User = mongoose.model('User', UserSchema, 'User')

export default User