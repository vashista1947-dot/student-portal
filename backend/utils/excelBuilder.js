const ExcelJS = require('exceljs');

const buildApplicantExcel = async (applications, companyName, role) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Applicants');

  // Define columns
  worksheet.columns = [
    { header: 'S.No', key: 'sno', width: 8 },
    { header: 'Roll Number', key: 'rollNumber', width: 18 },
    { header: 'Student Name', key: 'studentName', width: 25 },
    { header: 'Branch', key: 'branch', width: 35 },
    { header: 'Degree', key: 'degree', width: 10 },
    { header: 'Year of Passing', key: 'yearOfPassing', width: 16 },
    { header: 'College Mail', key: 'collegeMail', width: 30 },
    { header: 'Personal Mail', key: 'personalMail', width: 30 },
    { header: 'DOB', key: 'dob', width: 14 },
    { header: 'Phone', key: 'phone', width: 15 },
    { header: 'CGPA', key: 'cgpa', width: 8 },
    { header: 'Class 10th %', key: 'class10Percentage', width: 14 },
    { header: 'Class 12th %', key: 'class12Percentage', width: 14 },
    { header: 'Resume Link', key: 'resumeDriveLink', width: 45 }
  ];

  // Style header row
  worksheet.getRow(1).font = { bold: true, size: 12 };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4472C4' }
  };
  worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };

  // Add data rows
  applications.forEach((app, index) => {
    worksheet.addRow({
      sno: index + 1,
      rollNumber: app.rollNumber,
      studentName: app.studentName,
      branch: app.branch,
      degree: app.degree,
      yearOfPassing: app.yearOfPassing,
      collegeMail: app.collegeMail,
      personalMail: app.personalMail || 'N/A',
      dob: app.dob,
      phone: app.phone,
      cgpa: app.cgpa,
      class10Percentage: app.class10Percentage,
      class12Percentage: app.class12Percentage,
      resumeDriveLink: app.resumeDriveLink
    });
  });

  // Generate buffer
  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
};

module.exports = { buildApplicantExcel };