import { schoolTreeViewConfigs } from "utils/configEditor.js";
import { labels } from "utils/constants";

export function tenureSequenceTag(sequenceID, groupOption) {
  //console.log("sequenceID", sequenceID);
  const latestYearClass = sequenceID.split(":")[1];
  const latestYear = parseInt(latestYearClass.split("-")[0].split("/")[0]);
  const latestGrade = latestYearClass.split("-")[1].replace(/\D/g, "");
  const classLetter = latestYearClass.split("-")[1].replace(/\d/g, "");

  var tenureInitialGrade, tenureInitialYear, tenureFinalGrade, tenureFinalYear;
  if (groupOption === labels.groupByNineYear) {
    tenureInitialGrade = 1;
    tenureInitialYear = latestYear + tenureInitialGrade - latestGrade;
    tenureFinalGrade = 9;
    tenureFinalYear = tenureInitialYear + 8;
  } else if (groupOption === labels.groupByThreeYear) {
    tenureInitialGrade = 3 * (Math.ceil(latestGrade / 3) - 1) + 1;
    tenureInitialYear = latestYear + tenureInitialGrade - latestGrade;
    tenureFinalGrade = tenureInitialGrade + 2;
    tenureFinalGrade = tenureInitialGrade + 2;
  } else if (groupOption === labels.groupBySchoolYear) {
    return latestYearClass;
  } else if (groupOption === labels.groupByTrajectory) {
    return latestYearClass;
  }

  const schoolEntryYear = latestYear - latestGrade + 1;
  const schoolGraduationYear = 9 + schoolEntryYear - 1;

  const params = {
    classLetter,
    latestYear,
    latestGrade,
    tenureInitialYear,
    tenureInitialGrade,
    tenureFinalYear,
    tenureFinalGrade,
    schoolEntryYear,
    schoolGraduationYear,
  };

  const formatTemplate = convertToTemplate(
    schoolTreeViewConfigs().tenureTagFormat.tenureTemplate,
    params
  );

  const result = sequenceTagFormatter(
    params,
    formatTemplate
    //`${tenureInitialYear}-${tenureInitialGrade}${classLetter} to ${latestYear}-${latestGrade}${classLetter}`
  );

  return result;

  //return `${tenureInitialYearClass} to ${latestYearClass}`;
}

function sequenceTagFormatter(params, formatString) {
  return formatString.replace(/\${(\w+)}/g, (match, paramName) => {
    const index = params.findIndex((param) => param === paramName);
    return params[index];
  });
}

function convertToTemplate(templateStr, params) {
  // Evaluate the template string within the current scope
  // Use new Function to create a sandboxed function that evaluates the template with local variables
  const {
    classLetter,
    latestYear,
    latestGrade,
    tenureInitialYear,
    tenureInitialGrade,
    tenureFinalYear,
    tenureFinalGrade,
    schoolEntryYear,
    schoolGraduationYear,
  } = params;

  return eval("`" + templateStr + "`");
}
