import React from 'react';

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
        <div key={key}>
          <strong>{key}:</strong> {value}
        </div>
      ))}
    </div>
  );
};

export default DetailCanvas;
