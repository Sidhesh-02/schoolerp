const Joi = require("joi");
const ParentSchema = Joi.object({
    fatherName: Joi.string().min(1).required(),
    fatherOccupation: Joi.string().min(1).required(),
    motherName: Joi.string().min(1).required(),
    motherOccupation: Joi.string().min(1).required(),
    fatherContact: Joi.string().pattern(/^\d{10,15}$/).required()
        .messages({ "string.pattern.base": "Father's contact must be a valid number" }),
    motherContact: Joi.string().pattern(/^\d{10,15}$/).required()
        .messages({ "string.pattern.base": "Mother's contact must be a valid number" }),
    address: Joi.string().min(1).required(),
});


const FeeSchema = Joi.object({
    installmentType: Joi.string().min(1).required(),
    amount: Joi.number().positive().required()
        .messages({ "number.positive": "Amount must be a positive number" }),  // Custom message for positive number validation
    amountDate: Joi.date().iso().required()
        .messages({ "date.format": "Amount date must be a valid ISO date" }),
    admissionDate: Joi.date().iso().required()
        .messages({ "date.format": "Admission date must be a valid ISO date" }),
});

const StudentSchema = Joi.object({
    fullName: Joi.string().min(1).required(),
    gender: Joi.string().valid("Male", "Female", "Other").required(),
    dateOfBirth: Joi.date().iso().required()
        .messages({ "date.format": "Date of Birth must be a valid ISO date" }),
    rollNo: Joi.string().pattern(/^\d+$/).required()
        .messages({ "string.pattern.base": "Roll number must be numeric" }),
    standard: Joi.string().min(1).required(),
    adhaarCardNo: Joi.string().pattern(/^\d{12}$/).required()
        .messages({ "string.pattern.base": "Aadhaar Card number must be exactly 12 digits" }),
    scholarshipApplied: Joi.boolean().required(),
    address: Joi.string().min(1).required(),
    photoUrl: Joi.string().uri().allow(null, "").optional(),
    remark: Joi.string().allow(null, "").optional(), 
    category: Joi.string().min(1).required(),
    caste: Joi.string().min(1).required(),
    parents: Joi.array().items(ParentSchema).min(1).required(),
    fees: Joi.array().items(FeeSchema).min(1).required(),
});

module.exports = StudentSchema;
