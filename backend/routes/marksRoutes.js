const express = require("express");
const { PrismaClient } = require("@prisma/client");
const router = express.Router();
const ExcelJS = require("exceljs");
const path = require("path");

const fileStorage = require("../sessionManager");
const data = fileStorage.readData();
const session = data.year;

const prisma = new PrismaClient();

router.use(express.json());
router.use(express.urlencoded({ extended: true }));
router.use('/uploads', express.static(path.join(__dirname, 'uploads')));

function jsonBigIntReplacer(key, value) {
    if (typeof value === "bigint") {
      return value.toString();
    }
    return value;
}

async function calculateTotalPercentage(recievedData){
    let sumPercent = 0;
    let count = 0;
    const totalPercentage = recievedData.forEach((subjectWise) => {
        sumPercent += subjectWise.percentage;
        count++;
    });
    return (sumPercent/count).toFixed(2);
}
/* Marks Model */

// Marks Add
router.post("/add", async (req, res) => {
    const { studentName, standard, examinationType, marks } = req.body;
  
    try {
      const student = await prisma.student.findFirst({
        where: { fullName: studentName, standard, session: session },
      });
  
      if (!student) {
        return res.status(400).json({ error: "Student not found" });
      }
  
      const newMarks = await Promise.all(
        marks.map(async (mark) => {
          const { subjectId, subjectName, obtainedMarks, totalMarks } = mark;
          const percentage = (obtainedMarks / totalMarks) * 100;
  
          return await prisma.marks.create({
            data: {
              studentId: student.id,
              subjectId,
              subjectName,
              examinationType,
              obtainedMarks,
              totalMarks,
              percentage,
            },
          });
        })
      );
  
      res.status(201).json(newMarks);
    } catch (error) {
      console.error("Error adding marks:", error);
      res.status(500).json({ error: "Error adding marks" });
    }
  });
  
  router.get("/marks/search", async(req,res)=>{
    const{param , standard } = req.query;
    try{
      let result;
      if (/^\d+$/.test(param)){
        result = await prisma.student.findFirst({
          where:{
            rollNo : parseInt(param),
            standard : standard,
            session: session
          },
          include:{
            marks : true,
          }
        });
      }else{
        result = await prisma.student.findFirst({
          where:{
            rollNo : param,
            standard : standard,
            session: session
          },
          include:{
            marks : true,
          }
        });
      }
      const totalpercentage = await calculateTotalPercentage(result.marks)
      
      if (!result) {
        return res.status(404).json({ message: "Student not found" });
      }
      res.status(200).json(JSON.stringify({result,totalpercentage}, jsonBigIntReplacer));
    }catch(error){
      console.error("Error fetching student marks:", error);
      res.status(500).json({error : error})
    }
  })

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


  module.exports = router;