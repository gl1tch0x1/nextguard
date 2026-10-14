import mongoose from 'mongoose';

const quizQuestionSchema = new mongoose.Schema({
  question: { type: String, required: true, maxlength: 500 },
  options: [{ type: String, maxlength: 240 }],
  correctIndex: { type: Number, min: 0, max: 10, required: true },
  explanation: { type: String, maxlength: 1000, default: '' }
}, { _id: true });

const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true, maxlength: 180 },
  summary: { type: String, maxlength: 600, default: '' },
  content: { type: String, maxlength: 20000, default: '' },
  order: { type: Number, default: 0 },
  durationMinutes: { type: Number, default: 10 },
  quiz: [quizQuestionSchema]
}, { _id: true });

const courseSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
  title: { type: String, required: true, trim: true },
  category: { type: String, required: true, trim: true },
  level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
  duration: { type: String, default: 'Self-paced' },
  summary: { type: String, required: true },
  description: { type: String, default: '' },
  badge: { type: String, default: '' },
  competencies: [{ type: String }],
  tools: [{ type: String }],
  prerequisites: [{ type: String }],
  targetAudience: [{ type: String }],
  thumbnail: { type: String, default: '' },
  bannerImage: { type: String, default: '' },
  modules: { type: mongoose.Schema.Types.Mixed, default: [] },
  labs: { type: mongoose.Schema.Types.Mixed, default: [] },
  capstoneProject: { type: mongoose.Schema.Types.Mixed, default: null },
  lessons: [lessonSchema],
  published: { type: Boolean, default: true },
  instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
}, { timestamps: true, versionKey: false, strict: false });

courseSchema.index({ published: 1, title: 1 });
courseSchema.index({ instructor: 1 });
export default mongoose.model('Course', courseSchema);
