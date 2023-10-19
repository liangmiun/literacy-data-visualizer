import React, { useState, useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { set } from 'd3-collection';
import { interpolateSpectral } from 'd3-scale-chromatic';

export function ColorLegend(data, colorField, svg, width, margin) {
    // Assuming colorField is categorical
    const colorDomain = Array.from(new Set(data.map(d => d[colorField])));
    // const colorScale = d3.scaleOrdinal(d3.schemeCategory10)  // Example color scheme
    //     .domain(colorDomain);

    const numColors = 20;
    const quantizedScale = d3.scaleQuantize()
        .domain([0, colorDomain.length - 1])
        .range(d3.range(numColors).map(d => interpolateSpectral(d / (numColors - 1))));
    
    const colorScale = d3.scaleOrdinal()
        .domain(colorDomain)
        .range(colorDomain.map((_, i) => quantizedScale(i)));


    // Define legend space
    const legendWidth = 60;

    // Add a group for the legend
    const legend = svg.append("g")
        .attr("transform", `translate(${width - legendWidth}, ${margin.top})`);  // Adjust position as required

    legend.append("text")
    .attr("x", 0)
    .attr("y", -5)  // Position the title a bit above the colored rectangles
    .style("font-weight", "bold")  // Make the title bold (optional)
    .text(colorField);

    colorDomain.forEach((value, index) => {
        // Draw colored rectangle
        legend.append("rect")
            .attr("x", 0)
            .attr("y", index * 20)
            .attr("width", 15)
            .attr("height", 15)
            .style("fill", colorScale(value));

        // Draw text beside rectangle
        legend.append("text")
            .attr("x", 25)  // Adjust for padding beside rectangle
            .attr("y", index * 20 + 12)  // Adjust to vertically center text
            .text(value);
    });


}


const ScatterCanvas =
React.memo(
    ({ data, shownData, xField, yField, colorField, width, height,  setSelectedRecords, showLines}) => { //

    const svgRef = useRef();    
    const [brushing, setBrushing] = useState(false);
    const prevBrushingRef = useRef();
    //const [selectedCircles, setSelectedCircles] = useState([]);
    const newXScaleRef = useRef(null);
    const newYScaleRef = useRef(null);
    const filteredXYData = shownData.filter(d => d[xField] !== null && d[yField] !== null);

    
    useEffect(() => {
        function plot() { 
            const svg = d3.select(svgRef.current);
            svg.selectAll('*').remove();
    
            const margin = { top: 20, right: 20, bottom: 80, left: 80 };
            const innerWidth = width - margin.left - margin.right;
            const innerHeight = height - margin.top - margin.bottom;
            const g = svg.append('g').attr('transform', `translate(${margin.left}, ${margin.top})`);
    
            const formatDate = d3.timeFormat('%y-%m-%d');    

            const xScale = GetScale(xField, filteredXYData, innerWidth);
            const yScale = GetScale(yField, filteredXYData, innerHeight, true);
                  
            const colorDomain = Array.from(new Set(filteredXYData.map(d => d[colorField])));
            const colorScale = d3.scaleOrdinal(d3.schemeCategory10).domain(colorDomain);   
    
            const xAxis = d3.axisBottom(xScale);
            const yAxis = d3.axisLeft(yScale);
    
    
            g.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", -margin.left)
            .attr("x", -innerHeight / 2) 
            .attr("dy", "1em")  
            .style("text-anchor", "middle")
            .text(yField); 
    
    
            g.append("text")
                .attr("y", innerHeight + margin.bottom / 2)
                .attr("x", innerWidth / 2)  
                .attr("dy", "1em")  
                .style("text-anchor", "middle")
                .text(xField);

            const line = d3.line()
            .x(d => xScale(d[xField]))
            .y(d => yScale(d[yField]));

            
            if(showLines){
                
                //  Group data by ElevID; filteredXYData
                const elevIDGroups = d3.group(filteredXYData, d => d.ElevID);

                //  Sort data in each group by xField
                elevIDGroups.forEach(values => values.sort((a, b) => d3.ascending(a[xField], b[xField])));
        
                //  Define line generator

        
                //Draw lines
                g.selectAll('.line-path')
                    .data(Array.from(elevIDGroups.values()))
                    .enter().append('path')
                    .attr('class', 'line-path')
                    .attr('d', d => line(d))
                    .attr('fill', 'none')
                    .attr('stroke','rgba(128, 128, 128, 0.2)' )  //d => colorScale(d[0][colorField])
                    .attr('stroke-width', 0.5);
            }
    
            // Draw circles 
            g.selectAll('circle')
                .data(filteredXYData)  //filteredData
                .enter().append('circle')
                .attr('cx', d => xScale(d[xField]))
                .attr('cy', d => yScale(d[yField]))
                .attr('r', 3)  //d => selectedCircles.includes(d) ? 9 : 3
                .attr('fill', d => colorScale(d[colorField]))
                .on('click', function (event, d) {
                    if (!brushing) {
                        setSelectedRecords([d]);
                    }
                });
    
    
            g.append('g').attr('transform', `translate(0, ${innerHeight})`)
            .attr('class', 'x-axis') 
            .call(d3.axisBottom(xScale).tickFormat(d => {
                if(xField==='Födelsedatum'||xField==='Testdatum')
                {const dateObject = d; //=parseDate(d)
                //console.log("dateObject: ", dateObject, "formatedDate: ", formatDate(dateObject));
                return formatDate(dateObject);
                }
                return d;
            }));
    
    
            g.append('g')
            .attr('class', 'y-axis') 
            .call(d3.axisLeft(yScale)
            .tickFormat(d => {
                if(yField==='Födelsedatum'||yField==='Testdatum')
                {const dateObject = d; //=parseDate(d)
                return formatDate(dateObject);
                }
                return d;
            })
            ); 
            
            
            const zoomBehavior = d3.zoom()
                .scaleExtent([0.5, 10])
                .on('zoom', (event) => {
                    const zoomState = event.transform;    
                    const zoomXScale = zoomState.rescaleX(xScale);            
                    const zoomYScale = zoomState.rescaleY(yScale);
    
                    newXScaleRef.current = zoomXScale;
                    newYScaleRef.current = zoomYScale;
    
                    // Apply zoom transformation to circles
                    g.selectAll('circle')
                    .attr('cx', d => {
                        const value = zoomXScale(d[xField]);
                        return isNaN(value) ? 0 : value;  // Check for NaN and default to 0 if NaN
                    })
                    .attr('cy', d => {
                        const value = zoomYScale(d[yField]);
                        return isNaN(value) ? 0 : value;  // Check for NaN and default to 0 if NaN
                    });
    
                    // Apply zoom transformation to lines
                    if(showLines){
                        g.selectAll('.line-path')
                        .attr('d', line.x(d => zoomXScale(d[xField])).y(d => zoomYScale(d[yField])));
                    }

                    // Update the axes with the new scales
                    g.select('.x-axis').call(xAxis.scale(zoomXScale));
                    g.select('.y-axis').call(yAxis.scale(zoomYScale));
                });
        
            svg.call(zoomBehavior);
            
            function getElevIDSelected(dataSelection) {
                let selectedElevIDs = new Set(dataSelection.map(d => d.ElevID));
                return filteredXYData.filter(d => selectedElevIDs.has(d.ElevID));
            }
            
            function brush_part()
            {
                let combinedSelection = [];

                const brushBehavior = d3.brush()
                .on('end', (event) => {
                    if (!event.selection) return;
                    const [[x0, y0], [x1, y1]] = event.selection;
                    const currentXScale = newXScaleRef.current || xScale;
                    const currentYScale = newYScaleRef.current || yScale;
                    
                    let newlySelected = filteredXYData.filter(d => 
                        currentXScale(d[xField]) >= x0 && 
                        currentXScale(d[xField]) <= x1 && 
                        currentYScale(d[yField]) >= y0 && 
                        currentYScale(d[yField]) <= y1
                    );

                    newlySelected = getElevIDSelected(newlySelected);

                    combinedSelection = [...new Set([...combinedSelection, ...newlySelected])];
                    setSelectedRecords(combinedSelection);
                    
                    g.selectAll('circle')
                        .attr('r', d => {
                            if (combinedSelection.includes(d)) {
                                return 9;
                            }
                            return 3;
                        });
                    
                    g.selectAll('.line-path')
                        .attr('stroke-width', d => combinedSelection.some(item => item.ElevID === d[0].ElevID) ? 2 : 0.5)
                        .attr('stroke', d => combinedSelection.some(item => item.ElevID === d[0].ElevID) ? 'rgba(0, 0, 0, 0.7)' : 'rgba(128, 128, 128, 0.2)');
                });
        
                let brush = g.append("g")
                   .attr("class", "brush")
                   .call(brushBehavior)
                   .attr('display', 'none'); 
        
                console.log("brushing before judge: ", brushing); 
                if (prevBrushingRef.current !== brushing) {
                    if (brushing) { 
                        svg.on('.zoom', null);  // deactivate zoom
                        brush.attr('display', null);
        
                    } else {
                        brush.attr('display', 'none');
                        setSelectedRecords([]);
                        svg.call(zoomBehavior);
                    }
                    if (newXScaleRef.current && newYScaleRef.current) {
                        g.selectAll('circle')
                            .attr('cx', d => {
                                const value = newXScaleRef.current(d[xField]);
                                return isNaN(value) ? 0 : value;  // Check for NaN and default to 0 if NaN
                            })
                            .attr('cy', d => {
                                const value = newYScaleRef.current(d[yField]);
                                return isNaN(value) ? 0 : value;  // Check for NaN and default to 0 if NaN
                            });
                
                        g.selectAll('.line-path')
                            .attr('d', line.x(d => newXScaleRef.current(d[xField])).y(d => newYScaleRef.current(d[yField])));
                    }
                }   
        
                prevBrushingRef.current = brushing;       
        
    
    
            }            
    
            brush_part();
    
            // Add color legend
            ColorLegend(filteredXYData, colorField, svg, width, margin);  
            
                } 
        plot();     
    },[xField, yField, colorField, width, height,  setSelectedRecords, brushing, filteredXYData]);

    return (
        <div className="scatter-canvas" style={{ position: 'relative' }}>
            <button onClick={() => setBrushing(!brushing)}
                style={{
                    position: 'absolute',
                    bottom: '0px',
                    right: '0px',
                    // Optional: Add some spacing from the edges if needed
                    margin: '10px'
                }}         
            
            >
                {brushing ? 'de-brush' : 'brush'}
            </button>
            <svg  ref={svgRef} width={width} height={height}></svg>
        </div>
    );
    },


);

function GetScale(vField, filteredData, innerWidth, yFlag=false)
{
    let vScale;
    //const variable = filteredData[filteredData.length-1][vField];
    if (vField==='Födelsedatum'|| vField==='Testdatum') {  //variable instanceof Date && !isNaN(variable)
        const [vMin, vMax] = d3.extent(filteredData, d => d[vField]);
        //console.log("vMin: ", vMin, "vMax: ", vMax);
        const vPadding = (vMax - vMin) / (vMax - vMin) * 86400000;  // 1 day in milliseconds for padding
        vScale = d3.scaleTime()
        .domain([new Date(vMin - vPadding), new Date(vMax + vPadding)])
        .range([0, innerWidth]);
    }
    else if(vField==='Skola' || vField==='Klass'){

        const uniqueValues = set(filteredData.map(d => d[vField])).values();
        vScale = d3.scalePoint()
        .domain(uniqueValues)
        .range([0, innerWidth])
        .padding(0.5);  // Adjust padding to suit your needs

    }
    else {
        const [vMin, vMax] = d3.extent(filteredData, d => d[vField]);
        const vPadding = (vMax - vMin) * 0.03;
        vScale = d3.scaleLinear().domain([vMin - vPadding, vMax + vPadding]).range([0, innerWidth]);
        if (yFlag) {  // Check if the current field is yField
            vScale = d3.scaleLinear().domain([vMin - vPadding, vMax + vPadding]).range([innerWidth, 0]);  // Invert the range values for y-axis
        } else {
            vScale = d3.scaleLinear().domain([vMin - vPadding, vMax + vPadding]).range([0, innerWidth]);
        }

    }


    return vScale;

}


export default ScatterCanvas;



