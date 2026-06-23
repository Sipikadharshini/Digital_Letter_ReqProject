const mongoose = require('mongoose');
const { isValidEmail } = require('../utils/validation');

const optionalString = {
  type: String,
  set: (value) => (value === '' ? undefined : value),
};

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      ...optionalString,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: (value) => !value || isValidEmail(value),
        message: 'Invalid email address.',
      },
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['ADMIN', 'STUDENT', 'FACULTY', 'HOD'],
      required: true,
    },
    rollNumber: {
      ...optionalString,
      unique: true,
      sparse: true,
      trim: true,
    },
    year: Number,
    batch: {
      ...optionalString,
      trim: true,
    },
    advisorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: undefined,
    },
    employeeId: {
      ...optionalString,
      unique: true,
      sparse: true,
      trim: true,
    },
    isActivated: {
      type: Boolean,
      default: true,
    },
    signatureUrl: optionalString,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

userSchema.virtual('advisedStudents', {
  ref: 'User',
  localField: '_id',
  foreignField: 'advisorId',
});

userSchema.virtual('requests', {
  ref: 'Request',
  localField: '_id',
  foreignField: 'studentId',
});

module.exports = mongoose.model('User', userSchema);
