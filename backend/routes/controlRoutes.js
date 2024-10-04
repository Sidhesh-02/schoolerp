const express = require("express");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const fileStorage = require("../sessionManager");
const data = fileStorage.readData();
const session = data.year;

const router = express.Router();
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

function jsonBigIntReplacer(key, value) {
    if (typeof value === "bigint") {
        return value.toString();
    }
    return value;
}

async function calculateTotalPercentage(recievedData) {
    let sumPercent = 0;
    let count = 0;
    const totalPercentage = recievedData.forEach((subjectWise) => {
        sumPercent += subjectWise.percentage;
        count++;
    });
    return (sumPercent / count).toFixed(2);
}

router.post("/control/subjects", async (req, res) => {
    const { std, subjects } = req.body;

    try {
        const result = await prisma.standards.create({
            data: {
                std: std,
                subjects: {
                    create: subjects,
                }
            }
        })

        res.status(200).json(result);

    } catch (error) {
        console.log(error);
        res.status(500).json({ error });
    }
})

const promotionData = {
    sessions: {
      first: "2024-2025",
      second: "2025-2026",
      third: "2026-2027"
    },
    standards: [
      "lkg",
      "kg1",
      "kg2",
      "1st",
      "2nd",
      "3rd",
      "4th",
      "5th"
    ]
  };
  
  // Function to get the next session based on the current session
  function getNextSession(currentSession) {
    const sessionList = Object.values(promotionData.sessions);
    const currentIndex = sessionList.indexOf(currentSession);
    
    return currentIndex !== -1 && currentIndex < sessionList.length - 1
      ? sessionList[currentIndex + 1]
      : currentSession;  // Stay in the same session if at the end
  }
  
  // Function to get the next standard based on the current standard
  function getNextStandard(currentStandard) {
    const standardList = promotionData.standards;
    const currentIndex = standardList.indexOf(currentStandard);
    
    return currentIndex !== -1 && currentIndex < standardList.length - 1
      ? standardList[currentIndex + 1]
      : currentStandard;  // Stay in the same standard if at the end
  }
  
  // Function to calculate the total percentage
  async function calculateTotalPercentage(recievedData) {
    let sumPercent = 0;
    let count = recievedData.length;  // Count of subjects
  
    recievedData.forEach((subjectWise) => {
      sumPercent += subjectWise.percentage;
    });
  
    return count > 0 ? (sumPercent / count).toFixed(2) : 0;  // Avoid division by zero
  }
  
  router.post("/promotion", async (req, res) => {
    try {
       
  
      
      const studentData = await prisma.student.findMany({
        include: {
          parents: true,
          fees: true,
          marks: true  
        },
        where: {
          session: session,
        },
      });
  
      const promotedStudents = await Promise.all(
        studentData.map(async (oldStudent) => {
          const totalPercentage = await calculateTotalPercentage(oldStudent.marks);
  
          // Check if the student passed (total percentage > 50)
          const passed = totalPercentage > 50;
  
          await prisma.student.update({
            where: { id: oldStudent.id },
            data: {
              status: passed ? "Passed" : "Failed"
            }
          });
  
          // Only promote the student if they passed
          if (passed) {
            const newSession = getNextSession(oldStudent.session);
            const newStandard = getNextStandard(oldStudent.standard);
  
            // Create a new student without unique fields (like id)
            const newStudentData = {
              fullName: oldStudent.fullName,
              gender: oldStudent.gender,
              dateOfBirth: oldStudent.dateOfBirth,
              rollNo: oldStudent.rollNo,  
              standard: newStandard,  
              adhaarCardNo:oldStudent.adhaarCardNo,
              address : oldStudent.address,
              session: newSession,  
              scholarshipApplied: false,  
              remark: "",  
              status: "None",  
              parents: {
                create: oldStudent.parents.map((parent) => ({
                  fatherName: parent.fatherName,
                  fatherOccupation: parent.fatherOccupation,
                  motherName: parent.motherName,
                  motherOccupation: parent.motherOccupation,
                  fatherContact: parent.fatherContact,
                  motherContact: parent.motherContact,
                  address: parent.address,
                  // Don't copy the parent's id
                })),
              },
              fees: {
                create: oldStudent.fees.map((fee) => ({
                  title: fee.title,
                  amount: fee.amount,
                  amountDate: new Date(),  // Set new date for the new fee record
                  admissionDate: new Date(),  // Set new date for the admission
                  // Don't copy the fee's id
                })),
              },
            };
  
            // Create the new student with the modified data
            const createdStudent = await prisma.student.create({
              data: newStudentData,
            });
  
            return createdStudent;  // Return the newly created student data
          }
  
          return null;  // Return null for students who are not promoted
        })
      );
  
      // Filter out null values from promotedStudents (i.e., those who weren't promoted)
      const successfulPromotions = promotedStudents.filter(student => student !== null);
      
      res.status(200).json(JSON.stringify(successfulPromotions, jsonBigIntReplacer));  // Return all promoted students
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "An error occurred during promotion." });
    }
  });
  
  

module.exports = router;