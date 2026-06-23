const mongoose = require('mongoose');

const preRegisteredStaffSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ['FACULTY', 'HOD'],
      required: true,
    },
    isActivated: {
      type: Boolean,
      default: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

module.exports = mongoose.model('PreRegisteredStaff', preRegisteredStaffSchema);
