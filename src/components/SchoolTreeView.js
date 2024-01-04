import { TreeItem } from '@mui/x-tree-view/TreeItem';
import { TreeView } from '@mui/x-tree-view/TreeView';
import Button from '@mui/material/Button';
import React, { useState, useEffect } from 'react';
import { Checkbox } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { generateSchoolLastingClassMap } from '../Utils.js';
import '../App.css';


function SchoolTreeView({
  data, 
  checkedSchools,
  setCheckedSchools,
  checkedClasses,
  setCheckedClasses,
  isAggregatedView
}) {

  const school_class = generateSchoolLastingClassMap(data);   // Generate the school_class map from the data
  const [checkedAllSchools, setCheckedAllSchools] = useState(true);
  const allSchools = Object.keys(school_class);
  const allClasses = allSchools.flatMap(school => 
      Object.keys(school_class[school]).map(classId => `${school}.${classId}`)
  );


  const [expandedSchools, setExpandedSchools] = useState(['root']);

  useEffect(() => {
    if(isAggregatedView){
      setCheckedSchools([]);
      setCheckedClasses([]);
      setCheckedAllSchools(false);

    } else{
      setCheckedSchools(allSchools);
      setCheckedClasses(allClasses);
      setCheckedAllSchools(true);
    }
  }, [data, isAggregatedView]);


  const handleAllSchoolsCheckChange = (isChecked) => {
      if (isChecked) {  
          setCheckedSchools(allSchools);
          setCheckedClasses(allClasses);
          setCheckedAllSchools(true);
      }
  }

  const handleSchoolCheckChange = (school, isChecked) => {
      if (isChecked) {
          setCheckedSchools(prev => [...prev, school]);
          setCheckedClasses(prev => [...prev, ...Object.keys(school_class[school]).map(classId => `${school}.${classId}`)]);
      } else {   
          setCheckedSchools(prev => prev.filter(s => s !== school));
      }
  };

  const handleClassCheckChange = (schoolClass, isChecked) => {
      const [school, classId] = schoolClass.split('.');
      if (isChecked) {
          setCheckedClasses(prev => [...prev, schoolClass]);
      } else {
          setCheckedClasses(prev => prev.filter(c => c !== schoolClass));
          setCheckedSchools(prev => prev.filter(s => s !== school));
      }
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

        <div style={{ display: 'flex', alignItems: 'flex-start' }}>
          <Checkbox  style={{ padding: '1px' }}
              checked={checkedAllSchools}
              onChange={(event) => {handleAllSchoolsCheckChange(event.target.checked)}}
          /> 

          <Button variant="text" size="small"
              onClick={() => {
                  setCheckedSchools([]);
                  setCheckedClasses([]);
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
             {Object.entries(school_class).map(([school, classesMap], idx) => (
              <div key={school} style={{ display: 'flex', alignItems: 'flex-start' }}>
                <Checkbox  style={{ padding: '1px' }}
                      checked={checkedSchools.includes(school)}
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
                    <TreeItem
                      nodeId={`class-${idx}-${cIdx}`}
                      label={
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <Checkbox 
                            checked={checkedClasses.includes(`${school}.${classId}`)}
                            onChange={(event) => handleClassCheckChange(`${school}.${classId}`, event.target.checked)}
                          />
                          {classId }
                        </div>
                      }
                      key={classId}
                    />
                  ))}
                </TreeItem>


                <Button size="small"
                        onClick={() => {handleSchoolCheckChange(school, false);setCheckedClasses(prev => prev.filter(c => !c.startsWith(`${school}.`)))}}
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



