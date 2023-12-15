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
    ({ shownData, xField, yField, colorField, width, height,  setSelectedRecords, showLines}) => { //

    const svgRef = useRef();    
    const [brushing, setBrushing] = useState(false);
    const prevBrushingRef = useRef();
    const newXScaleRef = useRef(null);
    const newYScaleRef = useRef(null);
    const filteredXYData = shownData.filter(d => d[xField] !== null && d[yField] !== null);

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 20, right: 20, bottom: 80, left: 80 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    const g = svg.append('g').attr('transform', `translate(${margin.left}, ${margin.top})`).attr('id', 'g-Id');
    const formatDate = d3.timeFormat('%y-%m-%d');    
    const {scale: xScale, type: xType}  = GetScale(xField, filteredXYData, innerWidth);
    const {scale: yScale, type: yType}= GetScale(yField, filteredXYData, innerHeight, true);              
    const colorDomain = Array.from(new Set(filteredXYData.map(d => d[colorField])));
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10).domain(colorDomain); 
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    const line = d3.line()
    .x(d => xScale(d[xField]))
    .y(d => yScale(d[yField])); 

    //console.log("newXScaleRef.current ", newXScaleRef.current, "newYScaleRef.current ", newYScaleRef.current);
    
    useEffect(() => {
        plot();  

        function plot() { 

            let combinedIDSelection = [];
            let selectedCircles = [];


            //Start plotting:
            axes_and_captions_plot();

            dots_plot();

            //console.log("initial circles size: ", g.selectAll('circle').size(), g.selectAll('circle').attr('id'));

            if(showLines){
                connecting_lines_plot();
            }

            //console.log("svg node", svg.node(), svg.node().__zoom , "brushing: ", brushing, "prevBrushingRef.current: ", prevBrushingRef.current);

            if( svg.node() &&  d3.zoomTransform(svg.node()) && d3.zoomTransform(svg.node()) !== d3.zoomIdentity) {          //svg.node() && svg.node().__zoom && svg.node().__zoom != d3.zoomIdentity        
                const zoomState = d3.zoomTransform(svg.node()); // Get the current zoom state
                zoomRender(zoomState, svg, xScale, yScale, xType, yType, xField, yField, line, showLines, xAxis, yAxis, newXScaleRef, newYScaleRef);
                if(!brushing && prevBrushingRef.current !== brushing){
                    svg.call(d3.zoom().on("zoom",  (event) =>zoomRender(event.transform, svg, xScale, yScale, xType, yType, xField, yField, line, showLines,  xAxis, yAxis, newXScaleRef, newYScaleRef)));
                }
            }
            else {
                const svg = d3.select(svgRef.current);
                const zoomBehavior = createZoomBehavior(svg, xScale, yScale, xType, yType, xField, yField, line, showLines,  xAxis, yAxis, newXScaleRef, newYScaleRef); 
                console.log("zoomState: ",  svg.node().__zoom);
                svg.call(zoomBehavior);       

            }


            brush_part();
    
            // Add color legend
            ColorLegend(filteredXYData, colorField, svg, width, margin);  

    
            function axes_and_captions_plot() {

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


                g.append('g').attr('transform', `translate(0, ${innerHeight})`)
                .attr('class', 'x-axis') 
                .call(d3.axisBottom(xScale).tickFormat(d => {
                    if(xField==='Födelsedatum'||xField==='Testdatum')
                    {   const dateObject = d; 
                        return formatDate(dateObject);
                    }
                    return d;
                }));
        
        
                g.append('g')
                .attr('class', 'y-axis') 
                .call(d3.axisLeft(yScale)
                .tickFormat(d => {
                    if(yField==='Födelsedatum'||yField==='Testdatum')
                    {
                        const dateObject = d; //=parseDate(d)
                        return formatDate(dateObject);
                    }
                    return d;
                })); 

            }


            function connecting_lines_plot() {
                //  Group data by ElevID; filteredXYData
                const elevIDGroups = d3.group(filteredXYData, d => d.ElevID);

                //  Sort data in each group by xField
                elevIDGroups.forEach(values => values.sort((a, b) => d3.ascending(a[xField], b[xField])));
        
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

            function dots_plot(){
                // Draw circles 
                g.selectAll('circle')
                    .data(filteredXYData)  //filteredData
                    .enter().append('circle')
                    .attr('cx',  function(d) { return xScale(d[xField]);})
                    .attr('cy', d => yScale(d[yField]))
                    .attr('r', 3)  //d => selectedCircles.includes(d) ? 9 : 3
                    .attr('fill', d => colorScale(d[colorField]))
                    .on('click', function (event, d) {
                        if (!brushing) {
                            const currentCircle = d3.select(this);
                            if (event.ctrlKey) {
                                console.log("ctrlKey pressed");
                                ContinuousSelection(currentCircle);
                            }
                            else
                            {
                                combinedIDSelection = [];
                                if (selectedCircles.length > 0) {
                                    for (let i = 0; i < selectedCircles.length; i++) {
                                        selectedCircles[i].style('stroke-width', 0);
                                    }
                                }
                                selectedCircles = [];
                                ContinuousSelection(currentCircle);
                            }

                        }
                    }); 

            }
            

            function ContinuousSelection(currentCircle)
            {
                selectedCircles = [...selectedCircles, currentCircle];
                for (let i = 0; i < selectedCircles.length; i++) {
                    selectedCircles[i].style('stroke', "black");
                    selectedCircles[i].style('stroke-width', 2);
                }


                const newlySelectedIDs = getElevIDSelected(currentCircle.data());
                //console.log("combinedSelection ", combinedIDSelection);

                combinedIDSelection = [...new Set([...combinedIDSelection, ...newlySelectedIDs])];
                g.selectAll('.line-path')
                .attr('stroke-width',  d => combinedIDSelection.some(item => item.ElevID === d[0].ElevID) ? 2 : 0.5)
                .attr('stroke', d => combinedIDSelection.some(item => item.ElevID === d[0].ElevID) ? 'rgba(0, 0, 0, 0.7)' : 'rgba(128, 128, 128, 0.2)');

                setSelectedRecords(combinedIDSelection);

            }   

            
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
                    
                    if(showLines){
                        newlySelected = getElevIDSelected(newlySelected);
                    }

                    combinedSelection = [...new Set([...combinedSelection, ...newlySelected])];
                    setSelectedRecords(combinedSelection);

                    console.log("brushing: circles size: ", g.selectAll('circle').size());
                    
                    g.selectAll('circle')
                        .attr('stroke', d => combinedSelection.includes(d) ? 'black' : 'transparent')  
                        .attr('stroke-width', d => combinedSelection.includes(d) ? 2 : 0);  //
                    
                    g.selectAll('.line-path')
                        .attr('stroke-width', d => combinedSelection.some(item => item.ElevID === d[0].ElevID) ? 2 : 0.5)
                        .attr('stroke', d => combinedSelection.some(item => item.ElevID === d[0].ElevID) ? 'rgba(0, 0, 0, 0.7)' : 'rgba(128, 128, 128, 0.2)');
                });
        
                let brush = g.append("g")
                   .attr("class", "brush")
                   .call(brushBehavior)
                   .attr('display', 'none'); 
        
                if (prevBrushingRef.current !== brushing) {
                    if (brushing) { 
                        svg.on('.zoom', null);  // deactivate zoom
                        brush.attr('display', null);
        
                    } else {
                        brush.attr('display', 'none');
                        setSelectedRecords([]);
                        //svg.call(zoomBehavior);
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
            

            
        } 
   
    },[filteredXYData, xField, yField, colorField, width, height,  setSelectedRecords, brushing,  showLines, newXScaleRef, newYScaleRef]);

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
            <svg  ref={svgRef} width={width} height={height}  ></svg>
                {/* width={width} height={height} */}
        </div>
    );
    },


);

