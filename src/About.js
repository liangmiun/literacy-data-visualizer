// About.js
import * as d3 from 'd3';
import React,{useState, useRef} from 'react';
import { generateSchoolLastingClassMap, generateSchoolClassColorScale} from './Utils.js';
import { useEffect } from 'react';

const AAA = () => {
  // Original color scale from d3
  const colors = d3.schemeCategory10;
  

  // Generating darker colors
  const SndColors = colors.map(color => d3.color(color).darker(0.5).toString());
  const TrdColors = colors.map(color => d3.color(color).brighter(1).toString());
 

  return (
    <table>
      <tbody>
        <tr>
          {colors.map((color, index) => (
            <td key={index} style={{ width: '30px', height: '30px', backgroundColor: color }} />
          ))}
        </tr>
        <tr>
          {SndColors.map((color, index) => (
            <td key={index} style={{ width: '30px', height: '30px', backgroundColor: color }} />
          ))}
        </tr>
        <tr>
          {TrdColors.map((color, index) => (
            <td key={index} style={{ width: '30px', height: '30px', backgroundColor: color }} />
          ))}
        </tr>
      </tbody>
    </table>
  );
};

const SchoolColorComponent = ({schoolClasses, classColorScale}) => {
  return (
      <div>
          {Object.entries(schoolClasses).map(([schoolName, classes]) => (
              <div key={schoolName}>
                  <h3>{schoolName}</h3>
                  <div style={{ display: 'flex' }}>
                      {Object.keys(classes).map(className => (
                          <div key={className} style={{
                              width: '50px',
                              height: '50px',
                              backgroundColor:  classColorScale[schoolName][className],
                              margin: '5px'
                          }}>
                              {/* You can add more content here if needed */}
                          </div>
                      ))}
                  </div>
              </div>
          ))}
      </div>
  );
};


const About = ({data}) => {

  const [schoolClassesAndColorScale, setSchoolClassesAndColorScale ]= useState({schoolClasses:{}, colorScale: {}});


  useEffect(() => {
    if (Object.keys(data).length > 0)
    {
      const newSchoolClasses = generateSchoolLastingClassMap(data);
      const newClassColorScale = generateSchoolClassColorScale(newSchoolClasses).classColor;
      setSchoolClassesAndColorScale({ schoolClasses: newSchoolClasses, colorScale: newClassColorScale});
    }
  }, [data]);

  return (
  <>  
  <div>About Page</div>
  <SchoolColorComponent
    schoolClasses={  ( console.log(schoolClassesAndColorScale.schoolClasses) ,schoolClassesAndColorScale.schoolClasses)}
    classColorScale={ ( console.log(schoolClassesAndColorScale.schoolClasses) ,schoolClassesAndColorScale.colorScale)} 
  
  />
  </>);
};

export default About;