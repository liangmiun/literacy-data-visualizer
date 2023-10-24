import { TreeItem } from '@mui/x-tree-view/TreeItem';
import { TreeView } from '@mui/x-tree-view/TreeView';
import React, { useState, useEffect } from 'react';
import { Checkbox } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { generateClassId } from '../Utils.js';
import '../App.css';


function generateSchoolLastingClassMap(litData) {
  const schoolMap = {};

  litData.forEach(entry => {
      const school = entry.Skola;
      const classId = generateClassId(entry); // Use the function from AA.js to generate the classID

      if (!schoolMap[school]) {
          schoolMap[school] = {};
      }

      if (!schoolMap[school][classId]) {
          schoolMap[school][classId] = {
              classes: [],
          };
      }

      if (!schoolMap[school][classId].classes.some(klass => klass.Klass === entry.Klass)) {
          schoolMap[school][classId].classes.push({ Läsår: entry.Läsår, Klass: entry.Klass });
      }
  });

  return schoolMap;
}


function SchoolTreeView({
  data, 
  checkedSchools,
  setCheckedSchools,
  checkedClasses,
  setCheckedClasses
}) {

  const school_class = generateSchoolLastingClassMap(data);
  const [checkedAllSchools, setCheckedAllSchools] = useState(true);
  const allSchools = Object.keys(school_class);

  const allClasses = allSchools.flatMap(school => 
      Object.keys(school_class[school]).map(classId => `${school}.${classId}`)
  );

  useEffect(() => {
      setCheckedSchools(allSchools);
      setCheckedClasses(allClasses);
  }, [data]);

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
          //console.log("from school checkedClasses: ", checkedClasses);
      } else {   
          setCheckedSchools(prev => prev.filter(s => s !== school));
      }
  };

  const handleClassCheckChange = (schoolClass, isChecked) => {
      const [school, classId] = schoolClass.split('.');
      if (isChecked) {
          setCheckedClasses(prev => [...prev, schoolClass]);
          //console.log("checkedClasses: ", checkedClasses);
      } else {
          setCheckedClasses(prev => prev.filter(c => c !== schoolClass));
          setCheckedSchools(prev => prev.filter(s => s !== school));
          //console.log("after uncheck, checkedClasses: ", checkedClasses);
      }
  };

  return (
        <div  className='school-tree-view' style={{ margin: '5px 5px'}}>
        <h4>Filter by School and Class</h4>  
        <TreeView  style={{margin: '5px 5px',width: '100%' ,border: '1px solid gray',
            overflowX: 'auto', maxWidth: '20vw',
            overflowY: 'auto', maxHeight:'45vh' }}
          defaultCollapseIcon={<ExpandMoreIcon />}
          defaultExpandIcon={<ChevronRightIcon />}
        >

        <div style={{ display: 'flex', alignItems: 'flex-start' }}>
          <Checkbox  style={{ padding: '1px' }}
              checked={checkedAllSchools}
              onChange={(event) => {handleAllSchoolsCheckChange(event.target.checked)}}
          /> 

          <button 
              onClick={() => {
                  setCheckedSchools([]);
                  setCheckedClasses([]);
                  setCheckedAllSchools(false);
              }}
              style={{marginLeft: '1px'}}
            >
                X
          </button>

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
                      {school}
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
                          {classId}
                        </div>
                      }
                      key={classId}
                    />
                  ))}
                </TreeItem>


                <button 
                        onClick={() => {handleSchoolCheckChange(school, false);setCheckedClasses(prev => prev.filter(c => !c.startsWith(`${school}.`)))}}
                        style={{marginLeft: '10px'}}
                      >
                          Clear
                </button>

              </div>
            ))}
          </TreeItem>



        </div>
          
        </TreeView> 
  
      </div>






  );
}

  
  export default SchoolTreeView;



