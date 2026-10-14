import mongoose from 'mongoose';

const inquirySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
  company: { type: String, trim: true, maxlength: 120, default: '' },
  service: { type: String, required: true, enum: ['VAPT', 'Security Audit', 'Red Teaming', 'Web Development', 'Networking & IT', 'AI Security', 'Training', 'Other'] },
  message: { type: String, required: true, trim: true, maxlength: 4000 },
  authorized: { type: Boolean, default: false },
  status: { type: String, enum: ['new', 'in_review', 'closed'], default: 'new' }
}, { timestamps: true, versionKey: false });
inquirySchema.index({ status: 1, createdAt: -1 });
inquirySchema.index({ createdAt: -1 });

export default mongoose.model('Inquiry', inquirySchema);
