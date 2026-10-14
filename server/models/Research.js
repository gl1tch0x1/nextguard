import mongoose from 'mongoose';

const researchSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
  category: { type: String, default: 'CYBER RESEARCH', trim: true },
  summary: { type: String, required: true },
  content: { type: String, default: '' },
  tags: [{ type: String, trim: true }],
  keyFindings: [{ type: String, trim: true }],
  architecturePoC: { type: String, default: '' },
  threatModel: { type: mongoose.Schema.Types.Mixed, default: {} },
  readTimeMinutes: { type: Number, default: 8, min: 1, max: 120 },
  url: { type: String, default: '' },
  bannerImage: { type: String, default: '' },
  pocImages: [
    {
      url: { type: String, default: '' },
      caption: { type: String, default: '' },
      title: { type: String, default: '' }
    }
  ],
  status: { type: String, enum: ['draft', 'published'], default: 'published', index: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  authorName: { type: String, default: 'NexGuard Security Research Team', trim: true },
  authorRole: { type: String, default: 'Senior Security Researcher', trim: true },
  publishedAt: { type: Date, default: Date.now }
}, { timestamps: true, versionKey: false, strict: false });

researchSchema.index({ status: 1, publishedAt: -1 });
export default mongoose.model('Research', researchSchema);
