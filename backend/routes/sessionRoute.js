const express = require("express");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const router = express.Router();
router.use(express.json());
router.use(express.urlencoded({ extended: true }));
const CustomError = require("../utils/customErrorHandler");
const prismaErrorHandler = require("../utils/prismaErrorHandler")
const sessionManager = require("../middleware/sessionManager")


router.post('/session', async (req, res, next) => {
    try {
        const {year} = req.body;
        if (!year) {
            throw new CustomError("Year is Required",400);
        }
        const session = await prisma.session.create({
            data: { year },
        });
        return res.status(200).json({ success: true, message: 'Year Successfully Added', session });
    } catch (error) {
        error = prismaErrorHandler(error);
        next(error); 
    }
});

router.get('/getSessions',async(req,res,next)=>{
    try{
        const fetchSession = await prisma.session.findMany();
        return res.status(200).json(fetchSession)
    }catch(error){
        error = prismaErrorHandler(error);
        next(error);
    }
})
router.get('/setSession', (req, res,next) => {
    try {
        const { year } = req.query;
        if (!year) {
            throw new CustomError("Year is Required",400);
        }
        // Add further validation for `year` if necessary
        sessionManager.setSession(year);
        res.status(200).json({ message: `Session set to ${year}` });
    } catch (error) {
        error = prismaErrorHandler(error);
        next(error)
    }
});


module.exports = router;