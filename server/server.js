import express from 'express';
import mongoose from 'mongoose';
import 'dotenv/config';
import bcrypt from "bcrypt";
import User from "./Schema/User.js";
import {nanoid} from "nanoid";
import jwt from 'jsonwebtoken';
import cors from "cors";

const server=express();
let PORT=3000;

let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; 
let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/; 

mongoose.connect(process.env.DB_LOCATION, {
    autoIndex:true
})

server.use(express.json());
server.use(cors());

const formatDatatoSend = (user) =>{
    const access_token = jwt.sign({ id :user._id },process.env.SECRET_ACCESS_KEY )
    return {
        access_token,
        profile_img: user.personal_info.profile_img,
        username: user.personal_info.username,
        fullname: user.personal_info.fullname
    }
}
const generateUsername = async(email) => {
    let username = email.split("@")[0];

    let usernameExists = await User.exists({ "personal_info.username":username}).then((result) => result);

    usernameExists ? username += nanoid() : "";
    return username;
}
server.post("/signup", (req,res) => {
    
    let { fullname, email,password } =req.body;
    if (fullname.length<3){
        return res.status(403).json({ "error":"Full Name must be atleast 3 characters long"})
    }
    if (!email.length){
        return res.status(403).json({"error":"Please enter Email ID"})
    }
    if (!emailRegex.test(email)){
        return res.status(403).json({"error":"Please enter Valid Email ID"})
    }
    if (!passwordRegex.test(password)){
        return res.status(403).json({"error":"Password should be 6-20 Characters Long with a numeric, 1 Lowercase and 1 Uppercase Letter."})
    }
    bcrypt.hash(password, 10, async(err,hashed_password) =>{
        let username= await generateUsername(email);
        let user = new User({
            personal_info:{ fullname, email, password:hashed_password, username}
        })

        user.save().then((u) => {
            return res.status(200).json(formatDatatoSend(u))
        })
        .catch(err => {

            if (err.code==11000){
                return res.status(500).json({"error":"Account Already exists."})
            }
            return res.status(500).json({"error":err.message})
        })
    })
})

server.post("/signin", (req,res) => {
    let {email,password} = req.body;

    User.findOne({ "personal_info.email":email})
    .then((user) =>  {
        if (!user){
            return res.status(403).json({"error": "Email Not Found."})
        }

        bcrypt.compare(password,user.personal_info.password, (err,result) => {
            if (err){
                return res.status(403).json({"error":"Error Occured while trying to Signin, Please try again."})
            }
            if (!result){
                return res.status(403).json({"error":"Incorrect Password"})
            }else{
                return res.status(200).json(formatDatatoSend(user))
            }
        })

    })
    .catch(err => {
        console.log(err)
        return res.status(500).json({ "error":err.message})
    })
})
server.listen(PORT, () => {
    console.log("listening on port:" + PORT)
})