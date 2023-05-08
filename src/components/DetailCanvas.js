import React from 'react';

const DetailCanvas = ({ data }) => {
  console.log("data type: "+ typeof(data) + " content:" + data );
  return (
    <div className="detail-canvas">
      {data && Object.entries(data).map(([key, value]) => (
        <div key={key}>
          <strong>{key}:</strong> {value}
        </div>
      ))}
    </div>
  );
};

export default DetailCanvas;
