import React, { useState, useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { set } from 'd3-collection';
import { colorLegend, rescale, categoricals, translateExtentStartEnd, isDateFieldString, colors20 } from 'utils/Utils';
import { scatterWidth, scatterHeight, plotMargin } from 'utils/constants';

const ScatterCanvas =
React.memo(
    ({ shownData, xField, yField, colorField,  setSelectedRecords, showLines}) => { 

    const svgRef = useRef();    
    const [brushing, setBrushing] = useState(false);
    const prevBrushingRef = useRef();
    const newXScaleRef = useRef(null);
    const newYScaleRef = useRef(null);  
    
    useEffect(() => {

        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        const margin = plotMargin;
        const innerWidth =scatterWidth() - margin.left - margin.right;
        const innerHeight =scatterHeight()  - margin.top - margin.bottom;

        // eslint-disable-next-line
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

        const {scale: xScale, type: xType} = GetScale(xField, shownData, innerWidth);
        const {scale: yScale, type: yType} =  GetScale(yField, shownData, innerHeight, true); 
                     
        const colorDomain = Array.from(new Set(shownData.map(d => d[colorField])));
        colorDomain.sort();
        const colorScale = d3.scaleOrdinal(colors20()).domain(colorDomain); 

        const xAxis = d3.axisBottom(xScale);
        const yAxis = d3.axisLeft(yScale);

        const line = d3.line()
        .x(d => xScale(getStrValue(d[xField],xType)))
        .y(d => yScale(getStrValue(d[yField], yType)));        
        
        let combinedCircleSelection = [];
        let selectedCircles = [];

        axes_and_captions_plot();
        
        dots_plot();

        connecting_lines_plot();           

        process_zooming();

        brush_part();

        colorLegend(shownData, colorField, svg, scatterWidth()  - margin.right , margin); 


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


            const leftmostValue = xScale.domain()[0];
            const rotationText =   leftmostValue && leftmostValue.length > 4 ? "rotate(45)" : "";
            g.append('g').attr('transform', `translate(0, ${innerHeight})`)
            .attr('class', 'x-axis') 
            .call(d3.axisBottom(xScale))
            .selectAll(".tick text")  // Selects all tick labels
            .style("text-anchor", "start") 
            .attr("transform", rotationText); // Rotates the labels by -45 degrees

    
            g.append('g')
            .attr('class', 'y-axis') 
            .call(d3.axisLeft(yScale)
            ); 

        }

        function connecting_lines_plot() {
            //  Group data by ElevID; filteredXYData
            const elevIDGroups = d3.group(shownData, d => d.ElevID);

            //  Sort data in each group by xField
            elevIDGroups.forEach(values => values.sort((a, b) => d3.ascending(a[xField], b[xField])));
    
            //Draw lines
            scatter.selectAll('.line-path')
                .data(Array.from(elevIDGroups.values()))
                .enter().append('path')
                .attr('class', 'line-path')
                .attr('d', d => { return line(d)})
                .attr('fill', 'none')
                .attr('stroke','rgba(128, 128, 128, 0.2)' )  
                .attr('stroke-width', 0.5)
                .style("visibility", showLines ? "visible" : "hidden");

        }

        function dots_plot(){
            // Draw circles 
            scatter.selectAll('circle')
                .data(shownData)  //filteredData
                .enter().append('circle')
                .attr('cx',  function(d) {   return  xScale(getStrValue(d[xField], xType))}) 
                .attr('cy', d => yScale(getStrValue(d[yField], yType)))
                .attr('r', 3)  //d => selectedCircles.includes(d) ? 9 : 3
                .attr('fill', d => {  return colorScale(d[colorField])})
                .on('click', function (event, d) {
                    if (!brushing) {
                        const currentCircle = d3.select(this);
                        if (event.ctrlKey) {
                            ContinuousSelection(currentCircle);
                        }
                        else
                        {
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

        function process_zooming()
        {
            if( svg.node() &&  d3.zoomTransform(svg.node()) && d3.zoomTransform(svg.node()) !== d3.zoomIdentity)
            {        
                // if it is in an existing zooming state, then adopt that state.
                const zoomState = d3.zoomTransform(svg.node()); 
                zoomRender(zoomState, svg, xScale, yScale, xType, yType, xField, yField, line, xAxis, yAxis, newXScaleRef, newYScaleRef);
            }

            const zoomBehavior = createZoomBehavior(svg, xScale, yScale, xType, yType, xField, yField, line, xAxis, yAxis, newXScaleRef, newYScaleRef); 
            svg.call(zoomBehavior);  

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

            g.selectAll('.line-path')
            .attr('stroke-width',  d => combinedCircleSelection.some(item => item.ElevID === d[0].ElevID) ? 2 : 0.5)
            .attr('stroke', d => combinedCircleSelection.some(item => item.ElevID === d[0].ElevID) ? 'rgba(0, 0, 0, 0.7)' : 'rgba(128, 128, 128, 0.2)')
            .style("visibility",  d => showLines ||combinedCircleSelection.some(item => item.ElevID === d[0].ElevID) ? "visible" : "hidden");
        }   
        
        function getElevIDSelected(dataSelection) {
            let selectedElevIDs = new Set(dataSelection.map(d => d.ElevID));
            return shownData.filter(d => selectedElevIDs.has(d.ElevID));
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
                
                let newlySelected = shownData.filter(d => 
                    currentXScale(getStrValue(d[xField])) >= x0 && 
                    currentXScale(getStrValue(d[xField])) <= x1 && 
                    currentYScale(getStrValue(d[yField]))>= y0 && 
                    currentYScale(getStrValue(d[yField])) <= y1
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
    
    },[shownData, xField, yField, colorField, brushing,  showLines, newXScaleRef, newYScaleRef, setSelectedRecords]); 

    return (
        <div className="scatter-canvas" style={{ position: 'relative' }}>

            <svg  className= "plot-svg" ref={svgRef} width={scatterWidth()} height={scatterHeight()}  ></svg>

            <button onClick={() => setBrushing(!brushing)}
                        style={{
                            position: 'absolute',
                            bottom: '30px',
                            right: '60px',
                            width: '50px',
                            height: '30px',
                            margin: '10px'
                        }}
                    >
                        {brushing ? 'de-brush' : 'brush'}
            </button>

        </div>
    );

  },

);


function GetScale(vField, filteredData, innerWidth, yFlag=false)
{
    let vScale, type;

    if (isDateFieldString(vField)) { 
        const [vMin, vMax] = d3.extent(filteredData, d => d[vField]);
        const vPadding = (vMax - vMin)* 0.05;
        //const vPadding = (vMax - vMin) / (vMax - vMin) * 86400000;  // 1 day in milliseconds for padding
        vScale = d3.scaleTime()
        .domain([new Date(vMin - vPadding), new Date(vMax + vPadding)])
        .range([0, innerWidth]);
        type = 'time';
    }
    else if(categoricals.includes(vField)){

        const uniqueValues = set(filteredData.map(d => d[vField])).values();
        uniqueValues.sort();
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
        if (yFlag) {  
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
      .scaleExtent([1, 10])
      .translateExtent( translateExtentStartEnd(1.1, 1.1, svg)) 
      .on('zoom', (event) => {
            zoomRender(event.transform, svg, xScale, yScale, xType, yType, xField, yField, line,  xAxis, yAxis, newXScaleRef, newYScaleRef);            
        });
}


function zoomRender(zoomState, svg, xScale, yScale, xType, yType, xField, yField, line, xAxis, yAxis, newXScaleRef, newYScaleRef){
    const currentZoomState = zoomState;
    const zoomXScale = rescale(xScale, currentZoomState, xType, 'x');
    const zoomYScale = rescale(yScale, currentZoomState, yType, 'y' ); 
    newXScaleRef.current = zoomXScale;
    newYScaleRef.current = zoomYScale;
    const g = svg.select('#g-Id');


    // Apply zoom transformation to circles
    g.selectAll('circle')
      .attr('cx', d => {
        const value = zoomXScale( getStrValue(d[xField], xType));
        return isNaN(value) ? 0 : value;
      })
      .attr('cy', d => {
        const value = zoomYScale( getStrValue(d[yField], yType));
        return isNaN(value) ? 0 : value;
      });

    
    g.selectAll('.line-path')
    .attr('d', line.x(d => { 
       return zoomXScale(getStrValue(d[xField], xType));})
       .y(d => zoomYScale(getStrValue(d[yField], yType))));

    // Update the axes with the new scales
    const xAxisGroup = g.select('.x-axis');
    const yAxisGroup = g.select('.y-axis');

    if (xType === 'point') {  
        xAxisGroup.call(xAxis.scale(zoomXScale).tickValues(xScale.domain()));  //
    } else {
      xAxisGroup.call(xAxis.scale(zoomXScale)
      );
    }

    if (yType === 'point') {  
      yAxisGroup.call(yAxis.scale(zoomYScale).tickValues(yScale.domain()));
    } else {
      yAxisGroup.call(yAxis.scale(zoomYScale)
      );
    }

}


function getStrValue(value, type)
{
    if (type === 'point') {
        // point type is categorical and numeric value is converted to string
        return value + "";
    }
    return value;
}


export default ScatterCanvas;



