import mongoose from 'mongoose';
const enrollmentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
  completedLessons: [{ type: mongoose.Schema.Types.ObjectId }],
  quizAttempts: [{ lessonId: mongoose.Schema.Types.ObjectId, score: Number, total: Number, submittedAt: { type: Date, default: Date.now } }],
  enrolledAt: { type: Date, default: Date.now }, completedAt: { type: Date, default: null }
}, { timestamps: true, versionKey: false });
enrollmentSchema.index({ user: 1, course: 1 }, { unique: true });
export default mongoose.model('Enrollment', enrollmentSchema);
