const ScheduledEmail = require('../models/ScheduledEmail');
const { sendInvitationEmail } = require('./emailService');
const { getInvitationHtml } = require('./emailTemplates');
const path = require('path');
const fs = require('fs');

/**
 * Initializes and starts the background scheduler for sending pending emails.
 */
const runScheduler = () => {
  console.log('⏰ Background Scheduler Initialized (Running every 30 seconds)');

  setInterval(async () => {
    try {
      const now = new Date();
      // Find pending emails scheduled for current time or earlier
      const pendingEmails = await ScheduledEmail.find({
        status: 'pending',
        scheduledFor: { $lte: now }
      });

      if (pendingEmails.length === 0) return;

      console.log(`[Scheduler] Found ${pendingEmails.length} pending email(s) to dispatch.`);

      for (const email of pendingEmails) {
        try {
          console.log(`[Scheduler] Dispatching invitation to ${email.receiverEmails} for company ${email.companyName}...`);

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
          }

          // Attach Campus Recruitment Form (CRF)
          if (fs.existsSync(crfPath)) {
            attachments.push({
              filename: 'NSUT Campus Recruitment Form.docx',
              path: crfPath
            });
          }

          // Attach NSUT logo as inline CID attachment
          if (fs.existsSync(logoPath)) {
            attachments.push({
              filename: 'nsut-logo.png',
              path: logoPath,
              cid: 'nsutlogo'
            });
          }

          // Generate subject
          const subject = `NSUT: Invitation for Full Time and Intern Hiring 2026-27 | ${email.companyName}`;

          // Construct plain HTML body
          const html = getInvitationHtml(email.companyName, email.coordinators);

          // Send the invitation email
          await sendInvitationEmail({
            to: email.receiverEmails,
            cc: email.ccEmails || undefined,
            bcc: email.bccEmails || undefined,
            subject,
            html,
            attachments,
            adminName: email.adminName || 'T&P Cell'
          });

          // Update status in db
          email.status = 'sent';
          email.sentAt = new Date();
          await email.save();

          console.log(`[Scheduler] ✅ Invitation email successfully sent to ${email.receiverEmails} for ${email.companyName}`);
        } catch (err) {
          console.error(`[Scheduler] ❌ Failed to dispatch invitation to ${email.receiverEmails}:`, err.message);
          
          email.status = 'failed';
          email.error = err.message;
          await email.save();
        }
      }
    } catch (error) {
      console.error('[Scheduler] Error in periodic check:', error.message);
    }
  }, 30000); // Check every 30 seconds
};

module.exports = { runScheduler };
