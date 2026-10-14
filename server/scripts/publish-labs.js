import 'dotenv/config';
import mongoose from 'mongoose';

const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/nexguard';

async function run() {
  await mongoose.connect(mongoUri);
  await mongoose.connection.db.collection('labs').updateMany({}, { $set: { published: true } });
  console.log('All labs successfully updated to published: true');
  await mongoose.disconnect();
}

run().catch(console.error);
