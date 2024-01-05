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
    //const numClassColors = 20;
    const colors = d3.schemeCategory10;
    const brighterColors = colors.map(color => d3.color(color).brighter(1).toString());
    const Colors20 = colors.concat(brighterColors);
    console.log("color20",Colors20);

    for(const school in schoolClasses){
      const classsIDs = Object.keys(schoolClasses[school]);
      //console.log(school, classsIDs.length);
      const classColorScale = d3.scaleOrdinal()
      .domain(classsIDs)
      .range(classsIDs.map(d => Colors20[classsIDs.indexOf(d) % 20]));  
      classColorScaleMap[school] = classColorScale;
    }

    const schools = Object.keys(schoolClasses);
    const schoolColorScale = d3.scaleOrdinal()
    .domain(schools)
    .range(schools.map(d => Colors20[schools.indexOf(d) % 20]));


    return { school: schoolColorScale, class: classColorScaleMap };
  }





