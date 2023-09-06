import React, { useState, useEffect } from 'react';
import { csv } from 'd3';
import * as d3 from 'd3';
import AxisSelectionCanvas from './components/AxisSelectionCanvas';
import AggregateCanvas from './components/AggregateCanvas';
import DetailCanvas from './components/DetailCanvas';
import FilterCanvas from './components/FilterCanvas';
import LogicCanvas from './components/LogicCanvas';
import './App.css';



const AlternativePage = () => {
  const [data, setData] = useState([]);
  const [filterdData, setFilteredData] = useState(data);
  const [selectedRecord, setSelectedRecord] = useState(null); 
  const [xField, setXField] = useState('ElevID');
  const [yField, setYField] = useState('Lexplore Score');
  const [colorField, setColorField] = useState('Lexplore Score');
  const fields = Object.keys(data[0] || {});
  const [studentsChecked, setStudentsChecked] = useState(false);
  const [showViolin, setShowViolin] = useState(false);

  const preset_dict = {
    xField: '',
    yField: '',
    colorField: '',
    isClassView: false,
  };

  const updatePreset = () => {
    preset_dict.xField = xField;
    preset_dict.yField = yField;
    preset_dict.colorField = colorField;
    preset_dict.isClassView = isClassView;
  }


  const setConfigFromPreset = (preset) => {
    setXField( preset.xField);
    setYField( preset.yField);
    setColorField( preset.colorField);
    setIsClassView( preset.isClassView);
  }

  const save = () => {
    updatePreset();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(preset_dict));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);

    // Ask the user for the filename
    const fileName = prompt("Please enter the desired filename", "preset_config.json");
    
    // If user clicks "Cancel" on the prompt, fileName will be null. In that case, don't proceed with the download.
    if (fileName) {
        downloadAnchorNode.setAttribute("download", fileName);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    }
};



  const load = (callback) => {
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


  //  D3.v4 version:
  useEffect(() => {
    csv('/LiteracySample.csv', rowParser).then(setData)

    }, []);



  const handlePointClick = (event,record) => setSelectedRecord(record);

    // Initialize isClassView
    const [isClassView, setIsClassView] = useState(true);

    // Function to update data
  const updateData = (newData) => {
    setData(newData);
  }


  const toggleIsClassView = () => {
    setIsClassView(!isClassView);
  }

  return (   
    <div>    
    <div className="app" >  
      <AxisSelectionCanvas
        data={data}
        fields={fields}
        xField={xField}
        yField={yField}
        colorField = {colorField}
        onXFieldChange={setXField}
        onYFieldChange={setYField}
        onColorFieldChange={setColorField}
        setIsClassView={toggleIsClassView}
        isClassView={isClassView}   
        save = {save}
        load = {load}
        setConfig = {setConfigFromPreset}
        updateData={updateData}
        setStudentsChecked={setStudentsChecked}
        studentsChecked={studentsChecked}
        setShowViolin={setShowViolin}
        showViolin={showViolin}
        setFilteredData={setFilteredData}
      />
      <AggregateCanvas
        filteredData={filterdData}
        xField={xField}
        yField={yField}
        colorField = {colorField}
        width={600}
        height={400}    
        onPointClick={handlePointClick}  //  setSelectedRecord
        selectedRecord={selectedRecord}
        studentsChecked={studentsChecked}
        showViolin={showViolin}
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

export default AlternativePage;