import * as d3 from "d3";
import React, { useState, useMemo, useEffect, useCallback } from "react";
import AxisSelectionCanvas from "../layouts/AxisSelectionCanvas";
import AggregateCanvas from "../layouts/AggregateCanvas";
import ScatterCanvas from "../layouts/ScatterCanvas";
import DetailCanvas from "../layouts/DetailCanvas";
import FilterCanvas from "../layouts/FilterCanvas";
import LogicCanvas from "../layouts/LogicCanvas";
import {
  generateSchoolLastingClassMap,
  generateSchoolClassColorScale,
} from "../../utils/Utils.js";
import "assets/App.css";

const ScatterPage = (props) => {
  const {
    data,
    logicFilteredData,
    isClassView,
    setIsClassView,
    aggregateType,
    setAggregateType,
    selectedClasses,
    setSelectedClasses,
    xField,
    yField,
    rangeOptions,
    checkedOptions,
  } = props;
  const trends = {
    all: "all",
    overall_decline: "overall decline",
    logarithmic_decline: "logarithmicly decline",
    last_time_decline: "last time decline",
  };
  const [clickedRecords, setClickedRecords] = useState([]);
  const [trend, setTrend] = useState(trends.all);
  const [selectedClassDetail, setSelectedClassDetail] = useState([]);
  const [studentsChecked, setStudentsChecked] = useState(false);
  const [connectIndividual, setConnectIndividual] = useState(false);
  const [schoolClassesAndColorScale, setSchoolClassesAndColorScale] = useState({
    schoolClasses: {},
    colorScale: {},
  });
  const [allClasses, setAllClasses] = useState([]);
  const [declineSlopeThreshold, setDeclineSlopeThreshold] = useState(0);
  const [diffThreshold, setDiffThreshold] = useState(0);
  const [dataToShow, setDataToShow] = useState([]);
  const [minDeclineThreshold, setMinDeclineThreshold] = useState(-1);
  const [filterList, setFilterList] = useState([]);
  const [emptyFilterOptions, setEmptyFilterOptions] = useState({});
  const [groupOption, setGroupOption] = useState("9-year tenure");
  const [triggerRenderByConfig, setTriggerRenderByConfig] = useState(false);

  useEffect(() => {
    if (Object.keys(data).length > 0) {
      const nonNullLexploreData = data.filter(
        (d) => d["Lexplore Score"] !== null
      );
      const newSchoolClasses = generateSchoolLastingClassMap(
        nonNullLexploreData,
        groupOption
      );
      const newClassColorScale =
        generateSchoolClassColorScale(newSchoolClasses).classColor;
      setSchoolClassesAndColorScale({
        schoolClasses: newSchoolClasses,
        colorScale: newClassColorScale,
      });
    }
  }, [data, groupOption]);

  useEffect(() => {
    let allClassesList = [];
    for (const [school, classesMap] of Object.entries(
      schoolClassesAndColorScale.schoolClasses
    )) {
      for (const sequence of Object.values(classesMap)) {
        for (const yearlyClass of Object.values(sequence.classes)) {
          allClassesList.push({
            school: school,
            schoolYear: yearlyClass.Läsår,
            class: yearlyClass.Klass,
          });
        }
      }
    }
    setAllClasses(allClassesList);
  }, [schoolClassesAndColorScale]);

  useEffect(() => {
    if (Object.keys(logicFilteredData).length > 0) {
      setDataToShow(logicFilteredData);
    }
  }, [logicFilteredData]);

  const triggerRenderByConfigChange = () => {
    setTriggerRenderByConfig(!triggerRenderByConfig);
  };

  const handleClassColorPaletteClick = (school, sequenceID, newColor) => {
    setSchoolClassesAndColorScale((prevState) => {
      // Extracting the current state of schoolClasses and colorScale
      const { schoolClasses, colorScale } = prevState;
      const prevClasses = colorScale[school] || {};
      const updatedClasses = { ...prevClasses, [sequenceID]: newColor };
      // Returning the new state with the updated colorScale and unchanged schoolClasses
      return {
        schoolClasses: schoolClasses, // keeping the existing schoolClasses unchanged
        colorScale: { ...colorScale, [school]: updatedClasses }, // updating the colorScale
      };
    });
  };

  const handleTrendOptionChange = (optionValue) => {
    setTrend(optionValue);
    const threshold =
      optionValue === trends.overall_decline
        ? declineSlopeThreshold
        : diffThreshold;
    filterWithTrendThreshold(optionValue, threshold);
  };

  const filterWithTrendThreshold = (optionValue, threshold) => {
    if (optionValue === trends.overall_decline) {
      const linearDeclined = linearDeclinedData(logicFilteredData, threshold);
      setMinDeclineThreshold(linearDeclined.minSlope);
      setDataToShow(linearDeclined.data);
    } else if (optionValue === trends.logarithmic_decline) {
      const logarithmicDeclined = logarithmicDeclinedData(
        logicFilteredData,
        threshold
      );
      setMinDeclineThreshold(logarithmicDeclined.minCoeff);
      setDataToShow(logarithmicDeclined.data);
    } else if (optionValue === trends.last_time_decline) {
      const lastTimeDeclined = lastTimeDeclinedData(
        logicFilteredData,
        threshold
      );
      setMinDeclineThreshold(lastTimeDeclined.minDiff);
      setDataToShow(lastTimeDeclined.data);
    } else {
      setDataToShow(logicFilteredData);
    }
  };

  const checkedFilteredData = useCallback(
    (data) => {
      // filterList is the filters that are not disabled by 'x' button.
      return data.filter((record) => {
        for (let key in checkedOptions) {
          if (
            filterList.includes(key) &&
            !checkedOptions[key].includes(record[key])
          ) {
            return false;
          }
        }
        return true;
      });
    },
    [checkedOptions, filterList]
  );

  const rangeFilteredData = useCallback(
    (data) => {
      return data.filter((record) => {
        for (let key in rangeOptions) {
          const [min, max] = rangeOptions[key];
          if (
            filterList.includes(key) &&
            !(record[key] >= min && record[key] <= max)
          ) {
            return false;
          }
        }
        return true;
      });
    },
    [rangeOptions, filterList]
  );

  const shownData = useMemo(() => {
    console.log("run shownData,   ");

    const nonNullData = dataToShow.filter(
      (d) => d[xField] !== null && d[yField] !== null
    );
    return checkedFilteredData(
      rangeFilteredData(schoolClassFilteredData(nonNullData, selectedClasses))
    );
  }, [
    dataToShow,
    xField,
    yField,
    selectedClasses,
    checkedFilteredData,
    rangeFilteredData,
  ]);

  // useEffect(() => {
  //   // Decide which filter options are made empty based on the shownData
  //   // Define the labels and their options
  //   const labelsWithOptions = {
  //     Årskurs: [1, 2, 3, 4, 5, 6, 7, 8, 9],
  //     Läsår: ["18/19", "19/20", "20/21", "21/22", "22/23"],
  //     Stanine: [1, 2, 3, 4, 5, 6, 7, 8, 9],
  //   };

  //   // Initialize emptyOptions with labels as keys and empty arrays as values
  //   let newEmptyOptions = Object.keys(labelsWithOptions).reduce(
  //     (acc, label) => {
  //       acc[label] = [];
  //       return acc;
  //     },
  //     {}
  //   );

  //   // Iterate through each label and its options
  //   Object.entries(labelsWithOptions).forEach(([label, options]) => {
  //     options.forEach((option) => {
  //       // Check if there's no record in shownData with the current label and option
  //       const isOptionMissing = !shownData.some(
  //         (recordX) => recordX[label] === option
  //       );
  //       if (isOptionMissing) {
  //         // If the option is missing, add it to the respective label in newEmptyOptions
  //         newEmptyOptions[label].push(option);
  //       }
  //     });
  //   });

  //   // Update the emptyOptions state with newEmptyOptions
  //   setEmptyFilterOptions(newEmptyOptions);
  // }, [shownData]);

  useEffect(() => {
    // Decide which filter options are made empty based on the shownData
    // Define the labels and their options
    const labelsWithOptions = {
      Årskurs: [1, 2, 3, 4, 5, 6, 7, 8, 9],
      Läsår: ["18/19", "19/20", "20/21", "21/22", "22/23"],
      Stanine: [1, 2, 3, 4, 5, 6, 7, 8, 9],
      Klasses: allClasses,
    };

    // Initialize emptyOptions with labels as keys and empty arrays as values
    let newEmptyOptions = Object.keys(labelsWithOptions).reduce(
      (acc, label) => {
        acc[label] = [];
        return acc;
      },
      {}
    );

    const nonNullData = dataToShow.filter(
      (d) => d[xField] !== null && d[yField] !== null
    );
    // const dataToProcess = rangeFilteredData(
    //   schoolClassFilteredData(nonNullData, selectedClasses)
    // );

    const dataToProcess = rangeFilteredData(nonNullData);

    function findRecordWithExceptionAndOthersChecked(
      data,
      exceptionKey,
      exceptionValue
    ) {
      //const exceptionKey = Object.keys(exceptionOption)[0]; // Assuming only one key-value pair in exceptionOption
      if (exceptionKey !== "Klasses") {
        return data.some((record) => {
          // Check exceptionOption first
          if (record[exceptionKey] !== exceptionValue) {
            return false; // Skip this record if it does not match the exceptionOption
          }

          // Check other options
          const meetOtherOptionRequests =
            Object.entries(checkedOptions).every(([key, value]) => {
              // Skip checking for exceptionOption's key
              if (key === exceptionKey) return true;
              // Check if record's value for the key is within the checked options
              return value.includes(record[key]);
            }) &&
            selectedClasses.some(
              (item) =>
                item.school === record.Skola &&
                item.schoolYear === record.Läsår &&
                item.class === record.Klass
            );

          return meetOtherOptionRequests;
        });
      } else {
        return data.some((record) => {
          // Check exceptionOption first
          if (
            record["Skola"] !== exceptionValue["school"] ||
            record["Läsår"] !== exceptionValue["schoolYear"] ||
            record["Klass"] !== exceptionValue["class"]
          ) {
            return false; // Skip this record if it does not match the exceptionOption
          }

          // Check other options
          const meetOtherOptionRequests = Object.entries(checkedOptions).every(
            ([key, value]) => {
              return value.includes(record[key]);
            }
          );

          return meetOtherOptionRequests;
        });
      }
    }

    // Iterate through each label and its options
    Object.entries(labelsWithOptions).forEach(([label, options]) => {
      options.forEach((option) => {
        // Check if there's no record in shownData with the current label and option
        const hasRecordInfluencedByThisOption =
          findRecordWithExceptionAndOthersChecked(
            dataToProcess,
            label,
            option
            // { [label]: option }
          );

        const isOptionWithEmptyRecords = !hasRecordInfluencedByThisOption;

        if (isOptionWithEmptyRecords) {
          // If the option is missing, add it to the respective label in newEmptyOptions
          newEmptyOptions[label].push(option);
        }
      });
    });

    // Update the emptyOptions state with newEmptyOptions
    setEmptyFilterOptions(newEmptyOptions);
  }, [
    dataToShow,
    xField,
    yField,
    selectedClasses,
    checkedOptions,
    rangeFilteredData,
    allClasses,
  ]);

  return (
    <div className="app">
      <AxisSelectionCanvas
        data={data}
        fields_x={props.fields_x}
        fields_y={props.fields_y}
        xField={props.xField}
        yField={props.yField}
        seasonField={props.seasonField}
        colorField={props.colorField}
        onXFieldChange={props.setXField}
        onYFieldChange={props.setYField}
        onSeasonFieldChange={props.setSeasonField}
        onColorFieldChange={props.setColorField}
        save={props.save}
        load={props.load}
        setConfig={props.setConfigFromPreset}
        studentsChecked={studentsChecked}
        setStudentsChecked={setStudentsChecked}
        connectIndividual={connectIndividual}
        setConnectIndividual={setConnectIndividual}
        aggregateType={aggregateType}
        setAggregateType={setAggregateType}
        trendSet={trends}
        trend={trend}
        onTrendChange={handleTrendOptionChange}
        handleFileUpload={props.handleFileUpload}
        showLines={props.showLines}
        setShowLines={props.setShowLines}
        isClassView={isClassView}
        setIsClassView={setIsClassView}
        declineSlope={declineSlopeThreshold}
        setDeclineSlope={setDeclineSlopeThreshold}
        minDeclineThreshold={minDeclineThreshold}
        diffThreshold={diffThreshold}
        setDiffThreshold={setDiffThreshold}
        filterWithTrendThreshold={filterWithTrendThreshold}
        handleResetToOnboarding={props.handleResetToOnboarding}
        handleResetToLatest={props.handleResetToLatest}
        triggerRenderByConfigChange={triggerRenderByConfigChange}
      />

      {isClassView ? (
        <AggregateCanvas
          shownData={shownData}
          selectedClasses={selectedClasses}
          seasonField={props.seasonField}
          yField={props.yField}
          colorField={props.colorField}
          onPartClick={setSelectedClassDetail}
          studentsChecked={studentsChecked}
          connectIndividual={connectIndividual}
          aggregateType={aggregateType}
          classColors={schoolClassesAndColorScale.colorScale}
          showLines={props.showLines}
          groupOption={groupOption}
          triggerRenderByConfig={triggerRenderByConfig}
        />
      ) : (
        <ScatterCanvas
          shownData={shownData}
          xField={props.xField}
          yField={props.yField}
          colorField={props.colorField}
          setSelectedRecords={setClickedRecords}
          showLines={props.showLines}
        />
      )}

      <DetailCanvas
        data={isClassView ? selectedClassDetail : clickedRecords}
        keyList={isClassView ? classKeyList : studentKeyList}
      />

      <FilterCanvas
        data={data}
        fields={props.fields}
        allClasses={allClasses}
        selectedClasses={selectedClasses}
        setSelectedClasses={setSelectedClasses}
        rangeOptions={props.rangeOptions}
        setRangeOptions={props.setRangeOptions}
        checkedOptions={props.checkedOptions}
        setCheckedOptions={props.setCheckedOptions}
        setFilterList={setFilterList}
        isClassView={isClassView}
        school_class_map={schoolClassesAndColorScale.schoolClasses}
        onColorPaletteClick={handleClassColorPaletteClick}
        classColors={schoolClassesAndColorScale.colorScale}
        emptyFilterOptions={emptyFilterOptions}
        groupOption={groupOption}
        setGroupOption={setGroupOption}
      />

      <LogicCanvas
        fields={props.fields}
        data={data}
        setLogicFilteredData={props.setLogicFilteredData}
        expression={props.expression}
        setExpression={props.setExpression}
        query={props.query}
        setQuery={props.setQuery}
      />
    </div>
  );
};

