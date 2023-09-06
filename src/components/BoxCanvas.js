
import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';


const BoxCanvas = ({ data, xField, yField, colorField, width, height, 
    onPointClick, isClassView, setIsClassView,  selectedRecord, studentsChecked, showViolin }) => {


    if(showViolin) {
      return ViolinCanvas(data, xField, yField, colorField, width, height, onPointClick, isClassView, selectedRecord, studentsChecked= studentsChecked);
    }   

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

            // Compute quartiles, median, inter quantile range min and max for each Klass group.
            const grouped = d3.group(data, d => d.Klass);
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
            if(studentsChecked) {
                PresentIndividuals(data, yField, g, x, y)
            }

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
    }, [data, xField, yField, colorField, width, height, onPointClick, isClassView, selectedRecord, studentsChecked]);
    return (
        <svg className="scatter-canvas" ref={svgRef} width={width} height={height}></svg>
    );
};


const ViolinCanvas = (data, xField, yField, colorField, width, height, onPointClick, isClassView, selectedRecord, studentsChecked ) => {
        const svgRef = useRef();
        useEffect(() => {
            const svg = d3.select(svgRef.current);
            svg.selectAll('*').remove();
            const margin = { top: 20, right: 20, bottom: 40, left: 40 };
            const innerWidth = width - margin.left - margin.right;
            const innerHeight = height - margin.top - margin.bottom;
            const g = svg.append('g').attr('transform', `translate(${margin.left}, ${margin.top})`);

                // Process data for violin plot
            const allClasses = Array.from(new Set(data.map(d => d.Klass))); //Klass

            const [yMin, yMax] = d3.extent(data, d => d[yField]);
            const yPadding = 0;
            const y = d3.scaleLinear().domain([yMin - yPadding, yMax + yPadding]).range([innerHeight, 0]);

            //const y = d3.scaleLinear().domain([0, 100]).range([innerHeight, 0]); // Assuming Y scale is between 0-100 for simplicity. Adjust if necessary.
            g.append("g").call(d3.axisLeft(y));

            const x = d3.scaleBand().range([0, innerWidth]).domain(allClasses).padding(0.05);

            g.append("g").attr("transform", `translate(0, ${innerHeight})`).call(d3.axisBottom(x));

            const histogram = d3.bin().domain(y.domain()).thresholds(y.ticks(30))
                .value(d => d);

            const grouped = d3.group(data, d => d.Klass);

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

            // Add individual points with jitter
            console.log("violin chart studentsChecked:", studentsChecked, typeof(studentsChecked));    
            if(studentsChecked) {                
                PresentIndividuals(data, yField, g, x, y)
            }

            // ... rest of the zoom and event logic remains unchanged ...
        }, [data, xField, yField, colorField, width, height, onPointClick, isClassView, selectedRecord, studentsChecked]);
        
        return (
            <svg className="scatter-canvas" ref={svgRef} width={width} height={height}></svg>
        );
    };


function PresentIndividuals(data, yField, g, x, y)
{
    const jitterWidth = 20;

    g.selectAll("indPoints")
        .data(data)
        .enter().append("circle")
        .attr("cx", d => x(d.Klass) - jitterWidth/2 + Math.random()*jitterWidth)
        .attr("cy", d => y(d[yField]))
        .attr("r", 4)
        .style("fill", "white")
        .attr("stroke", "black");

}
    



export default BoxCanvas;



