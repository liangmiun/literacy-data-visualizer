import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';


const ScatterCanvas = ({ data, xField, yField, colorField, width, height, onPointClick }) => {
  const svgRef = useRef();

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 20, right: 20, bottom: 40, left: 40 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const [xMin, xMax] = d3.extent(data, d => d[xField]);
    const xPadding = (xMax - xMin) * 0.03; // calculate 3% of the x range
    const xScale = d3.scaleLinear().domain([xMin - xPadding, xMax + xPadding]).range([0, innerWidth]);

    const [yMin, yMax] = d3.extent(data, d => d[yField]);
    const yPadding = (yMax - yMin) * 0.03; // calculate 3% of the y range
    const yScale = d3.scaleLinear().domain([yMin - yPadding, yMax + yPadding]).range([innerHeight, 0]);


    // Color mapping function. 
    let legendDomain;

    const getColor = (data) => {

      // Generate unique values from the data colorField for the legend
      legendDomain = Array.from(new Set(data.map(d => d[colorField])));

      // const fieldValues = data.map(d => d[field]);
      // const minVal = d3.minV(fieldValues);
      // const maxVal = d3.maxV(fieldValues);
      // const rangeLength = maxVal - minVal;

      let minV, maxV;
      [minV, maxV] = d3.extent(data, d => d[colorField]); //Number()
      const rangeLength = maxV - minV;
      
      let step;
      
      if (rangeLength > 10 || !rangeLength) {
        step = 10;
      } else {
        step = rangeLength;
      }
      

      console.log("step ", step);

      const colorScale = d3.scaleQuantize()
        .domain([minV, maxV])
        .range(d3.quantize(d3.interpolateWarm, step));
      
      return (value) =>  colorScale(value);
    }   
      

    const getColorForValue = getColor(data);  //, colorField


    const g = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    const circles = g.selectAll('circle')
      .data(data)
      .join('circle')
      .attr('cx', d => xScale(d[xField]))
      .attr('cy', d => yScale(d[yField]))
      .attr('r', 3)
      .attr('fill', d => getColorForValue(d[colorField]))
      .on('click', onPointClick);

    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0, ${innerHeight})`)
      .call(xAxis);

    g.append('g')
      .attr('class', 'y-axis')
      .call(yAxis);

    const zoomBehavior = d3.zoom()
      .scaleExtent([0.5, 5])
      .on('zoom', (event) => {
        const zoomState = event.transform;
        g.selectAll('circle')
          .attr('cx', d => zoomState.applyX(xScale(d[xField])))
          .attr('cy', d => zoomState.applyY(yScale(d[yField])));
        g.select('.x-axis').call(xAxis.scale(zoomState.rescaleX(xScale)));
        g.select('.y-axis').call(yAxis.scale(zoomState.rescaleY(yScale)));
      });

    svg.call(zoomBehavior);

        // Add Legend
        const legend = g.append('g')
        .attr('transform', `translate(${innerWidth - 100}, ${innerHeight - 20*legendDomain.length})`);
  
    legend.selectAll('rect')
      .data(legendDomain)
      .enter()
      .append('rect')
      .attr('width', 18)
      .attr('height', 18)
      .attr('y', (d, i) => i*20)
      .style('fill', getColorForValue);

    legend.selectAll('text')
      .data(legendDomain)
      .enter()
      .append('text')
      .attr('x', 24)
      .attr('y', (d, i) => i*20 + 9)
      .attr('dy', '.35em')
      .style('text-anchor', 'start')
      .text(d => d);


  }, [data, xField, yField, colorField,width, height, onPointClick]);

  return (
    <svg className="scatter-canvas" ref={svgRef} width={width} height={height}></svg>
  );
};

export default ScatterCanvas;



