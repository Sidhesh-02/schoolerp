const express = require("express");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

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

router.post("/control/standard", async (req, res) => {
  const { std } = req.body;
  try {
    const result = await prisma.standards.create({
        data: {
            std: std,
            // subjects:{create:subjects}
        }
    })
    res.status(200).json(result);

  } catch (error) {
      console.log(error);
      res.status(500).json({ error });
  }
})

router.post("/control/subjects", async (req, res) => {
  const { std, subjects } = req.body;

  if (!std || !Array.isArray(subjects) || subjects.length === 0) {
    return res.status(400).json({ error: "Invalid input data" });
  }

  try {
    // Fetch the standard by `std`
    const standard = await prisma.standards.findUnique({
      where: { std }, // Find by `std`, not `id`
    });

    if (!standard) {
      return res.status(404).json({ error: "Standard not found" });
    }

    // Create subjects linked to the standard
    const result = await prisma.subject.createMany({
      data: subjects.map((subject) => ({
        name: subject.name,
        stdId: std, // Link by `std` as defined in the schema
      })),
    });

    res.status(200).json({ message: "Subjects created successfully", result });
  } catch (error) {
    console.error("Error creating subjects:", error);
    res.status(500).json({ error: "An error occurred while creating subjects" });
  }
});



const promotionData = {
    sessions: {
      first: "2024-2025",
      second: "2025-2026",
      third: "2026-2027"
    },
    standards: [
      "LKG",
      "UKG",
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
    const session = req.session;
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
              category:oldStudent.category,
              caste:oldStudent.caste, 
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
                })),
              },
            
            };
            
            
            // Create the new student with the modified data
            const existingStudent = await prisma.student.findUnique({
              where: {
                standard_rollNo_session: {
                  standard: newStandard,
                  rollNo: oldStudent.rollNo,
                  session: newSession,
                },
              },
            });
            
            if (!existingStudent) {
              const createdStudent = await prisma.student.create({
                data: newStudentData,
              });
              return createdStudent; // Return the newly created student data
            }
            

            return null;
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

  router.post("/handleInstallments",async(req,res)=>{
      const installment = req.body;
      console.log("Backend ",installment)
      if(!installment){
        return res.status(400).json({error:"Enter Valid Data"});
      }
      const postResult = await prisma.installments.create({
        data: {
          installments: installment.installment,
        }
    });
      if(postResult){
        return res.status(200).json({postResult});
      }
  })
  
  router.get("/getInstallments",async(req,res)=>{
    const installmentsData = await prisma.installments.findMany();
    if(!installmentsData){
      return res.status(400).json({error:"No data found"});
    }
    return res.status(200).json(installmentsData);
  })

  // Update the installment
  router.post("/updateinstallment", async (req, res) => {
  const { updatedInstallment,updatedInstallment2 } = req.body;
  if (!updatedInstallment || !updatedInstallment2) {
    return res.status(400).json({ error: "ID and Installment are required" });
  }
  
  try {
    const existingInstallment = await prisma.installments.findUnique({
      where: {installments:updatedInstallment },
    });

    if (!existingInstallment) {
      return res.status(404).json({ error: "Installment not found" });
    }

    const updatedStatus = await prisma.installments.update({
      where: { installments: updatedInstallment },
       data: { installments: updatedInstallment2 },
    });

    return res.status(200).json({ updatedStatus });

  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Server Error" });
  }
});

router.put("/updateStandard", async (req, res) => {
  
  const { prevStandard, newStandard } = req.body
  try {
    const existingStandard = await prisma.standards.findFirst({
      where: { std: prevStandard },
    });

    if (!existingStandard) {
      return res.status(404).json({ message: "Standard not found" });
    }

    // Update the standard
    const updatedStandard = await prisma.standards.update({
      where: { std: prevStandard },
      data: { std: newStandard },
    });

    //  return  res.status(200).json(updatedStandard);
    if (!updatedStandard) {
      return res.status.json("Error Updating")
    }

    return res.status.json("Success")

  }
  catch (err) {
    res.status(201).json(err)
  }


})

router.put("/updateSubject", async (req, res) => {
  
  const { prevSubject, updatedSubject, dropdownStandardChange2 } = req.body
  console.log(prevSubject,updatedSubject,dropdownStandardChange2);
  try {
  
    // Update the standard
    const updatedStandard = await prisma.subject.update({
      where: { 
        stdId: dropdownStandardChange2,
        name:prevSubject,
      },
      data:{
        name : updatedSubject
      }
    });
    console.log("Status",updatedStandard);
    //  return  res.status(200).json(updatedStandard);
    if (!updatedStandard) {
      return res.status.json("Error Updating")
    }

    return res.status.json("Success")

  }
  catch (err) {
    res.status(201).json(err)
  }


})


module.exports = router;