const mongoose = require('mongoose');

const signatureCoordinateSchema = new mongoose.Schema(
  {
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Request',
      required: true,
    },
    role: {
      type: String,
      enum: ['FACULTY', 'HOD'],
      required: true,
    },
    x: {
      type: Number,
      required: true,
    },
    y: {
      type: Number,
      required: true,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

module.exports = mongoose.model('SignatureCoordinate', signatureCoordinateSchema);
