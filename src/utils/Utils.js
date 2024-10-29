import * as d3 from "d3";
import { sequenceIDfromYearSchoolClass, Season } from "./AggregateUtils.js";
import { tenureSequenceTag } from "./tenureFormat";
import { labels } from "./constants";

export const parseDate = (rawDateInput) => d3.timeParse("%y%m%d")(rawDateInput);

export function drawIndividualAverageTemporalLines(
  collection,
  colorScale,
  meanScoresIn,
  lineGenerator
) {
  const meanScoresEntries = Array.from(meanScoresIn);

  // Bind data and create a group for each colorValue
  const lines = collection
    .selectAll(".ref-line-group")
    .data(meanScoresEntries)
    .enter()
    .append("g")
    .attr("class", "ref-line-group");

  lines
    .append("path")
    .attr("class", "reference-line-path")
    .attr("d", (d) => lineGenerator(d[1]))
    .attr("fill", "none")
    .attr(
      "stroke",
      (d) => colorScale(d[0]) //: "rgba(128, 128, 128, 0.6)"
    )
    .attr("stroke-width", 2)
    .attr("stroke-dasharray", "10,10");
}

export function drawAggregateAverageTemporalLines(
  collection,
  xScale,
  yScale,
  meanScoresIn,
  subBandWidth,
  seasonField
) {
  const lineGenerator = d3
    .line()
    .x((d) => {
      return (
        xScale(Season(getStrValue(d.date, "time"), seasonField)) +
        subBandWidth / 2
      );
    })
    .y((d) => yScale(getStrValue(d.meanScore, "linear")));

  const meanScoresWithinDomain = new Map();

  meanScoresIn.forEach((group, key) => {
    const filteredGroup = group.filter((item) =>
      xScale
        .domain()
        .includes(Season(getStrValue(item.date, "time"), seasonField))
    );
    meanScoresWithinDomain.set(key, filteredGroup);
  });

  const meanScoresEntries = Array.from(meanScoresWithinDomain);

  // Bind data and create a group for each colorValue
  const lines = collection
    .selectAll(".ref-line-group")
    .data(meanScoresEntries)
    .enter()
    .append("g")
    .attr("class", "ref-line-group");

  lines
    .append("path")
    .attr("class", "reference-line-path")
    .attr("d", (d) => {
      return lineGenerator(d[1]);
    })
    .attr("fill", "none")
    .attr("stroke", "rgba(128, 128, 128, 0.6)")
    .attr("stroke-width", 2)
    .attr("stroke-dasharray", "10,10");
}

export const formatDate = d3.timeFormat("%Y-%m-%d");

export function formatTickValue(d, field) {
  if (isDateFieldString(field)) {
    const dateObject = parseDate(d);
    return formatDate(dateObject);
  }
  return d;
}

export function isDateFieldString(field) {
  return field === "Födelsedatum" || field === "Testdatum";
}

export function getStrValue(value, type) {
  if (type === "point") {
    // point type is categorical and numeric value is converted to string
    return value + "";
  }
  return value;
}

export function rowParser(d) {
  // Initialize an empty object to hold the parsed fields
  const parsedRow = {};

  // Manually parse each field
  for (let field in d) {
    const key = field.trim();
    if (key === "Skola" || key === "Klass" || key === "Läsår") {
      parsedRow[key] = String(d[field]);
    } else if (isDateFieldString(field)) {
      parsedRow[field] = parseDate(d[field]);
    } else if (field === "Årskurs" || field === "Läsnivå (5 = hög)") {
      parsedRow[field] = parseInt(d[field], 10);
    } else {
      parsedRow[field] = d3.autoType({ [field]: d[field] })[field];
    }
  }

  return parsedRow;
}

export const preset_dict = {
  xField: "",
  yField: "",
  colorField: "",
  checkedOptions: {},
  rangeOptions: {},
  query: "",
  expression: [],
  isClassView: false,
  showLines: false,
  aggregateType: "",
};

export const load = (callback) => {
  const uploadInputNode = document.createElement("input");
  uploadInputNode.setAttribute("type", "file");
  uploadInputNode.setAttribute("accept", "application/json");

  uploadInputNode.onchange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      const loadedConfig = JSON.parse(content, (key, value) => {
        if (isDateFieldString(key)) return value.map((v) => new Date(v));
        return value;
      });
      callback(loadedConfig);
    };

    reader.readAsText(file);
  };

  document.body.appendChild(uploadInputNode);
  uploadInputNode.click();
  uploadInputNode.remove();
};

export function generateSequenceID(record, sequenceType) {
  const year = parseInt(record.Läsår.split("/")[0]);
  const skola = record.Skola;

  return sequenceIDfromYearSchoolClass(year, skola, record.Klass, sequenceType);
}

