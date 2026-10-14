import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.js';

const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/nexguard';
await mongoose.connect(mongoUri);

try {
  const countBefore = await User.countDocuments();
  console.log(`Users before purge: ${countBefore}`);
  const result = await User.deleteMany({});
  console.log(`Deleted ${result.deletedCount} user accounts from database.`);
  const countAfter = await User.countDocuments();
  console.log(`Users after purge: ${countAfter}`);
} finally {
  await mongoose.disconnect();
}
