import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import * as AggregateUtils from './AggregateUtils';

const AggregateCanvas = (props) => {

    const filteredData = props.filteredData.filter(d => d[props.xField] !== null && d[props.yField] !== null); 

    return(
        
        <>
            {
                filteredData.length > 0 && (props.showViolin?
                <ViolinPlots filteredData={filteredData} xField={props.xField} yField={props.yField} colorField={props.colorField} 
                    width={props.width} height={props.height} onViolinClick={props.onPartClick} selectedRecord={props.selectedRecord} 
                    studentsChecked={props.studentsChecked} showViolin={props.showViolin} classColors={props.classColors}/>
                :
                <BoxPlots    filteredData={filteredData} xField={props.xField} yField={props.yField} colorField={props.colorField} 
                    width={props.width} height={props.height} onBoxClick={props.onPartClick} selectedRecord={props.selectedRecord} 
                    studentsChecked={props.studentsChecked} showViolin={props.showViolin} classColors={props.classColors}
                    checkedClasses ={props.checkedClasses} />
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

        const {svg, g, margin, innerWidth, innerHeight, sumstat, y, x0, xAxis, getSubBandScale, lastingClassGroups}  = AggregateUtils.PreparePlotStructure(svgRef, props.filteredData, props.yField, props.width, props.height, true);

        // For the X axis label:
        g.append("text")
        .attr("y", innerHeight + margin.bottom / 2)
        .attr("x", innerWidth / 2)  
        .attr("dy", "1em")    
        .style("text-anchor", "middle")  
        .text("Seasons of Testdatum"); 

        // Add the x-axis to the group element
        g.append("g")
            .attr("transform", `translate(0, ${innerHeight})`)
            .call(xAxis)
            .attr('class', 'x-axis') ;        


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

        
        const subBandWidth = x0.bandwidth() * 0.2;

        var maxNum = 0;
        for (var i in sumstat) {
            var allBins = sumstat[i].value.bins
            var lengths = allBins.map(a => a.length)
            var longest = d3.max(lengths)
            if (longest > maxNum) { maxNum = longest }
        }

        const xNum = d3.scaleLinear().range([0, subBandWidth]).domain([-maxNum, maxNum]);
        //console.log("init xNum "+ xNum + typeof(xNum) + xNum.length)

        function bandedX(d) {
            const season = d.value.season.toString();
            const clazz = d.value.class.toString();
            const x1 = getSubBandScale(season); // Get x1 scale for the current season
            return x0(season) + x1(clazz) 
        }

        
        g.selectAll(".violins")
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
        .style("stroke", "none")
        .attr("d", d3.area()
                .x0(d => xNum(-d.length* subBandWidth * AggregateUtils.singleViolinWidthRatio))  
                .x1(d => xNum(d.length* subBandWidth * AggregateUtils.singleViolinWidthRatio))  
                .y(d => y(d.x0))   //d.x0
                .curve(d3.curveCatmullRom)
                );  


        lastingClassGroups.forEach((values, lastingClassKey) => {
            for(let i = 0; i < values.length - 1; i++) {
                const startPoint = values[i];
                const endPoint = values[i + 1]; 
                g.append("line")
                    .attr("class", "lastingClassLines")
                    .attr("x1", () => {
                        const season = startPoint.value.season.toString();
                        const clazz = startPoint.value.class.toString();
                        const x1 = getSubBandScale(season);
                        return x0(season) + x1(clazz) + subBandWidth / 2;
                    })
                    .attr("x2", () => {
                        const season = endPoint.value.season.toString();
                        const clazz = endPoint.value.class.toString();
                        const x1 = getSubBandScale(season);
                        return x0(season) + x1(clazz) + subBandWidth / 2;
                    })
                    .attr("y1", y(startPoint.value.median))
                    .attr("y2", y(endPoint.value.median))
                    .attr("stroke", d => {            
                        const classID = AggregateUtils.getLastingClassID(startPoint.value.school, startPoint.value.season, startPoint.value.class);
                        return  props.classColors[startPoint.value.school][classID]; }) 
                    .attr('stroke-width', 1.5)
                    .attr("startSeason", startPoint.value.season.toString())
                    .attr("startClass", startPoint.value.class.toString())
                    .attr("endSeason", endPoint.value.season.toString())
                    .attr("endClass", endPoint.value.class.toString())                  
                    ; 
            }
        }); 


            // Add individual points with jitter

        if(props.studentsChecked) {       
            AggregateUtils.PresentIndividuals(props.filteredData, props.yField, g, x0, getSubBandScale, y, subBandWidth)       
            
        }

        if( svg.node() &&  d3.zoomTransform(svg.node()) && d3.zoomTransform(svg.node()) !== d3.zoomIdentity) {                  
            const zoomState = d3.zoomTransform(svg.node()); // Get the current zoom state
            AggregateUtils.violinZoomRender( zoomState, x0, y, 'band', 'linear', 'season', props.yField, null, false, g, xAxis, d3.axisLeft(y), newXScaleRef, newYScaleRef, getSubBandScale,xNum, props.studentsChecked);
        }

        // Setup zoom behavior
        const zoomBehavior = AggregateUtils.createViolinZoomBehavior(x0, y, 'band', 'linear', 'season', props.yField, null, false, g, xAxis, d3.axisLeft(y), newXScaleRef, newYScaleRef, getSubBandScale, xNum, props.studentsChecked);

        // Apply the zoom behavior to the SVG
        svg.call(zoomBehavior)
  

    }, [props.filteredData,props.xField, props.yField, props.colorField, props.width, props.height, props.selectedRecord, props.studentsChecked, formatDate, parseDate, props.onViolinClick]);
    
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

        const {svg, g, margin, innerWidth, innerHeight, sumstat, y, x0, xAxis, getSubBandScale, lastingClassGroups, classCount }  = AggregateUtils.PreparePlotStructure(svgRef, props.filteredData, props.yField, props.width, props.height);
        
        // For the X axis label:
        g.append("text")
            .attr("y", innerHeight + margin.bottom / 2)
            .attr("x", innerWidth / 2)  
            .attr("dy", "1em")    
            .style("text-anchor", "middle")  
            .text("Seasons of Testdatum"); 

        // Add the x-axis to the group element
        g.append("g")
            .attr("transform", `translate(0, ${innerHeight})`)
            .call(xAxis)
            .attr('class', 'x-axis') ;
            
            
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
        //console.log("checkedClasses.length ", props.checkedClasses.length, x0.bandwidth() / props.checkedClasses.length);
        const subBandWidth = x0.bandwidth() / props.checkedClasses.length;
        function bandedX(d) {
            const season = d.value.season.toString();
            const clazz = d.value.lastingclass.toString();   //.class
            const x1 = getSubBandScale(season); // Get x1 scale for the current season
            //console.log("bandedX clazz", clazz, "season ", season, "x0(season)", x0(season),  "clazz", clazz, "x1(clazz), ", x1(clazz));
            return x0(season) + x1(clazz) 
        }


        g.selectAll(".vertLines")
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
            .style("width", 40);     


        // Boxes
        g.selectAll(".boxes")
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
        g.selectAll(".medianLines")
            .data(sumstat)
            .enter().append("line")
            .attr("class", "medianLines") 
            .attr("x1", d => {
                return bandedX(d);
            })
            .attr("x2", d => {
                return bandedX(d) + subBandWidth;
            })
            .attr("y1", d => y(d.value.median))
            .attr("y2", d => y(d.value.median))
            .attr("stroke", "black")
            .style("width", 40);


        // g.selectAll(".medianText")
        //     .data(sumstat)
        //     .enter().append("text")
        //     .attr("class", "medianText") 
        //     .attr("x", d => {
        //         return bandedX(d) + subBandWidth/2;
        //     })
        //     .attr("y", d => y(d.value.median) - 5) 
        //     .style("text-anchor", "middle")
        //     .text(d => d.value.median);


        lastingClassGroups.forEach((values, lastingClassKey) => {
            for(let i = 0; i < values.length - 1; i++) {
                const startPoint = values[i];
                const endPoint = values[i + 1];        
                g.append("line")
                    .attr("class", "lastingClassLines")
                    .attr("x1", () => {
                        return bandedX(startPoint) + subBandWidth / 2;
                    })
                    .attr("x2", () => {
                        return bandedX(endPoint) + subBandWidth / 2;
                    })
                    .attr("y1", y(startPoint.value.median))
                    .attr("y2", y(endPoint.value.median))
                    .attr("stroke", d => {            
                        const classID = AggregateUtils.getLastingClassID(startPoint.value.school, startPoint.value.season, startPoint.value.class);
                        return props.classColors[startPoint.value.school][classID];}) 
                    .attr('stroke-width', 2)
                    .attr("startSeason", startPoint.value.season.toString())
                    .attr("startClass", startPoint.value.class.toString())
                    .attr("endSeason", endPoint.value.season.toString())
                    .attr("endClass", endPoint.value.class.toString())
            }
        });
       

        // Add individual points with jitter
        if(props.studentsChecked) {
            AggregateUtils.PresentIndividuals(props.filteredData, props.yField, g, x0, getSubBandScale, y, subBandWidth)  //getSubBandScale,
        }


        if( svg.node() &&  d3.zoomTransform(svg.node()) && d3.zoomTransform(svg.node()) !== d3.zoomIdentity) {                  
            const zoomState = d3.zoomTransform(svg.node()); // Get the current zoom state
            AggregateUtils.boxZoomRender( zoomState, x0, y, 'band', 'linear', 'season', props.yField, null, false, g, xAxis, d3.axisLeft(y), newXScaleRef, newYScaleRef, getSubBandScale, props.studentsChecked);
        }

        // Setup zoom behavior
        const zoomBehavior = AggregateUtils.createBoxZoomBehavior(x0, y, 'band', 'linear', 'season', props.yField, null, false, g, xAxis, d3.axisLeft(y), newXScaleRef, newYScaleRef, getSubBandScale, props.studentsChecked);
        // Apply the zoom behavior to the SVG
        svg.call(zoomBehavior)

        // Add color legend
        //ColorLegend(identityClasses, "classID", svg, 200, margin);          

        // ... rest of the zoom and event logic remains unchanged ...
    }, [props.filteredData, props.xField, props.yField, props.colorField, props.width, props.height,  props.selectedRecord, props.studentsChecked,formatDate, parseDate, props.onBoxClick, props.classColors,props.checkedClasses]); 
    return (
        <svg className="scatter-canvas" ref={svgRef} width={props.width} height={props.height}></svg>
    );

}


export default AggregateCanvas;