export function generateSchoolLastingClassMap(litData, sequenceType) {
  const schoolMap = {};

  litData.forEach((entry) => {
    const school = entry.Skola;
    const sequenceID = generateSequenceID(entry, sequenceType); // Use the function from Utils.js to generate the sequenceID

    if (!schoolMap[school]) {
      schoolMap[school] = {};
    }

    if (!schoolMap[school][sequenceID]) {
      schoolMap[school][sequenceID] = {
        classes: [],
      };
    }

    if (
      !schoolMap[school][sequenceID].classes.some(
        (klass) => klass.Klass === entry.Klass
      )
    ) {
      schoolMap[school][sequenceID].classes.push({
        Läsår: entry.Läsår,
        Klass: entry.Klass,
        studentIDs: new Set([entry.ElevID]),
      });
    } else {
      const thisClassIndex = schoolMap[school][sequenceID].classes.findIndex(
        (klass) => klass.Klass === entry.Klass
      );
      schoolMap[school][sequenceID].classes[thisClassIndex].studentIDs.add(
        entry.ElevID
      );
    }
  });

  // Convert the schoolMap to a sorted array of schools
  const sortedSchools = Object.keys(schoolMap)
    .sort()
    .map((school) => {
      // Sort class IDs for each school
      const sortedClasses = Object.keys(schoolMap[school])
        .sort()
        .reduce((acc, sequenceID) => {
          acc[sequenceID] = schoolMap[school][sequenceID];
          return acc;
        }, {});

      return { school, classes: sortedClasses };
    });

  // Convert back to object if needed, or you can keep it as an array
  const sortedSchoolMap = {};
  sortedSchools.forEach((schoolItem) => {
    sortedSchoolMap[schoolItem.school] = schoolItem.classes;
  });

  return sortedSchoolMap;
}

export function colors20() {
  const colors = d3.schemeCategory10;
  const brighterColors = colors.map((color) => {
    const brightenedColor = d3.color(color).brighter(1);
    return `rgba(${brightenedColor.r}, ${brightenedColor.g}, ${brightenedColor.b}, 0.5)`;
  });
  return colors.concat(brighterColors);
}

export function fieldDomainTocolorScale(colorField, colorDomain) {
  var colorScale;
  if (colorField === "Kön") {
    colorScale = d3
      .scaleOrdinal(d3.schemeCategory10.slice(1, 3))
      .domain(colorDomain);
  } else if (colorField === "Invandringsdatum") {
    colorScale = d3
      .scaleOrdinal(d3.schemeCategory10.slice(3, 5))
      .domain(colorDomain);
  } else {
    colorScale = d3.scaleOrdinal(colors20()).domain(colorDomain);
  }
  return colorScale;
}

export function convertFieldDataType(d, colorField) {
  if (colorField === "Invandringsdatum") {
    return d[colorField] !== null ? "ja" : "nej";
  }
  return d[colorField];
}

export function generateSchoolClassColorScale(schoolClasses) {
  const classColorScaleMap = {};

  for (const school in schoolClasses) {
    const classsIDs = Object.keys(schoolClasses[school]);
    const classColorScale = classsIDs.reduce((acc, sequenceID, index) => {
      acc[sequenceID] = colors20()[index % 20];
      return acc;
    }, {});
    classColorScaleMap[school] = classColorScale;
  }

  const schools = Object.keys(schoolClasses);
  const schoolColorScale = d3
    .scaleOrdinal()
    .domain(schools)
    .range(schools.map((d) => colors20()[schools.indexOf(d) % 20]));

  return { schoolColor: schoolColorScale, classColor: classColorScaleMap };
}

export function aggrColorLegend(
  checkedClasses,
  classColors,
  svg,
  width,
  margin,
  groupOption
) {
  if (Object.keys(classColors).length > 0 && checkedClasses.length > 0) {
    checkedClasses.sort();
    const legend = svg
      .append("g")
      .attr("class", "legend")
      .attr("transform", `translate(${width + 30}, ${margin.top})`); // Adjust position as required  //width - legendWidth

    legend
      .append("text")
      .attr("x", 0)
      .attr("y", -5) // Position the title a bit above the colored rectangles
      .style("font-weight", "bold") // Make the title bold (optional)
      .text(labels.aggregateLegendTag);

    const first20CheckedClasses = checkedClasses.slice(0, 20);

    first20CheckedClasses.forEach((schoolClass, index) => {
      const school = schoolClass.split(".")[0];
      const sequenceID = schoolClass.split(".")[1];

      // Draw colored rectangle
      legend
        .append("rect")
        .attr("x", 0)
        .attr("y", index * 20)
        .attr("width", 15)
        .attr("height", 15)
        .style("fill", classColors[school][sequenceID]);

      // Draw text beside rectangle
      legend
        .append("text")
        .attr("x", 25) // Adjust for padding beside rectangle
        .attr("y", index * 20 + 12) // Adjust to vertically center text
        .style("font-size", "12px")
        .text(tenureSequenceTag(sequenceID, groupOption)); // sequenceID.split(":")[1]
    });

    if (checkedClasses.length > 20) {
      legend
        .append("text")
        .attr("x", 0)
        .attr("y", 20 * 20 + 12)
        .text("(and more ...)");
    }
  }
}

