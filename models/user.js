import mongoose from "mongoose"; // Erase if already required

// Declare the Schema of the Mongo model
const userSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true,
        unique:true,
    },
    password:{
        type:String,
        required:true,
    },
    isMfaActive:{
        type:Boolean,
        default:false,
    },
    twoFactorSecret:{
        type:String,
    }
},{
    timestamps: true,  // Saves createdAt and updatedAt fields
});

//Export the model
const User=mongoose.model('User', userSchema);
export default User;