
import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';


const ScatterCanvas = ({ filteredData, xField, yField, colorField, width, height, onPointClick, isClassView, setIsClassView, updateData, selectedRecord }) => {
    const svgRef = useRef();
    useEffect(() => {
        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();
        const margin = { top: 20, right: 20, bottom: 40, left: 40 };
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;
        const g = svg.append('g').attr('transform', `translate(${margin.left}, ${margin.top})`);
        if (isClassView) {
            // Process data for violin plot
            const allClasses = Array.from(new Set(filteredData.map(d => d.Skola))); //Klass

            const [yMin, yMax] = d3.extent(filteredData, d => d[yField]);
            const yPadding = 0;
            const y = d3.scaleLinear().domain([yMin - yPadding, yMax + yPadding]).range([innerHeight, 0]);

            //const y = d3.scaleLinear().domain([0, 100]).range([innerHeight, 0]); // Assuming Y scale is between 0-100 for simplicity. Adjust if necessary.
            g.append("g").call(d3.axisLeft(y));

            const x = d3.scaleBand().range([0, innerWidth]).domain(allClasses).padding(0.05);
            g.append("g").attr("transform", `translate(0, ${innerHeight})`).call(d3.axisBottom(x));

            const histogram = d3.bin().domain(y.domain()).thresholds(y.ticks(30))
                .value(d => d);

            const grouped = d3.group(filteredData, d => d.Skola);

            const sumstat = Array.from(grouped).map(([key, values]) => {
                const input = values.map(g => g[yField]);
                const bins = histogram(input);
                return { key, value: bins };
                });


            //const maxNum = Math.max(...sumstat.map(s => Math.max(...s.value.map(v => v.length))));
            var maxNum = 0;
            for ( var i in sumstat ){
              var allBins = sumstat[i].value
              console.log("allBins: ", i,  allBins);
              var lengths = allBins.map(function(a){return a.length;})   //.map(function(a){return a.length;})
              var longest = d3.max(lengths)
              if (longest > maxNum) { maxNum = longest }
            }
            console.log("maxNum: ", maxNum, "sumstat.length: ", sumstat.length);

            const xNum = d3.scaleLinear().range([0, x.bandwidth()]).domain([-maxNum, maxNum]);
            g.selectAll("myViolin")
                .data(sumstat)
                .enter().append("g")
                .attr("transform", d => `translate(${x(d.key)},0)`)
                .append("path")
                .datum(
                    function(d){ 
                        //console.log(d.value);  // Check the value being set as datum
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

            //  Group data by ElevID
            const elevIDGroups = d3.group(filteredData, d => d.ElevID);

            //  Sort data in each group by xField
            elevIDGroups.forEach(values => values.sort((a, b) => d3.ascending(a[xField], b[xField])));

            //  Define line generator
            const line = d3.line()
                .x(d => xScale(d[xField]))
                .y(d => yScale(d[yField]));

            // Draw lines
            g.selectAll('.line-path')
                .data(Array.from(elevIDGroups.values()))
                .enter().append('path')
                .attr('class', 'line-path')
                .attr('d', d => line(d))
                .attr('fill', 'none')
                .attr('stroke', d => colorScale(d[0][colorField]))
                .attr('stroke-width', 0.5);

            // Draw circles 
            g.selectAll('circle')
                .data(filteredData)
                .enter().append('circle')
                .attr('cx', d => xScale(d[xField]))
                .attr('cy', d => yScale(d[yField]))
                .attr('r', 2)
                .attr('fill', d => colorScale(d[colorField]))
                .on('click', onPointClick);

            g.append('g').attr('transform', `translate(0, ${innerHeight})`).call(d3.axisBottom(xScale));
            g.append('g').call(d3.axisLeft(yScale));

        }
        // ... rest of the zoom and event logic remains unchanged ...
    }, [filteredData, xField, yField, colorField, width, height, onPointClick, isClassView, selectedRecord]);
    return (
        <svg className="scatter-canvas" ref={svgRef} width={width} height={height}></svg>
    );
};
export default ScatterCanvas;



