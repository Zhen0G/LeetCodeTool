// ✅ src/models/ProblemSet.js
import mongoose from 'mongoose'

const problemSetSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  problems: [{ type: Number, ref: 'Problem' }], // 保存题号数组，引用 Problem
  createdAt: { type: Date, default: Date.now }
})

export default mongoose.models.ProblemSet || mongoose.model('ProblemSet', problemSetSchema)
