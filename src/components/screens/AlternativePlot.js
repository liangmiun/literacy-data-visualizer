import React, { useState, useMemo } from 'react';
import AxisSelectionCanvas from '../layouts/AxisSelectionCanvas';
import AggregateCanvas from '../layouts/AggregateCanvas';
import DetailCanvas from '../layouts/DetailCanvas';
import FilterCanvas from '../layouts/FilterCanvas';
import './App.css';
import {schoolClassFilteredData } from './ScatterPage';


const AlternativePage = (props) => {
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
    return schoolClassFilteredData(props.data, props.checkedClasses, props.checkedSchools);
  }, [props.data, props.checkedSchools, props.checkedClasses]);  

  const handlePartClick = (details) => {
    setSelectedClassDetail(details);
  };

  return (   
    <div className="app" >  
      <AxisSelectionCanvas
        data={props.data}
        fields={props.fields}
        xField={props.xField}
        yField={props.yField}
        colorField = {props.colorField}
        onXFieldChange={props.setXField}
        onYFieldChange={props.setYField}
        onColorFieldChange={props.setColorField}
        save = {props.save}
        load = {props.load}
        setConfig = {props.setConfigFromPreset}
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
        xField={props.xField}
        yField={props.yField}
        colorField = {props.colorField}
        width={1000}
        height={700}    
        onPartClick={handlePartClick} 
        studentsChecked={aggrStudentsChecked}
        showViolin={showAggrViolin}
      />

      <FilterCanvas 
        data={props.data}
        fields={props.fields.filter(field => field !== 'StudentID')} 
        checkedSchools={props.checkedSchools}
        setCheckedSchools={props.setCheckedSchools}
        checkedClasses={props.checkedClasses}
        setCheckedClasses={props.setCheckedClasses}
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