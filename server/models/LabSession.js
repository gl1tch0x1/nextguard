import mongoose from 'mongoose';
const schema = new mongoose.Schema({ user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true }, labSlug: { type: String, required: true }, status: { type: String, enum: ['started','completed'], default: 'started' }, notes: { type: String, maxlength: 2000, default: '' }, startedAt: { type: Date, default: Date.now }, completedAt: Date }, { timestamps: true, versionKey: false });
schema.index({ user: 1, labSlug: 1 });
export default mongoose.model('LabSession', schema);
