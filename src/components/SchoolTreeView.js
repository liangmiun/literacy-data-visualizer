import { TreeItem } from '@mui/x-tree-view/TreeItem';
import { TreeView } from '@mui/x-tree-view/TreeView';
import React, { useState, useEffect } from 'react';
import { Checkbox } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import '../App.css';


function generateSchoolClassMap(litData) {
  const school_class = {};

  litData.forEach(entry => {
      const school = entry.Skola;
      const klass = entry.Klass;

      if (!school_class[school]) {
          school_class[school] = [];
      }

      if (school_class[school].indexOf(klass) === -1) {
          school_class[school].push(klass);
      }
  });

  Object.keys(school_class).forEach(school => {
    school_class[school].sort((a, b) => a.localeCompare(b));
  });

  return school_class;
}


function SchoolTreeView({ data,  checkedSchools,setCheckedSchools,checkedClasses,setCheckedClasses}) {

    const school_class = generateSchoolClassMap(data);
    const [checkedAllSchools, setCheckedAllSchools] = useState(true);
    const allSchools = Object.keys(school_class);
    const allClasses = allSchools.flatMap(school => 
      school_class[school].map(cls => `${school}.${cls}`)
  );

    useEffect(() => {
      setCheckedSchools(allSchools);
      setCheckedClasses(allClasses);
  },[data]);

    const handleAllSchoolsCheckChange = (isChecked) => {
      if(isChecked){  
        setCheckedSchools(allSchools);
        setCheckedClasses(allClasses);
        setCheckedAllSchools(true);
      }
    }

    const handleSchoolCheckChange = (school, isChecked) => {
      if (isChecked) {
        setCheckedSchools(prev => [...prev, school]);
        setCheckedClasses(prev => [...prev, ...school_class[school].map(cls => `${school}.${cls}`)]);
      } else {   
        setCheckedSchools(prev => prev.filter(s => s !== school));
      }
  };    
 
    
    const handleClassCheckChange = (schoolClass, isChecked) => {
      const [school] = schoolClass.split('.');
      if (isChecked) {

        setCheckedClasses(prev => [...prev, schoolClass]);
      } else {

        setCheckedClasses(prev => prev.filter(c => c !== schoolClass));
        setCheckedSchools(prev => prev.filter(s => s !== school));
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
            {Object.entries(school_class).map(([school, classes], idx) => (
              <div style={{ display: 'flex', alignItems: 'flex-start' }}>
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
                  {classes.map((cls, cIdx) => (
                    <TreeItem
                      nodeId={`class-${idx}-${cIdx}`}
                      label={
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <Checkbox 
                            checked={checkedClasses.includes(`${school}.${cls}`)}
                            onChange={(event) => handleClassCheckChange(`${school}.${cls}`, event.target.checked)}
                          />
                          {cls}
                        </div>
                      }
                      key={cls}
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



