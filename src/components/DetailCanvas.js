import React from 'react';
import * as d3 from 'd3';
import '../App.css';

const DetailCanvas = ({ data }) => {
  //console.log("data type: "+ typeof(data) + " content:" + data );
  const keyList = 
  ['Skola',
  'Årskurs',
  'Klass',
  'ElevID',
  'Födelsedatum',
  'Läsår',
  'Testdatum',
  'Standardpoäng',
  'Lexplore Score'
  ];
  return (
    <div className="detail-canvas">
      {data && Object.entries(data).filter(([key]) => keyList.includes(key)).map(([key, value]) => (
        <div key={key} className="detail-item">
          <strong>{key}:</strong> {DetailValue(key,value)}
        </div>
      ))}
    </div>
  );
};

function DetailValue(key,value)
{
  if(key==='Födelsedatum'||key==='Testdatum')
  {
    const parseDate = d3.timeParse('%y%m%d');
    const formatDate = d3.timeFormat('%Y-%m-%d'); 
    value = formatDate(parseDate(value));
  } 
  return value;

}


export default DetailCanvas;
