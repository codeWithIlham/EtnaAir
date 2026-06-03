const { validationResult } = require("express-validator");

/**
 * Middleware de validation générique.
 * À utiliser après les règles express-validator dans les routes.
 * Retourne 422 si des erreurs de validation existent.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      message: "Données invalides",
      errors: errors.array().map(e => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

module.exports = validate;
