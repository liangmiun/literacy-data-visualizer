import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

const ScatterCanvas = ({ data, xField, yField, width, height, onPointClick }) => {
  const svgRef = useRef();

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 20, right: 20, bottom: 40, left: 40 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const xScale = d3.scaleLinear().domain(d3.extent(data, d => d[xField])).range([0, innerWidth]);
    const yScale = d3.scaleLinear().domain(d3.extent(data, d => d[yField])).range([innerHeight, 0]);

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    g.selectAll('circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', d => xScale(d[xField]))
      .attr('cy', d => yScale(d[yField]))
      .attr('r', 3)
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

    g.select('.x-axis')
      .append('text')
      .attr('class', 'axis-label')
      .attr('x', innerWidth / 2)
      .attr('y', 35)
      .text(xField);

    g.select('.y-axis')
      .append('text')
      .attr('class', 'axis-label')
      .attr('x', -innerHeight / 2)
      .attr('y', -30)
      .attr('transform', 'rotate(-90)')
      .text(yField);

  }, [data, xField, yField, width, height, onPointClick]);

  return (
    <svg className="scatter-canvas" ref={svgRef} width={width} height={height}></svg>
  );
};

export default ScatterCanvas;
