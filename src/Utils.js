import * as d3 from 'd3';
import { interpolateSpectral } from 'd3-scale-chromatic';


const parseDate = d3.timeParse('%y%m%d');


export function rowParser(d) {


    // Initialize an empty object to hold the parsed fields
    const parsedRow = {};

    // Manually parse each field
    for (let field in d) {
      if (field === 'Skola' || field === 'Klass' || field === 'Läsår') {
        parsedRow[field] = String(d[field]);
      } else if (field === 'Födelsedatum' || field === 'Testdatum') {
        parsedRow[field] = parseDate(d[field]);
      } else if (field === 'Årskurs' || field === 'Läsnivå (5 = hög)') {
        parsedRow[field] = parseInt(d[field], 10);	
      }
      else {
        parsedRow[field] = d3.autoType({ [field]: d[field] })[field];
      }
    }

  return parsedRow;
}


export const preset_dict = {
  xField: '',
  yField: '',
  colorField: '',
  checkedSchools: [],
  checkedClasses: [],
  checkedOptions: {},
  rangeOptions: {},
  query: '',
  expression: []
};


export const load = (callback) => {
  const uploadInputNode = document.createElement('input');
  uploadInputNode.setAttribute("type", "file");
  uploadInputNode.setAttribute("accept", "application/json");

  uploadInputNode.onchange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      const loadedConfig = JSON.parse(content);
      callback(loadedConfig);
    };

    reader.readAsText(file);
  };

  document.body.appendChild(uploadInputNode);
  uploadInputNode.click();
  uploadInputNode.remove();
};


export function generateClassId(record) {
  const year = parseInt(record.Läsår.split('/')[0]);
  //console.log(year);
  const skola = record.Skola;
  const klassNum = parseInt(record.Klass[0]);
  const klassSuffix = record.Klass.length > 1 ? record.Klass[1] : '';
  const skolaShort = skola.substring(0, 4).replace(/\s+/g, '_');
  return `${skolaShort}:${year - klassNum + 1}-${1}${klassSuffix}`;
}


export function generateSchoolLastingClassMap(litData) {
  const schoolMap = {};

  litData.forEach(entry => {
      const school = entry.Skola;
      const classId = generateClassId(entry); // Use the function from Utils.js to generate the classID

      if (!schoolMap[school]) {
          schoolMap[school] = {};
      }

      if (!schoolMap[school][classId]) {
          schoolMap[school][classId] = {
              classes: [],
          };
      }

      if (!schoolMap[school][classId].classes.some(klass => klass.Klass === entry.Klass)) {
          schoolMap[school][classId].classes.push({ Läsår: entry.Läsår, Klass: entry.Klass });
      }
  });

      // Convert the schoolMap to a sorted array of schools
      const sortedSchools = Object.keys(schoolMap).sort().map(school => {
        // Sort class IDs for each school
        const sortedClasses = Object.keys(schoolMap[school]).sort().reduce((acc, classId) => {
            acc[classId] = schoolMap[school][classId];
            return acc;
        }, {});

        return { school, classes: sortedClasses };
    });

    // Convert back to object if needed, or you can keep it as an array
    const sortedSchoolMap = {};
    sortedSchools.forEach(schoolItem => {
        sortedSchoolMap[schoolItem.school] = schoolItem.classes;
    });

    return sortedSchoolMap;

}


export function generateSchoolClassColorScale(schoolClasses) {

    const classColorScaleMap = {};
    const colors = d3.schemeCategory10;
    const brighterColors = colors.map(color => d3.color(color).brighter(1).toString());
    const Colors20 = colors.concat(brighterColors);

    for(const school in schoolClasses){
      const classsIDs = Object.keys(schoolClasses[school]);
      const classColorScale = d3.scaleOrdinal()
      .domain(classsIDs)
      .range(classsIDs.map(d => Colors20[classsIDs.indexOf(d) % 20]));  
      classColorScaleMap[school] = classColorScale;
    }

    const schools = Object.keys(schoolClasses);
    const schoolColorScale = d3.scaleOrdinal()
    .domain(schools)
    .range(schools.map(d => Colors20[schools.indexOf(d) % 20]));

    return { schoolColor: schoolColorScale, classColor: classColorScaleMap };
  }


  export function ColorLegend(data, colorField, svg, width, margin) {
    // Assuming colorField is categorical
    const colorDomain = Array.from(new Set(data.map(d => d[colorField])));
    const numColors = 20;
    const quantizedScale = d3.scaleQuantize()
        .domain([0, colorDomain.length - 1])
        .range(d3.range(numColors).map(d => interpolateSpectral(d / (numColors - 1))));    
    const colorScale = d3.scaleOrdinal()
        .domain(colorDomain)
        .range(colorDomain.map((_, i) => quantizedScale(i)));

    const colors = d3.schemeCategory10;
    const brighterColors = colors.map(color => d3.color(color).brighter(1).toString());
    const Colors20 = colors.concat(brighterColors);


    // Define legend space
    const legendWidth = 60;

    // Add a group for the legend
    const legend = svg.append("g")
        .attr("transform", `translate(${width - legendWidth}, ${margin.top})`);  // Adjust position as required

    legend.append("text")
    .attr("x", 0)
    .attr("y", -5)  // Position the title a bit above the colored rectangles
    .style("font-weight", "bold")  // Make the title bold (optional)
    .text(colorField);

    colorDomain.forEach((value, index) => {
        // Draw colored rectangle
        legend.append("rect")
            .attr("x", 0)
            .attr("y", index * 20)
            .attr("width", 15)
            .attr("height", 15)
            .style("fill", colorScale(value));

        // Draw text beside rectangle
        legend.append("text")
            .attr("x", 25)  // Adjust for padding beside rectangle
            .attr("y", index * 20 + 12)  // Adjust to vertically center text
            .text(value);
    });


}




