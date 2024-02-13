import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import * as AggregateUtils from './AggregateUtils';

const AggregateCanvas = (props) => {

    const filteredData = props.shownData.filter(d => d[props.xField] !== null && d[props.yField] !== null); 
    const subBandCount = props.checkedClasses.length;

    return(
        
        <>
            {
                // filteredData.length > 0 && 
                (
                    <>
                   
                        { props.aggregateType ==='violin' && < ViolinPlots shownData={filteredData} xField={props.xField} yField={props.yField} colorField={props.colorField} 
                            width={props.width} height={props.height} onViolinClick={props.onPartClick} selectedRecord={props.selectedRecord} 
                            studentsChecked={props.studentsChecked}  classColors={props.classColors}
                            subBandCount = {subBandCount}  showLines={props.showLines}/>
                        }
                        
                        {props.aggregateType ==='box' && <BoxPlots    shownData={filteredData} xField={props.xField} yField={props.yField} colorField={props.colorField} 
                            width={props.width} height={props.height} onBoxClick={props.onPartClick} selectedRecord={props.selectedRecord} 
                            studentsChecked={props.studentsChecked}  classColors={props.classColors}
                            subBandCount ={subBandCount}  showLines={props.showLines}/>
                        }

                        {props.aggregateType ==='circle' && <CirclePlots  shownData={filteredData} xField={props.xField} yField={props.yField} colorField={props.colorField} 
                            width={props.width} height={props.height} onBoxClick={props.onPartClick} selectedRecord={props.selectedRecord} 
                            studentsChecked={props.studentsChecked}  classColors={props.classColors}
                            subBandCount ={subBandCount}  showLines={props.showLines}/>
                        }

                    </>
                )
            }
        </>
    )
};


