import { TreeItem } from '@mui/x-tree-view/TreeItem';
import { TreeView } from '@mui/x-tree-view/TreeView';
import React, { useState, useEffect } from 'react';
import { Checkbox } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import {classIDfromYearSchoolClass} from 'utils/AggregateUtils.js';
import 'assets/App.css';
import * as d3 from 'd3';
import Tooltip from '@mui/material/Tooltip';


function SchoolTreeView(props) {

  const { allClasses, selectedClasses, setSelectedClasses,  checkedSchools, checkedClasses, setCheckedClasses, checkedYearlyClasses, setCheckedYearlyClasses,
          isClassView, classColors, school_class_map, onColorPaletteClick} = props;

  const [areAllSchoolSelected, setAreAllSchoolSelected] = useState(true);
  const [paletteID, setPaletteID] = useState('');
  const [expandedSchools, ] = useState(['root']); 

  useEffect(() => {

    const createComparableString = (obj) => `${obj.school}-${obj.schoolYear}-${obj.class}`;

    // Sort both arrays based on the string representation
    const sortedAll = allClasses.map(createComparableString).sort();
    const sortedSelected = selectedClasses.map(createComparableString).sort();
    // Check if both sorted arrays are equal in length and all elements match
    const areAllClassesSelected = sortedAll.length === sortedSelected.length && sortedAll.every((element, index) => element === sortedSelected[index]);

    if(areAllClassesSelected) {
      setAreAllSchoolSelected(true);
    }
    else {
      setAreAllSchoolSelected(false);
    }
  },[selectedClasses, allClasses]);    

  const handleAllSchoolsCheckChange = (isChecked) => {
      if (isChecked) { 
        setSelectedClasses(allClasses);
      }
      else{
        setSelectedClasses([]);
      }
    };


  const handleClassSequenceCheckChange = (schoolClass, isChecked) => {
      const [school, classId] = schoolClass.split('.');  
      const classesMap =school_class_map[school];
      const classesInSequence = classesMap[classId].classes.map(item =>  item.Läsår + '-' + item.Klass);
      const yearlyClasses = classesInSequence.map(item => `${classId}.${item}`);    
      if (isChecked) {
          console.log('checked sequence', schoolClass);
          setCheckedClasses(prev => [...prev, schoolClass]);

          for( const yearlyClass of yearlyClasses) {
            if(!checkedYearlyClasses.includes(yearlyClass)){
              handleYearlyClassCheckChange(yearlyClass, true);
            }
          }
          // setCheckedYearlyClasses(prev => {
          //   return [...prev, ...classesInSequence.map(item => `${classId}.${item}`).filter(c => !prev.includes(c))];        
          // });
      } else {
          console.log('unchecked sequence', schoolClass);
          setCheckedClasses(prev => prev.filter(c => c !== schoolClass));
          for( const yearlyClass of yearlyClasses) {
            if(checkedYearlyClasses.includes(yearlyClass)){
              handleYearlyClassCheckChange(yearlyClass, false);
            }
          }
          //setCheckedYearlyClasses(prev => prev.filter(c => !c.startsWith(`${classId}.`)));
      }
  };

  const handleYearlyClassCheckChange = (sequence_class, isChecked) => {
    if (isChecked) {
        setCheckedYearlyClasses(prev => [...prev, sequence_class]);
    } else {
        setCheckedYearlyClasses(prev => { if(prev.length>0 ) return prev.filter(c => c !== sequence_class);  return prev;});
    }
    console.log('handleYearlyClassCheckChange', checkedYearlyClasses);
  };

  const handleColorChange = (school, classID, newColor) => {
    setPaletteID('');
    onColorPaletteClick(school, classID, newColor);
  };



  return (
      <div  className='school-tree-view' style={{ margin: '0px 3px'}}>
        <h4 style={{ textAlign: 'center' }} >
        <Tooltip title="Select schools and classes: ☑ for all, ☐ for none and ▣ for some." followCursor>        
        <label>Filter by School and Class </label>
        </Tooltip>
          
        </h4>  
        <TreeView  style={{margin: '5px 5px',width: '100%' ,
            overflowX: 'auto', maxWidth: '20vw',
            overflowY: 'auto', maxHeight:'50vh' }}
          defaultCollapseIcon={<ExpandMoreIcon />}
          defaultExpandIcon={<ChevronRightIcon />}
          defaultExpanded={expandedSchools}    

        >

        <div  style={{ display: 'flex', alignItems: 'flex-start'  }}>
          <Checkbox  style={{ padding: '1px' }}
              checked={areAllSchoolSelected}
              indeterminate={!areAllSchoolSelected && selectedClasses.length > 0}
              onChange={(event) => {handleAllSchoolsCheckChange(event.target.checked)}}
          /> 

          <TreeItem nodeId="root" 
              label={
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    Schools
                    {/* 2. Add a clear button beside the "Schools" label */}

                </div>
            }  
          
          >
            {Object.entries(school_class_map).map( ([school, classesMap], idx) =>( 
            
              <SchoolComponent
                key={school}
                props={{
                  school,
                  selectedClasses,
                  setSelectedClasses,
                  allClassesInSchool: allClasses.filter(c => c.school === school),
                  classesMap,
                  idx,
                  checkedClasses,
                  setCheckedClasses,
                  handleClassSequenceCheckChange,
                  handleYearlyClassCheckChange,
                  checkedYearlyClasses,                    
                  checkedSchools,
                  setPaletteID,
                  paletteID,
                  handleColorChange,
                  isClassView,
                  classColors,
                }}
              />
            
            
            ))}
          </TreeItem>



        </div>
          
        </TreeView> 
  
      </div>

  );
}


