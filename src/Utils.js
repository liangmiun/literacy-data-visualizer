import * as d3 from 'd3';


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


export function calculateSlope(x, y) {
    const n = x.length;
    const sumX = d3.sum(x);
    const sumY = d3.sum(y);
    const sumXY = d3.sum(x.map((xi, i) => xi * y[i]));
    const sumXX = d3.sum(x.map(xi => xi * xi));
  
    return (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  }

  
export function DeclinedData(data) {
    // 1. Parse Testdatum to a numeric format (e.g., timestamp) if it's not already numeric
    data.forEach(d => {
        d.Testdatum = +new Date(d.Testdatum);
    });
  
    data = data.filter(d => d.Testdatum !== null && d['Lexplore Score'] !== null)
  
    // 2. Group data by ElevID
    const groupedData = d3.group(data, d => d.ElevID);
  
    // 3. For each group, calculate the slope of the regression line
    const declinedGroups = [];
    groupedData.forEach((group, elevId) => {
        const x = group.map(d => d.Testdatum);
        const y = group.map(d => d['Lexplore Score']);
        const slope = calculateSlope(x, y);
  
        // If slope is negative, it indicates a decline
        if (slope < 0) {
            declinedGroups.push(group);
        }
    });
  
    // 4. Flatten the array of declined groups to get a single array of declined data records
    const declinedData = [].concat(...declinedGroups);
  
    return declinedData;
  }