const ViolinPlots = (props ) => {
    const svgRef = useRef();
    const parseDate = d3.timeParse('%y%m%d');
    const formatDate = d3.timeFormat('%y-%m-%d');
    const newXScaleRef = useRef(null);
    const newYScaleRef = useRef(null);

    useEffect(() => {

        const {svg, g, margin, innerWidth, innerHeight, sumstat, y, x0, xAxis, getSubBandScale, lastingClassGroups}  = AggregateUtils.PreparePlotStructure(svgRef, props.shownData, props.yField, props.width, props.height, 'violin');

        var clip = svg.append("defs").append("svg:clipPath")
        .attr("id", "clip")
        .append("svg:rect")
        .attr("width", innerWidth )
        .attr("height", innerHeight)
        .attr("x", 0)
        .attr("y", 0);

        g.append("line")
        .style("stroke", "black")  // Line color
        .style("stroke-width", 0.5)  // Line width
        .attr("x1", 0)  // Start of the line on the x-axis
        .attr("x2", innerWidth)  // End of the line on the x-axis (width of your plot)
        .attr("y1", innerHeight)  // Y-coordinate for the line
        .attr("y2", innerHeight); 

        const aggregate = g.append('g')
        .attr('id', 'g').attr("clip-path", "url(#clip)");

        // For the X axis label:
        g.append("text")
        .attr("y", innerHeight + margin.bottom / 2)
        .attr("x", innerWidth / 2)  
        .attr("dy", "1em")    
        .style("text-anchor", "middle")  
        .text("Months of Testdatum"); 

        // Add the x-axis to the group element
        g.append("g")
            .attr("transform", `translate(0, ${innerHeight})`)
            .call(xAxis)
            .attr('class', 'x-axis').attr("clip-path", "url(#clip)") ;        


        g.append('g').call(d3.axisLeft(y).tickFormat(d => {
            if(props.yField==='Födelsedatum'||props.yField==='Testdatum')
            {const dateObject = parseDate(d);
            return formatDate(dateObject);
            }
            return d;
        }));

        g.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left)
        .attr("x", -innerHeight / 2) 
        .attr("dy", "1em")  
        .style("text-anchor", "middle")
        .text(props.yField); 

        
        const subBandWidth = x0.bandwidth() / props.subBandCount;

        var maxNum = 0;
        for (var i in sumstat) {
            var allBins = sumstat[i].value.bins
            var lengths = allBins.map(a => a.length)
            var longest = d3.max(lengths)
            if (longest > maxNum) { maxNum = longest }
        }

        const xNum = d3.scaleLinear().domain([-maxNum, maxNum]).range([0, subBandWidth]);

        function bandedX(d) {
            const season = d.value.season.toString();
            const clazz = d.value.lastingclass.toString();
            const x1 = getSubBandScale(season); // Get x1 scale for the current season
            return x0(season) + x1(clazz) 
        }

        
        aggregate.selectAll(".violins")
        .data(sumstat)
        .enter().append("g")
        .attr("class", "violins")   
        .attr("transform",  d => {
            return `translate(${bandedX(d)}, 0)`;  
            })
        .style("fill", d => {
            const classID = AggregateUtils.getLastingClassID(d.value.school, d.value.season, d.value.class);
            return  props.classColors[d.value.school][classID]   ; 
        })
        .on("click", (event, d) => {
            props.onViolinClick([{
                lastingclass: d.value.lastingclass,
                class: d.value.class,
                season: d.value.season,
                min: parseInt(d.value.min)  , 
                max: parseInt(d.value.max)   , 
                median: parseInt(d.value.median) , 
                q1: parseInt(d.value.q1) ,
                q3: parseInt(d.value.q3)  ,
                count: parseInt(d.value.count) 
            }]);
        })
        .append("path")
        .attr("class", "area")
        .datum(
                    function(d){ 
                        return d.value.bins;
                    }
                )
        .attr("d", d3.area()
                .x0(d => {  return xNum(-d.length * AggregateUtils.singleViolinWidthRatio)})  //* subBandWidth
                .x1(d => xNum(d.length * AggregateUtils.singleViolinWidthRatio))  //* subBandWidth
                .y(d => y(d.x0))   //d.x0
                .curve(d3.curveCatmullRom)
                );  

        AggregateUtils.presentLines(props.showLines, lastingClassGroups,  g, x0, getSubBandScale, y, subBandWidth, props.classColors);

        if(props.studentsChecked) {       
            AggregateUtils.PresentIndividuals(props.shownData, props.yField, g, x0, getSubBandScale, y, subBandWidth, props.setSelectedRecords)   
        }

        if( svg.node() &&  d3.zoomTransform(svg.node()) && d3.zoomTransform(svg.node()) !== d3.zoomIdentity) {                  
            const zoomState = d3.zoomTransform(svg.node()); // Get the current zoom state
            AggregateUtils.violinZoomRender( zoomState, x0, y, 'band', 'linear', 'season', props.yField, null, false, g, xAxis, d3.axisLeft(y), newXScaleRef, newYScaleRef, getSubBandScale,xNum, props.studentsChecked, props.subBandCount);
        }

        // Setup zoom behavior
        const zoomBehavior = AggregateUtils.createViolinZoomBehavior(x0, y, 'band', 'linear', 'season', props.yField, null, false, g, xAxis, d3.axisLeft(y), newXScaleRef, newYScaleRef, getSubBandScale, xNum, props.studentsChecked, props.subBandCount);

        // Apply the zoom behavior to the SVG
        svg.call(zoomBehavior)
  

    }, [props.shownData,props.xField, props.yField, props.colorField, props.width, props.height, props.selectedRecord, props.studentsChecked, formatDate, parseDate, props.onViolinClick, props.showLines]);
    
    return (
        <svg className="scatter-canvas" ref={svgRef} width={props.width} height={props.height}></svg>
    );
    };


