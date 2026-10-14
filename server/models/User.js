import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 254 },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ['student', 'instructor', 'administrator', 'writer'], default: 'student', index: true },
  isVerifiedWriter: { type: Boolean, default: false },
  active: { type: Boolean, default: true },
  resetPasswordToken: { type: String, select: false },
  resetPasswordExpires: { type: Date, select: false },
  aiUsage: { day: { type: String, default: '' }, requests: { type: Number, default: 0 }, tokensApprox: { type: Number, default: 0 } }
}, { timestamps: true, versionKey: false, strict: false });

userSchema.index({ role: 1, active: 1 });
export default mongoose.model('User', userSchema);
