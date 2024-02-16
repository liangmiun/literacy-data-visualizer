import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const About = () => {
    // Ref for the container where the circles will be appended
    const d3Container = useRef(null);

    useEffect(() => {
        // Ensure D3 code only runs once the component has mounted
        if (d3Container.current) {
            // Select the container using D3
            const svg = d3.select(d3Container.current);

            // Create an SVG element if it doesn't exist
            const width = 400, height = 400;
            if (svg.select("svg").empty()) {
                svg.append("svg").attr("width", width).attr("height", height);
            }

            // Select the SVG we appended
            const svgContent = svg.select("svg");

            // Create 10 circles
            svgContent.selectAll("circle")
                .data(d3.range(10)) // Create an array of 10 elements to bind to the circles
                .enter()
                .append("circle")
                .attr("cx", (d, i) => 50 + i * 40) // This will space out the circles horizontally
                .attr("cy", height / 2) // Center the circles vertically
                .attr('r', 6)
                .attr('fill', "green")
                .on("click", function(event, d) {
                    // Reset all circles' stroke-width
                    svgContent.selectAll("circle").attr("stroke-width", 0);

                    // Apply stroke to the clicked circle
                    d3.select(this)
                        .attr("stroke", "black")
                        .attr("stroke-width", 3);
                    console.log("about page circle clicked", event.currentTarget);   
                });
        }
    }, []); // Empty dependency array ensures this effect runs only once

    return (
        <>
            <div>About Page</div>
            <div ref={d3Container}></div>
        </>
    );
};

export default About;
