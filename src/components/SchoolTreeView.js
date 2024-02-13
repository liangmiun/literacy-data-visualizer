import { TreeItem } from '@mui/x-tree-view/TreeItem';
import { TreeView } from '@mui/x-tree-view/TreeView';
import Button from '@mui/material/Button';
import React, { useState, useEffect } from 'react';
import { Checkbox } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import '../App.css';
import * as d3 from 'd3';


function SchoolTreeView(props) {

  const [checkedAllSchools, setCheckedAllSchools] = useState(true);
  const allSchools = Object.keys(props.school_class);
  const allClasses = allSchools.flatMap(school => 
      Object.keys(props.school_class[school]).map(classId => `${school}.${classId}`)
  );
  const [paletteID, setPaletteID] = useState('');
  const [expandedSchools, ] = useState(['root']);

  useEffect(() => {
      props.setCheckedSchools(allSchools);
      props.setCheckedClasses(allClasses);
      setCheckedAllSchools(true);
  }, [props.school_class]);  


  const handleAllSchoolsCheckChange = (isChecked) => {
      if (isChecked) {  
          props.setCheckedSchools(allSchools);
          props.setCheckedClasses(allClasses);
          setCheckedAllSchools(true);
      }
  }

  const handleSchoolCheckChange = (school, isChecked) => {
      if (isChecked) {
          props.setCheckedSchools(prev => [...prev, school]);
          props.setCheckedClasses(prev => [...prev, ...Object.keys(props.school_class[school]).map(classId => `${school}.${classId}`)]);
      } else {   
          props.setCheckedSchools(prev => prev.filter(s => s !== school));
      }
  };

  const handleClassCheckChange = (schoolClass, isChecked) => {
      const [school, ] = schoolClass.split('.');
      if (isChecked) {
          props.setCheckedClasses(prev => [...prev, schoolClass]);
      } else {
          props.setCheckedClasses(prev => prev.filter(c => c !== schoolClass));
          props.setCheckedSchools(prev => prev.filter(s => s !== school));
      }
  };

  const handleColorChange = (school, classID, newColor) => {
    setPaletteID('');
    props.onColorPaletteClick(school, classID, newColor);
  };


  return (
      <div  className='school-tree-view' style={{ margin: '0px 3px'}}>
        <h4 style={{ textAlign: 'center' }} >Filter by School and Class</h4>  
        <TreeView  style={{margin: '5px 5px',width: '100%' ,border: '1px solid gray',
            overflowX: 'auto', maxWidth: '20vw',
            overflowY: 'auto', maxHeight:'45vh' }}
          defaultCollapseIcon={<ExpandMoreIcon />}
          defaultExpandIcon={<ChevronRightIcon />}
          defaultExpanded={expandedSchools}    

        >

        <div  style={{ display: 'flex', alignItems: 'flex-start' }}>
          <Checkbox  style={{ padding: '1px' }}
              checked={checkedAllSchools}
              onChange={(event) => {handleAllSchoolsCheckChange(event.target.checked)}}
          /> 

          <Button variant="text" size="small"
              onClick={() => {
                  props.setCheckedSchools([]);
                  props.setCheckedClasses([]);
                  setCheckedAllSchools(false);
              }}
              style={{marginLeft: '1px', minWidth: 0  }}
            >
                X
          </Button>

          <TreeItem nodeId="root" 
              label={
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    Schools
                    {/* 2. Add a clear button beside the "Schools" label */}

                </div>
            }  
          
          >
             {Object.entries(props.school_class).map(([school, classesMap], idx) => (
              <div key={school} style={{ display: 'flex', alignItems: 'flex-start' }}>
                <Checkbox  style={{ padding: '1px' }}
                      checked={props.checkedSchools.includes(school)}
                      onChange={(event) => {handleSchoolCheckChange(school, event.target.checked)}}
                />
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
                    <div key={classId} style={{ display: 'flex', alignItems: 'center', flexDirection: 'row' }}>
                    <TreeItem
                      nodeId={`class-${idx}-${cIdx}`}
                      label={
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <Checkbox 
                            checked={props.checkedClasses.includes(`${school}.${classId}`)}
                            onChange={(event) => handleClassCheckChange(`${school}.${classId}`, event.target.checked)}
                          />
                          {classId }
                        </div>
                      }
                      key={classId}
                    />
                    {/* <div style={{ width: '10px', height: '10px', backgroundColor: classColors[school](classId), marginLeft: '5px' }} /> */}
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
                  ))}
                </TreeItem>


                <Button size="small"
                        onClick={() => {handleSchoolCheckChange(school, false);props.setCheckedClasses(prev => prev.filter(c => !c.startsWith(`${school}.`)))}}
                        style={{marginLeft: '10px',  minWidth: 0 }}
                      >
                          X
                </Button>

              </div>
            ))}
          </TreeItem>



        </div>
          
        </TreeView> 
  
      </div>






  );
}
  
export default SchoolTreeView;