function schoolClassFilteredData(data, selectedClasses) {
  return data.filter((record) => {
    if (
      selectedClasses.some(
        (item) =>
          item.school === record.Skola &&
          item.schoolYear === record.Läsår &&
          item.class === record.Klass
      )
    ) {
      return true;
    }
    return false;
  });
}

const studentKeyList = [
  "Skola",
  "Årskurs",
  "Klass",
  "ElevID",
  "Födelsedatum",
  "Läsår",
  "Testdatum",
  "Standardpoäng",
  "Lexplore Score",
];

const classKeyList = [
  // 'lastingclass',
  "school",
  "class",
  "season",
  "min",
  "q1",
  "median",
  "q3",
  "max",
  "count",
];

function linearDeclinedData(data, declineSlopeThreshold) {
  // 1. Parse Testdatum to a numeric format (e.g., timestamp) if it's not already numeric
  const millisecondsPerDay = 86400000;
  data.forEach((d) => {
    d.numericTestdatum = +new Date(d.Testdatum) / millisecondsPerDay;
  });

  data = data.filter(
    (d) => d.numericTestdatum !== null && d["Lexplore Score"] !== null
  );

  // 2. Group data by ElevID
  const groupedData = d3.group(data, (d) => d.ElevID);

  // 3. For each group, calculate the slope of the regression line
  const declinedGroups = [];
  var minSlope = 0; //-0.1
  groupedData.forEach((group, elevId) => {
    const x = group.map((d) => d.numericTestdatum);
    const y = group.map((d) => d["Lexplore Score"]);
    const slope = calculateSlope(x, y);

    if (slope < minSlope) {
      minSlope = slope;
    }

    // If slope is negative, it indicates a decline
    if (slope < declineSlopeThreshold) {
      declinedGroups.push(group);
    }
  });

  // 4. Flatten the array of declined groups to get a single array of declined data records
  minSlope = parseFloat(minSlope.toFixed(2));
  const declinedData = [].concat(...declinedGroups);

  return { data: declinedData, minSlope: minSlope };
}

