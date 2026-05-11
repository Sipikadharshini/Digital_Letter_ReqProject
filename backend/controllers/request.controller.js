const prisma = require('../prismaClient');
const path = require('path');
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

    const newRequest = await prisma.request.create({
      data: {
        studentId: req.user.userId,
        type,
        status: 'PENDING_ADVISOR',
        documentPath: 'uploads/' + file.filename,
        coordinates: {
          create: parsedCoords.map(c => ({
            role: c.role,
            x: parseFloat(c.x),
            y: parseFloat(c.y)
          }))
        }
      }
    });

    res.status(201).json(newRequest);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getStudentRequests = async (req, res) => {
  try {
    const requests = await prisma.request.findMany({
      where: { studentId: req.user.userId },
      orderBy: { createdAt: 'desc' }
    });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getFacultyPendingRequests = async (req, res) => {
  try {
    const requests = await prisma.request.findMany({
      where: { 
        status: 'PENDING_ADVISOR',
        student: {
          advisorId: req.user.userId
        }
      },
      include: { 
        student: { select: { name: true, rollNumber: true, year: true, batch: true } },
        coordinates: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getHODPendingRequests = async (req, res) => {
  try {
    const requests = await prisma.request.findMany({
      where: { status: 'PENDING_HOD' },
      include: { 
        student: { select: { name: true, rollNumber: true, year: true, batch: true } },
        coordinates: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getFacultyDashboardStats = async (req, res) => {
  try {
    const requests = await prisma.request.findMany({
      where: {
        student: { advisorId: req.user.userId }
      }
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
    const requests = await prisma.request.findMany({
      where: {
        status: { in: ['PENDING_HOD', 'APPROVED', 'REJECTED'] }
      }
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
    const reqData = await prisma.request.findUnique({
      where: { id },
      include: { coordinates: true, student: true }
    });

    if (!reqData || reqData.status !== 'PENDING_ADVISOR') {
      return res.status(400).json({ message: 'Invalid request' });
    }

    const coord = reqData.coordinates.find(c => c.role === 'FACULTY');
    
    if (coord) {
      const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
      
      if (!user.signatureUrl) {
         return res.status(400).json({ message: 'Signature missing. Please upload your signature in the dashboard first.' });
      }

      const inputPath = path.join(__dirname, '..', reqData.documentPath);
      const outputPath = path.join(__dirname, '..', 'uploads', `signed_faculty_${id}.pdf`);
      
      await pdfService.addSignatureToPdf(inputPath, {
        x: coord.x, y: coord.y, name: user.name, role: 'Faculty Advisor', signatureUrl: user.signatureUrl
      }, outputPath);
      
      await prisma.request.update({
        where: { id },
        data: { 
          status: 'PENDING_HOD',
          documentPath: `uploads/signed_faculty_${id}.pdf` // Update document path to the signed one
        }
      });
    } else {
       await prisma.request.update({
        where: { id },
        data: { status: 'PENDING_HOD' }
      });
    }

    // Send Faculty Approval Email
    if (reqData.student?.email) {
      const emailText = `Hello ${reqData.student.name},\n\nYour request has been approved by your Faculty Advisor and forwarded to the HOD for final approval.\nYou will receive another notification once the final decision is made.\n\nBest Regards,\nDocFlow System`;
      await emailService.sendEmail(reqData.student.email, 'Request Approved by Faculty Advisor', emailText);
    }

    res.json({ message: 'Request approved by Faculty' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.facultyReject = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    // Fetch request to get student details
    const reqData = await prisma.request.findUnique({
      where: { id },
      include: { student: true }
    });

    await prisma.request.update({
      where: { id },
      data: { status: 'REJECTED', rejectionReason: reason }
    });

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
    
    const reqData = await prisma.request.findUnique({
      where: { id },
      include: { coordinates: true, student: true }
    });

    if (!reqData || reqData.status !== 'PENDING_HOD') {
      return res.status(400).json({ message: 'Invalid request' });
    }

    const coord = reqData.coordinates.find(c => c.role === 'HOD');
    
    let finalDocPath = reqData.documentPath;

    if (coord) {
      const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
      
      if (!user.signatureUrl) {
         return res.status(400).json({ message: 'Signature missing. Please upload your signature in the dashboard first.' });
      }

      const inputPath = path.join(__dirname, '..', reqData.documentPath);
      const outputFilename = `final_signed_${id}.pdf`;
      const outputPath = path.join(__dirname, '..', 'uploads', outputFilename);
      
      await pdfService.addSignatureToPdf(inputPath, {
        x: coord.x, y: coord.y, name: user.name, role: 'HOD', signatureUrl: user.signatureUrl
      }, outputPath);
      
      finalDocPath = `uploads/${outputFilename}`;
    }

    const updated = await prisma.request.update({
      where: { id },
      data: { 
        status: 'APPROVED',
        signedDocPath: finalDocPath
      }
    });

    // Send HOD Fully Approved Email
    if (reqData.student?.email) {
      const emailText = `Hello ${reqData.student.name},\n\nYour request has been approved by the HOD.\nYou can now download the signed document directly from the DocFlow system.\n\nBest Regards,\nDocFlow System`;
      await emailService.sendEmail(reqData.student.email, 'Request Fully Approved', emailText);
    }

    res.json({ message: 'Request approved by HOD', request: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.hodReject = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    // Fetch request to get student details
    const reqData = await prisma.request.findUnique({
      where: { id },
      include: { student: true }
    });

    await prisma.request.update({
      where: { id },
      data: { status: 'REJECTED', rejectionReason: reason }
    });

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
