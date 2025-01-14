const Ajv = require("ajv");

const Result = require("../utils/result");
const schemaTemplate = require("../../schemas/schema.json");

const validate = (data, requiredLanguages, optionalLanguages) => {
  return validateData(
    generateSchema(requiredLanguages, optionalLanguages),
    data
  );
};

const validateData = (schema, data) => {
  const validator = new Ajv({ jsonPointers: true });
  const valid = validator.validate(schema, data);
  if (valid) {
    return Result.success({});
  } else {
    return Result.error("❌ Your Localicipe contains some issues.", {
      allErrors: validator.errors.map(
        error => `Entry ${error.dataPath} ${error.message}`
      )
    });
  }
};

const generateSchema = (requiredLanguages, optionalLanguages) => {
  let schema = schemaTemplate;

  if (optionalLanguages === undefined) {
    schema["definitions"]["Translation"][
      "properties"
    ] = requiredLanguages.reduce((acc, language) => {
      acc[language] = { type: "string" };
      return acc;
    }, {});
    schema["definitions"]["Translation"]["required"] = requiredLanguages;
    schema["definitions"]["Translation"]["additionalProperties"] = {
      type: "string"
    };
  } else {
    schema["definitions"]["Translation"][
      "properties"
    ] = requiredLanguages.concat(optionalLanguages).reduce((acc, language) => {
      acc[language] = { type: "string" };
      return acc;
    }, {});
    schema["definitions"]["Translation"]["required"] = requiredLanguages;
  }

  return schema;
};

module.exports = validate;
