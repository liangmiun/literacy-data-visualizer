import React, { useState, useEffect,useMemo } from 'react';
import { csv } from 'd3';
import * as d3 from 'd3';
import AxisSelectionCanvas from './components/AxisSelectionCanvas';
import ScatterCanvas from './components/ScatterCanvas';
import DetailCanvas from './components/DetailCanvas';
import FilterCanvas from './components/FilterCanvas';
import LogicCanvas from './components/LogicCanvas';
import './App.css';


export function schoolClassFilteredData(data,checkedClasses,checkedSchools) {
  return data.filter(record => {
      // Check if the school of the record is in checkedSchools
      if (checkedSchools.includes(record.Skola)) {
          return true;
      }

      // Construct the school.class string from the record
      const schoolClassCombo = `${record.Skola}.${record.Klass}`;
      // Check if this combo is in checkedClasses
      if (checkedClasses.includes(schoolClassCombo)) {
          return true;
      }

      // If none of the above conditions are met, exclude this record
      return false;
  } );    
}

const ScatterPage = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredtData] = useState(data);
  const [selectedRecord, setSelectedRecord] = useState(null); 
  const [xField, setXField] = useState('Testdatum');
  const [yField, setYField] = useState('Lexplore Score');
  const [colorField, setColorField] = useState('Årskurs');
  const fields = Object.keys(data[0] || {});

  const [checkedSchools, setCheckedSchools] = useState([]);
  const [checkedClasses, setCheckedClasses] = useState([]);
  const [checkedOptions, setCheckedOptions] = useState(
    {'Årskurs':[],
    'Läsår':[],
    'Stanine':[]}
    );
  const [rangeOptions, setRangeOptions] = useState(
    {'Födelsedatum':[],
    'Testdatum':[],
    'Lexplore Score':[]}
    );

  const [filterList, setFilterList] = useState([]);


  function checkedFilteredData(data) {
    return data.filter(record => {
        for (let key in checkedOptions) {
            if ( filterList.includes(key) && ! checkedOptions[key].includes(record[key])) {
                return false;
            }
        }
        return true;
    });
  }


  function rangeFilteredData(data) {
    return data.filter(record => {
        for (let key in rangeOptions) {
          const [min, max] = rangeOptions[key];
          if ( filterList.includes(key)  && !(record[key] >= min && record[key] <= max)) {
              return false;
          }
        }
        return true;
    });
  }



  //const shownData = checkedFilteredData(rangeFilteredData(schoolClassFilteredData(data)));
  const shownData = useMemo(() => {
      return checkedFilteredData(rangeFilteredData(schoolClassFilteredData(data,checkedClasses,checkedSchools)));
    }, [data, checkedOptions, rangeOptions, checkedSchools, checkedClasses]);  





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
        filteredData={shownData}
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
        rangeOptions={rangeOptions}
        setRangeOptions={setRangeOptions}
        checkedOptions={checkedOptions}
        setCheckedOptions={setCheckedOptions}
        setFilterList=  {setFilterList}
      />   

      <LogicCanvas  
        fields={fields} 
        data ={data}
        setFilteredData={setFilteredtData}
      /> 
      
    </div>
    </div>
  );
};

const parseDate = d3.timeParse('%y%m%d');

let count = 0;

function rowParser(d) {


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