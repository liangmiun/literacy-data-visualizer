import { TreeItem } from '@mui/x-tree-view/TreeItem';
import { TreeView } from '@mui/x-tree-view/TreeView';
import React, { useEffect } from 'react';
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

  return school_class;
}


function SchoolTreeView({ data,  checkedSchools,setCheckedSchools,checkedClasses,setCheckedClasses}) {

    const school_class = generateSchoolClassMap(data);

    useEffect(() => {
      // 1. Initialize checkedSchools and checkedClasses so all are checked
      const allSchools = Object.keys(school_class);
      const allClasses = allSchools.flatMap(school => 
          school_class[school].map(cls => `${school}.${cls}`)
      );
      setCheckedSchools(allSchools);
      setCheckedClasses(allClasses);
  },[data]);

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
      <div  className='school-tree-view'>
        <h4>Filter by School and Class</h4>  
        <TreeView style={{margin: '20px 20px',width: '80%' ,border: '1px solid gray',
            overflowX: 'auto', maxWidth: '15vw',
            overflowY: 'auto', maxHeight:'45vh' }}
          defaultCollapseIcon={<ExpandMoreIcon />}
          defaultExpandIcon={<ChevronRightIcon />}
        >
          <TreeItem nodeId="root" 
              label={
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    Schools
                    {/* 2. Add a clear button beside the "Schools" label */}
                    <button 
                        onClick={() => {
                            setCheckedSchools([]);
                            setCheckedClasses([]);
                        }}
                        style={{marginLeft: '10px'}}
                    >
                        Clear
                    </button>
                </div>
            }       
          
          >
            {Object.entries(school_class).map(([school, classes], idx) => (
              <TreeItem
                nodeId={`school-${idx}`}
                label={
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Checkbox 
                      checked={checkedSchools.includes(school)}
                      onChange={(event) => {handleSchoolCheckChange(school, event.target.checked)}}
                    />
                    {school}
                    <button 
                      onClick={() => {handleSchoolCheckChange(school, false);setCheckedClasses(prev => prev.filter(c => !c.startsWith(`${school}.`)))}}
                      style={{marginLeft: '10px'}}
                    >
                        Clear
                    </button>

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
            ))}
          </TreeItem>
        </TreeView> 
  
      </div>
    );
  }
  
  export default SchoolTreeView;