function logarithmicDeclinedData(data, declineCoeffThreshold) {
  // 1. Parse Testdatum to a numeric format if it's not already numeric
  const millisecondsPerDay = 86400000;
  data.forEach((d) => {
    d.numericTestdatum = +new Date(d.Testdatum) / millisecondsPerDay;
  });

  data = data.filter(
    (d) => d.numericTestdatum !== null && d["Lexplore Score"] !== null
  );

  // 2. Group data by ElevID
  const groupedData = d3.group(data, (d) => d.ElevID);

  // 3. For each group, fit a logarithmic model and calculate its coefficient
  const declinedGroups = [];
  var minCoeff = 0;
  groupedData.forEach((group, elevId) => {
    const x = group.map((d) => Math.log(d.numericTestdatum));
    const y = group.map((d) => d["Lexplore Score"]);
    const { coeffA } = fitLogarithmicModel(x, y);

    if (coeffA < minCoeff) {
      minCoeff = coeffA;
    }

    // If coeffA is negative and below the threshold, it indicates a decline
    if (coeffA < declineCoeffThreshold) {
      declinedGroups.push(group);
    }
  });

  // 4. Flatten the array of declined groups to get a single array of declined data records
  minCoeff = parseFloat(minCoeff.toFixed(2));
  const declinedData = [].concat(...declinedGroups);

  return { data: declinedData, minCoeff: minCoeff };
}

