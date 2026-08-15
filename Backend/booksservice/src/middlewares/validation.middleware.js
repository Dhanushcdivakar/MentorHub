import ApiError from "../utils/ApiError.js";

const validate = (schema, property = "body") => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      return next(
        new ApiError(
          400,
          "Validation Failed",
          error.details.map((err) => err.message),
        ),
      );
    }

    req[property] = value;

    next();
  };
};

export default validate;
