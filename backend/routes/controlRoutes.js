const express = require("express");
const {PrismaClient} = require("@prisma/client");
const prisma = new PrismaClient();

const router = express.Router();
router.use(express.json());
router.use(express.urlencoded({extended : true}));


router.post("/control/subjects", async(req,res)=>{
    const {std , subjects} = req.body;
    try{
        const result = await prisma.standards.create({
            data :{
                std : std,
                subjects :{
                    create : subjects,
                }
            }
        })

        console.log(result);
        res.status(200).json(result);

    }catch(error){
        console.log(error);
        res.status(500).json({error});
    }
})

module.exports = router;