function fitLogarithmicModel(x, y) {
  // Transform x values
  const lnX = x.map((value) => Math.log(value));

  // Calculate means
  const meanX = lnX.reduce((acc, val) => acc + val, 0) / lnX.length;
  const meanY = y.reduce((acc, val) => acc + val, 0) / y.length;

  // Calculate coefficients a and b for the model y = a * log(x) + b
  let num = 0;
  let den = 0;
  for (let i = 0; i < lnX.length; i++) {
    num += (lnX[i] - meanX) * (y[i] - meanY);
    den += (lnX[i] - meanX) ** 2;
  }

  const coeffA = num / den;
  const coeffB = meanY - coeffA * meanX;

  return { coeffA, coeffB };
}

function lastTimeDeclinedData(data, diffThreshold) {
  data.forEach((d) => {
    d.numericTestdatum = +new Date(d.Testdatum);
  });
  data = data.filter(
    (d) => d.numericTestdatum !== null && d["Lexplore Score"] !== null
  );

  const groupedData = d3.group(data, (d) => d.ElevID);

  const declinedGroups = [];
  var minDiff = 0;
  groupedData.forEach((group, elevId) => {
    const descendDatedGroup = group.sort(
      (a, b) => b.numericTestdatum - a.numericTestdatum
    );
    if (descendDatedGroup.length >= 2) {
      const diff =
        descendDatedGroup[0]["Lexplore Score"] -
        descendDatedGroup[1]["Lexplore Score"];
      if (diff < 0) {
        if (diff < minDiff) {
          minDiff = diff;
        }
        if (diff < diffThreshold) {
          declinedGroups.push(group);
        }
      }
    }
  });

  const declinedData = [].concat(...declinedGroups);

  return { data: declinedData, minDiff: minDiff };
}

function calculateSlope(x, y) {
  const n = x.length;
  const sumX = d3.sum(x);
  const sumY = d3.sum(y);
  const sumXY = d3.sum(x.map((xi, i) => xi * y[i]));
  const sumXX = d3.sum(x.map((xi) => xi * xi));

  return (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
}

export default ScatterPage;
