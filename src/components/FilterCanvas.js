import React from 'react';
import 'rc-slider/assets/index.css';
import SchoolTreeView from './SchoolTreeView';
import {SliderGroup, AgeCheckGroup, OptionSelectGroup } from './ValueSelect';


const FilterCanvas = ({ data, checkedSchools,setCheckedSchools,checkedClasses,setCheckedClasses, weightSegments,setWeightSegments,checkedAges, setCheckedAges }) => {


  return (

    <div  className='filter-canvas'>
      <h2>Filter by School and Class</h2>
      
      {/* Detail Component */}
      <div style={{ margin: '20px 0' }}>
        <p>School: {checkedSchools.join(', ')}</p>
        <p>Class: {checkedClasses.join(', ')}</p>
        <p>Weight Range: {`${weightSegments[0]} to ${weightSegments[1]}`}</p>
        <p>Age: {checkedAges.join(', ')}</p>
        <p>SchoolClass: {[...checkedSchools, ...checkedClasses].join(', ') }</p>
      </div>


      <SchoolTreeView
        data={data} 
        checkedSchools={checkedSchools}
        setCheckedSchools={setCheckedSchools}
        checkedClasses={checkedClasses}
        setCheckedClasses={setCheckedClasses}
      />

      <OptionSelectGroup checkedAges={checkedAges} setCheckedAges={setCheckedAges} setWeightSegments={setWeightSegments} />


      
      {/* <AgeCheckGroup checkedAges={checkedAges} setCheckedAges={setCheckedAges} />


      <SliderGroup weightSegments={weightSegments} setWeightSegments={setWeightSegments} /> */}



    </div>
  );
};

export default FilterCanvas;
