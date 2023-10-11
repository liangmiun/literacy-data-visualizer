import React, { useState, useMemo } from 'react';
import AxisSelectionCanvas from './components/AxisSelectionCanvas';
import AggregateCanvas from './components/AggregateCanvas';
import DetailCanvas from './components/DetailCanvas';
import FilterCanvas from './components/FilterCanvas';
import './App.css';
import {schoolClassFilteredData } from './ScatterPage';


const AlternativePage = ({
  data,
  xField,
  setXField,
  yField,
  setYField,
  colorField,
  setColorField,
  fields,
  checkedSchools,
  setCheckedSchools,
  checkedClasses,
  setCheckedClasses,
  save,
  load,
  setConfigFromPreset
}) => {
  const [selectedClassDetail, setSelectedClassDetail] = useState([]);
  const [studentsChecked, setStudentsChecked] = useState(false);


  const classKeyList =
    ['min',
    'q1',
    'median',
    'q3',
    'max'
    ];

  const [showViolin, setShowViolin] = useState(false);

//   const [xField, setXField] = useState('ElevID');
//   const [yField, setYField] = useState('Lexplore Score');
//   const [colorField, setColorField] = useState('Lexplore Score');
//   const fields = Object.keys(data[0] || {});
//   const [checkedSchools, setCheckedSchools] = useState([]);
//   const [checkedClasses, setCheckedClasses] = useState([]);

//   const preset_dict = {
//     xField: '',
//     yField: '',
//     colorField: '',
//     checkedSchools: [],
//     checkedClasses: [],
//     checkedOptions: {},
//     rangeOptions: {},
//     query: '',
//     expression: []
//   };


  const classFilteredData = useMemo(() => {
    return schoolClassFilteredData(data, checkedClasses, checkedSchools);
  }, [data, checkedSchools, checkedClasses]);  

//   const updatePreset = () => {
//     preset_dict.xField = xField;
//     preset_dict.yField = yField;
//     preset_dict.colorField = colorField;
//   }


//   const setConfigFromPreset = (preset) => {
//     setXField( preset.xField);
//     setYField( preset.yField);
//     setColorField( preset.colorField);
//   }

//   const save = () => {
//     updatePreset();
//     const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(preset_dict));
//     const downloadAnchorNode = document.createElement('a');
//     downloadAnchorNode.setAttribute("href", dataStr);

//     // Ask the user for the filename
//     const fileName = prompt("Please enter the desired filename", "preset_config.json");
    
//     // If user clicks "Cancel" on the prompt, fileName will be null. In that case, don't proceed with the download.
//     if (fileName) {
//         downloadAnchorNode.setAttribute("download", fileName);
//         document.body.appendChild(downloadAnchorNode);
//         downloadAnchorNode.click();
//         downloadAnchorNode.remove();
//     }
// };


//   const load = (callback) => {
//     const uploadInputNode = document.createElement('input');
//     uploadInputNode.setAttribute("type", "file");
//     uploadInputNode.setAttribute("accept", "application/json");
  
//     uploadInputNode.onchange = (event) => {
//       const file = event.target.files[0];
//       if (!file) return;
  
//       const reader = new FileReader();
//       reader.onload = (e) => {
//         const content = e.target.result;
//         const loadedConfig = JSON.parse(content);
//         callback(loadedConfig);
//       };
  
//       reader.readAsText(file);
//     };
  
//     document.body.appendChild(uploadInputNode);
//     uploadInputNode.click();
//     uploadInputNode.remove();
//   };


  const handlePartClick = (details) => {
    setSelectedClassDetail(details);
  };


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
        save = {save}
        load = {load}
        setConfig = {setConfigFromPreset}
        setStudentsChecked={setStudentsChecked}
        studentsChecked={studentsChecked}
        setShowViolin={setShowViolin}
        showViolin={showViolin}
        showXField = {false}
        showClassbar={true}
      />
      <AggregateCanvas
        filteredData={classFilteredData}
        xField={xField}
        yField={yField}
        colorField = {colorField}
        width={1000}
        height={700}    
        onPartClick={handlePartClick} 
        studentsChecked={studentsChecked}
        showViolin={showViolin}
      />

      <FilterCanvas 
        data={data}
        fields={fields.filter(field => field !== 'StudentID')} 
        checkedSchools={checkedSchools}
        setCheckedSchools={setCheckedSchools}
        checkedClasses={checkedClasses}
        setCheckedClasses={setCheckedClasses}
        showOptionFilter={false}
      />   
      
      <DetailCanvas data={selectedClassDetail} keyList={classKeyList} />     


      {/*<FilterCanvas fields={fields.filter(field => field !== 'StudentID')} />   */} 

      {/*<LogicCanvas  fields={fields} data ={data}/>   */} 
      
    </div>
    </div>
  );
};



export default AlternativePage;