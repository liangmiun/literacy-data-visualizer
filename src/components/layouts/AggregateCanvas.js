import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { formatTickValue } from 'utils/Utils';
import * as AggregateUtils from 'utils/AggregateUtils';
import { aggrWidth, aggrHeight, innerAggrWidth, innerAggrHeight, plotMargin } from 'utils/constants';


const AggregateCanvas = (props) => {

    const subBandCount = props.checkedClasses.length;

    return(
        
        <>
            {
                // filteredData.length > 0 && 
                (
                    <>
                   
                        { props.aggregateType ==='violin' && < ViolinPlots shownData={props.shownData} xField={props.xField} yField={props.yField} colorField={props.colorField} 
                            onViolinClick={props.onPartClick}  
                            studentsChecked={props.studentsChecked}  classColors={props.classColors}
                            subBandCount = {subBandCount}  showLines={props.showLines}  connectIndividual = {props.connectIndividual}  />
                        }
                        
                        {props.aggregateType ==='box' && <BoxPlots    shownData={props.shownData} xField={props.xField} yField={props.yField} colorField={props.colorField} 
                            onBoxClick={props.onPartClick} 
                            studentsChecked={props.studentsChecked}  classColors={props.classColors}
                            subBandCount ={subBandCount}  showLines={props.showLines}  connectIndividual = {props.connectIndividual}/>
                        }

                        {props.aggregateType ==='circle' && <CirclePlots  shownData={props.shownData} xField={props.xField} yField={props.yField} colorField={props.colorField} 
                            onBoxClick={props.onPartClick} 
                            studentsChecked={props.studentsChecked}  classColors={props.classColors}
                            subBandCount ={subBandCount}  showLines={props.showLines}  connectIndividual = {props.connectIndividual}/>
                        }

                    </>
                )
            }
        </>
    )
};


