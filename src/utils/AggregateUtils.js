import * as d3 from "d3";
import {
  rescale,
  translateExtentStartEnd,
  formatDate,
  getStrValue,
} from "utils/Utils";
import { aggregationConfigs } from "utils/configEditor.js";
import { labels } from "./constants";

export const singleViolinWidthRatio = 1; // The width of a single violin relative to the sub-band width
const indv_jitterWidth = 5;
const indv_offset = 0;

export function PresentIndividuals(
  data,
  seasonField,
  yField,
  g,
  x0,
  getSubBandScale,
  yScale,
  subBandWidth,
  connectIndividual,
  classColors,
  sequenceType
) {
  // Calculate positions and draw circles
  const positions = []; // To store the positions of circles
  data.forEach((d) => {
    const season = Season(d.Testdatum, seasonField).toString();
    const clazz = d.Klass.toString();
    d.sequenceID = getLastingSequenceID(d.Skola, season, clazz, sequenceType);
  });
  g.selectAll(".indvPoints")
    .data(data)
    .enter()
    .append("circle")
    .attr("class", "indvPoints")
    .attr("cx", (d) => {
      const season = Season(d.Testdatum, seasonField).toString(); // or whatever field you use for the season
      const sequenceID = d.sequenceID;
      const x1 = getSubBandScale(season); // get the x1 scale for the current season

      // Unique string for hashing, combining properties that uniquely identify this data point
      const uniqueIdentifier = `${d.ElevID}`; //`${d.Skola}-${season}-${clazz}`
      const hashValue = simpleHash(uniqueIdentifier);
      const jitterOffset = consistentRandom(
        hashValue,
        -indv_jitterWidth / 2,
        indv_jitterWidth / 2
      );
      const cx =
        x0(season) +
        x1(sequenceID) +
        subBandWidth / 2 +
        indv_offset +
        jitterOffset; //- indv_jitterWidth/2 + Math.random()*indv_jitterWidth

      const record_id = d.ElevID + "-" + formatDate(d.Testdatum);

      positions.push({
        ElevID: d.ElevID,
        cx,
        cy: yScale(d[yField]),
        record_id: record_id,
        Skola: d.Skola,
        sequenceID: d.sequenceID,
      });
      return cx;
    })
    .attr("cy", (d) => {
      return yScale(d[yField]);
    })
    .attr("r", 2)
    .style("fill", "white")
    .attr("stroke", (d) => {
      return classColors[d.Skola][d.sequenceID];
    })
    .style("fill-opacity", 0.5)
    .attr("record_id", (d) => {
      return d.ElevID + "-" + formatDate(d.Testdatum);
    })
    .attr("indv_season", (d) => {
      return Season(d.Testdatum, seasonField).toString();
    })
    .attr("indv_sequenceID", (d) => {
      return getLastingSequenceID(
        d.Skola,
        Season(d.Testdatum, seasonField).toString(),
        d.Klass.toString(),
        sequenceType
      );
    })
    .attr("jitterOffset", (d) => {
      const uniqueIdentifier = `${d.ElevID}`;
      const hashValue = simpleHash(uniqueIdentifier);
      return consistentRandom(
        hashValue,
        -indv_jitterWidth / 2,
        indv_jitterWidth / 2
      );
    });

  const groupedPositions = d3.group(positions, (d) => d.ElevID);

  if (connectIndividual) {
    groupedPositions.forEach((value, key) => {
      const points = value;

      for (let i = 0; i < points.length - 1; i++) {
        g.append("line")
          .attr("class", "indvLines")
          .attr("x1", points[i].cx)
          .attr("y1", points[i].cy)
          .attr("x2", points[i + 1].cx)
          .attr("y2", points[i + 1].cy)
          .attr("stroke", () => {
            const d = points[i];
            return classColors[d.Skola][d.sequenceID];
          })
          .attr("stroke-width", 0.5)
          .attr("stroke-opacity", 1)
          .attr("start_record_id", points[i].record_id)
          .attr("end_record_id", points[i + 1].record_id);
        //.style("visibility", connectIndividual ? "visible" : "hidden");
      }
    });
  }
}