function GetScale(vField, filteredData, innerWidth, yFlag=false)
{
    let vScale, type;
    if (vField==='Födelsedatum'|| vField==='Testdatum') { 
        const [vMin, vMax] = d3.extent(filteredData, d => d[vField]);
        const vPadding = (vMax - vMin) / (vMax - vMin) * 86400000;  // 1 day in milliseconds for padding
        vScale = d3.scaleTime()
        .domain([new Date(vMin - vPadding), new Date(vMax + vPadding)])
        .range([0, innerWidth]);
        type = 'time';
    }
    else if(vField==='Skola' || vField==='Klass'){

        const uniqueValues = set(filteredData.map(d => d[vField])).values();
        vScale = d3.scalePoint()
        .domain(uniqueValues)
        .range([0, innerWidth])
        .padding(0.5);  // Adjust padding to suit your needs
        type = 'point';

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
        type = 'linear';

    }


    return {scale: vScale, type: type};

}


export function rescale(scale, zoomState, scaleType, dimension) {
    if (scaleType === 'point') {
        const domain = scale.domain();
        const range = scale.range();
        const rangePoints = d3.range(domain.length).map(i => range[0] + i * (range[1] - range[0]) / (domain.length - 1));
        const zoomedRangePoints = rangePoints.map(r => zoomState.applyX(r));
        const newDomain = zoomedRangePoints.map(r => {
        const index = d3.bisect(rangePoints, r);
        const a = domain[Math.max(0, index - 1)];
        const b = domain[Math.min(domain.length - 1, index)];
        return a && b ? d3.interpolate(a, b)(r - rangePoints[index - 1] / (rangePoints[index] - rangePoints[index - 1])) : a || b;
        });
        return scale.copy().domain(newDomain);
    } else if (scaleType === 'band') {
        // Handle band scale
        //console.log("rescale as band")
        const domain = scale.domain();
        const range = scale.range();
        const bandWidth = scale.bandwidth();
        const newRange = dimension === 'x' 
        ? [zoomState.applyX(range[0]), zoomState.applyX(range[1])]
        : [zoomState.applyY(range[0]), zoomState.applyY(range[1])];
        
        const newScale = scale.copy().range(newRange);
        
        // Find the part of the domain that fits in the new range
        const start = newScale.domain().find(d => newScale(d) + bandWidth > newRange[0]);
        const end = newScale.domain().reverse().find(d => newScale(d) < newRange[1]);

        const startIndex = domain.indexOf(start);
        const endIndex = domain.indexOf(end);
        const newDomain = domain.slice(startIndex, endIndex + 1);

        return scale.copy().domain(newDomain).range([newScale(start), newScale(end) + bandWidth]);
    } else {
        return dimension === 'x' ? zoomState.rescaleX(scale) : zoomState.rescaleY(scale);
    }
}


