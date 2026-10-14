import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
  number: { type: String, default: '01' },
  category: { type: String, required: true },
  tagline: { type: String, default: '' },
  summary: { type: String, required: true },
  duration: { type: String, default: '2 – 3 Weeks' },
  assessmentType: { type: String, default: '' },
  compliance: { type: String, default: '' },
  clearance: { type: String, default: '' },
  threatContext: { type: String, default: '' },
  bullets: [{ type: String }],
  corePillars: { type: mongoose.Schema.Types.Mixed, default: [] },
  methodologySteps: { type: mongoose.Schema.Types.Mixed, default: [] },
  deliverables: { type: mongoose.Schema.Types.Mixed, default: [] },
  technicalCapabilities: { type: mongoose.Schema.Types.Mixed, default: [] },
  engagementTimeline: { type: mongoose.Schema.Types.Mixed, default: [] },
  caseStudy: { type: mongoose.Schema.Types.Mixed, default: null },
  published: { type: Boolean, default: true }
}, { timestamps: true, versionKey: false, strict: false });

serviceSchema.index({ published: 1, title: 1 });
export default mongoose.model('Service', serviceSchema);
