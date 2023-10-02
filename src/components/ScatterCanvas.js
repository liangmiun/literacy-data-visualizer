import React, { useState, useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { set } from 'd3-collection';

function ColorLegend(data, colorField, svg, width, margin) {
    // Assuming colorField is categorical
    const colorDomain = Array.from(new Set(data.map(d => d[colorField])));
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10)  // Example color scheme
        .domain(colorDomain);

    // Define legend space
    const legendWidth = 30;

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

const ScatterCanvas = ({ filteredData, xField, yField, colorField, width, height, onPointClick, isClassView, setIsClassView, updateData, selectedRecord
                           }) => {
    const svgRef = useRef();    
    const [brushing, setBrushing] = useState(false);
    const prevBrushingRef = useRef();

    const newXScaleRef = useRef(null);
    const newYScaleRef = useRef(null);


    //console.log("canvas newXScale: ", newXScale,"newYScale: ",newYScale);;

    useEffect(() => {
        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        const margin = { top: 20, right: 20, bottom: 80, left: 80 };
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;
        const g = svg.append('g').attr('transform', `translate(${margin.left}, ${margin.top})`);

        const parseDate = d3.timeParse('%y%m%d');
        const formatDate = d3.timeFormat('%y-%m-%d');

        if (isClassView) {
            // Process data for violin plot
            const allClasses = Array.from(new Set(filteredData.map(d => d.Klass))); //Klass

            const [yMin, yMax] = d3.extent(filteredData, d => d[yField]);
            const yPadding = 0;
            const y = d3.scaleLinear().domain([yMin - yPadding, yMax + yPadding]).range([innerHeight, 0]);

            //const y = d3.scaleLinear().domain([0, 100]).range([innerHeight, 0]); // Assuming Y scale is between 0-100 for simplicity. Adjust if necessary.
            g.append("g").call(
                d3.axisLeft(y).tickFormat(d => {
                    if(yField==='Födelsedatum'||yField==='Testdatum')
                    {const dateObject = parseDate(d);
                    return formatDate(dateObject);
                    }
                    return d;
                })
            );

            const x = d3.scaleBand().range([0, innerWidth]).domain(allClasses).padding(0.05);
            g.append("g").attr("transform", `translate(0, ${innerHeight})`)
                .call(d3.axisBottom(x).tickFormat(d => {
                    if(xField==='Födelsedatum'||xField==='Testdatum')
                    {const dateObject = parseDate(d);
                    return formatDate(dateObject);
                    }
                    return d;
                })
            );

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

            const histogram = d3.bin().domain(y.domain()).thresholds(y.ticks(30))
                .value(d => d);

            const grouped = d3.group(filteredData, d => d.Klass);

            const sumstat = Array.from(grouped).map(([key, values]) => {
                const input = values.map(g => g[yField]);
                const bins = histogram(input);
                return { key, value: bins };
                });


            //const maxNum = Math.max(...sumstat.map(s => Math.max(...s.value.map(v => v.length))));
            var maxNum = 0;
            for ( var i in sumstat ){
              var allBins = sumstat[i].value
              var lengths = allBins.map(function(a){return a.length;})   //.map(function(a){return a.length;})
              var longest = d3.max(lengths)
              if (longest > maxNum) { maxNum = longest }
            }

            const xNum = d3.scaleLinear().range([0, x.bandwidth()]).domain([-maxNum, maxNum]);
            g.selectAll("myViolin")
                .data(sumstat)
                .enter().append("g")
                .attr("transform", d => `translate(${x(d.key)},0)`)
                .append("path")
                .datum(
                    function(d){ 
                        return d.value;
                    }
                )
                .style("stroke", "none")
                .style("fill", "#69b3a2")
                .attr("d", d3.area()
                    .x0(d => xNum(-d.length))  //-d.length
                    .x1(d => xNum(d.length))  //d.length
                    .y(d => y(d.x0))   //d.x0
                    .curve(d3.curveCatmullRom)
                );
        } else {
            // Process data for scatter plot
            const [xMin, xMax] = d3.extent(filteredData, d => d[xField]);
            const xPadding = (xMax - xMin) * 0.03;
            const xScale = d3.scaleLinear().domain([xMin - xPadding, xMax + xPadding]).range([0, innerWidth]);
            
            const [yMin, yMax] = d3.extent(filteredData, d => d[yField]);
            const yPadding = (yMax - yMin) * 0.03;
            const yScale = d3.scaleLinear().domain([yMin - yPadding, yMax + yPadding]).range([innerHeight, 0]);
          
            const colorDomain = Array.from(new Set(filteredData.map(d => d[colorField])));
            const colorScale = d3.scaleOrdinal(d3.schemeCategory10).domain(colorDomain);

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

            //  Group data by ElevID; filteredXYData
            const filteredXYData = filteredData.filter(d => d[xField] !== null && d[yField] !== null);
            const elevIDGroups = d3.group(filteredXYData, d => d.ElevID);

            //  Sort data in each group by xField
            elevIDGroups.forEach(values => values.sort((a, b) => d3.ascending(a[xField], b[xField])));


            //  Define line generator
            const line = d3.line()
            .x(d => xScale(d[xField]))
            .y(d => yScale(d[yField]));

            //Draw lines
            g.selectAll('.line-path')
                .data(Array.from(elevIDGroups.values()))
                .enter().append('path')
                .attr('class', 'line-path')
                .attr('d', d => line(d))
                .attr('fill', 'none')
                .attr('stroke','rgba(128, 128, 128, 0.5)' )  //d => colorScale(d[0][colorField])
                .attr('stroke-width', 0.5);


            // Draw circles 
            g.selectAll('circle')
                .data(filteredData)
                .enter().append('circle')
                .attr('cx', d => xScale(d[xField]))
                .attr('cy', d => yScale(d[yField]))
                .attr('r', 3)
                .attr('fill', d => colorScale(d[colorField]))
                .on('click', onPointClick);


            g.append('g').attr('transform', `translate(0, ${innerHeight})`)
            .attr('class', 'x-axis') 
            .call(d3.axisBottom(xScale).tickFormat(d => {
                if(xField==='Födelsedatum'||xField==='Testdatum')
                {const dateObject = parseDate(d);
                return formatDate(dateObject);
                }
                return d;
            }));


            g.append('g')
            .attr('class', 'y-axis') 
            .call(d3.axisLeft(yScale)
            .tickFormat(d => {
                if(yField==='Födelsedatum'||yField==='Testdatum')
                {const dateObject = parseDate(d);
                return formatDate(dateObject);
                }
                return d;
            })
            ); 

            // ... rest of the zoom and event logic remains unchanged ...   
            const xAxis = d3.axisBottom(xScale);
            const yAxis = d3.axisLeft(yScale);
            
            
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
                    g.selectAll('.line-path')
                    .attr('d', line.x(d => zoomXScale(d[xField])).y(d => zoomYScale(d[yField])));

                    // Update the axes with the new scales
                    g.select('.x-axis').call(xAxis.scale(zoomXScale));
                    g.select('.y-axis').call(yAxis.scale(zoomYScale));
                });
    
            svg.call(zoomBehavior);          


            const brushBehavior = d3.brush()  
            .on('end', (event) => {
                if (!event.selection) return;
                const [[x0, y0], [x1, y1]] = event.selection;
                const currentXScale = newXScaleRef.current || xScale;
                const currentYScale = newYScaleRef.current || yScale;

                g.selectAll('circle')
                    .attr('r', d => {
                        if (currentXScale(d[xField]) >= x0 && currentXScale(d[xField]) <= x1 && currentYScale(d[yField]) >= y0 && currentYScale(d[yField]) <= y1) {
                            return 9;  // 3 times the original radius
                        }
                        return 3;
                    });
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
                    //svg.on('.brush', null);  // deactivate brush
                    brush.attr('display', 'none');
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


        // Add color legend
        ColorLegend(filteredData, colorField, svg, width, margin);   



    }, [filteredData, xField, yField, colorField, width, height, onPointClick, isClassView, selectedRecord, brushing]); 


    return (
        <div>
            <button onClick={() => setBrushing(!brushing)}>
                {brushing ? 'de-brush' : 'brush'}
            </button>
            <svg className="scatter-canvas" ref={svgRef} width={width} height={height}></svg>
        </div>
    );
};




export default ScatterCanvas;



