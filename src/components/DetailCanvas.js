import React from 'react';
import * as d3 from 'd3';
import '../App.css';

const DetailCanvas = ({ data, keyList}) => {
  //console.log("data type: "+ typeof(data) + " content:" + data );




  const formatDate = d3.timeFormat('%Y.%m.%d');

  const DetailValue = (key, value) => {
    if (key === 'Födelsedatum' || key === 'Testdatum') {
        value = formatDate(value);
    }
    return value;
  };

  const aggregateData = (key) => {
    if (data.length === 1) {
        return DetailValue(key, data[0][key]);
    }

    switch (key) {
        case 'Skola':
        case 'Klass':
        case 'Läsår':
            const sortedStrings = data.map(record => record[key]).sort();
            return `${sortedStrings[0]} - ${sortedStrings[sortedStrings.length - 1]}`;

        case 'ElevID':
          const sortedNumbers = data.map(record => parseInt(record[key], 10)).sort((a, b) => a - b);
          return `${sortedNumbers[0]} - ${sortedNumbers[sortedNumbers.length - 1]}`;
  

        case 'Årskurs':
            const uniqueYears = [...new Set(data.map(record => record[key]))];
            return uniqueYears.join(', ');
        case 'Födelsedatum':
        case 'Testdatum':
            const sortedDates = data.map(record => record[key]).sort((a, b) => a - b);
            return `${formatDate(sortedDates[0])} - ${formatDate(sortedDates[sortedDates.length - 1])}`;

        case 'Standardpoäng':
        case 'Lexplore Score':
            const mean = data.reduce((sum, record) => sum + record[key], 0) / data.length;
            return `${parseInt(mean,10)} (mean)`;

        default:
            return '';
    }
  };
  
  
  return (
    <div className="detail-canvas" style={{ fontSize: '1.0em' }}>
      {data && data.length>0 && keyList.map(key => (
            <div key={key} className="detail-item">
                <strong>{key}:</strong> {aggregateData(key)}
            </div>
        ))}
    </div>
  );
};




export default DetailCanvas;
