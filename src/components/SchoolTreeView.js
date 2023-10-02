import { TreeItem } from '@mui/x-tree-view/TreeItem';
import { TreeView } from '@mui/x-tree-view/TreeView';
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

    const handleSchoolCheckChange = (school, isChecked) => {
      if (isChecked) {
        setCheckedSchools(prev => [...prev, school]);
        setCheckedClasses(prev => [...prev, ...school_class[school].map(cls => `${school}.${cls}`)]);
      } else {       
        
        setCheckedSchools(prev => prev.filter(s => s !== school));
      }
  };  
  
 
    
    const handleClassCheckChange = (schoolClass, isChecked) => {
      const [school, cls] = schoolClass.split('.');
      if (isChecked) {

        setCheckedClasses(prev => [...prev, schoolClass]);
      } else {

        setCheckedClasses(prev => prev.filter(c => c !== schoolClass));
        setCheckedSchools(prev => prev.filter(s => s !== school));
      }
  };
  
  
  
    return (
      <div className="single-tree-view" >
  
        <TreeView style={{margin: '20px 20px',width: '80%' ,border: '1px solid gray' }}
          defaultCollapseIcon={<ExpandMoreIcon />}
          defaultExpandIcon={<ChevronRightIcon />}
        >
          <TreeItem nodeId="root" label="Schools">
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



