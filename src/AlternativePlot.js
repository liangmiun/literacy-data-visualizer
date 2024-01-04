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
  const [aggrStudentsChecked, setAggrStudentsChecked] = useState(false);
  const [showAggrViolin, setShowAggrViolin] = useState(false);
  const [isClassView, setIsClassView] = useState(false);


  const classKeyList =
    [
      'lastingclass',
      'class',
      'season',
      'min',
      'q1',
      'median',
      'q3',
      'max',
      'count'
    ];


  const classFilteredData = useMemo(() => {
    return schoolClassFilteredData(data, checkedClasses, checkedSchools);
  }, [data, checkedSchools, checkedClasses]);  



  const handlePartClick = (details) => {
    setSelectedClassDetail(details);
  };


  return (   
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
        setStudentsChecked={setAggrStudentsChecked}
        studentsChecked={aggrStudentsChecked}
        setShowViolin={setShowAggrViolin}
        showViolin={showAggrViolin}
        showXField = {false}
        showClassbar={true}
        isClassView={isClassView}
        setIsClassView={setIsClassView}
      />
      <AggregateCanvas
        filteredData={classFilteredData}
        xField={xField}
        yField={yField}
        colorField = {colorField}
        width={1000}
        height={700}    
        onPartClick={handlePartClick} 
        studentsChecked={aggrStudentsChecked}
        showViolin={showAggrViolin}
      />

      <FilterCanvas 
        data={data}
        fields={fields.filter(field => field !== 'StudentID')} 
        checkedSchools={checkedSchools}
        setCheckedSchools={setCheckedSchools}
        checkedClasses={checkedClasses}
        setCheckedClasses={setCheckedClasses}
        showOptionFilter={false}
        isAggregatedView={true}
      />   
      
      <DetailCanvas data={selectedClassDetail} keyList={classKeyList} />     


      {/*<FilterCanvas fields={fields.filter(field => field !== 'StudentID')} />   */} 

      {/*<LogicCanvas  fields={fields} data ={data}/>   */} 
      
    </div>
  );
};



export default AlternativePage;