function getSemesterFromDate(dateObject) {
  const month = getMonthFromDate(dateObject);
  const halfYear = Math.floor((month - 1) / 6);
  return ["Spring", "Autumn"][halfYear];
}

function getBoundaryDate(boundary, year) {
  return new Date(`${year}-${boundary}`);
}

function getQuarterFromDate(dateObject) {
  const { springEnd, summerEnd, autumnEnd } =
    aggregationConfigs().seasonBoundaries;
  const year = dateObject.getFullYear();
  const date = new Date(year, dateObject.getMonth(), dateObject.getDate()); // Normalize time to avoid hour differences affecting comparison

  if (date <= getBoundaryDate(springEnd, year)) {
    return "Q1";
  } else if (date <= getBoundaryDate(summerEnd, year)) {
    return "Q2";
  } else if (date <= getBoundaryDate(autumnEnd, year)) {
    return "Q3";
  } else {
    return "Q4";
  }
}

export function getMonthFromDate(dateObject) {
  return dateObject.getMonth() + 1;
}

export function Season(dateObject, type) {
  const year = dateObject.getFullYear();

  var season = "";
  if (type === labels.seasonByQuarter) {
    season = getQuarterFromDate(dateObject);
  } else if (type === labels.seasonBySemester) {
    season = getSemesterFromDate(dateObject);
  } else {
    season = getMonthFromDate(dateObject);
  }

  return `${year}-${season}`; //-${day}
}

function getCurrentSchoolYear() {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  // Check if the current date is after June 30
  if (currentDate.getMonth() > 5) {
    // It's after June 30
    return currentYear;
  } else {
    // It's on or before June 30
    return currentYear - 1;
  }
}

export function getLastingSequenceID(
  school,
  seasonKey,
  classKey,
  sequenceType
) {
  const testYear = parseInt(seasonKey.split("-")[0]) - 2000;
  const testSeason = seasonKey.split("-")[1];
  const schoolYear = isFirstHalfYear(testSeason) ? testYear - 1 : testYear;

  return sequenceIDfromYearSchoolClass(
    schoolYear,
    school,
    classKey,
    sequenceType
  );
}

export function sequenceIDfromYearSchoolClass(
  schoolYearTwoDigit,
  school,
  classKey,
  sequenceType
) {
  const classNum = parseInt(classKey[0]);
  const classSuffix = classKey.length > 1 ? classKey[1] : "";
  const currentSchoolYear = getCurrentSchoolYear() - 2000;
  const { newClassNum, newSchoolYear } = classNumAndYearForSequence(
    classNum,
    currentSchoolYear,
    schoolYearTwoDigit,
    sequenceType
  );

  return `${school}:${newSchoolYear}/${
    newSchoolYear + 1
  }-${newClassNum}${classSuffix}`;
}

function classNumAndYearForSequence(
  classNum,
  currentSchoolYear,
  schoolYearTwoDigit,
  sequenceType
) {
  var newClassNum;
  var newSchoolYear;
  var endClassNum;

  if (sequenceType === labels.groupByNineYear) {
    endClassNum = 9;
  } else if (sequenceType === labels.groupByThreeYear) {
    endClassNum = 3 * (Math.ceil(classNum / 3) - 1) + 3;
  } else {
    endClassNum = classNum;
  }

  if (classNum + currentSchoolYear - schoolYearTwoDigit <= endClassNum) {
    newClassNum = classNum + currentSchoolYear - schoolYearTwoDigit; //
    newSchoolYear = currentSchoolYear;
  } else {
    newClassNum = endClassNum;
    newSchoolYear = schoolYearTwoDigit - classNum + endClassNum;
  }

  return { newClassNum, newSchoolYear };
}

function isFirstHalfYear(testSeason) {
  if (testSeason === "Q1" || testSeason === "Q2" || testSeason === "Spring") {
    return true;
  }

  if (!isNaN(parseInt(testSeason))) {
    return parseInt(testSeason) < 7;
  }
  return false;
}

