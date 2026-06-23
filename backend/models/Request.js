const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['PERMISSION_LETTER', 'SCHOLARSHIP_FORM', 'OTHER'],
      required: true,
    },
    status: {
      type: String,
      enum: ['PENDING_ADVISOR', 'PENDING_HOD', 'APPROVED', 'REJECTED'],
      required: true,
      default: 'PENDING_ADVISOR',
    },
    documentPath: {
      type: String,
      required: true,
    },
    signedDocPath: String,
    rejectionReason: String,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

requestSchema.virtual('student', {
  ref: 'User',
  localField: 'studentId',
  foreignField: '_id',
  justOne: true,
});

requestSchema.virtual('coordinates', {
  ref: 'SignatureCoordinate',
  localField: '_id',
  foreignField: 'requestId',
});

module.exports = mongoose.model('Request', requestSchema);