const BoxPlots = (props) => {
    const svgRef = useRef();
    const parseDate = d3.timeParse('%y%m%d');
    const formatDate = d3.timeFormat('%y-%m-%d');
    const newXScaleRef = useRef(null);
    const newYScaleRef = useRef(null);
    
    // In your useEffect: 
    useEffect(() => {

        const {svg, g, margin, innerWidth, innerHeight, sumstat, y, x0, xAxis, getSubBandScale, lastingClassGroups, classCount }  = AggregateUtils.PreparePlotStructure(svgRef, props.shownData, props.yField, props.width, props.height, 'box');

        var clip = svg.append("defs").append("svg:clipPath")
        .attr("id", "clip")
        .append("svg:rect")
        .attr("width", innerWidth )
        .attr("height", innerHeight)
        .attr("x", 0)
        .attr("y", 0);

        g.append("line")
        .style("stroke", "black")  // Line color
        .style("stroke-width", 0.5)  // Line width
        .attr("x1", 0)  // Start of the line on the x-axis
        .attr("x2", innerWidth)  // End of the line on the x-axis (width of your plot)
        .attr("y1", innerHeight)  // Y-coordinate for the line
        .attr("y2", innerHeight); 

        const aggregate = g.append('g')
        .attr('id', 'g').attr("clip-path", "url(#clip)");

        // For the X axis label:
        g.append("text")
        .attr("y", innerHeight + margin.bottom / 2)
        .attr("x", innerWidth / 2)  
        .attr("dy", "1em")    
        .style("text-anchor", "middle")  
        .text("Months of Testdatum"); 

        // Add the x-axis to the group element
        g.append("g")
            .attr("transform", `translate(0, ${innerHeight})`)
            .call(xAxis)
            .attr('class', 'x-axis').attr("clip-path", "url(#clip)") ;
            
            
        const yAxis =d3.axisLeft(y).tickFormat(d => {
            if(props.yField==='Födelsedatum'||props.yField==='Testdatum')
            {const dateObject = parseDate(d);
            return formatDate(dateObject);
            }
            return d;
        })

        g.append('g').call(yAxis);

        g.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left)
        .attr("x", -innerHeight / 2) 
        .attr("dy", "1em")  
        .style("text-anchor", "middle")
        .text(props.yField); 

        // Vertical lines
        const subBandWidth = x0.bandwidth() / props.subBandCount;
        function bandedX(d) {
            const season = d.value.season.toString();
            const clazz = d.value.lastingclass.toString();   //.class
            const x1 = getSubBandScale(season); // Get x1 scale for the current season
            return x0(season) + x1(clazz) 
        }
    
        aggregate.selectAll(".vertLines")
        .data(sumstat)
        .enter().append("line")
        .attr("class", "vertLines") 
        .attr("x1", d => {
            return bandedX(d) + subBandWidth / 2;
        })
        .attr("x2", d => {
            return bandedX(d) + subBandWidth / 2;
        })
        .attr("y1", d => y(d.value.min))
        .attr("y2", d => y(d.value.max))
        .attr("stroke", "black")
        .style("stroke-width", 0.2); 

        // Boxes
        aggregate.selectAll(".boxes")
            .data(sumstat)
            .enter().append("rect")
            .attr("class", "boxes") 
            .attr("x", d => {
                return bandedX(d);
            })
            .attr("y", d => { const distance = y(d.value.q1) - y(d.value.q3); return distance > 0 ?  y(d.value.q3): y(d.value.q3) -2.5;})
            .attr("height", d => { const distance = y(d.value.q1) - y(d.value.q3); return distance > 0 ?  distance: 5;})
            .attr("width", d => {
                return subBandWidth;
            })
            .attr("stroke", "black")
            .style("stroke-width", 0.5)
            .style("fill", d => {
                const classID = AggregateUtils.getLastingClassID(d.value.school, d.value.season, d.value.class);
                return  props.classColors[d.value.school][classID]   ;  // colorScale(classId)  "url(#mygrad)"  `url(#mygrad-${classID})`
            })
            .on("click", (event,d) =>{             
                props.onBoxClick([{
                lastingclass: d.value.lastingclass,
                class: d.value.class,
                season: d.value.season,
                min: parseInt(d.value.min,10),
                max: parseInt(d.value.max,10),
                median: parseInt(d.value.median,10),
                q1: parseInt(d.value.q1,10),
                q3: parseInt(d.value.q3,10),
                count: parseInt(d.value.count,10)
            }])});

        // Median lines
        aggregate.selectAll(".medianLines")
        .data(sumstat)
        .enter().append("line")
        .attr("class", "medianLines") 
        .attr("x1", d => {
            return bandedX(d) ;
        })
        .attr("x2", d => {
            return bandedX(d)+ subBandWidth ;   
         })
        .attr("y1", d => y(d.value.median))
        .attr("y2", d => y(d.value.median))
        .attr("stroke", "black")
        .style("stroke-width", 2)

        AggregateUtils.presentLines(props.showLines, lastingClassGroups,  g, x0, getSubBandScale, y, subBandWidth, props.classColors);       

        // Add individual points with jitter
        if(props.studentsChecked) {
            AggregateUtils.PresentIndividuals(props.shownData, props.yField, g, x0, getSubBandScale, y, subBandWidth, props.setSelectedRecords)  //getSubBandScale,
        }


        if( svg.node() &&  d3.zoomTransform(svg.node()) && d3.zoomTransform(svg.node()) !== d3.zoomIdentity) {                  
            const zoomState = d3.zoomTransform(svg.node()); // Get the current zoom state
            AggregateUtils.boxZoomRender( zoomState, x0, y, 'band', 'linear', 'season', props.yField, null, false, g, xAxis, d3.axisLeft(y), newXScaleRef, newYScaleRef, getSubBandScale, props.studentsChecked, props.subBandCount);
        }

        // Setup zoom behavior
        const zoomBehavior = AggregateUtils.createBoxZoomBehavior(x0, y, 'band', 'linear', 'season', props.yField, null, false, g, xAxis, d3.axisLeft(y), newXScaleRef, newYScaleRef, getSubBandScale, props.studentsChecked,props.subBandCount);
        // Apply the zoom behavior to the SVG
        svg.call(zoomBehavior)

        // Add color legend
        //ColorLegend(identityClasses, "classID", svg, 200, margin);          

        // ... rest of the zoom and event logic remains unchanged ...
    }, [props.shownData, props.xField, props.yField, props.colorField, props.width, props.height,  props.selectedRecord, props.studentsChecked,formatDate, parseDate, props.onBoxClick, props.classColors,props.checkedClasses]); 
    return (
        <svg className="scatter-canvas" ref={svgRef} width={props.width} height={props.height}></svg>
    );

}


