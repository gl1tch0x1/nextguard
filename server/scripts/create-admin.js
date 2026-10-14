import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD, MONGODB_URI } = process.env;
if (!MONGODB_URI || !ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) throw new Error('Set MONGODB_URI, ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD in the environment.');
if (ADMIN_PASSWORD.length < 8) throw new Error('ADMIN_PASSWORD must be at least 8 characters.');
await mongoose.connect(MONGODB_URI);
try {
 const email=ADMIN_EMAIL.trim().toLowerCase(); const existing=await User.findOne({email});
 if(existing){console.log('An account with this email already exists. No changes made.');}
 else {await User.create({name:ADMIN_NAME.trim(),email,passwordHash:await bcrypt.hash(ADMIN_PASSWORD,12),role:'administrator'});console.log(`Administrator created for ${email}.`);}
} finally {await mongoose.disconnect();}
