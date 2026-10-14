import mongoose from 'mongoose';

const labSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true, trim: true },
    level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
    estimatedMinutes: { type: Number, default: 25, min: 1 },
    objective: { type: String, required: true, trim: true },
    safety: { type: String, required: true, trim: true },
    steps: [{ type: String, trim: true }],
    challenge: { type: String, required: true, trim: true },
    hints: [{ type: String, trim: true }],
    kind: { type: String, default: 'static' },
    published: { type: Boolean, default: true, index: true }
  },
  { timestamps: true }
);

export default mongoose.model('Lab', labSchema);