export function PreparePlotStructure(
  svgRef,
  filteredData,
  seasonField,
  yField,
  aggregateType,
  margin,
  dimensions,
  sequenceType
) {
  const svg = d3.select(svgRef.current);
  svg.selectAll("*").remove();

  //set margin for svg
  const g = svg
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // Create main linear scale for y-axis
  const [yMin, yMax] = d3.extent(filteredData, (d) => d[yField]);
  const yPadding = (yMax - yMin) * 0.1;
  const yScale = d3
    .scaleLinear()
    .domain([yMin - yPadding, yMax + yPadding])
    .range([dimensions.height - margin.top - margin.bottom, 0]);

  // Group the individuals based on Klass and Testdatum (season), with season as first level and Klass as second level.
  const sumstat = setSumStat(
    filteredData,
    yScale,
    seasonField,
    yField,
    aggregateType,
    sequenceType
  ).filter(
    (d) => d.value.count >= aggregationConfigs().removeAggrOfSizeLowerThan
  );

  // Sort the sumstat by key to ensure boxes layout horizontally within each season:
  // Here sumstat is in a flat structure.
  sumstat.sort((a, b) => {
    const xComp = d3.ascending(a.season, b.season);
    return xComp !== 0 ? xComp : d3.ascending(a.class, b.class);
  });

  const lastingClassGroups = d3.group(sumstat, (d) => d.value.lastingclass);

  // Create an array of unique seasons
  const seasons = Array.from(
    new Set(sumstat.map((d) => d.value.season.toString()))
  );

  // Create a mapping of each season to its classes
  // Create a function to get the sub-band scale for classes within a given season
  function getSubBandScale(season) {
    const seasonToClasses = getSeasonToClasses(seasons, sumstat);
    return d3
      .scaleBand()
      .padding(0.05) //0.05
      .domain(seasonToClasses[season])
      .range([0, xMainBandScale.bandwidth()]);
  }

  // Create main band scale for seasons
  const xMainBandScale = d3
    .scaleBand()
    .domain(seasons) //seasons
    .range([0, dimensions.width - margin.left - margin.right])
    .paddingInner(0.2)
    .paddingOuter(0.2);

  // g.selectAll(".padding-rect")
  // .data(seasons)
  // .enter().append("rect")
  // .attr("class", "padding-rect")
  // .attr("x", d => x0(d) - x0.step() * x0.paddingInner() / 2)
  // .attr("width", x0.step())
  // .attr("height", innerHeight)  // Set to the height of your chart area
  // .attr("fill", "white");  // Color for the padding areas

  // Generate the tick values (just the combined class-season strings now)
  let tickValues = seasons;

  // Create the x-axis using the new band scale `x1`
  const xAxis = d3.axisBottom(xMainBandScale).tickValues(tickValues); // Use the combined class-season strings,  .tickFormat(d => d)

  return {
    svg,
    g,
    sumstat,
    seasons,
    yScale,
    xMainBandScale,
    xAxis,
    getSubBandScale,
    lastingClassGroups,
  };
}

export function PrepareTrajectoryData(
  allData,
  seasons,
  yScale,
  yField,
  seasonField,
  aggregateType,
  sequenceType,
  anchorClass
) {
  const trajectoryData = setTrajectoryData(
    allData,
    anchorClass.school,
    anchorClass.class,
    anchorClass.schoolYear
  );

  const trajectorySumstat = setTrajectorySumStat(
    trajectoryData,
    yScale,
    seasonField,
    yField,
    aggregateType,
    sequenceType
  );

  const trajectorySeasons = Array.from(
    new Set([
      ...trajectorySumstat.map((d) => d.value.season.toString()),
      ...seasons,
    ])
  );
  trajectorySeasons.sort((a, b) => a.toString().localeCompare(b.toString()));

  return { trajectorySumstat, trajectorySeasons };
}