const CirclePlots = (props) => {
        const svgRef = useRef();
        const parseDate = d3.timeParse('%y%m%d');
        const formatDate = d3.timeFormat('%y-%m-%d');
        const newXScaleRef = useRef(null);
        const newYScaleRef = useRef(null);
        
        // In your useEffect: 
        useEffect(() => {
    
            const {svg, g, margin, innerWidth, innerHeight, sumstat, y, x0, xAxis, getSubBandScale, lastingClassGroups, classCount }  = AggregateUtils.PreparePlotStructure(svgRef, props.shownData, props.yField, props.width, props.height, 'box');
            
            var clip = svg.append("defs").append("svg:clipPath")
            .attr("id", "clip")
            .append("svg:rect")
            .attr("width", innerWidth )
            .attr("height", innerHeight)
            .attr("x", 0)
            .attr("y", 0);
    
            g.append("line")
            .style("stroke", "black")  // Line color
            .style("stroke-width", 0.5)  // Line width
            .attr("x1", 0)  // Start of the line on the x-axis
            .attr("x2", innerWidth)  // End of the line on the x-axis (width of your plot)
            .attr("y1", innerHeight)  // Y-coordinate for the line
            .attr("y2", innerHeight); 
    
            const aggregate = g.append('g')
            .attr('id', 'g').attr("clip-path", "url(#clip)");

            // For the X axis label:
            g.append("text")
                .attr("y", innerHeight + margin.bottom / 2)
                .attr("x", innerWidth / 2)  
                .attr("dy", "1em")    
                .style("text-anchor", "middle")  
                .text("Months of Testdatum"); 
    
            // Add the x-axis to the group element
            g.append("g")
                .attr("transform", `translate(0, ${innerHeight})`)
                .call(xAxis)
                .attr('class', 'x-axis').attr("clip-path", "url(#clip)") ;
                
                
            const yAxis =d3.axisLeft(y).tickFormat(d => {
                if(props.yField==='Födelsedatum'||props.yField==='Testdatum')
                {const dateObject = parseDate(d);
                return formatDate(dateObject);
                }
                return d;
            })
    
            g.append('g').call(yAxis);
    
            g.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", -margin.left)
            .attr("x", -innerHeight / 2) 
            .attr("dy", "1em")  
            .style("text-anchor", "middle")
            .text(props.yField); 
    
            const subBandWidth = x0.bandwidth() / props.subBandCount;
            function bandedX(d) {
                const season = d.value.season.toString();
                const clazz = d.value.lastingclass.toString();   //.class
                const x1 = getSubBandScale(season); // Get x1 scale for the current season
                return x0(season) + x1(clazz) 
            }        
    

            aggregate.selectAll('.circles')
            .data(sumstat)  //filteredData
            .enter().append('circle')
            .attr('class', 'circles') 
            .attr('cx',  function(d) { return bandedX(d)+ subBandWidth / 2;})
            .attr('cy', d => y(d.value.median))
            .attr('r', 3)  //d => selectedCircles.includes(d) ? 9 : 3
            .attr('fill', d => {
                const classID = AggregateUtils.getLastingClassID(d.value.school, d.value.season, d.value.class);
                return  props.classColors[d.value.school][classID]   ;})
            .on("click", (event,d) =>{             
                props.onBoxClick([{
                lastingclass: d.value.lastingclass,
                class: d.value.class,
                season: d.value.season,
                min: parseInt(d.value.min,10),
                max: parseInt(d.value.max,10),
                median: parseInt(d.value.median,10),
                q1: parseInt(d.value.q1,10),
                q3: parseInt(d.value.q3,10),
                count: parseInt(d.value.count,10)
            }])}); 
   

            AggregateUtils.presentLines(props.showLines, lastingClassGroups,  g, x0, getSubBandScale, y, subBandWidth, props.classColors);
           
    
            // Add individual points with jitter
            if(props.studentsChecked) {
                AggregateUtils.PresentIndividuals(props.shownData, props.yField, g, x0, getSubBandScale, y, subBandWidth, props.setSelectedRecords)  //getSubBandScale,
            }    
    
            if( svg.node() &&  d3.zoomTransform(svg.node()) && d3.zoomTransform(svg.node()) !== d3.zoomIdentity) {                  
                const zoomState = d3.zoomTransform(svg.node()); // Get the current zoom state
                AggregateUtils.circleZoomRender( zoomState, x0, y, 'band', 'linear', 'season', props.yField, null, false, g, xAxis, d3.axisLeft(y), newXScaleRef, newYScaleRef, getSubBandScale, props.studentsChecked, props.subBandCount);
            }
    
            // Setup zoom behavior
            const zoomBehavior = AggregateUtils.createCircleZoomBehavior(x0, y, 'band', 'linear', 'season', props.yField, null, false, g, xAxis, d3.axisLeft(y), newXScaleRef, newYScaleRef, getSubBandScale, props.studentsChecked,props.subBandCount);
            // Apply the zoom behavior to the SVG
            svg.call(zoomBehavior)
    
            // Add color legend
            //ColorLegend(identityClasses, "classID", svg, 200, margin);          
    
            // ... rest of the zoom and event logic remains unchanged ...
        }, [props.shownData, props.xField, props.yField, props.colorField, props.width, props.height,  props.selectedRecord, props.studentsChecked,formatDate, parseDate, props.onBoxClick, props.classColors,props.checkedClasses]); 
        return (
            <svg className="scatter-canvas" ref={svgRef} width={props.width} height={props.height}></svg>
        );
    
    }


export default AggregateCanvas;



