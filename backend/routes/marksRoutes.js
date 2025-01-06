const express = require("express");
const { PrismaClient } = require("@prisma/client");
const router = express.Router();
const ExcelJS = require("exceljs");
const path = require("path");

const prisma = new PrismaClient();

router.use(express.json());
router.use(express.urlencoded({ extended: true }));
router.use('/uploads', express.static(path.join(__dirname, 'uploads')));

/* Marks Model */

  router.get("/downloadMarks", async (req, res) => {
    try {
      const feeRecord = await prisma.marks.findMany();
  
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Marks");
  
      worksheet.columns = [
        { header: "id", key: "id", width: 30 },
        { header: "studentId", key: "studentId", width: 15 },
        { header: "subjectId", key: "subjectId", width: 15 },
        { header: "subjectName", key: "subjectName", width: 30 },
        { header: "examinationType", key: "examinationType", width: 20 },
        { header: "obtainedMarks", key: "obtainedMarks", width: 10 },
        { header: "totalMarks ", key: "totalMarks", width: 10 },
        { header: "percentage ", key: "percentage", width: 10 },
      ];
  
      feeRecord.forEach((record) => {
        worksheet.addRow({
          id                  : record.id,
          studentId           : record.studentId,
          subjectId           : record.subjectId,
          subjectName         : record.subjectName,
          examinationType     : record.examinationType,
          obtainedMarks       : record.obtainedMarks,
          totalMarks          : record.totalMarks,
          percentage          : record.percentage,
      })});
  
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=Marks.xlsx"
      );
      
      await workbook.xlsx.write(res);
      res.end();
    }catch (error) {
      console.error("Error generating attendance Excel file:", error);
      res.status(500).send("Failed to generate Excel file");
    }
  });

  router.post('/api/marks', async (req, res) => {
    const { studentId, subjectId, subjectName, examinationType, obtainedMarks, totalMarks, percentage } = req.body;
  
    try {
      // Save the marks data
      const result = await prisma.marks.create({
        data: {
          studentId,
          subjectId,
          subjectName,
          examinationType,
          obtainedMarks,
          totalMarks,
          percentage,
        },
      });
  
      res.status(201).json(result);
    } catch (error) {
      console.error("Error saving marks:", error);
      res.status(500).json({ error: "Failed to save marks." });
    }
  });


  module.exports = router;