const Application = require('../models/Application');
const JobEvent = require('../models/JobEvent');
const Company = require('../models/Company');
const ScheduledEmail = require('../models/ScheduledEmail');
const { buildApplicantExcel } = require('../utils/excelBuilder');
const { sendDispatchEmail, sendInvitationEmail } = require('../utils/emailService');
const { getInvitationHtml } = require('../utils/emailTemplates');
const path = require('path');
const fs = require('fs');

// @desc    Send applicant data via email as Excel attachment
// @route   POST /api/dispatch/send
const sendData = async (req, res, next) => {
  try {
    const { season, companyId, jobRole, opportunityType } = req.body;

    if (!season || !companyId || !jobRole || !opportunityType) {
      return res.status(400).json({
        message: 'Please provide season, company, role, and type of opportunity'
      });
    }

    // Find the company
    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    // Find the matching event
    const event = await JobEvent.findOne({
      company: companyId,
      season,
      jobRole: { $regex: new RegExp(jobRole, 'i') },
      opportunityType
    });

    if (!event) {
      return res.status(404).json({ message: 'No matching event found with the given criteria' });
    }

    // Get all applications for this event
    const applications = await Application.find({ jobEvent: event._id })
      .sort({ appliedAt: 1 });

    if (applications.length === 0) {
      return res.status(400).json({ message: 'No applications found for this event' });
    }

    // Build Excel
    const excelBuffer = await buildApplicantExcel(applications, company.name, jobRole);

    // Compose email
    const subject = `Data Verification - ${company.name} | ${opportunityType}`;
    const body = `Dear Team,\n\nKindly Verify the date,\n\nRegards.`;
    const fileName = `${company.name}_${jobRole}_${season}.xlsx`;

    // Send email
    await sendDispatchEmail({
      to: 'vasista1947@gmail.com',
      subject,
      body,
      excelBuffer,
      fileName,
      adminName: req.user.name
    });

    res.json({
      message: 'Data sent successfully!',
      details: {
        company: company.name,
        role: jobRole,
        type: opportunityType,
        season,
        totalApplicants: applications.length
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Send official placement invitation email with attachments
// @route   POST /api/dispatch/send-invitation
const sendInvitation = async (req, res, next) => {
  try {
    const { receiverEmails, ccEmails, bccEmails, companyName, coordinators, scheduledFor } = req.body;

    if (!receiverEmails || !companyName || !coordinators || !Array.isArray(coordinators)) {
      return res.status(400).json({
        message: 'Please provide receiver email(s), company name, and placement coordinators'
      });
    }

    // If scheduledFor is provided, schedule the email instead of sending immediately
    if (scheduledFor) {
      const scheduleDate = new Date(scheduledFor);
      if (isNaN(scheduleDate.getTime()) || scheduleDate <= new Date()) {
        return res.status(400).json({
          message: 'Please provide a valid date and time in the future for scheduling'
        });
      }

      const scheduledEmail = await ScheduledEmail.create({
        receiverEmails,
        ccEmails: ccEmails || undefined,
        bccEmails: bccEmails || undefined,
        companyName,
        coordinators: coordinators.map(c => ({
          name: c.name.trim(),
          phone: c.phone.trim() || undefined
        })),
        scheduledFor: scheduleDate,
        adminName: req.user.name,
        status: 'pending'
      });

      return res.json({
        message: 'Placement Invitation scheduled successfully!',
        details: {
          company: companyName,
          recipients: receiverEmails,
          cc: ccEmails || 'None',
          bcc: bccEmails || 'None',
          scheduledFor: scheduleDate,
          coordinatorsCount: coordinators.length
        }
      });
    }

    // Resolve paths to the attached files in assets
    const brochurePath = path.join(__dirname, '../assets/Placement_Brochure_2025-26.pdf');
    const crfPath = path.join(__dirname, '../assets/NSUT_CRF_2025-26.docx');
    const logoPath = path.join(__dirname, '../assets/nsut-logo.png');

    const attachments = [];

    // Attach Placement Brochure
    if (fs.existsSync(brochurePath)) {
      attachments.push({
        filename: 'NSUT Placement Brochure 2025-26.pdf',
        path: brochurePath
      });
    } else {
      console.warn('Brochure file missing in backend/assets');
    }

    // Attach Campus Recruitment Form (CRF)
    if (fs.existsSync(crfPath)) {
      attachments.push({
        filename: 'NSUT Campus Recruitment Form.docx',
        path: crfPath
      });
    } else {
      console.warn('CRF document file missing in backend/assets');
    }

    // Attach NSUT logo as inline CID attachment
    if (fs.existsSync(logoPath)) {
      attachments.push({
        filename: 'nsut-logo.png',
        path: logoPath,
        cid: 'nsutlogo'
      });
    } else {
      console.warn('Logo image file missing in backend/assets');
    }

    // Generate subject
    const subject = `NSUT: Invitation for Full Time and Intern Hiring 2026-27 | ${companyName}`;

    // Construct plain HTML body
    const html = getInvitationHtml(companyName, coordinators);

    // Respond immediately — email sends in background
    res.json({
      message: 'Placement Invitation email is being dispatched!',
      details: {
        company: companyName,
        recipients: receiverEmails,
        cc: ccEmails || 'None',
        bcc: bccEmails || 'None',
        coordinatorsCount: coordinators.length
      }
    });

    // Fire and forget — send email in background
    sendInvitationEmail({
      to: receiverEmails,
      cc: ccEmails || undefined,
      bcc: bccEmails || undefined,
      subject,
      html,
      attachments,
      adminName: req.user.name
    }).then(() => {
      console.log(`✅ Invitation email sent to ${receiverEmails} for ${companyName}`);
    }).catch((err) => {
      console.error(`❌ Failed to send invitation email to ${receiverEmails}:`, err.message);
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { sendData, sendInvitation };