// About.js
import * as d3 from 'd3';
import React from 'react';

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


const About = () => {
  return (
  <>  
  <div>About Page</div>
  <AAA/>
  </>);
};

export default About;