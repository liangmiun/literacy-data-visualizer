import { TreeItem } from '@mui/x-tree-view/TreeItem';
import { TreeView } from '@mui/x-tree-view/TreeView';
import React, { useState, useEffect } from 'react';
import { Checkbox } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import 'assets/App.css';
import * as d3 from 'd3';
import Tooltip from '@mui/material/Tooltip';


function SchoolTreeView(props) {

  const { checkedSchools, setCheckedSchools, checkedClasses, setCheckedClasses, checkedYearlyClasses, setCheckedYearlyClasses,
          isClassView, classColors, school_class_map, onColorPaletteClick} = props;

  const [checkedAllSchools, setCheckedAllSchools] = useState(true);
  const [existIndeterminateSchool, setExistIndeterminateSchool] = useState(false);

  const allSchools = Object.keys(school_class_map);
  // const allClasses = allSchools.flatMap(school => 
  //     Object.keys(school_class_map[school]).map(classId => `${school}.${classId}`)
  // );
  const [paletteID, setPaletteID] = useState('');
  const [expandedSchools, ] = useState(['root']); 
  const [indeterminateAllSchools, setIndeterminateAllSchools] = useState(false);


  useEffect(() => {
    // Logic to determine if some schools are fully checked, partially checked, or not checked
    const someChecked = allSchools.some(school => 
      checkedSchools.includes(school));

    const someUnchecked = allSchools.some(school => 
      !checkedSchools.includes(school) 
      );

    setIndeterminateAllSchools(existIndeterminateSchool || (someChecked && someUnchecked));
    setCheckedAllSchools(allSchools.length === checkedSchools.length && someUnchecked === false); 
  }, [checkedSchools, allSchools, existIndeterminateSchool]);


  const handleAllSchoolsCheckChange = (isChecked) => {
      if (isChecked) {  
          console.log('check allSchools', allSchools);
          for( const school of allSchools) {
            if(!checkedSchools.includes(school)){
            handleSchoolCheckChange(school, true);
            }
          }
          setCheckedAllSchools(true);
      }
      else{
        for( const school of allSchools) {
          if(checkedSchools.includes(school)){
          handleSchoolCheckChange(school, false);
          }
        }
        setCheckedAllSchools(false);
      }
    };

  const handleSchoolCheckChange = (school, isChecked) => {

    if (isChecked) {
          setCheckedSchools(prev => [...prev, school]);
          const toCheckSchoolClasses = Object.keys(school_class_map[school]).map(classId => `${school}.${classId}`);
          console.log('toCheckSchoolClasses', toCheckSchoolClasses, "checkedClasses", checkedClasses );
          for( const schoolClass of toCheckSchoolClasses) {
            if(!checkedClasses.includes(schoolClass)){
              handleClassSequenceCheckChange(schoolClass, true);
            }
          }
          //setCheckedClasses(prev => [...prev, ...Object.keys(school_class_map[school]).map(classId => `${school}.${classId}`)]);
      } else {   
          setCheckedSchools(prev => prev.filter(s => s !== school));
          const toUncheckSchoolClasses = Object.keys(school_class_map[school]).map(classId => `${school}.${classId}`);
          for (const schoolClass of toUncheckSchoolClasses) {
            if(checkedClasses.includes(schoolClass)){
              handleClassSequenceCheckChange(schoolClass, false);
            }
          }
          //setCheckedClasses(prev => prev.filter(c => !c.startsWith(`${school}.`)));
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
              checked={checkedAllSchools}
              indeterminate={indeterminateAllSchools}
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
                  classesMap,
                  idx,
                  checkedClasses,
                  setCheckedClasses,
                  handleClassSequenceCheckChange,
                  handleYearlyClassCheckChange,
                  checkedYearlyClasses,                    
                  checkedSchools,
                  handleSchoolCheckChange,
                  setPaletteID,
                  paletteID,
                  handleColorChange,
                  isClassView,
                  classColors,
                  setExistIndeterminateSchool
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
  const { school, classesMap, checkedClasses, handleSchoolCheckChange, idx, handleClassSequenceCheckChange,handleYearlyClassCheckChange, 
        setPaletteID, paletteID, handleColorChange, checkedYearlyClasses, isClassView, classColors, setExistIndeterminateSchool} = props;

  const sequenceCheckStates = Object.entries(classesMap).map(([classId]) =>
    checkedClasses.includes(`${school}.${classId}`)
  );

  const [schoolHasIndeterminateSequence, setSchoolHasIndeterminateSequence] = useState(false);

  const someSequenceChecked = sequenceCheckStates.some(checked => checked);
  const someSequenceUnchecked = sequenceCheckStates.some(checked => !checked);
  const allSequenceChecked = sequenceCheckStates.every(checked => checked);
  const schoolInChecked = props.checkedSchools.includes(school);
  const isSchoolIndeterminate = schoolHasIndeterminateSequence || (someSequenceChecked && someSequenceUnchecked);

  useEffect(() => {
    if (allSequenceChecked && !schoolInChecked) {
      handleSchoolCheckChange(school, true);
    }
  }, [allSequenceChecked, school, handleSchoolCheckChange , schoolInChecked]);  

  useEffect(() => {
    if (someSequenceChecked && someSequenceUnchecked) {
      setExistIndeterminateSchool(true);
    }
    else
      setExistIndeterminateSchool(false);
  }, [setExistIndeterminateSchool, someSequenceChecked, someSequenceUnchecked]);

  // useEffect(() => {
  //   if (someClassChecked && someClassUnchecked) {
  //     setSchoolHasIndeterminateSequence(true);
  //   }
  //   else
  //     setSchoolHasIndeterminateSequence(false);
  // }, [setSchoolHasIndeterminateSequence, someClassChecked, someClassUnchecked]);

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start' }}>
      <Checkbox
        style={{ padding: '1px' }}
        checked={props.checkedSchools.includes(school)}
        indeterminate={isSchoolIndeterminate}
        onChange={(event) => handleSchoolCheckChange(school, event.target.checked)}
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
                setSchoolHasIndeterminateSequence
              }}
            
            
            />

          ))}
      </TreeItem>  
    </div>
  );
}


