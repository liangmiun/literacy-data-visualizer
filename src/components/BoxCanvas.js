
import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';


const BoxCanvas = ({ data, xField, yField, colorField, width, height, onPointClick, isClassView, setIsClassView, updateData, selectedRecord }) => {
    const svgRef = useRef();
    useEffect(() => {
        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();
        const margin = { top: 20, right: 20, bottom: 40, left: 40 };
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;
        const g = svg.append('g').attr('transform', `translate(${margin.left}, ${margin.top})`);

        if (isClassView) {
            // Process data for box plot

            // Compute quartiles, median, inter quantile range min and max for each Skola group.
            const grouped = d3.group(data, d => d.Skola);
            const sumstat = Array.from(grouped).map(([key, values]) => {
                const sortedValues = values.map(g => g[yField]).sort(d3.ascending);
                
                const q1 = d3.quantile(sortedValues, 0.25);
                const median = d3.quantile(sortedValues, 0.5);
                const q3 = d3.quantile(sortedValues, 0.75);
                const interQuantileRange = q3 - q1;
                const min = q1 - 1.5 * interQuantileRange;
                const max = q3 + 1.5 * interQuantileRange;

                return { 
                    key: key,
                    value: {
                        q1: q1, 
                        median: median, 
                        q3: q3, 
                        interQuantileRange: interQuantileRange, 
                        min: min, 
                        max: max
                    }
                };
            });

            // Scales
            const x = d3.scaleBand()
                .range([0, innerWidth])
                .domain(sumstat.map(d => d.key))
                .paddingInner(1)
                .paddingOuter(0.5);
            
            const [yMin, yMax] = d3.extent(data, d => d[yField]);
            const y = d3.scaleLinear()
                .domain([yMin, yMax])
                .range([innerHeight, 0]);

            // X & Y axis
            g.append('g').attr('transform', `translate(0, ${innerHeight})`).call(d3.axisBottom(x));
            g.append('g').call(d3.axisLeft(y));

            // Vertical lines
            const boxWidth = 50;
            g.selectAll("vertLines")
                .data(sumstat)
                .enter().append("line")
                .attr("x1", d => x(d.key))
                .attr("x2", d => x(d.key))
                .attr("y1", d => y(d.value.min))
                .attr("y2", d => y(d.value.max))
                .attr("stroke", "black")
                .style("width", 40);

            // Boxes
            g.selectAll("boxes")
                .data(sumstat)
                .enter().append("rect")
                .attr("x", d => x(d.key) - boxWidth/2)
                .attr("y", d => y(d.value.q3))
                .attr("height", d => y(d.value.q1) - y(d.value.q3))
                .attr("width", boxWidth)
                .attr("stroke", "black")
                .style("fill", "#69b3a2");

            // Median lines
            g.selectAll("medianLines")
                .data(sumstat)
                .enter().append("line")
                .attr("x1", d => x(d.key) - boxWidth/2)
                .attr("x2", d => x(d.key) + boxWidth/2)
                .attr("y1", d => y(d.value.median))
                .attr("y2", d => y(d.value.median))
                .attr("stroke", "black")
                .style("width", 40);

            // Add individual points with jitter
            const jitterWidth = 20;

            g.selectAll("indPoints")
                .data(data)
                .enter().append("circle")
                .attr("cx", d => x(d.Skola) - jitterWidth/2 + Math.random()*jitterWidth)
                .attr("cy", d => y(d[yField]))
                .attr("r", 4)
                .style("fill", "white")
                .attr("stroke", "black");


        }       

        else {
            // Process data for scatter plot
            const [xMin, xMax] = d3.extent(data, d => d[xField]);
            const xPadding = (xMax - xMin) * 0.03;
            const xScale = d3.scaleLinear().domain([xMin - xPadding, xMax + xPadding]).range([0, innerWidth]);
            const [yMin, yMax] = d3.extent(data, d => d[yField]);
            const yPadding = (yMax - yMin) * 0.03;
            const yScale = d3.scaleLinear().domain([yMin - yPadding, yMax + yPadding]).range([innerHeight, 0]);
            const colorDomain = Array.from(new Set(data.map(d => d[colorField])));
            const colorScale = d3.scaleOrdinal(d3.schemeCategory10).domain(colorDomain);
            g.selectAll('circle')
                .data(data)
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
    }, [data, xField, yField, colorField, width, height, onPointClick, isClassView, selectedRecord]);
    return (
        <svg className="scatter-canvas" ref={svgRef} width={width} height={height}></svg>
    );
};
export default BoxCanvas;



