import mongoose from 'mongoose'

const ProblemSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  title: { type: String, required: true },
  tags: [String],
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'] },

  status: {
    last: {
      type: String,
      enum: ['Not Started', 'Partially Solved', 'Solved'],
      default: 'Not Started'
    },
    stats: {
      tried: { type: Number, default: 0 },
      passed: { type: Number, default: 0 },
      partial: { type: Number, default: 0 }
    }
  },

  favorite: { type: Boolean, default: false },
  link: { type: String, required: true },
  note: { type: String, default: '' },

  // ✅ Each record includes date, status, and time spent
  history: [
    {
      date: { type: Date, required: true },
      status: { type: String, enum: ['Not Started', 'Partially Solved', 'Solved'] },
      duration: { type: Number, default: 0 }  // in seconds
    }
  ]
})

export default mongoose.models.Problem || mongoose.model('Problem', ProblemSchema)
