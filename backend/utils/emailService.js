const nodemailer = require('nodemailer');

const createTransporter = () => {
  const rawPass = process.env.SENDER_PASSWORD || '';
  const cleanPass = rawPass.replace(/\s+/g, '');
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SENDER_EMAIL,
      pass: cleanPass
    }
  });
};

const sendDispatchEmail = async ({ to, subject, body, excelBuffer, fileName, adminName }) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"${adminName} - T&P Cell" <${process.env.SENDER_EMAIL}>`,
    to: to || process.env.RECEIVER_EMAIL || 'vasista1947@gmail.com',
    subject: subject,
    text: body,
    attachments: [
      {
        filename: fileName || 'applicants.xlsx',
        content: excelBuffer,
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      }
    ]
  };

  const info = await transporter.sendMail(mailOptions);
  return info;
};

const sendOtpEmail = async ({ to, otpCode, name }) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"NSUT Placement Portal" <${process.env.SENDER_EMAIL}>`,
      to: to,
      subject: 'Verification Code - NSUT Placement Portal',
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 500px; margin: 0 auto; padding: 30px; background-color: #0d1117; border: 1px solid #1e293b; border-radius: 12px; color: #f1f5f9;">
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="display: inline-block; padding: 10px 20px; background: linear-gradient(135deg, #6366f1, #8b5cf6); border-radius: 8px; font-weight: bold; color: white;">T&P NSUT</div>
          </div>
          <h2 style="font-size: 1.3rem; font-weight: 700; color: #f1f5f9; margin-bottom: 12px; text-align: center;">One-Time Verification Code</h2>
          <p style="font-size: 0.9rem; color: #94a3b8; line-height: 1.5; text-align: center;">Hello ${name},<br/>Use the following 6-digit code to complete your login or registration process. This code is active for 5 minutes.</p>
          <div style="text-align: center; margin: 30px 0;">
            <span style="font-size: 2.2rem; font-weight: 800; letter-spacing: 6px; color: #8b5cf6; background: rgba(99,102,241,0.08); padding: 12px 24px; border-radius: 8px; border: 1px dashed rgba(99,102,241,0.3);">${otpCode}</span>
          </div>
          <p style="font-size: 0.76rem; color: #64748b; line-height: 1.5; text-align: center;">If you did not make this request, you can safely ignore this email. Do not share this code with anyone.</p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`OTP Email successfully sent to ${to}: ${otpCode}`);
    return info;
  } catch (err) {
    // If SMTP fails (credentials not set up in env yet), print to console so development is not blocked!
    console.log(`\n⚠️  [SMTP Mail Fail]: Could not send email automatically to ${to}.`);
    console.log(`👉 Development OTP Code: [ ${otpCode} ] (Use this to bypass)\n`);
    return null;
  }
};

const sendInvitationEmail = async ({ to, cc, bcc, subject, html, attachments, adminName }) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"${adminName} - T&P Cell" <${process.env.SENDER_EMAIL}>`,
    to,
    cc,
    bcc,
    subject,
    html,
    attachments
  };

  const info = await transporter.sendMail(mailOptions);
  return info;
};

module.exports = { sendDispatchEmail, sendOtpEmail, sendInvitationEmail };