export function getSeasonToClasses(seasons, sumstatIn) {
  const seasonToClasses = {};
  seasons.forEach((season) => {
    let classesForSeason = sumstatIn
      .filter((d) => d.value.season === season)
      .map((d) => d.value.lastingclass); // .class
    classesForSeason.sort((a, b) => a.toString().localeCompare(b.toString()));
    seasonToClasses[season] = classesForSeason;
  });
  return seasonToClasses;
}

function setSumStat(
  filteredData,
  yScale,
  seasonField,
  yField,
  aggregateType,
  sequenceType
) {
  const sumstat = [];
  if (aggregateType === "violin") {
    const histogram = d3
      .bin()
      .domain(yScale.domain())
      .thresholds(yScale.ticks(30))
      .value((d) => d);
    const grouped = d3.group(
      filteredData,
      (d) => Season(d.Testdatum, seasonField),
      (d) => d.Skola,
      (d) => d.Klass
    );
    grouped.forEach((seasonGroup, seasonKey) => {
      seasonGroup.forEach((schoolGroup, schoolKey) => {
        schoolGroup.forEach((values, klassKey) => {
          const input = values.map((g) => g[yField]);
          const bins = histogram(input);
          const bin_values = bins.flatMap((bin) => bin.slice(0, bin.length));
          const sortedValues = bin_values.sort(d3.ascending);
          const q1 = d3.quantile(sortedValues, 0.25);
          const median = d3.quantile(sortedValues, 0.5);
          const q3 = d3.quantile(sortedValues, 0.75);
          const interQuantileRange = q3 - q1;
          const min = q1 - 1.5 * interQuantileRange;
          const max = q3 + 1.5 * interQuantileRange;

          sumstat.push({
            key: `${klassKey}-${seasonKey}`,
            value: {
              lastingclass: getLastingSequenceID(
                schoolKey,
                seasonKey,
                klassKey,
                sequenceType
              ),
              season: seasonKey,
              school: schoolKey,
              class: klassKey,
              bins: bins,
              q1: q1,
              median: median,
              q3: q3,
              interQuantileRange: interQuantileRange,
              min: min,
              max: max,
              count: sortedValues.length,
            },
          });
        });
      });
    });
  } else {
    const grouped = d3.group(
      filteredData,
      function (d) {
        return Season(d.Testdatum, seasonField);
      },
      (d) => d.Skola,
      (d) => d.Klass
    ); //d => Season(d.Testdatum)
    grouped.forEach((seasonGroup, seasonKey) => {
      seasonGroup.forEach((schoolGroup, schoolKey) => {
        schoolGroup.forEach((values, classKey) => {
          const sortedValues = values.map((g) => g[yField]).sort(d3.ascending);
          const q1 = d3.quantile(sortedValues, 0.25);
          const median = d3.quantile(sortedValues, 0.5);
          const q3 = d3.quantile(sortedValues, 0.75);
          const interQuantileRange = q3 - q1;
          const min = q1 - 1.5 * interQuantileRange;
          const max = q3 + 1.5 * interQuantileRange;

          sumstat.push({
            key: `${classKey}-${seasonKey}`,
            value: {
              lastingclass: getLastingSequenceID(
                schoolKey,
                seasonKey,
                classKey,
                sequenceType
              ),
              school: schoolKey,
              class: classKey,
              season: seasonKey,
              q1: q1,
              median: median,
              q3: q3,
              interQuantileRange: interQuantileRange,
              min: min,
              max: max,
              count: sortedValues.length,
            },
          });
        });
      });
    });
  }
  return sumstat;
}

