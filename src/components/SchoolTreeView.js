
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import { TreeView } from '@mui/x-tree-view/TreeView';
import { Checkbox } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import '../App.css';

const data = {
    "School A": ["class 1", "class 2", "class 3"],
    "School B": ["class x", "class y"],
    "School C": ["class c", "class d"]
  };


function SchoolTreeView({checkedSchools,setCheckedSchools,checkedClasses,setCheckedClasses}) {
  
    const handleSchoolCheckChange = (school, isChecked) => {
      if (isChecked) {
        setCheckedSchools(prev => [...prev, school]);
      } else {
        setCheckedSchools(prev => prev.filter(s => s !== school));
      }
    };
  
    const handleClassCheckChange = (schoolClass, isChecked) => {
      if (isChecked) {
        setCheckedClasses(prev => [...prev, schoolClass]);
      } else {
        setCheckedClasses(prev => prev.filter(c => c !== schoolClass));
      }
    };   
  
  
    return (
      <div className="tree-view-part" >
  
        <TreeView style={{margin: '20px 20px',width: '80%' ,border: '1px solid gray' }}
          defaultCollapseIcon={<ExpandMoreIcon />}
          defaultExpandIcon={<ChevronRightIcon />}
        >
          <TreeItem nodeId="root" label="Schools">
            {Object.entries(data).map(([school, classes], idx) => (
              <TreeItem
                nodeId={`school-${idx}`}
                label={
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Checkbox 
                      checked={checkedSchools.includes(school)}
                      onChange={(event) => handleSchoolCheckChange(school, event.target.checked)}
                    />
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
            ))}
          </TreeItem>
        </TreeView> 

      {/* Detail Component */}
      <div style={{ margin: '20px 0' }}>
        <p>School: {checkedSchools.join(', ')}</p>
        <p>Class: {checkedClasses.join(', ')}</p>
      </div>
  
      </div>
    );
  }
  
  export default SchoolTreeView;