function createZoomBehavior(svg, xScale, yScale, xType, yType, xField, yField, line, showLines, xAxis, yAxis, newXScaleRef, newYScaleRef) {

    return d3.zoom()
      .scaleExtent([0.5, 10])
      .on('zoom', (event) => {
        zoomRender(event.transform, svg, xScale, yScale, xType, yType, xField, yField, line, showLines, xAxis, yAxis, newXScaleRef, newYScaleRef);
      });
}


function zoomRender(zoomState, svg, xScale, yScale, xType, yType, xField, yField, line, showLines,  xAxis, yAxis, newXScaleRef, newYScaleRef){
    const currentZoomState = zoomState;
    const zoomXScale = rescale(xScale, currentZoomState, xType, 'x');         
    const zoomYScale = rescale(yScale, currentZoomState, yType, 'y' ); 
    newXScaleRef.current = zoomXScale;
    newYScaleRef.current = zoomYScale;
    const g = svg.select('#g-Id');

    // Apply zoom transformation to circles
    g.selectAll('circle')
      .attr('cx', d => {
        //console.log("d[xField]: ", d[xField]);
        const value = zoomXScale(d[xField]);
        return isNaN(value) ? 0 : value;
      })
      .attr('cy', d => {
        const value = zoomYScale(d[yField]);
        return isNaN(value) ? 0 : value;
      });


    g.selectAll('.line-path')
    .attr('d', line.x(d => zoomXScale(d[xField])).y(d => zoomYScale(d[yField])));

    // Update the axes with the new scales
    const xAxisGroup = g.select('.x-axis');
    const yAxisGroup = g.select('.y-axis');

    if (xType === 'point') {  
      xAxisGroup.call(xAxis.scale(zoomXScale).tickValues(xScale.domain()));
    } else {
      xAxisGroup.call(xAxis.scale(zoomXScale));
    }

    if (yType === 'point') {  
      yAxisGroup.call(yAxis.scale(zoomYScale).tickValues(yScale.domain()));
    } else {
      yAxisGroup.call(yAxis.scale(zoomYScale));
    }

}


export default ScatterCanvas;



