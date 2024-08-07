const express = require("express");
const { PrismaClient } = require("@prisma/client");
const router = express.Router();
const path = require("path");


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

/* Marks Model */

// Marks Add
router.post("/add", async (req, res) => {
    const { studentName, standard, examinationType, marks } = req.body;
  
    try {
      const student = await prisma.student.findFirst({
        where: { fullName: studentName, standard },
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
    const{rollNo , standard } = req.query;
    try{
      const result = await prisma.student.findFirst({
        where:{
          rollNo : parseInt(rollNo),
          standard : standard
        },
        include:{
          marks : true,
        }
      });
      if (!result) {
        return res.status(404).json({ message: "Student not found" });
      }
      res.status(200).json(JSON.stringify({result}, jsonBigIntReplacer))
    }catch(error){
      console.error("Error fetching student marks:", error);
      res.status(500).json({error : error})
    }
  })


  module.exports = router;