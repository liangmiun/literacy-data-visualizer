import React, { useState, useEffect } from 'react';
import { csv } from 'd3';
import * as d3 from 'd3';
import AxisSelectionCanvas from './components/AxisSelectionCanvas';
import ScatterCanvas from './components/ScatterCanvas';
import DetailCanvas from './components/DetailCanvas';
import FilterCanvas from './components/FilterCanvas';
import './App.css';
//import ScatterPage from './ScatterPage';


const ScatterPage = () => {
  const [data, setData] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null); 
  const [xField, setXField] = useState('Grade');
  const [yField, setYField] = useState('LexploreScore');
  const fields = Object.keys(data[0] || {});

  useEffect(() => {
    csv('/Literacy29fields.csv', rowParser).then(setData)

    }, []);

  const handlePointClick = (event,record) => setSelectedRecord(record);

  return (   
    <div>    
    <div className="app" >  
      <AxisSelectionCanvas
        fields={fields}
        xField={xField}
        yField={yField}
        onXFieldChange={setXField}
        onYFieldChange={setYField}
      />
      <ScatterCanvas
        data={data}
        xField={xField}
        yField={yField}
        width={600}
        height={400}
        
        onPointClick={handlePointClick}  //  setSelectedRecord
      />

      
      <DetailCanvas data={selectedRecord} />
     


      <FilterCanvas fields={fields.filter(field => field !== 'StudentID')} />
    </div>
    </div>
  );
};

function rowParser(d) {
  // Apply D3 autoType first to handle all columns
  const parsedRow = d3.autoType(d);

  // Convert Count to an integer
  parsedRow.StudentID = +parsedRow.StudentID;

  return parsedRow;
}

export default ScatterPage;