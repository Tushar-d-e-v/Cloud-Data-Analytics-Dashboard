import Joi from 'joi';

export const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

export const datasetUploadSchema = Joi.object({
  datasetName: Joi.string().min(1).max(100).required(),
  timeColumn: Joi.string().optional(),
  metricColumn: Joi.string().optional()
});

export const analyticsRunSchema = Joi.object({
  datasetId: Joi.string().required(),
  metric: Joi.string().required()
});

export const validateRequest = (schema: Joi.ObjectSchema) => {
  return (req: any, res: any, next: any) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        details: error.details[0].message
      });
    }
    next();
  };
};