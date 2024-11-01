import * as d3 from "d3";
import React, { useState, useMemo, useEffect, useCallback } from "react";
import AppLevelContext from "context/AppLevelContext";
import AxisSelectionCanvas from "../layouts/AxisSelectionCanvas";
import AggregateCanvas from "../layouts/AggregateCanvas";
import ScatterCanvas from "../layouts/ScatterCanvas";
import DetailCanvas from "../layouts/DetailCanvas";
import FilterCanvas from "../layouts/FilterCanvas";
import LogicCanvas from "../layouts/LogicCanvas";
import {
  sequenceIDfromYearSchoolClass,
  Season,
} from "../../utils/AggregateUtils";
import { labels, studentKeyList, classKeyList } from "../../utils/constants";
import {
  generateSchoolLastingClassMap,
  generateSchoolClassColorScale,
  convertFieldDataType,
} from "../../utils/Utils.js";
import "assets/App.css";
import { useContext } from "react";

const ScatterPage = () => {
  const {
    data,
    logicFilteredData,
    isClassView,
    selectedClasses,
    xField,
    yField,
    colorField,
    rangeOptions,
    checkedOptions,
    seasonField,
    setSchoolClassMapForTeacher,
  } = useContext(AppLevelContext);

  const trends = {
    all: labels.trendOptionAll,
    overall_decline: labels.trendOptionDecline,
    logarithmic_decline: labels.trendOptionLogDecline,
    last_time_decline: labels.trendOptionLastDecline,
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
  const [tenureGroupOption, setTenureGroupOption] = useState(
    labels.groupByThreeYear
  );
  const [wouldRenderByConfig, setWouldRenderByConfig] = useState(false);
  const [showAverageLine, setShowAverageLine] = useState(false);
  const [meanScores, setMeanScores] = useState(new Map());

  // Set average line data
  useEffect(() => {
    const treeViewSelectedGrades = new Set(
      selectedClasses.map((item) => parseInt(item.class.replace(/\D/g, ""), 10))
    );

    const treeViewSelectedSchools = selectedClasses.map((item) => item.school);

    const checkedGrades = checkedOptions["Årskurs"] || [];

    const intersectGrades = Array.from(
      new Set(
        [...treeViewSelectedGrades].filter((x) => checkedGrades.includes(x))
      )
    );

    const groupingList = ["Skola", "Årskurs", "Invandringsdatum", "Kön"];
    //Make multiple groups when colorField is in groupingList, otherwise make one group
    const groupingPattern =
      groupingList.includes(colorField) && !isClassView
        ? (d) => convertFieldDataType(d, colorField)
        : () => 0;

    const calculateMunicipalAverage = () => {
      const nonNullGradedData = data.filter(
        (d) =>
          d["Lexplore Score"] !== null &&
          intersectGrades.includes(parseInt(d["Årskurs"], 10)) &&
          (colorField !== "Skola" ||
            treeViewSelectedSchools.includes(d["Skola"]))
      );

      const seasonlyGroups = d3.group(
        nonNullGradedData,
        groupingPattern,
        (d) => Season(d.Testdatum, seasonField) //d.Testdatum.getFullYear() + "-" + d.Testdatum.getMonth() //Season[(d.Testdatum, seasonField)] //##
      );

      // Iterate over each colorField group
      const means = new Map();
      seasonlyGroups.forEach((yearMonthMap, colorValue) => {
        const scores = Array.from(yearMonthMap, ([key, values]) => {
          const mean = d3.mean(values, (d) => d["Lexplore Score"]);
          const meanDate = new Date(
            d3.mean(values, (d) => d["Testdatum"].getTime())
          );
          return {
            date: meanDate, //new Date(key.split("-")[0], key.split("-")[1], 15), //##
            meanScore: mean,
          };
        });
        means.set(colorValue, scores);
      });

      return means;
    };

    //updateReferenceLexploreScore(calculateMunicipalAverage());
    setMeanScores(calculateMunicipalAverage());
  }, [
    data,
    checkedOptions,
    selectedClasses,
    colorField,
    seasonField,
    isClassView,
  ]);

  //set school-classes map and color scale
  useEffect(() => {
    if (Object.keys(data).length > 0) {
      const nonNullLexploreData = data.filter(
        (d) => d["Lexplore Score"] !== null
      );
      const newSchoolClasses = generateSchoolLastingClassMap(
        nonNullLexploreData,
        tenureGroupOption
      );
      const newClassColorScale =
        generateSchoolClassColorScale(newSchoolClasses).classColor;
      setSchoolClassesAndColorScale({
        schoolClasses: newSchoolClasses,
        colorScale: newClassColorScale,
      });
    }
  }, [data, tenureGroupOption]);

  useEffect(() => {
    if (Object.keys(data).length > 0) {
      const nonNullLexploreData = data.filter(
        (d) => d["Lexplore Score"] !== null
      );
      const flatSchoolClasses = generateSchoolLastingClassMap(
        nonNullLexploreData,
        "school-year"
      );
      setSchoolClassMapForTeacher(flatSchoolClasses);
    }
  }, [data, setSchoolClassMapForTeacher]);

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
    setWouldRenderByConfig(!wouldRenderByConfig);
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

  //examine options with empty impact for each label
  const labelsWithOptions = useMemo(() => {
    return {
      Årskurs: [1, 2, 3, 4, 5, 6, 7, 8, 9],
      Läsår: ["18/19", "19/20", "20/21", "21/22", "22/23"],
      Stanine: [1, 2, 3, 4, 5, 6, 7, 8, 9],
      classes: allClasses,
      schools: Array.from(new Set(allClasses.map((item) => item.school))),
      sequences: Array.from(
        new Set(
          allClasses.map((item) =>
            sequenceIDfromYearSchoolClass(
              parseInt(item.schoolYear.split("/")[0]),
              item.school,
              item.class,
              tenureGroupOption
            )
          )
        )
      ),
    };
  }, [allClasses, tenureGroupOption]);

  useEffect(() => {
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

    const dataToProcess = rangeFilteredData(nonNullData);

    function findRecordWithExceptionAndOthersChecked(
      data,
      exceptionKey,
      exceptionValue
    ) {
      if (["Årskurs", "Läsår", "Stanine"].includes(exceptionKey)) {
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
      } else if (exceptionKey === "classes") {
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
      } else if (exceptionKey === "schools") {
        return data.some((record) => {
          // Check exceptionOption first
          if (record["Skola"] !== exceptionValue) {
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
      } else if (exceptionKey === "sequences") {
        return data.some((record) => {
          // Check exceptionOption first
          const recordSequenceID = sequenceIDfromYearSchoolClass(
            parseInt(record["Läsår"].split("/")[0]),
            record["Skola"],
            record["Klass"],
            tenureGroupOption
          );

          if (recordSequenceID !== exceptionValue) {
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
          findRecordWithExceptionAndOthersChecked(dataToProcess, label, option);

        const isOptionWithEmptyImpact = !hasRecordInfluencedByThisOption;

        if (isOptionWithEmptyImpact) {
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
    labelsWithOptions,
    tenureGroupOption,
  ]);

  const disableIndiLinesUnderMultipleSchools = useMemo(() => {
    const schoolCount = new Set(selectedClasses.map((item) => item.school))
      .size;
    if (schoolCount > 2) {
      setConnectIndividual(false);
      return true;
    }
    return false;
  }, [selectedClasses]);

  return (
    <div className="app">
      <AxisSelectionCanvas
        studentsChecked={studentsChecked}
        setStudentsChecked={setStudentsChecked}
        connectIndividual={connectIndividual}
        setConnectIndividual={setConnectIndividual}
        trendSet={trends}
        trend={trend}
        onTrendChange={handleTrendOptionChange}
        declineSlope={declineSlopeThreshold}
        setDeclineSlope={setDeclineSlopeThreshold}
        minDeclineThreshold={minDeclineThreshold}
        diffThreshold={diffThreshold}
        setDiffThreshold={setDiffThreshold}
        filterWithTrendThreshold={filterWithTrendThreshold}
        triggerRenderByConfigChange={triggerRenderByConfigChange}
        disableIndiLines={disableIndiLinesUnderMultipleSchools}
        showAverageLine={showAverageLine}
        setShowAverageLine={setShowAverageLine}
      />

      {isClassView ? (
        <AggregateCanvas
          shownData={shownData}
          yField={"Lexplore Score"}
          onPartClick={setSelectedClassDetail}
          studentsChecked={studentsChecked}
          connectIndividual={connectIndividual}
          classColors={schoolClassesAndColorScale.colorScale}
          groupOption={tenureGroupOption}
          triggerRenderByConfig={wouldRenderByConfig}
          showAverageLine={showAverageLine}
          meanScores={meanScores}
        />
      ) : (
        <ScatterCanvas
          shownData={shownData}
          setSelectedRecords={setClickedRecords}
          showAverageLine={showAverageLine}
          meanScores={meanScores}
        />
      )}

      <DetailCanvas
        data={isClassView ? selectedClassDetail : clickedRecords}
        keyList={isClassView ? classKeyList : studentKeyList}
        isClassView={isClassView}
      />

      <FilterCanvas
        setFilterList={setFilterList}
        allClasses={allClasses}
        school_class_map={schoolClassesAndColorScale.schoolClasses}
        onColorPaletteClick={handleClassColorPaletteClick}
        classColors={schoolClassesAndColorScale.colorScale}
        emptyFilterOptions={emptyFilterOptions}
        groupOption={tenureGroupOption}
        setGroupOption={setTenureGroupOption}
        triggerRenderByConfig={wouldRenderByConfig}
      />

      <LogicCanvas />
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
