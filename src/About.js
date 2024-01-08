// About.js
import * as d3 from 'd3';
import React,{useState, useRef} from 'react';
import { generateSchoolLastingClassMap, generateSchoolClassColorScale} from './Utils.js';
import { useEffect } from 'react';
import { set } from 'd3-collection';

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

const SchoolColorComponent = ({schoolClasses, classColorScale, renderCount}) => {
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
                              backgroundColor: (console.log("time ",renderCount, schoolClasses,classColorScale ), classColorScale[schoolName][className]),
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

  console.log('data length',Object.keys(data).length);
  const [schoolClassesAndColorScale, setSchoolClassesAndColorScale ]= useState({schoolClasses:{}, colorScale: {}});
  //const [schoolClasses, setSchoolClasses] = useState({});
  //const [classColorScale, setClassColorScale] = useState({});
  const renderCount = useRef(0); // Initialize a ref to hold the render count


  useEffect(() => {
    if (Object.keys(data).length > 0)
    {
      const newSchoolClasses = generateSchoolLastingClassMap(data);
      const newClassColorScale = generateSchoolClassColorScale(newSchoolClasses).classColor;
      console.log("data change to set newSchoolClasses",newSchoolClasses, newClassColorScale);
      setSchoolClassesAndColorScale({ schoolClasses: newSchoolClasses, colorScale: newClassColorScale});
    }
  }, [data]);

  // useEffect(() => {
  //   if (Object.keys(schoolClasses).length > 0) {
  //     const newClassColorScale = generateSchoolClassColorScale(schoolClasses).classColor;
  //     console.log("schoolClasses change to set classColorScale",schoolClasses)
  //     console.log("newClassColorScale",newClassColorScale, "newSchoolClasses",schoolClasses, "renderCount",renderCount.current );
  //     setClassColorScale(newClassColorScale);
  //   }
  // }, [schoolClasses]);

  useEffect(() => {
    renderCount.current += 1;
    console.log(`About component rendered ${renderCount.current} times`);
  });

  return (
  <>  
  <div>About Page</div>
  <SchoolColorComponent
    schoolClasses={  ( console.log(schoolClassesAndColorScale.schoolClasses) ,schoolClassesAndColorScale.schoolClasses)}
    classColorScale={ ( console.log(schoolClassesAndColorScale.schoolClasses) ,schoolClassesAndColorScale.colorScale)} 
    renderCount={renderCount.current}
  
  />
  </>);
};

export default About;