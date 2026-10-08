const mongoose = require('mongoose')

const entrySchema = new mongoose.Schema({
  type: { type: String, enum: ['labour', 'material'], required: true },
  date: { type: String, required: true },
  item: { type: String, required: true, trim: true, maxlength: 120 },
  category: { type: String, required: true, trim: true, maxlength: 80 },
  quantity: { type: Number, required: true, min: 0.01 },
  unit: { type: String, required: true, trim: true, maxlength: 40 },
  rate: { type: Number, required: true, min: 0 },
  total: { type: Number, required: true, min: 0 },
}, { timestamps: true })

const projectSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 120 },
  location: { type: String, required: true, trim: true, maxlength: 120 },
  address: { type: String, trim: true, maxlength: 200, default: '' },
  unit: { type: String, required: true, trim: true, maxlength: 30 },
  size: { type: Number, required: true, min: 0.01 },
  status: { type: String, enum: ['Draft', 'In progress', 'Completed'], default: 'Draft' },
  entries: { type: [entrySchema], default: [] },
}, { timestamps: true })

module.exports = mongoose.model('Project', projectSchema)
