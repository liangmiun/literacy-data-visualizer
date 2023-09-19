import React, { useState } from 'react';
import 'rc-slider/assets/index.css';
import SchoolTreeView from './SchoolTreeView';
import { WeightSlider, AgeCheckBoxes } from './ValueSelect';


const FilterCanvas = ({ data, checkedSchools,setCheckedSchools,checkedClasses,setCheckedClasses, weightRange, setWeightRange,checkedAges, setCheckedAges }) => {


  return (

    <div  className='filter-canvas'>
      <h2>Filter by School and Class</h2>
      
      {/* Detail Component */}
      <div style={{ margin: '20px 0' }}>
        <p>School: {checkedSchools.join(', ')}</p>
        <p>Class: {checkedClasses.join(', ')}</p>
        <p>Weight: {weightRange.join(', ')}</p>
        <p>Age: {checkedAges.join(', ')}</p>
      </div>


      <SchoolTreeView
        data={data} 
        checkedSchools={checkedSchools}
        setCheckedSchools={setCheckedSchools}
        checkedClasses={checkedClasses}
        setCheckedClasses={setCheckedClasses}    
      />

      <WeightSlider
        weightRange={weightRange}
        setWeightRange={setWeightRange}  
      />

      <AgeCheckBoxes 
        checkedAges={checkedAges}
        setCheckedAges={setCheckedAges}
      />



    </div>
  );
};

export default FilterCanvas;