function setTrajectorySumStat(
  trajectoryData,
  yScale,
  seasonField,
  yField,
  aggregateType,
  sequenceType
) {
  const sumstat = [];
  if (aggregateType === "violin") {
    const histogram = d3
      .bin()
      .domain(yScale.domain())
      .thresholds(yScale.ticks(30))
      .value((d) => d);
    const grouped = d3.group(
      trajectoryData,
      (d) => Season(d.Testdatum, seasonField),
      (d) => d.Skola,
      (d) => d.Klass
    );
    grouped.forEach((seasonGroup, seasonKey) => {
      seasonGroup.forEach((schoolGroup, schoolKey) => {
        schoolGroup.forEach((values, klassKey) => {
          const input = values.map((g) => g[yField]);
          const bins = histogram(input);
          const bin_values = bins.flatMap((bin) => bin.slice(0, bin.length));
          const sortedValues = bin_values.sort(d3.ascending);
          const q1 = d3.quantile(sortedValues, 0.25);
          const median = d3.quantile(sortedValues, 0.5);
          const q3 = d3.quantile(sortedValues, 0.75);
          const interQuantileRange = q3 - q1;
          const min = q1 - 1.5 * interQuantileRange;
          const max = q3 + 1.5 * interQuantileRange;

          sumstat.push({
            key: `${klassKey}-${seasonKey}`,
            value: {
              lastingclass: getLastingSequenceID(
                schoolKey,
                seasonKey,
                klassKey,
                sequenceType
              ),
              season: seasonKey,
              school: schoolKey,
              class: klassKey,
              bins: bins,
              q1: q1,
              median: median,
              q3: q3,
              interQuantileRange: interQuantileRange,
              min: min,
              max: max,
              count: sortedValues.length,
            },
          });
        });
      });
    });
  } else {
    const grouped = d3.group(
      trajectoryData.data,
      function (d) {
        return Season(d.Testdatum, seasonField);
      }
      // (d) => d.Skola,
      // (d) => d.Klass
    ); //d => Season(d.Testdatum)
    grouped.forEach((values, seasonKey) => {
      // seasonGroup.forEach((schoolGroup, schoolKey) => {
      //   schoolGroup.forEach((values, classKey) => {
      const sortedValues = values.map((g) => g[yField]).sort(d3.ascending);
      const q1 = d3.quantile(sortedValues, 0.25);
      const median = d3.quantile(sortedValues, 0.5);
      const q3 = d3.quantile(sortedValues, 0.75);
      const interQuantileRange = q3 - q1;
      const min = q1 - 1.5 * interQuantileRange;
      const max = q3 + 1.5 * interQuantileRange;

      const trajectoryClass = `${trajectoryData.className}-${trajectoryData.schoolYear}-trajectory`;

      sumstat.push({
        key: `${trajectoryData.className}-${seasonKey}`,
        value: {
          lastingclass: getLastingSequenceID(
            trajectoryData.school,
            seasonKey,
            trajectoryData.className,
            sequenceType
          ),
          school: trajectoryData.school,
          class: trajectoryClass,
          season: seasonKey,
          q1: q1,
          median: median,
          q3: q3,
          interQuantileRange: interQuantileRange,
          min: min,
          max: max,
          count: sortedValues.length,
        },
      });
      //   });
      // });
    });
  }
  return sumstat;
}

function setTrajectoryData(data, school, className, schoolYear) {
  const mappedIDs = data
    .filter((d) => {
      // Continue with the existing filter condition
      return (
        d.Skola === school && d.Klass === className && d.Läsår === schoolYear
      );
    })
    .map((d) => d.ElevID);

  const trajectoryIDs = Array.from(new Set(mappedIDs));

  const trajectoryData = data.filter(
    (d) =>
      trajectoryIDs.includes(d.ElevID) &&
      d.Läsår !== schoolYear &&
      d.Testdatum !== null
  );
  return {
    data: trajectoryData,
    school: school,
    className: className,
    schoolYear: schoolYear,
  };
}

