import React, { useState, useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { set } from 'd3-collection';
import { ColorLegend, rescale } from '../Utils';

const ScatterCanvas =
React.memo(
    ({ shownData, xField, yField, colorField, width, height, setSelectedRecords, showLines}) => { //

    const svgRef = useRef();    
    const [brushing, setBrushing] = useState(false);
    const prevBrushingRef = useRef();
    const newXScaleRef = useRef(null);
    const newYScaleRef = useRef(null);
    const filteredXYData = shownData.filter(d => d[xField] !== null && d[yField] !== null);
    
    
    useEffect(() => {

        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();
        const margin = { top: 20, right: 120, bottom: 80, left: 80 };
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;

        var clip = svg.append("defs").append("svg:clipPath")
        .attr("id", "clip")
        .append("svg:rect")
        .attr("width", innerWidth )
        .attr("height", innerHeight)
        .attr("x", 0)
        .attr("y", 0);

        const g = svg
        .append('g').attr('transform', `translate(${margin.left}, ${margin.top})`)
        .attr('id', 'g-Id');  //clip-path="url(#clip)";

        const scatter = g.append('g')
        .attr('id', 'scatter').attr("clip-path", "url(#clip)");

        const {scale: xScale, type: xType}  = GetScale(xField, filteredXYData, innerWidth);
        console.log("GetScale xScale domain(): ", xScale.domain(), "xType ", xType );
        const {scale: yScale, type: yType}= GetScale(yField, filteredXYData, innerHeight, true);              
        const colorDomain = Array.from(new Set(filteredXYData.map(d => d[colorField])));
        const colorScale = d3.scaleOrdinal(d3.schemeCategory10).domain(colorDomain); 
        const xAxis = d3.axisBottom(xScale);
        const yAxis = d3.axisLeft(yScale);
        const line = d3.line()
        .x(d => xScale(d[xField]))
        .y(d => yScale(d[yField]));       

        plot();  
        function plot() { 

            let combinedCircleSelection = [];
            let selectedCircles = [];
            axes_and_captions_plot();
            dots_plot();

            connecting_lines_plot();           

            if( svg.node() &&  d3.zoomTransform(svg.node()) && d3.zoomTransform(svg.node()) !== d3.zoomIdentity)
            {        
                // if it is in an existing zooming state, then adopt that state.
                const zoomState = d3.zoomTransform(svg.node()); 
                zoomRender(zoomState, svg, xScale, yScale, xType, yType, xField, yField, line, xAxis, yAxis, newXScaleRef, newYScaleRef);
            }

            const zoomBehavior = createZoomBehavior(svg, xScale, yScale, xType, yType, xField, yField, line, xAxis, yAxis, newXScaleRef, newYScaleRef); 
            svg.call(zoomBehavior);   


            brush_part();
    
            // Add color legend
            ColorLegend(filteredXYData, colorField, svg, width - margin.right , margin); //width  

    
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
                .call(d3.axisBottom(xScale)
                .tickFormat( getTickFormat(xField)));        
        
                g.append('g')
                .attr('class', 'y-axis') 
                .call(d3.axisLeft(yScale)
                .tickFormat(getTickFormat(yField))); 

            }


            function connecting_lines_plot() {
                //  Group data by ElevID; filteredXYData
                const elevIDGroups = d3.group(filteredXYData, d => d.ElevID);

                //  Sort data in each group by xField
                elevIDGroups.forEach(values => values.sort((a, b) => d3.ascending(a[xField], b[xField])));
        
                //Draw lines
                scatter.selectAll('.line-path')
                    .data(Array.from(elevIDGroups.values()))
                    .enter().append('path')
                    .attr('class', 'line-path')
                    .attr('d', d => line(d))
                    .attr('fill', 'none')
                    .attr('stroke','rgba(128, 128, 128, 0.2)' )  
                    .attr('stroke-width', 0.5)
                    .style("visibility", showLines ? "visible" : "hidden");

            }

            function dots_plot(){
                // Draw circles 
                scatter.selectAll('circle')
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
                                ContinuousSelection(currentCircle);
                            }
                            else
                            {
                                //console.log("single click");
                                combinedCircleSelection = [];
                                if (selectedCircles.length > 0) {
                                    for (let i = 0; i < selectedCircles.length; i++) {
                                        selectedCircles[i].attr('stroke-width', 0);
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
                selectedCircles.push(currentCircle);
                setSelectedRecords(selectedCircles.map(d => d.data()[0]));   
                for (let i = 0; i < selectedCircles.length; i++) {
                    selectedCircles[i].attr('stroke', "black");
                    selectedCircles[i].attr('stroke-width', 3);
                }
                
                const newlySelectedIDs = getElevIDSelected(currentCircle.data());
                combinedCircleSelection = [...new Set([...combinedCircleSelection, ...newlySelectedIDs])];

                
                var newGroup = d3.group(combinedCircleSelection, d => d.ElevID); 

                console.log("combinedCircleSelection " + combinedCircleSelection + combinedCircleSelection[0]);

                g.selectAll('.line-path')
                .attr('stroke-width',  d => combinedCircleSelection.some(item => item.ElevID === d[0].ElevID) ? 2 : 0.5)
                .attr('stroke', d => combinedCircleSelection.some(item => item.ElevID === d[0].ElevID) ? 'rgba(0, 0, 0, 0.7)' : 'rgba(128, 128, 128, 0.2)')
                .style("visibility",  d => showLines ||combinedCircleSelection.some(item => item.ElevID === d[0].ElevID) ? "visible" : "hidden");
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
   
    },[filteredXYData, xField, yField, colorField, width, height,  brushing,  showLines, newXScaleRef, newYScaleRef, setSelectedRecords]); //

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
    const categoricals = ["Skola","Klass","Läsår"];

    if (vField==='Födelsedatum'|| vField==='Testdatum') { 
        const [vMin, vMax] = d3.extent(filteredData, d => d[vField]);
        const vPadding = (vMax - vMin) / (vMax - vMin) * 86400000;  // 1 day in milliseconds for padding
        vScale = d3.scaleTime()
        .domain([new Date(vMin - vPadding), new Date(vMax + vPadding)])
        .range([0, innerWidth]);
        type = 'time';
    }
    else if(categoricals.includes(vField)){

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


function createZoomBehavior(svg, xScale, yScale, xType, yType, xField, yField, line, xAxis, yAxis, newXScaleRef, newYScaleRef) {

    return d3.zoom()
      .scaleExtent([0.5, 10])
      .on('zoom', (event) => {
        zoomRender(event.transform, svg, xScale, yScale, xType, yType, xField, yField, line,  xAxis, yAxis, newXScaleRef, newYScaleRef);
      });
}


function zoomRender(zoomState, svg, xScale, yScale, xType, yType, xField, yField, line, xAxis, yAxis, newXScaleRef, newYScaleRef){
    const currentZoomState = zoomState;
    const zoomXScale = rescale(xScale, currentZoomState, xType, 'x');
    console.log( "zoomRenderer xType"  , xType);         
    const zoomYScale = rescale(yScale, currentZoomState, yType, 'y' ); 
    newXScaleRef.current = zoomXScale;
    newYScaleRef.current = zoomYScale;
    const g = svg.select('#g-Id');

    // Apply zoom transformation to circles
    g.selectAll('circle')
      .attr('cx', d => {
        const value = zoomXScale(d[xField]);
        return isNaN(value) ? 0 : value;
      })
      .attr('cy', d => {
        const value = zoomYScale(d[yField]);
        return isNaN(value) ? 0 : value;
      });

    
    g.selectAll('.line-path')
    .attr('d', line.x(d => { 
       return zoomXScale(d[xField]);})
       .y(d => zoomYScale(d[yField])));

    // Update the axes with the new scales
    const xAxisGroup = g.select('.x-axis');
    const yAxisGroup = g.select('.y-axis');

    if (xType === 'point') {  
        xAxisGroup.call(xAxis.scale(zoomXScale).tickValues(xScale.domain()));
    } else {
      xAxisGroup.call(xAxis.scale(zoomXScale)
      .tickFormat(getTickFormat(xField))
      .tickValues(getLinearTickValues(zoomXScale, xField))      
      );
    }

    if (yType === 'point') {  
      yAxisGroup.call(yAxis.scale(zoomYScale).tickValues(yScale.domain()));
    } else {
      yAxisGroup.call(yAxis.scale(zoomYScale)
      .tickFormat(getTickFormat(yField))
      .tickValues(getLinearTickValues(zoomYScale, yField))
      );
    }

}

function getLinearTickValues(zoomScale, field)
{
    // Generate integer tick values within the domain   
    if (field === 'Årskurs' ) {
        let tickValues = d3.range(Math.ceil(zoomScale.domain()[0]), Math.floor(zoomScale.domain()[1]) + 1);
        return tickValues
    }
    return zoomScale.domain();
}


function getTickFormat( field)
{

    if (field === 'Årskurs' ) {
        const formatInt = d3.format("d");
        return formatInt;
    }
    else if(field==='Födelsedatum'||field==='Testdatum')
    {    
        const formatDate = d3.timeFormat('%y-%m-%d');  
        return formatDate;
    }
    return d3.format(".1f");
}


export default ScatterCanvas;