const ViolinPlots = (props ) => {
    const svgRef = useRef();
    const newXScaleRef = useRef(null);
    const newYScaleRef = useRef(null);
    const { shownData, xField, yField, colorField, onViolinClick, studentsChecked,  showLines, subBandCount, classColors, connectIndividual } = props;

    useEffect(() => {

        const {svg, g, sumstat, yScale, x0, xAxis, getSubBandScale, lastingClassGroups}  = AggregateUtils.PreparePlotStructure(svgRef, shownData, yField,'violin', plotMargin);

        // eslint-disable-next-line no-unused-vars
        var clip = svg.append("defs").append("svg:clipPath")
        .attr("id", "clip")
        .append("svg:rect")
        .attr("width", innerAggrWidth )
        .attr("height", innerAggrHeight)
        .attr("x", 0)
        .attr("y", 0);

        g.append("line")  // generate shadow line for the x-axis
        .style("stroke", "black")  
        .style("stroke-width", 0.5)  // Line width
        .attr("x1", 0)  // Start of the line on the x-axis
        .attr("x2", innerAggrWidth)  // End of the line on the x-axis (width of your plot)
        .attr("y1", innerAggrHeight)  // Y-coordinate for the line
        .attr("y2", innerAggrHeight); 

        const aggregate = g.append('g')
        .attr('id', 'g').attr("clip-path", "url(#clip)");

        // For the X axis label:
        g.append("text")
        .attr("y", innerAggrHeight + plotMargin.bottom / 2)
        .attr("x", innerAggrWidth / 2)  
        .attr("dy", "1em")    
        .style("text-anchor", "middle")  
        .text("Months of Testdatum"); 

        // Add the x-axis to the group element
        g.append("g")
            .attr("transform", `translate(0, ${innerAggrHeight})`)
            .call(xAxis)
            .attr('class', 'x-axis').attr("clip-path", "url(#clip)")
            .selectAll(".tick text")         
            .style("text-anchor", "start") 
            .attr("transform",  "rotate(45)"); 

        g.append('g').call(d3.axisLeft(yScale).tickFormat(d => formatTickValue(d, yField)));

        g.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -plotMargin.left)
        .attr("x", -innerAggrHeight / 2) 
        .attr("dy", "1em")  
        .style("text-anchor", "middle")
        .text(yField); 

        
        const subBandWidth = x0.bandwidth() / subBandCount;

        var maxNum = 0;
        for (var i in sumstat) {
            var allBins = sumstat[i].value.bins
            var lengths = allBins.map(a => a.length)
            var longest = d3.max(lengths)
            if (longest > maxNum) { maxNum = longest }
        }

        const xNumScale = d3.scaleLinear().domain([-maxNum, maxNum]).range([-subBandWidth/2, subBandWidth/2]);

        function bandedX(d) {
            const season = d.value.season.toString();
            const clazz = d.value.lastingclass.toString();
            const x1 = getSubBandScale(season); // Get x1 scale for the current season
            return x0(season) + x1(clazz)         }

        
        aggregate.selectAll(".violins")
        .data(sumstat)
        .enter().append("g")
        .attr("class", "violins")   
        .attr("transform",  d => {
            return `translate(${bandedX(d)}, 0)`;  
            })
        .style("fill", d => {
            const classID = AggregateUtils.getLastingClassID(d.value.school, d.value.season, d.value.class);
            return  classColors[d.value.school][classID]   ; 
        })
        .on("click", function(event, d) {

            d3.selectAll(".violins").attr("stroke-width", 0)
            d3.select(this)
                .attr("stroke", "black")
                .attr("stroke-width", 1)

            console.log('violin click', event.currentTarget);

            onViolinClick([{
                // lastingclass: d.value.lastingclass,
                school: d.value.school,
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
                        //return d.value.bins;
                        const filteredBins = d.value.bins.filter(bin => {
                            return bin.x0 >= d.value.min && bin.x0 <= d.value.max;
                        });
                        return filteredBins;
                    }
                )
        .attr("d", d3.area()
                .x0(d => {  return xNumScale(-d.length * AggregateUtils.singleViolinWidthRatio)})  //* subBandWidth
                .x1(d => xNumScale(d.length * AggregateUtils.singleViolinWidthRatio))  //* subBandWidth
                .y(d => yScale(d.x0))   //d.x0
                .curve(d3.curveCatmullRom)
                );  

        AggregateUtils.presentLines(showLines, lastingClassGroups,  aggregate, x0, getSubBandScale, yScale, subBandWidth, classColors);

        if(studentsChecked) {       
            AggregateUtils.PresentIndividuals(shownData, yField, aggregate, x0, getSubBandScale, yScale, subBandWidth,connectIndividual)   
        }

        if( svg.node() &&  d3.zoomTransform(svg.node()) && d3.zoomTransform(svg.node()) !== d3.zoomIdentity) {                  
            const zoomState = d3.zoomTransform(svg.node()); // Get the current zoom state
            AggregateUtils.violinZoomRender( zoomState, x0, yScale, 'band', 'linear', 'season', yField, null, connectIndividual, g, xAxis, d3.axisLeft(yScale), newXScaleRef, newYScaleRef, getSubBandScale,xNumScale, studentsChecked, subBandCount);
        }

        // Setup zoom behavior
        const zoomBehavior = AggregateUtils.createViolinZoomBehavior(x0, yScale, 'band', 'linear', 'season', yField, null, connectIndividual, svg, g, xAxis, d3.axisLeft(yScale), newXScaleRef, newYScaleRef, getSubBandScale, xNumScale, studentsChecked, subBandCount);

        // Apply the zoom behavior to the SVG
        svg.call(zoomBehavior)
  

    }, [shownData,xField, yField, colorField, studentsChecked,  onViolinClick, showLines, subBandCount, classColors, connectIndividual]);
    
    return (
        <svg className="scatter-canvas" ref={svgRef} width={aggrWidth} height={aggrHeight}></svg>
    );
    };


const BoxPlots = (props) => {
    const svgRef = useRef();
    const newXScaleRef = useRef(null);
    const newYScaleRef = useRef(null);
    const {shownData, xField, yField, colorField, onBoxClick, studentsChecked, classColors, subBandCount, showLines, connectIndividual } = props;
    
    // In your useEffect: 
    useEffect(() => {

        console.log('BoxPlots useEffect');

        const {svg, g, sumstat, yScale, x0, xAxis, getSubBandScale, lastingClassGroups}  = AggregateUtils.PreparePlotStructure(svgRef, shownData, yField, 'box', plotMargin);

        // eslint-disable-next-line no-unused-vars
        var clip = svg.append("defs").append("svg:clipPath")
        .attr("id", "clip")
        .append("svg:rect")
        .attr("width", innerAggrWidth )
        .attr("height", innerAggrHeight)
        .attr("x", 0)
        .attr("y", 0);

        g.append("line")
        .style("stroke", "black")  // Line color
        .style("stroke-width", 0.5)  // Line width
        .attr("x1", 0)  // Start of the line on the x-axis
        .attr("x2", innerAggrWidth)  // End of the line on the x-axis (width of your plot)
        .attr("y1", innerAggrHeight)  // Y-coordinate for the line
        .attr("y2", innerAggrHeight); 

        const aggregate = g.append('g')
        .attr('id', 'g').attr("clip-path", "url(#clip)");

        // For the X axis label:
        g.append("text")
        .attr("y", innerAggrHeight + plotMargin.bottom / 2)
        .attr("x", innerAggrWidth / 2)  
        .attr("dy", "1em")    
        .style("text-anchor", "middle")  
        .text("Months of Testdatum"); 

        // Add the x-axis to the group element
        g.append("g")
            .attr("transform", `translate(0, ${innerAggrHeight})`)
            .call(xAxis)
            .attr('class', 'x-axis').attr("clip-path", "url(#clip)")
            .selectAll(".tick text")         
            .style("text-anchor", "start") 
            .attr("transform",  "rotate(45)") ;
            
            
        const yAxis =d3.axisLeft(yScale).tickFormat(d => formatTickValue(d, yField))

        g.append('g').call(yAxis);

        g.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -plotMargin.left)
        .attr("x", -innerAggrHeight / 2) 
        .attr("dy", "1em")  
        .style("text-anchor", "middle")
        .text(yField); 

        // Vertical lines
        const subBandWidth = x0.bandwidth() / subBandCount;
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
        .attr("y1", d => yScale(d.value.min))
        .attr("y2", d => yScale(d.value.max))
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
            .attr("y", d => { const distance = yScale(d.value.q1) - yScale(d.value.q3); return distance > 0 ?  yScale(d.value.q3): yScale(d.value.q3) -2.5;})
            .attr("height", d => { const distance = yScale(d.value.q1) - yScale(d.value.q3); return distance > 0 ?  distance: 5;})
            .attr("width", d => {
                return subBandWidth;
            })
            .style("fill", d => {
                const classID = AggregateUtils.getLastingClassID(d.value.school, d.value.season, d.value.class);
                return  classColors[d.value.school][classID]   ;  // colorScale(classId)  "url(#mygrad)"  `url(#mygrad-${classID})`
            })
            .on("click", function(event,d) {
                
                d3.selectAll(".boxes").attr("stroke-width", 0)
                d3.select(this)
                    .attr("stroke", "black")
                    .attr("stroke-width", 3)

                console.log('box click', event.currentTarget);


                onBoxClick([{
                // lastingclass: d.value.lastingclass,
                school: d.value.school,
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
        .attr("y1", d => yScale(d.value.median))
        .attr("y2", d => yScale(d.value.median))
        .attr("stroke", "black")
        .style("stroke-width", 2)

        AggregateUtils.presentLines(showLines, lastingClassGroups, aggregate, x0, getSubBandScale, yScale, subBandWidth, classColors);       

        // Add individual points with jitter
        if(studentsChecked) {
            AggregateUtils.PresentIndividuals(shownData, yField, aggregate, x0, getSubBandScale, yScale, subBandWidth, connectIndividual)  //getSubBandScale,
        }


        if( svg.node() &&  d3.zoomTransform(svg.node()) && d3.zoomTransform(svg.node()) !== d3.zoomIdentity) {                  
            const zoomState = d3.zoomTransform(svg.node()); // Get the current zoom state
            AggregateUtils.boxZoomRender( zoomState, x0, yScale, 'band', 'linear', 'season', yField, null, connectIndividual, g, xAxis, d3.axisLeft(yScale), newXScaleRef, newYScaleRef, getSubBandScale, studentsChecked, subBandCount);
        }

        // Setup zoom behavior
        const zoomBehavior = AggregateUtils.createBoxZoomBehavior(x0, yScale, 'band', 'linear', 'season', yField, null, connectIndividual, svg, g, xAxis, d3.axisLeft(yScale), newXScaleRef, newYScaleRef, getSubBandScale, studentsChecked,subBandCount);
        // Apply the zoom behavior to the SVG
        svg.call(zoomBehavior)

        // Add color legend
        //ColorLegend(identityClasses, "classID", svg, 200, margin);          

        // ... rest of the zoom and event logic remains unchanged ...
    }, [shownData, xField, yField, colorField, studentsChecked, onBoxClick, classColors, showLines, subBandCount, connectIndividual]); 
    return (
        <svg className="scatter-canvas" ref={svgRef} width={aggrWidth} height={aggrHeight}></svg>
    );

}


const CirclePlots = (props) => {
        const svgRef = useRef();
        const newXScaleRef = useRef(null);
        const newYScaleRef = useRef(null);
        const {shownData, xField, yField, colorField, onBoxClick, studentsChecked, classColors, subBandCount, showLines, connectIndividual } = props;

        console.log('CirclePlots connect individual', connectIndividual);
        
        useEffect(() => {
    
            const {svg, g, sumstat, yScale, x0, xAxis, getSubBandScale, lastingClassGroups }  = AggregateUtils.PreparePlotStructure(svgRef, shownData, yField, 'box', plotMargin);
            
            // eslint-disable-next-line no-unused-vars
            var clip = svg.append("defs").append("svg:clipPath")
            .attr("id", "clip")
            .append("svg:rect")
            .attr("width", innerAggrWidth )
            .attr("height", innerAggrHeight)
            .attr("x", 0)
            .attr("y", 0);
    
            g.append("line")
            .style("stroke", "black")  // Line color
            .style("stroke-width", 0.5)  // Line width
            .attr("x1", 0)  // Start of the line on the x-axis
            .attr("x2", innerAggrWidth)  // End of the line on the x-axis (width of your plot)
            .attr("y1", innerAggrHeight)  // Y-coordinate for the line
            .attr("y2", innerAggrHeight); 
    
            const aggregate = g.append('g')
            .attr('id', 'g').attr("clip-path", "url(#clip)");

            // For the X axis label:
            g.append("text")
                .attr("y", innerAggrHeight + plotMargin.bottom / 2)
                .attr("x", innerAggrWidth / 2)  
                .attr("dy", "1em")    
                .style("text-anchor", "middle")  
                .text("Months of Testdatum"); 
    
            // Add the x-axis to the group element
            g.append("g")
                .attr("transform", `translate(0, ${innerAggrHeight})`)
                .call(xAxis)
                .attr('class', 'x-axis').attr("clip-path", "url(#clip)")
                .selectAll(".tick text")         
                .style("text-anchor", "start") 
                .attr("transform",  "rotate(45)") ;
                
                
            const yAxis =d3.axisLeft(yScale).tickFormat(d => formatTickValue(d, yField))
    
            g.append('g').call(yAxis);
    
            g.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", -plotMargin.left)
            .attr("x", -innerAggrHeight / 2) 
            .attr("dy", "1em")  
            .style("text-anchor", "middle")
            .text(yField); 
    
            const subBandWidth = x0.bandwidth() / subBandCount;
            function bandedX(d) {
                const season = d.value.season.toString();
                const clazz = d.value.lastingclass.toString();   //.class
                const x1 = getSubBandScale(season); // Get x1 scale for the current season
                return x0(season) + x1(clazz) 
            }        
    

            aggregate.selectAll('.circles')  //'.circles'
            .data(sumstat)  //filteredData
            .enter().append('circle')
            .attr('class', 'circles') 
            .attr('cx',  function(d) { return bandedX(d)+ subBandWidth / 2;})
            .attr('cy', d => yScale(d.value.median))
            .attr('r', 6)  
            .attr('fill', d => {
                const classID = AggregateUtils.getLastingClassID(d.value.school, d.value.season, d.value.class);
                return  classColors[d.value.school][classID]   ;})
            .on("click", function(event,d) {   

                d3.selectAll("circle").attr("stroke-width", 0)
                d3.select(this)
                    .attr("stroke", "black")
                    .attr("stroke-width", 3)

                onBoxClick([{
                // lastingclass: d.value.lastingclass,
                school: d.value.school,
                class: d.value.class,
                season: d.value.season,
                min: parseInt(d.value.min,10),
                max: parseInt(d.value.max,10),
                median: parseInt(d.value.median,10),
                q1: parseInt(d.value.q1,10),
                q3: parseInt(d.value.q3,10),
                count: parseInt(d.value.count,10)
                }])          

            }); 
   

            AggregateUtils.presentLines(showLines, lastingClassGroups,  aggregate, x0, getSubBandScale, yScale, subBandWidth, classColors);
           
    
            // Add individual points with jitter
            if(studentsChecked) {
                console.log('to re-present individuals');
                AggregateUtils.PresentIndividuals(shownData, yField, aggregate, x0, getSubBandScale, yScale, subBandWidth, connectIndividual)  //getSubBandScale,
            }    
    
            if( svg.node() &&  d3.zoomTransform(svg.node()) && d3.zoomTransform(svg.node()) !== d3.zoomIdentity) {                  
                const zoomState = d3.zoomTransform(svg.node()); // Get the current zoom state
                AggregateUtils.circleZoomRender( zoomState, x0, yScale, 'band', 'linear', 'season', yField, null, connectIndividual, g, xAxis, d3.axisLeft(yScale), newXScaleRef, newYScaleRef, getSubBandScale, studentsChecked, subBandCount);
            }
    
            // Setup zoom behavior
            const zoomBehavior = AggregateUtils.createCircleZoomBehavior(x0, yScale, 'band', 'linear', 'season', yField, null, connectIndividual, svg, g, xAxis, d3.axisLeft(yScale), newXScaleRef, newYScaleRef, getSubBandScale, studentsChecked,subBandCount);
            // Apply the zoom behavior to the SVG
            svg.call(zoomBehavior)

            // d3.selection.prototype.attr = originalAttr;
    

        }, [shownData, xField, yField, colorField, studentsChecked,  classColors,  onBoxClick, showLines,subBandCount, connectIndividual]);  //onBoxClick,

        return (
            <svg className="scatter-canvas" ref={svgRef} width={aggrWidth} height={aggrHeight}></svg>
        );
    
    }


export default AggregateCanvas;



