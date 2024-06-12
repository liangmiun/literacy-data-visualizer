import * as d3 from "d3";
import { sequenceIDfromYearSchoolClass } from "./AggregateUtils.js";
import { tenureSequenceTag } from "./tenureFormat";

export const parseDate = (rawDateInput) =>
  d3.timeParse("%y%m%d")(parseInt(rawDateInput));

export function updateReferenceLexploreScore(newReference) {
  referenceLexploreScore = newReference;
}

var referenceLexploreScore = 350;

export function drawAverageReference(g, collection, yScale, dimensions) {
  // After setting up scales and axes, draw the reference line
  // Adding a text label for the reference line
  g.append("text") // Adding the text to the main group element
    .attr("x", dimensions.width - 120) // Position the text at the right edge of the plot area
    .attr("y", yScale(referenceLexploreScore)) // Align the text vertically with the reference line
    .attr("dy", "0.35em") // Slightly adjust the text position for better visual alignment with the line
    .attr("text-anchor", "end") // Anchor text at the end to align it properly at the right edge
    .text("Municipal Average") // Text content
    .attr("fill", "gray") // Text color
    .attr("font-size", "12px"); // Text size

  collection
    .append("line") // Adding the line to the main group element
    .attr("x1", 0) // Starting point on the x-axis
    .attr("x2", dimensions.width) // End point on the x-axis, stretching across the width of the plot
    .attr("y1", yScale(referenceLexploreScore)) // yScale to translate the value 450 to the corresponding pixel value
    .attr("y2", yScale(referenceLexploreScore)) // Same as y1 to make the line horizontal
    .attr("stroke", "gray") // Color of the line
    .attr("stroke-width", 2) // Thickness of the line
    .attr("stroke-dasharray", "5,5"); // Optional: makes the line dashed (5 pixels filled, 5 pixels empty)
}

export const formatDate = d3.timeFormat("%y-%m-%d");

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

export const data_fields = [
  "Testdatum",
  "Lexplore Score",
  "Skola",
  "Årskurs",
  "Klass",
  "Födelsedatum",
  "Läsår",
  "Percentil",
  "Läsnivå (5 = hög)",
  "Stanine",
  "Standardpoäng",
  "Antal korrekta svar",
  "Antal fel svar",
  "Antal frågor",
  "Läshastighet medelvärde",
  "Läshastighet högläsning",
  "Läshastighet tystläsning",
];

export const y_data_fields = [
  "Lexplore Score",
  "Läsnivå (5 = hög)",
  "Antal korrekta svar",
  "Antal fel svar",
  "Antal frågor",
  "Läshastighet medelvärde",
  "Läshastighet högläsning",
  "Läshastighet tystläsning",
];

export const season_choice_fields = ["Month", "Quarter", "Semester"];

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
  console.log("colorField", colorField);
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

export function setColorOption(d, colorField) {
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
      .text("Classes");

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
      console.log("classes more than 20: ", checkedClasses.length);
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
        .map((d) => setColorOption(d, colorField))
        .filter((value) => value != null)
    )
  );
  colorDomain.sort();
  if (!isNaN(colorDomain[0])) {
    colorDomain.reverse();
  } // sort descending if numeric;

  //const colorScale = d3.scaleOrdinal(colors20()).domain(colorDomain); // d3.schemeCategory10
  const colorScale = fieldDomainTocolorScale(colorField, colorDomain);

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

export const categoricals = [
  "Skola",
  "Klass",
  "Läsår",
  "Årskurs",
  "Läsnivå (5 = hög)",
  "Stanine",
  "Antal korrekta svar",
  "Antal fel svar",
  "Antal frågor",
  "ElevID",
];

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