export function createAggrZoomBehavior(
  renderer,
  xScale,
  yScale,
  xType,
  yType,
  xField,
  yField,
  seasonField,
  line,
  connectIndividual,
  svg,
  g,
  xAxis,
  yAxis,
  newXScaleRef,
  newYScaleRef,
  getSubBandScale,
  studentsChecked,
  subBandCount,
  xNum
) {
  return d3
    .zoom()
    .scaleExtent([1, 20])
    .translateExtent(translateExtentStartEnd(1.1, 1, svg))
    .on("zoom", (event) => {
      const zoomState = event.transform;
      renderer(
        zoomState,
        xScale,
        yScale,
        xType,
        yType,
        xField,
        yField,
        seasonField,
        line,
        connectIndividual,
        g,
        xAxis,
        yAxis,
        newXScaleRef,
        newYScaleRef,
        getSubBandScale,
        studentsChecked,
        subBandCount,
        xNum
      );
    });
}

export function boxZoomRender(
  zoomState,
  xScale,
  yScale,
  xType,
  yType,
  xField,
  yField,
  seasonField,
  line,
  connectIndividual,
  g,
  xAxis,
  yAxis,
  newXScaleRef,
  newYScaleRef,
  getSubBandScale,
  studentsChecked,
  subBandCount
) {
  const { zoomXScale, zoomYScale, subBandWidth, zoomedX } = init_ZoomSetting(
    zoomState,
    xScale,
    yScale,
    xType,
    yType,
    g,
    xAxis,
    yAxis,
    newXScaleRef,
    newYScaleRef,
    getSubBandScale,
    subBandCount
  );
  // Apply zoom transformation to boxes
  g.selectAll(".boxes, .medianText") //
    .attr("x", (d) => {
      return zoomedX(d);
    })
    .attr("width", (d) => {
      return subBandWidth;
    });

  g.selectAll(".medianLines")
    .attr("x1", (d) => {
      return zoomedX(d);
    })
    .attr("x2", (d) => {
      return zoomedX(d) + subBandWidth;
    });

  g.selectAll(".vertLines")
    .attr("x1", (d) => {
      return zoomedX(d) + subBandWidth / 2;
    })
    .attr("x2", (d) => {
      return zoomedX(d) + subBandWidth / 2;
    });

  commonPartRender(
    g,
    zoomXScale,
    zoomYScale,
    zoomState,
    subBandWidth,
    getSubBandScale,
    connectIndividual,
    xField,
    yField,
    seasonField,
    line,
    studentsChecked
  );
}

export function circleZoomRender(
  zoomState,
  xScale,
  yScale,
  xType,
  yType,
  xField,
  yField,
  seasonField,
  line,
  connectIndividual,
  g,
  xAxis,
  yAxis,
  newXScaleRef,
  newYScaleRef,
  getSubBandScale,
  studentsChecked,
  subBandCount
) {
  const { zoomXScale, zoomYScale, subBandWidth, zoomedX } = init_ZoomSetting(
    zoomState,
    xScale,
    yScale,
    xType,
    yType,
    g,
    xAxis,
    yAxis,
    newXScaleRef,
    newYScaleRef,
    getSubBandScale,
    subBandCount
  );
  // Apply zoom transformation to circles
  g.selectAll(".circles") //
    .attr("cx", (d) => {
      return zoomedX(d) + subBandWidth / 2;
    });

  commonPartRender(
    g,
    zoomXScale,
    zoomYScale,
    zoomState,
    subBandWidth,
    getSubBandScale,
    connectIndividual,
    xField,
    yField,
    seasonField,
    line,
    studentsChecked
  );
}

export function violinZoomRender(
  zoomState,
  xScale,
  yScale,
  xType,
  yType,
  xField,
  yField,
  seasonField,
  line,
  connectIndividual,
  g,
  xAxis,
  yAxis,
  newXScaleRef,
  newYScaleRef,
  getSubBandScale,
  studentsChecked,
  subBandCount,
  xNum
) {
  const { zoomXScale, zoomYScale, subBandWidth, zoomedX } = init_ZoomSetting(
    zoomState,
    xScale,
    yScale,
    xType,
    yType,
    g,
    xAxis,
    yAxis,
    newXScaleRef,
    newYScaleRef,
    getSubBandScale,
    subBandCount
  );

  g.selectAll(".violins")
    .attr("transform", (d) => {
      return `translate(${zoomedX(d) + subBandWidth / 2}, 0)`;
    })
    .selectAll(".area")
    .attr(
      "d",
      d3
        .area()
        .x0((d) => xNum(-d.length * singleViolinWidthRatio) * zoomState.k)
        .x1((d) => xNum(d.length * singleViolinWidthRatio) * zoomState.k)
        .y((d) => yScale(d.x0)) //d.x0
        .curve(d3.curveCatmullRom)
    );

  commonPartRender(
    g,
    zoomXScale,
    zoomYScale,
    zoomState,
    subBandWidth,
    getSubBandScale,
    connectIndividual,
    xField,
    yField,
    seasonField,
    line,
    studentsChecked
  );
}

