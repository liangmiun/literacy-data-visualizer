import { csvParse } from "d3";
import {
  initial_principal_preset,
  initial_teacher_preset,
  latest_preset,
  updateLatestPreset,
} from "../contents/InitialPreset.js";
import { USER_TYPE } from "../utils/constants.js";
import { rowParser, preset_dict, isDateFieldString } from "./Utils.js";

// Function to update the preset configuration based on current state values
const updatePreset = (setters) => {
  // Directly modify the passed preset object
  const {
    xField,
    yField,
    colorField,
    selectedClasses,
    checkedOptions,
    rangeOptions,
    query,
    expression,
    isClassView,
    showLines,
    aggregateType,
  } = setters;
  preset_dict.xField = xField;
  preset_dict.yField = yField;
  preset_dict.colorField = colorField;
  preset_dict.selectedClasses = selectedClasses;
  preset_dict.checkedOptions = checkedOptions;
  preset_dict.rangeOptions = rangeOptions;
  preset_dict.query = query;
  preset_dict.expression = expression;
  preset_dict.isClassView = isClassView;
  preset_dict.showLines = showLines;
  preset_dict.aggregateType = aggregateType;
};

// Function to apply a preset configuration to the app's state
export const setConfigFromPreset = (setters) => {
  //preset

  return (preset) => {
    const {
      setXField,
      setYField,
      setColorField,
      setSelectedClasses,
      setCheckedOptions,
      setRangeOptions,
      setQuery,
      setExpression,
      setIsClassView,
      setShowLines,
      setAggregateType,
    } = setters;

    setXField(preset.xField);
    setYField(preset.yField);
    setColorField(preset.colorField);
    setSelectedClasses(preset.selectedClasses);
    setCheckedOptions(preset.checkedOptions);
    setRangeOptions(preset.rangeOptions);
    setQuery(preset.query);
    setExpression(preset.expression);
    setIsClassView(preset.isClassView);
    setShowLines(preset.showLines);
    setAggregateType(preset.aggregateType);
  };
};

// Function to save the current configuration as a downloadable JSON file
export const saveConfig = (saveSetters) => {
  return () => {
    updatePreset(saveSetters);
    const stringified = JSON.stringify(preset_dict);
    const dataStr =
      "data:text/json;charset=utf-8," + encodeURIComponent(stringified);
    updateLatestPreset(stringified);
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);

    const fileName = prompt(
      "Please enter the desired filename",
      "preset_config.json"
    );

    if (fileName) {
      downloadAnchorNode.setAttribute("download", fileName);
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
    }
  };
};

export const handleFileUpload = (event, setters) => {
  const { setData, setLogicFilteredtData } = setters;
  console.log("handleFileUpload");
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const csvData = e.target.result;
      const parsedData = await csvParse(csvData, rowParser);
      setData(parsedData);
      setLogicFilteredtData(parsedData);
    };
    reader.readAsText(file);
  }
};

export const handleResetToOnboarding = (
  configSetters,
  userType,
  teacherChoice
) => {
  return () => {
    console.log("handleReset userType ", userType);

    var initial_preset;

    if (userType === USER_TYPE.principal) {
      initial_preset = initial_principal_preset;
    } else {
      // Parsing the initial preset to make it mutable and to use its structure
      const parsedPreset = JSON.parse(initial_teacher_preset);

      // Creating a new preset based on the initial one but with modified selectedClasses
      const newPreset = {
        ...parsedPreset, // Spread the existing properties to retain them (e.g., xField)
        selectedClasses: [
          {
            school: teacherChoice.school,
            schoolYear: teacherChoice.year,
            class: teacherChoice.class,
          },
        ],
      };

      // Convert the new preset object back to a JSON string if needed
      initial_preset = JSON.stringify(newPreset);
    }

    handleResetToTarget(initial_preset, configSetters);
  };
};

export const handleResetToLatest = (configSetters) => {
  return () => {
    handleResetToTarget(latest_preset, configSetters);
  };
};

const handleResetToTarget = (preset, configSetters) => {
  let parsed = JSON.parse(preset, (key, value) => {
    if (isDateFieldString(key)) return value.map((v) => new Date(v));
    return value;
  });
  setConfigFromPreset(configSetters)(parsed);
};