function ClassSequenceComponent({ props }) {
  const { school, classId, classesMap, idx, cIdx, checkedYearlyClasses, handleClassSequenceCheckChange, setSchoolHasIndeterminateSequence,
          setPaletteID, paletteID, handleColorChange, isClassView, classColors, handleYearlyClassCheckChange } = props;

  const classesInSequence = classesMap[classId].classes.map(item =>  item.Läsår + '-' + item.Klass);

  const classCheckStates = Object.entries(classesInSequence).map(([yearlyId, yearlyClass]) =>{
    return checkedYearlyClasses.includes(`${classId}.${yearlyClass}`)

    //return checkedYearlyClasses.map( item => item.split('.')[1]).includes(`${yearlyClass}`)
  }  // problematic here.
);

  const someClassChecked = classCheckStates.some(checked => checked);
  const someClassUnchecked = classCheckStates.some(checked => !checked);
  const allClassChecked = classCheckStates.every(checked => checked);
  const sequenceInChecked = props.checkedClasses.includes(`${school}.${classId}`);

  useEffect(() => {
    if (allClassChecked && !sequenceInChecked) {
      //console.log('a sequence is filled by yearly classes', `${school}.${classId}`, classCheckStates, checkedYearlyClasses);
      handleClassSequenceCheckChange(`${school}.${classId}`, true);
    }
  }, [allClassChecked, school, classId, handleClassSequenceCheckChange , sequenceInChecked]);  

  useEffect(() => {
    if (someClassChecked && someClassUnchecked) {
      setSchoolHasIndeterminateSequence(true);
    }
    else
      setSchoolHasIndeterminateSequence(false);
  }, [setSchoolHasIndeterminateSequence, someClassChecked, someClassUnchecked]);

  return (
    <div key={classId}  style={{ display: 'flex', alignItems: 'flex-start' }} >  
    {/* //  style={{ display: 'flex', alignItems: 'center', flexDirection: 'row' }} */}
      <Checkbox 
        checked={props.checkedClasses.includes(`${school}.${classId}`)}
        style={{ padding: '1px' }}
        indeterminate={someClassChecked && someClassUnchecked}
        onChange={(event) => handleClassSequenceCheckChange(`${school}.${classId}`, event.target.checked)}
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
  const { school, classId, yearlyClass, idx, cIdx, setPaletteID, paletteID, handleColorChange,
          checkedYearlyClasses, handleYearlyClassCheckChange, isClassView, classColors } = props;  



  return (
    <div key={yearlyClass} style={{ display: 'flex', alignItems: 'center', flexDirection: 'row' }}>
      <TreeItem
        nodeId={`classByYear-${idx}-${cIdx}`}
        label={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Checkbox 
              checked={checkedYearlyClasses.length>0 && checkedYearlyClasses.includes(`${classId}.${yearlyClass}`)}
              onChange={(event) => handleYearlyClassCheckChange(`${classId}.${yearlyClass}`, event.target.checked)}
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
