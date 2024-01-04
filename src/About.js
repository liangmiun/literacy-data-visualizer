// About.js
import React from 'react';

const AAA = () => {
    const numRows = 20;
    const numCols = 20;

    // Generate a table with varying hue and saturation
    const tableRows = [];
    for (let row = 0; row < numRows; row++) {
        const cells = [];
        for (let col = 0; col < numCols; col++) {
            // Calculating hue and saturation values
            const hue = (col / numCols) * 360; // Hue varies from 0 to 360
            const saturation = 100 - (row / numRows) * 80; // Saturation varies from 100% to 0%

            // Set the background color using HSL
            const style = { backgroundColor: `hsl(${hue}, ${saturation}%, 40%)`,
                            width: '20px',
                            height: '20px' };
            cells.push(<td key={col} style={style}></td>);
        }
        tableRows.push(<tr key={row}>{cells}</tr>);
    }

    return (
        <table>
            <tbody>{tableRows}</tbody>
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