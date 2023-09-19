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
  const [filteredData, setFilteredtData] = useState(data);
  const [selectedRecord, setSelectedRecord] = useState(null); 
  const [xField, setXField] = useState('Testdatum');
  const [yField, setYField] = useState('Lexplore Score');
  const [colorField, setColorField] = useState('Årskurs');
  const fields = Object.keys(data[0] || {});

  const [schoolClassMap,setSchoolClassMap] = useState([]);

  const [checkedSchools, setCheckedSchools] = useState([]);
  const [checkedClasses, setCheckedClasses] = useState([]);
  const [checkedAges, setCheckedAges] = useState([]);
  const [weightRange, setWeightRange] = useState([15, 35]);

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
  const [isClassView, setIsClassView] = useState(false);

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
        setFilteredData={setFilteredtData}
      />
      <ScatterCanvas
        filteredData={filteredData}
        xField={xField}
        yField={yField}
        colorField = {colorField}
        width= {1000}
        height={700}
        isClassView={isClassView}        
        onPointClick={handlePointClick}  //  setSelectedRecord
        setIsClassView={toggleIsClassView}
        updateData={updateData}      
        selectedRecord={selectedRecord}
      />

      
      <DetailCanvas data={selectedRecord} />


      <FilterCanvas 
        data={data}
        fields={fields.filter(field => field !== 'StudentID')} 
        checkedSchools={checkedSchools}
        setCheckedSchools={setCheckedSchools}
        checkedClasses={checkedClasses}
        setCheckedClasses={setCheckedClasses}
        weightRange={weightRange}
        setWeightRange={setWeightRange}
        checkedAges={checkedAges}
        setCheckedAges={setCheckedAges}
        setSchoolClassMap={setSchoolClassMap}
      />   

      <LogicCanvas  fields={fields} data ={data}/> 
      
    </div>
    </div>
  );
};

function rowParser(d) {
  // Apply D3 autoType first to handle all columns
  const parsedRow = d3.autoType(d);
  parsedRow['Årskurs'] = parseInt(parsedRow['Årskurs'], 10);
  parsedRow['Läsnivå (5 = hög)'] = parseInt(parsedRow['Läsnivå (5 = hög)'], 10);     
  //parsedRow['Födelsedatum'] = formatDate(parseDate(parsedRow['Födelsedatum']));  
  //parsedRow['Testdatum'] = formatDate(parseDate(parsedRow['Testdatum']));              

  // Convert Count to an integer
  //parsedRow.StudentID = +parsedRow.StudentID;

  return parsedRow;
}

function filterDataBySchoolAndClass(data, group_map) {
  return data.filter(record => {
      // Check if the school exists in the group_data
      const schoolClasses = group_map[record.Skola];
      if (!schoolClasses) return false;

      // Check if the class exists within the classes of that school
      return schoolClasses.includes(record.Klass);
  });
}




export default ScatterPage;