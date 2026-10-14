import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/nexguard';
const adminEmail = (process.env.ADMIN_EMAIL || 'admin@nexguard.io').trim().toLowerCase();
const adminPassword = process.env.ADMIN_PASSWORD || 'nextguard.io';
const adminName = process.env.ADMIN_NAME || 'Nexguard Administrator';

await mongoose.connect(mongoUri);
try {
  const passwordHash = await bcrypt.hash(adminPassword, 12);
  let admin = await User.findOne({ email: adminEmail });
  if (admin) {
    admin.passwordHash = passwordHash;
    admin.role = 'administrator';
    admin.active = true;
    await admin.save();
    console.log(`Updated administrator (${adminEmail}) password successfully to: ${adminPassword}`);
  } else {
    admin = await User.create({
      name: adminName,
      email: adminEmail,
      passwordHash,
      role: 'administrator',
      active: true
    });
    console.log(`Created administrator (${adminEmail}) with password: ${adminPassword}`);
  }
} finally {
  await mongoose.disconnect();
}
