import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";
import User from "../models/user.js";

passport.use(new LocalStrategy(
    async(username, password, done)=> {
        try {
            const user = await User.findOne({username})
            if(!user) return done(null,false,{message: "user not found"});

            const isMatch = await bcrypt.compare(password, user.password);
            if(!isMatch) return done(null, false,{message: "incorrect password"});
            else return done(null,user)
        } catch (error) {
            return done(error)
            
        }
      
      })
    
  )
  passport.serializeUser((user,done) => {
    console.log("serialized user")
    done(null, user._id);
  })

  passport.deserializeUser(async(_id,done) => {
    try {
        console.log("deserialized user")
        const user= await User.findById(_id);
        done(null, user);
        
    } catch (error) {
        done(error)
    }
  
  })