function SchoolComponent({ props }) {
  const { school, selectedClasses, setSelectedClasses, allClassesInSchool,
        classesMap, checkedClasses,  idx, handleClassSequenceCheckChange,handleYearlyClassCheckChange, 
        setPaletteID, paletteID, handleColorChange, checkedYearlyClasses, isClassView, classColors } = props;

  const [areAllClassesInSchoolSelected, setAreAllClassesInSchoolSelected] = useState(false);
  const [selectedClassesInSchool, setSelectedClassesInSchool] = useState(selectedClasses.filter(c => c.school === school));  

  useEffect(() => {
    const createComparableString = (obj) => `${obj.school}-${obj.schoolYear}-${obj.class}`;

    // Sort both arrays based on the string representation
    const sortedAll = allClassesInSchool.map(createComparableString).sort();
    const sortedSelected = selectedClassesInSchool.map(createComparableString).sort();
    // Check if both sorted arrays are equal in length and all elements match
    const areAllInSchoolSelected = sortedAll.length === sortedSelected.length && sortedAll.every((element, index) => element === sortedSelected[index]);

    if(areAllInSchoolSelected) {
      setAreAllClassesInSchoolSelected(true);
    }
    else {
      setAreAllClassesInSchoolSelected(false);
    }   

  }  ,[school, selectedClassesInSchool, allClassesInSchool]);


  useEffect(() => {
    //update selected classes in school
    setSelectedClassesInSchool(selectedClasses.filter(c => c.school === school));
  },[selectedClasses, school]);



  function handleSchoolCheckChange(isChecked) { 
    if(isChecked){
      setSelectedClasses(prev => [...prev.filter(c => c.school !== school), ...allClassesInSchool]); 
    }
    else{
      setSelectedClasses(prev => prev.filter(c => c.school !== school));
    }
  }



  return (
    <div style={{ display: 'flex', alignItems: 'flex-start' }}>
      <Checkbox
        style={{ padding: '1px' }}
        checked={areAllClassesInSchoolSelected}
        indeterminate={  !areAllClassesInSchoolSelected && selectedClassesInSchool.length > 0}
        onChange={(event) => handleSchoolCheckChange(event.target.checked)}
      />
      {/* Render classes and other UI elements here */}

      <TreeItem
          nodeId={`school-${idx}`}
          label={
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {school }
            </div>
          }
          key={school}
        >
          {Object.entries(classesMap).map(([classId, classes], cIdx) => (
            <ClassSequenceComponent
              key={classId}
              props={{
                school,
                classId,
                idx,
                cIdx,
                selectedClasses,
                setSelectedClasses,
                allClassesInSequence: classes.classes.map(item => ({
                  school: school,
                  schoolYear: item.Läsår,
                  class: item.Klass
                })),
                classesMap,
                checkedClasses,
                checkedYearlyClasses,
                handleClassSequenceCheckChange,
                handleYearlyClassCheckChange,
                setPaletteID,
                paletteID,
                handleColorChange,
                isClassView,
                classColors,
              }}
            
            
            />

          ))}
      </TreeItem>  
    </div>
  );
}