function commonPartRender(
  g,
  zoomXScale,
  zoomYScale,
  zoomState,
  subBandWidth,
  getSubBandScale,
  connectIndividual,
  xField,
  yField,
  seasonField,
  line,
  studentsChecked
) {
  g.selectAll(".lastingClassLines")
    .attr("x1", function () {
      const startSeason = d3.select(this).attr("startSeason");
      const startSequenceID = d3.select(this).attr("startSequenceID");
      return (
        zoomXScale(startSeason) +
        getSubBandScale(startSeason)(startSequenceID) * zoomState.k +
        subBandWidth / 2
      );
    })
    .attr("x2", function () {
      const endSeason = d3.select(this).attr("endSeason");
      const endSequenceID = d3.select(this).attr("startSequenceID");
      return (
        zoomXScale(endSeason) +
        getSubBandScale(endSeason)(endSequenceID) * zoomState.k +
        subBandWidth / 2
      );
    });

  // Apply zoom transformation to lines
  var filteredSelection = g.selectAll(".line-path").filter(function () {
    return d3.select(this).style("visibility") === "visible";
  });

  if (filteredSelection.size() > 0) {
    filteredSelection.attr(
      "d",
      line.x((d) => zoomXScale(d[xField])).y((d) => zoomYScale(d[yField]))
    );
  }

  if (studentsChecked) {
    zoomIndividualJitter(
      g,
      zoomXScale,
      zoomState,
      subBandWidth,
      getSubBandScale,
      connectIndividual
    );
  }

  g.selectAll(".reference-line-path").attr("d", (d) => {
    return d3
      .line()
      .x((data) => {
        return (
          zoomXScale(Season(getStrValue(data.date, "time"), seasonField)) +
          subBandWidth / 2
        );
      })
      .y((data) => zoomYScale(getStrValue(data.meanScore, "linear")))(d[1]);
  });
}

export function init_ZoomSetting(
  zoomState,
  xScale,
  yScale,
  xType,
  yType,
  g,
  xAxis,
  yAxis,
  newXScaleRef,
  newYScaleRef,
  getSubBandScale,
  subBandCount,
  sumstat
) {
  //const zoomState = event.transform;
  const zoomXScale = rescale(xScale, zoomState, xType, "x");
  const zoomYScale = rescale(yScale, zoomState, yType, "y");

  newXScaleRef.current = zoomXScale;
  newYScaleRef.current = zoomYScale;
  const subBandWidth = zoomXScale.bandwidth() / subBandCount;

  function zoomedX(d) {
    const season = d.value.season.toString();
    const clazz = d.value.lastingclass.toString();
    const x1 = getSubBandScale(season, sumstat); // Get x1 scale for the current season
    const value = zoomXScale(season) + x1(clazz) * zoomState.k; //zoomXScale(season) + x1(clazz)
    return isNaN(value) ? 0 : value;
  }

  // Update the axes with the new scales
  const xAxisGroup = g.select(".x-axis");
  const yAxisGroup = g.select(".y-axis");

  if (xType === "point") {
    xAxisGroup.call(xAxis.scale(zoomXScale).tickValues(xScale.domain()));
  } else {
    xAxisGroup.call(xAxis.scale(zoomXScale));
  }

  if (yType === "point") {
    yAxisGroup.call(yAxis.scale(zoomYScale).tickValues(yScale.domain()));
  } else {
    yAxisGroup.call(yAxis.scale(zoomYScale));
  }

  return { zoomState, zoomXScale, zoomYScale, subBandWidth, zoomedX };
}