export function colorLegend(data, colorField, svg, width, margin) {
  const colorDomain = Array.from(
    new Set(
      data
        .map((d) => convertFieldDataType(d, colorField))
        .filter((value) => value != null)
    )
  );

  colorDomain.sort();
  const colorScale = fieldDomainTocolorScale(colorField, colorDomain);

  if (!isNaN(colorDomain[0])) {
    colorDomain.reverse();
  } // sort descending if numeric;

  // Add a group for the legend
  const legend = svg
    .append("g")
    .attr("class", "legend")
    .attr("transform", `translate(${width + 30}, ${margin.top})`); // Adjust position as required  //width - legendWidth

  legend
    .append("text")
    .attr("x", 0)
    .attr("y", -5) // Position the title a bit above the colored rectangles
    .style("font-weight", "bold") // Make the title bold (optional)
    .text(colorField);

  const first20ColorDomain = colorDomain.slice(0, 20);

  first20ColorDomain.forEach((value, index) => {
    const strippedValue = value.toString().split(" ")[0];
    // Draw colored rectangle
    legend
      .append("rect")
      .attr("x", 0)
      .attr("y", index * 20)
      .attr("width", 15)
      .attr("height", 15)
      .style("fill", colorScale(value));

    // Draw text beside rectangle
    legend
      .append("text")
      .attr("x", 25) // Adjust for padding beside rectangle
      .attr("y", index * 20 + 12) // Adjust to vertically center text
      .text(strippedValue);
  });

  if (colorDomain.length > 20) {
    legend
      .append("text")
      .attr("x", 0)
      .attr("y", first20ColorDomain.length * 20 + 12)
      .text("(and more ...)");
  }
}

export function rescale(scale, zoomState, scaleType, dimension) {
  if (scaleType === "point") {
    const domain = scale.domain();
    const range = scale.range();
    const bandWidth = scale.bandwidth();

    const newRange =
      dimension === "x"
        ? [zoomState.applyX(range[0]), zoomState.applyX(range[1])]
        : [zoomState.applyY(range[0]), zoomState.applyY(range[1])];

    const newScale = scale.copy().range(newRange);

    // Find the part of the domain that fits in the new range
    const start = newScale
      .domain()
      .find((d) => newScale(d) + bandWidth > newRange[0]);
    const end = newScale
      .domain()
      .reverse()
      .find((d) => newScale(d) < newRange[1]);

    const startIndex = domain.indexOf(start);
    const endIndex = domain.indexOf(end);
    const newDomain = domain.slice(startIndex, endIndex + 1);

    return scale.copy().domain(newDomain).range(range); //bandWidth
  }
  if (scaleType === "band") {
    //|| scaleType === 'point'
    // Handle band scale
    const domain = scale.domain();
    const range = scale.range();
    const bandWidth = scale.bandwidth();

    const newRange =
      dimension === "x"
        ? [zoomState.applyX(range[0]), zoomState.applyX(range[1])]
        : [zoomState.applyY(range[0]), zoomState.applyY(range[1])];

    const newScale = scale.copy().range(newRange);

    // Find the part of the domain that fits in the new range
    const start = newScale
      .domain()
      .find((d) => newScale(d) + bandWidth > newRange[0]);
    const end = newScale
      .domain()
      .reverse()
      .find((d) => newScale(d) < newRange[1]);

    const startIndex = domain.indexOf(start);
    const endIndex = domain.indexOf(end);
    const newDomain = domain.slice(startIndex, endIndex + 1);

    return scale
      .copy()
      .domain(newDomain)
      .range([newScale(start), newScale(end) + bandWidth]); //bandWidth
  } else {
    return dimension === "x"
      ? zoomState.rescaleX(scale)
      : zoomState.rescaleY(scale);
  }
}

export function translateExtentStartEnd(coeffX, coeffY, svg) {
  var svgNode = svg.node();
  var svgWidth = svgNode.getBoundingClientRect().width;
  var svgHeight = svgNode.getBoundingClientRect().height;
  const x0 = (svgWidth / 2) * (1 - coeffX);
  const y0 = (svgHeight / 2) * (1 - coeffY);
  const x1 = (svgWidth / 2) * (1 + coeffX);
  const y1 = (svgHeight / 2) * (1 + coeffY);

  return [
    [x0, y0],
    [x1, y1],
  ];
}