function ClassSequenceComponent({ props }) {
  const { school, classId,  selectedClasses, setSelectedClasses, allClassesInSequence,  classesMap, idx, cIdx, checkedYearlyClasses, 
          setPaletteID, paletteID, handleColorChange, isClassView, classColors, handleYearlyClassCheckChange } = props;

  const classesInSequence = classesMap[classId].classes.map(item =>  item.Läsår + '-' + item.Klass);
  const schoolShort = school.toString().substring(0,4).replace(/\s+/g, '_');

  console.log('allClassesInSequence', allClassesInSequence, classId);

  const [areAllClassesInSequenceSelected, setAreAllClassesInSequenceSelected] = useState(false);
  const [selectedClassesInSequence, setSelectedClassesInSequence] = useState(
      selectedClasses.filter(c => c.school === school && classIDfromYearSchoolClass(parseInt(c.schoolYear.split("/")[0]), schoolShort, c.class) === classId)
    );

  useEffect(() => {
    const createComparableString = (obj) => `${obj.school}-${obj.schoolYear}-${obj.class}`;

    // Sort both arrays based on the string representation
    const sortedAll = allClassesInSequence.map(createComparableString).sort();
    const sortedSelected = selectedClassesInSequence.map(createComparableString).sort();
    // Check if both sorted arrays are equal in length and all elements match
    const areAllInSequenceSelected = sortedAll.length === sortedSelected.length && sortedAll.every((element, index) => element === sortedSelected[index]);

    if(areAllInSequenceSelected) {
      setAreAllClassesInSequenceSelected(true);
    }
    else {
      setAreAllClassesInSequenceSelected(false);
    }

    console.log('areAllInSequenceSelected', areAllInSequenceSelected, sortedAll, sortedSelected);
  },[selectedClassesInSequence, allClassesInSequence]);

  useEffect(() => {
    //update selected classes in sequence
    setSelectedClassesInSequence(selectedClasses.filter(c => c.school === school && classIDfromYearSchoolClass(parseInt(c.schoolYear.split("/")[0]), schoolShort, c.class) === classId));
  },[selectedClasses, classId, school, schoolShort]);

  
  function handleClassSequenceCheckChange( isChecked) {
  
    if(isChecked){
      //setSelectedClassesInSequence(allClassesInSequence);
      setSelectedClasses( prev => [...prev.filter(c => c.school !== school || classIDfromYearSchoolClass(parseInt(c.schoolYear.split("/")[0]),schoolShort, c.class) !== classId), ...allClassesInSequence]);
    }
    else
    {
      //setSelectedClassesInSequence([]);
      setSelectedClasses( prev => prev.filter(c => c.school !== school || classIDfromYearSchoolClass(parseInt(c.schoolYear.split("/")[0]),schoolShort, c.class) !== classId));
    }
  }


  return (
    <div key={classId}  style={{ display: 'flex', alignItems: 'flex-start' }} >  
    {/* //  style={{ display: 'flex', alignItems: 'center', flexDirection: 'row' }} */}
      <Checkbox 
        checked={areAllClassesInSequenceSelected}
        style={{ padding: '1px' }}
        indeterminate={ !areAllClassesInSequenceSelected && selectedClassesInSequence.length > 0}
        onChange={(event) => handleClassSequenceCheckChange(event.target.checked)}
      />
      <TreeItem
        nodeId={`classSequence-${idx}-${cIdx}`}
        label={
          <div style={{ display: 'flex', alignItems: 'center' }}>
          {classId }
          </div>
        }
        key={classId}
      >
          {Object.entries(classesInSequence).map(([ yearlyIdx,yearlyClass], cIdx) => (
            <SingleYearClassComponent
              key={yearlyClass}
              props={{
                school,
                selectedClasses,
                setSelectedClasses,
                classId,
                checkedYearlyClasses,
                handleYearlyClassCheckChange,
                yearlyClass,                
                idx,
                cIdx,
                setPaletteID,
                paletteID,
                handleColorChange,
                isClassView,
                classColors
              }}
            />
          ))}
      </TreeItem>
      <div>
        <div 
          style={{ width: '10px', height: '10px', backgroundColor: props.isClassView? props.classColors[school][classId]: 'white', marginLeft: '5px' }}
          onClick={() => setPaletteID(classId)}
        />
        {paletteID===classId && props.isClassView && (
          <div style={{ marginTop: '5px' }}>
            {[0, 1].map(row => (
              <div key={row} style={{ display: 'flex' }}>
                {d3.schemeCategory10.slice(row * 5, (row + 1) * 5).map((paletteColor, index) => (
                  <div 
                    key={index}
                    style={{ width: '10px', height: '10px', backgroundColor:  paletteColor, marginLeft: '2px' }}
                    onClick={() => handleColorChange(school, classId, paletteColor)}
                  />
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
  
}


function SingleYearClassComponent({ props }) {
  const { school, setSelectedClasses,  yearlyClass, idx, cIdx, setPaletteID, paletteID, handleColorChange,
          isClassView, classColors } = props;  

  const [isClassChecked, setIsClassChecked] = useState(false);

  useEffect(() => {
    setIsClassChecked(props.selectedClasses.some(c => c.school === school && c.schoolYear === yearlyClass.split('-')[0] && c.class === yearlyClass.split('-')[1]));
  },[props.selectedClasses, school, yearlyClass]);

  function handleYearlyClassCheckChange(isChecked) {
    const schoolYear = yearlyClass.split('-')[0];
    const className = yearlyClass.split('-')[1];
    if(isChecked){
      setSelectedClasses(prev => [...prev.filter( c => !( c.school=== school && c.schoolYear === schoolYear && c.class === className ) ), {school: school, schoolYear:schoolYear, class: className}]);
    }
    else{
      setSelectedClasses(prev => prev.filter( c => !( c.school=== school && c.schoolYear === schoolYear && c.class === className ) ));
    }
  }

  return (
    <div key={yearlyClass} style={{ display: 'flex', alignItems: 'center', flexDirection: 'row' }}>
      <TreeItem
        nodeId={`classByYear-${idx}-${cIdx}`}
        label={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Checkbox 
              checked={isClassChecked}
              onChange={(event) => handleYearlyClassCheckChange( event.target.checked)}
            />
            {/* <Tooltip title={transformClassTooltip(yearlyClass)} followCursor>        */}
            <label>{yearlyClass }</label>
            {/* </Tooltip> */}
          </div>
        }
        key={yearlyClass}
      />

      <div>
        <div 
          style={{ width: '10px', height: '10px', backgroundColor: isClassView? classColors[school][yearlyClass]: 'white', marginLeft: '5px' }}
          onClick={() => setPaletteID(yearlyClass)}
        />
        {paletteID===yearlyClass && isClassView && (
          <div style={{ marginTop: '5px' }}>
            {[0, 1].map(row => (
              <div key={row} style={{ display: 'flex' }}>
                {d3.schemeCategory10.slice(row * 5, (row + 1) * 5).map((paletteColor, index) => (
                  <div 
                    key={index}
                    style={{ width: '10px', height: '10px', backgroundColor:  paletteColor, marginLeft: '2px' }}
                    onClick={() => handleColorChange(school, yearlyClass, paletteColor)}
                  />
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );


}


function transformClassTooltip(input) {
  // Split the string by ":" to separate the prefix and the numbers
  const parts = input.split(':');
  const baseParts = parts[1].split('-');

  // Further split the second part of the number to separate digits and letters
  const numPart = baseParts[1].match(/\d+/g); // Matches all the digit(s)
  const letterPart = baseParts[1].match(/[a-zA-Z]+/g); // Matches all the letter(s)

  // Parse the first part of the number to use it as a base for incrementing
  let baseNumber = parseInt(baseParts[0]) + 2000;


  // Use template literals to create the new string.
  const newString = `Class ${baseNumber}-${numPart ? numPart : ''}${letterPart ? letterPart[0] : ''}, 
                    ${baseNumber + 1}-${numPart ? parseInt(numPart) + 1 : ''}${letterPart ? letterPart[0] : ''},
                    ${baseNumber + 2}-${numPart ? parseInt(numPart) + 2 : ''}${letterPart ? letterPart[0] : ''} from ${parts[0]} school`;


  return newString;
}


export default SchoolTreeView;