export function zoomIndividualJitter(
  g,
  zoomXScale,
  zoomState,
  subBandWidth,
  getSubBandScale,
  connectIndividual
) {
  g.selectAll(".indvPoints").attr("cx", function () {
    const season = d3.select(this).attr("indv_season");
    const sequenceID = d3.select(this).attr("indv_sequenceID");
    const jitterOffset = d3.select(this).attr("jitterOffset");
    return (
      zoomXScale(season) +
      getSubBandScale(season)(sequenceID) * zoomState.k +
      subBandWidth / 2 +
      jitterOffset * zoomState.k
    );
  });

  if (connectIndividual) {
    g.selectAll(".indvLines").each(function () {
      // Current line element
      var line = d3.select(this);

      // Read the start_record_id and end_record_id from the line
      var startRecordId = line.attr("start_record_id");
      var endRecordId = line.attr("end_record_id");

      // Find the start and end circle elements based on record_id
      var dStart = g.select(`.indvPoints[record_id="${startRecordId}"]`);
      var dEnd = g.select(`.indvPoints[record_id="${endRecordId}"]`);

      // Ensure elements were found before attempting to read attributes
      if (!dStart.empty() && !dEnd.empty()) {
        // Set the line's x1 and x2 attributes based on the found circles' cx attributes
        line.attr("x1", dStart.attr("cx")).attr("x2", dEnd.attr("cx"));
        //.style("visibility", connectIndividual ? "visible" : "hidden");
      }
    });
  }
}

export function presentLines(
  showLines,
  lastingClassGroups,
  g,
  x0,
  getSubBandScale,
  y,
  subBandWidth,
  classColors,
  sequenceType,
  sumstat
) {
  if (showLines) {
    lastingClassGroups.forEach((values, lastingClassKey) => {
      for (let i = 0; i < values.length - 1; i++) {
        const startPoint = values[i];
        const endPoint = values[i + 1];
        g.append("line")
          .attr("class", "lastingClassLines")
          .attr("x1", () => {
            const season = startPoint.value.season.toString();
            const clazz = startPoint.value.lastingclass.toString();
            const x1 = getSubBandScale(season, sumstat);
            return x0(season) + x1(clazz) + subBandWidth / 2;
          })
          .attr("x2", () => {
            const season = endPoint.value.season.toString();
            const clazz = endPoint.value.lastingclass.toString();
            const x1 = getSubBandScale(season, sumstat);
            return x0(season) + x1(clazz) + subBandWidth / 2;
          })
          .attr("y1", y(startPoint.value.median))
          .attr("y2", y(endPoint.value.median))
          .attr("stroke", () => {
            const sequenceID = getLastingSequenceID(
              startPoint.value.school,
              startPoint.value.season,
              startPoint.value.class,
              sequenceType
            );
            return classColors[startPoint.value.school][sequenceID];
          })
          .attr("stroke-width", 1)
          .attr("startSeason", startPoint.value.season.toString())
          .attr(
            "startSequenceID",
            getLastingSequenceID(
              startPoint.value.school,
              startPoint.value.season,
              startPoint.value.class,
              sequenceType
            )
          )
          .attr("endSeason", endPoint.value.season.toString())
          .attr("endClass", endPoint.value.class.toString());
      }
    });
  }
}

function simpleHash(s) {
  // A very basic hash function for demonstration purposes
  return s
    .split("")
    .reduce((acc, char) => (Math.imul(31, acc) + char.charCodeAt(0)) | 0, 0);
}

function consistentRandom(hashValue, min, max) {
  // Pseudo-random function based on a hash value
  const rand = Math.abs(hashValue % 1000) / 1000; // Normalize hash value to [0, 1)
  return min + rand * (max - min); // Scale to [min, max)
}
