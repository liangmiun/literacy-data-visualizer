import React, { useState, useEffect } from 'react';
import { csv } from 'd3';
import * as d3 from 'd3';
import AxisSelectionCanvas from './components/AxisSelectionCanvas';
import ScatterCanvas from './components/ScatterCanvas';
import DetailCanvas from './components/DetailCanvas';
import FilterCanvas from './components/FilterCanvas';
import LogicCanvas from './components/LogicCanvas';
import './App.css';


const ScatterPage = () => {
  const [data, setData] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null); 
  const [xField, setXField] = useState('ElevID');
  const [yField, setYField] = useState('Lexplore Score');
  const [colorField, setColorField] = useState('Lexplore Score');
  const fields = Object.keys(data[0] || {});
  const isClassView = true;

  //console.log("fields: " + fields);

  useEffect(() => {
    csv('/LiteracySample.csv', rowParser).then(setData)

    }, []);

  const handlePointClick = (event,record) => setSelectedRecord(record);

  return (   
    <div>    
    <div className="app" >  
      <AxisSelectionCanvas
        fields={fields}
        xField={xField}
        yField={yField}
        colorField = {colorField}
        onXFieldChange={setXField}
        onYFieldChange={setYField}
        onColorFieldChange={setColorField}
      />
      <ScatterCanvas
        data={data}
        xField={xField}
        yField={yField}
        colorField = {colorField}
        width={600}
        height={400}
        isClassView={isClassView}        
        onPointClick={handlePointClick}  //  setSelectedRecord
      />

      
      <DetailCanvas data={selectedRecord} />
     


      <FilterCanvas fields={fields.filter(field => field !== 'StudentID')} />  

      <LogicCanvas  fields={fields} data ={data}/>  
      
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