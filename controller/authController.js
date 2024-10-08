import bcrypt from "bcryptjs";
import User from '../models/user.js';
import speakeasy from "speakeasy";
import qrCode from "qrCode";
import jwt from "jsonwebtoken";
export const register = async(req,res) =>{
    try {
        const {username,password}=req.body;
        const hashedPassword=await bcrypt.hash(password,10)
        const newUser=new User({
            username,
            password:hashedPassword,
            isMfaActive:false,

        })
        await newUser.save();
        res.status(201).json({message: "User registered successfully", user:newUser})
        } catch (error) {
        res.status(500).json({error:"error registering user",message:error})
        
    }

}
export const login = async(req,res) =>{
    console.log("the authenticated user is:",req.user)
    res.status(200).json({
        message: "User logged successfully",
        username:req.user.username,
        isMfaActive:req.user.isMfaActive
    })
    
}
export const authStatus = (req,res) =>{
    if(req.user){
        res.status(200).json({
            message: "User is authenticated", 
            isAuthenticated:true, 
            username:req.user.username
        })
    }else{
        res.status(401).json({
            message: "User is not authenticated",
    
        })
    }
    
}
export const logout = async(req, res) => {
    if (!req.user) {
        return res.status(401).json({
            message: "Unauthorized user",
            isAuthenticated: false,
        });
    }

    // Logout the user
    req.logout((err) => {
        if (err) {
            return res.status(500).json({ error: "Error logging out", message: err.message });
        }

        res.status(200).json({
            message: "User logged out successfully",
            isAuthenticated: false,
        });
    });
};

export const setup2FA =async(req,res) =>{
    try {
        console.log("the req.user is:",req.user)
        const user=req.user;
        var secret = speakeasy.generateSecret();
        console.log("the secret object is:",secret);
        user.twoFactorSecret = secret.base32;
        user.isMfaActive = true;
        await user.save();
        const url=speakeasy.otpauthURL({
            secret: secret.base32,
            label: user.username,
            issuer: "Multi-Factor Authentication",
            encoding: "base32",
        })
        const qrImageUrl=await qrCode.toDataURL(url);
        res.status(200).json({message: "2FA setup successful", qrCode:qrImageUrl, secretKey:secret.base32})
        
    } catch (error) {
        res.status(500).json({error:"error setting up 2FA",message:error})
        
    }

    
}
export const verify2FA =async (req,res) =>{

    const {token}   =req.body;
    const user=req.user;

    const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: "base32",
        token,
    });
    if(verified){
        const jwtToken=jwt.sign({
            username:user.username
        },
        process.env.JWT_SECRET,
        {expiresIn:"1hr"}
    )  
        res.status(200).json({message:"2FA Successful",token:jwt})
    }else{
        res.status(401).json({message: "Invalid 2FA token"})
    
    }
};
export const reset2FA = async(req,res) =>{

    try {
        const user=req.user;
        user.twoFactorSecret ="";
        user.isMfaActive = false;
        await user.save();
        res.status(200).json({message: "2FA reset successful"})
            } catch (error) {
        res.status(500).json({error:"error resetting 2FA",message:error})
        
    }
    
}