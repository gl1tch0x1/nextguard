import 'dotenv/config';
import mongoose from 'mongoose';

const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/nexguard';

async function run() {
  await mongoose.connect(mongoUri);
  const db = mongoose.connection.db;
  const res = await db.collection('services').deleteMany({
    slug: { $in: ['vapt', 'security-audits', 'red-team-simulation'] }
  });
  console.log('Deleted legacy services:', res.deletedCount);
  const remaining = await db.collection('services').find({}).toArray();
  console.log('Remaining services:', remaining.map(s => ({ slug: s.slug, title: s.title, number: s.number })));
  await mongoose.disconnect();
}

run().catch(console.error);
