const path = require('path');
const User = require('../models/User');
const Request = require('../models/Request');
const SignatureCoordinate = require('../models/SignatureCoordinate');
const pdfService = require('../services/pdf.service');
const emailService = require('../services/email.service');

exports.createRequest = async (req, res) => {
  try {
    const { type, coordinates } = req.body; // coordinates is JSON string
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: 'Document is required' });
    }

    let parsedCoords = [];
    if (coordinates) {
      parsedCoords = JSON.parse(coordinates);
    }

    const newRequest = await Request.create({
      studentId: req.user.userId,
      type,
      status: 'PENDING_ADVISOR',
      documentPath: 'uploads/' + file.filename
    });

    if (parsedCoords.length > 0) {
      await SignatureCoordinate.insertMany(parsedCoords.map(c => ({
        requestId: newRequest.id,
        role: c.role,
        x: parseFloat(c.x),
        y: parseFloat(c.y)
      })));
    }

    res.status(201).json(newRequest);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getStudentRequests = async (req, res) => {
  try {
    const requests = await Request.find({ studentId: req.user.userId }).sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getFacultyPendingRequests = async (req, res) => {
  try {
    const advisedStudents = await User.find({ advisorId: req.user.userId }).select('_id');
    const requests = await Request.find({
      status: 'PENDING_ADVISOR',
      studentId: { $in: advisedStudents.map((student) => student._id) }
    })
      .populate('student', 'name rollNumber year batch')
      .populate('coordinates')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getHODPendingRequests = async (req, res) => {
  try {
    const requests = await Request.find({ status: 'PENDING_HOD' })
      .populate('student', 'name rollNumber year batch')
      .populate('coordinates')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getFacultyDashboardStats = async (req, res) => {
  try {
    const advisedStudents = await User.find({ advisorId: req.user.userId }).select('_id');
    const requests = await Request.find({
      studentId: { $in: advisedStudents.map((student) => student._id) }
    });

    const stats = {
      total: requests.length,
      pending: requests.filter(r => r.status === 'PENDING_ADVISOR').length,
      approved: requests.filter(r => r.status === 'PENDING_HOD' || r.status === 'APPROVED').length,
      rejected: requests.filter(r => r.status === 'REJECTED').length
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getHodDashboardStats = async (req, res) => {
  try {
    const requests = await Request.find({
      status: { $in: ['PENDING_HOD', 'APPROVED', 'REJECTED'] }
    });

    const stats = {
      total: requests.length,
      pending: requests.filter(r => r.status === 'PENDING_HOD').length,
      approved: requests.filter(r => r.status === 'APPROVED').length,
      rejected: requests.filter(r => r.status === 'REJECTED').length
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.facultyApprove = async (req, res) => {
  try {
    const { id } = req.params;

    // Add signature logic to PDF
    const reqData = await Request.findById(id)
      .populate('coordinates')
      .populate('student');

    console.log('📋 Faculty Approve - Request Data:', { id, status: reqData?.status, coordsCount: reqData?.coordinates?.length });
    console.log('📋 Coordinates:', reqData?.coordinates);

    if (!reqData || reqData.status !== 'PENDING_ADVISOR') {
      return res.status(400).json({ message: 'Invalid request' });
    }

    const coord = reqData.coordinates.find(c => c.role === 'FACULTY');
    console.log('🎯 Found FACULTY coordinate:', coord);

    if (coord) {
      const user = await User.findById(req.user.userId);

      if (!user.signatureUrl) {
        return res.status(400).json({ message: 'Signature missing. Please upload your signature in the dashboard first.' });
      }

      const inputPath = path.join(__dirname, '..', reqData.documentPath);
      const outputPath = path.join(__dirname, '..', 'uploads', `signed_faculty_${id}.pdf`);

      console.log('🔄 Calling addSignatureToPdf with:', { x: coord.x, y: coord.y, role: coord.role });

      await pdfService.addSignatureToPdf(inputPath, {
        x: coord.x, y: coord.y, name: user.name, role: 'Faculty Advisor', signatureUrl: user.signatureUrl
      }, outputPath);

      await Request.findByIdAndUpdate(id, {
        status: 'PENDING_HOD',
        documentPath: `uploads/signed_faculty_${id}.pdf` // Update document path to the signed one
      });
    } else {
      console.log('⚠ No FACULTY coordinate found, skipping signature');
      await Request.findByIdAndUpdate(id, { status: 'PENDING_HOD' });
    }

    // Send Faculty Approval Email
    if (reqData.student?.email) {
      const emailText = `Hello ${reqData.student.name},\n\nYour request has been approved by your Faculty Advisor and forwarded to the HOD for final approval.\nYou will receive another notification once the final decision is made.\n\nBest Regards,\nDocFlow System`;
      await emailService.sendEmail(reqData.student.email, 'Request Approved by Faculty Advisor', emailText);
    }

    res.json({ message: 'Request approved by Faculty' });
  } catch (error) {
    console.error('❌ Faculty Approve Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.facultyReject = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    // Fetch request to get student details
    const reqData = await Request.findById(id).populate('student');

    await Request.findByIdAndUpdate(id, { status: 'REJECTED', rejectionReason: reason });

    // Send Faculty Rejection Email
    if (reqData && reqData.student?.email) {
      const emailText = `Hello ${reqData.student.name},\n\nUnfortunately, your request has been rejected by your Faculty Advisor.\n\nReason: ${reason}\n\nBest Regards,\nDocFlow System`;
      await emailService.sendEmail(reqData.student.email, 'Request Rejected by Faculty Advisor', emailText);
    }

    res.json({ message: 'Request rejected' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.hodApprove = async (req, res) => {
  try {
    const { id } = req.params;

    const reqData = await Request.findById(id)
      .populate('coordinates')
      .populate('student');

    console.log('📋 HOD Approve - Request Data:', { id, status: reqData?.status, coordsCount: reqData?.coordinates?.length });
    console.log('📋 Coordinates:', reqData?.coordinates);

    if (!reqData || reqData.status !== 'PENDING_HOD') {
      return res.status(400).json({ message: 'Invalid request' });
    }

    const coord = reqData.coordinates.find(c => c.role === 'HOD');
    console.log('🎯 Found HOD coordinate:', coord);

    let finalDocPath = reqData.documentPath;

    if (coord) {
      const user = await User.findById(req.user.userId);

      if (!user.signatureUrl) {
        return res.status(400).json({ message: 'Signature missing. Please upload your signature in the dashboard first.' });
      }

      const inputPath = path.join(__dirname, '..', reqData.documentPath);
      const outputFilename = `final_signed_${id}.pdf`;
      const outputPath = path.join(__dirname, '..', 'uploads', outputFilename);

      console.log('🔄 Calling addSignatureToPdf with:', { x: coord.x, y: coord.y, role: coord.role });

      await pdfService.addSignatureToPdf(inputPath, {
        x: coord.x, y: coord.y, name: user.name, role: 'HOD', signatureUrl: user.signatureUrl
      }, outputPath);

      finalDocPath = `uploads/${outputFilename}`;
    } else {
      console.log('⚠ No HOD coordinate found, using previous document');
    }

    const updated = await Request.findByIdAndUpdate(
      id,
      {
        status: 'APPROVED',
        signedDocPath: finalDocPath
      },
      { returnDocument: 'after' }
    );

    // Send HOD Fully Approved Email
    if (reqData.student?.email) {
      const emailText = `Hello ${reqData.student.name},\n\nYour request has been approved by the HOD.\nYou can now download the signed document directly from the DocFlow system.\n\nBest Regards,\nDocFlow System`;
      await emailService.sendEmail(reqData.student.email, 'Request Fully Approved', emailText);
    }

    res.json({ message: 'Request approved by HOD', request: updated });
  } catch (error) {
    console.error('❌ HOD Approve Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.hodReject = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    // Fetch request to get student details
    const reqData = await Request.findById(id).populate('student');

    await Request.findByIdAndUpdate(id, { status: 'REJECTED', rejectionReason: reason });

    // Send HOD Rejection Email
    if (reqData && reqData.student?.email) {
      const emailText = `Hello ${reqData.student.name},\n\nUnfortunately, your request has been rejected by the HOD.\n\nReason: ${reason}\n\nBest Regards,\nDocFlow System`;
      await emailService.sendEmail(reqData.student.email, 'Request Rejected by HOD', emailText);
    }

    res.json({ message: 'Request rejected' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
