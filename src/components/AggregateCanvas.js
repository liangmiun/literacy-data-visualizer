import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import {  rescale } from './ScatterCanvas';
import { interpolateSpectral } from 'd3-scale-chromatic';
import {  ColorLegend} from '../Utils.js';

const singleViolinWidthRatio = 0.6; // The width of a single violin relative to the sub-band width
const indv_jitterWidth = 10;
const indv_offset =0;


const AggregateCanvas = (props) => {

    const filteredData = props.filteredData.filter(d => d[props.xField] !== null && d[props.yField] !== null); 

    return(
        <>
            {
                props.showViolin?
                <ViolinPlots filteredData={filteredData} xField={props.xField} yField={props.yField} colorField={props.colorField} width={props.width} height={props.height} onPartClick={props.onPartClick} selectedRecord={props.selectedRecord} studentsChecked={props.studentsChecked} showViolin={props.showViolin} classColors={props.classColors}/>
                :
                <BoxPlots filteredData={filteredData} xField={props.xField} yField={props.yField} colorField={props.colorField} width={props.width} height={props.height} onPartClick={props.onPartClick} selectedRecord={props.selectedRecord} studentsChecked={props.studentsChecked} showViolin={props.showViolin} classColors={props.classColors}/>
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

        const {svg, g, margin, innerWidth, innerHeight, colorScale, sumstat, y, x0, xAxis, getSubBandScale, lastingClassGroups, identityClasses}  = PreparePlotStructure(svgRef, props.filteredData, props.yField, props.width, props.height, true);

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
            const classId = getLastingClassID(d.value.school, d.value.season, d.value.class);
            return colorScale(classId);
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
                .x0(d => xNum(-d.length* subBandWidth * singleViolinWidthRatio))  
                .x1(d => xNum(d.length* subBandWidth * singleViolinWidthRatio))  
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
                        const classId = getLastingClassID(startPoint.value.school, startPoint.value.season, startPoint.value.class);
                        return colorScale(classId);}) 
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
            PresentIndividuals(props.filteredData, props.yField, g, x0, getSubBandScale, y, subBandWidth)       
            
        }

        if( svg.node() &&  d3.zoomTransform(svg.node()) && d3.zoomTransform(svg.node()) !== d3.zoomIdentity) {                  
            const zoomState = d3.zoomTransform(svg.node()); // Get the current zoom state
            violinZoomRender( zoomState, x0, y, 'band', 'linear', 'season', props.yField, null, false, g, xAxis, d3.axisLeft(y), newXScaleRef, newYScaleRef, getSubBandScale,xNum, props.studentsChecked);
        }

        // Setup zoom behavior
        const zoomBehavior = createViolinZoomBehavior(x0, y, 'band', 'linear', 'season', props.yField, null, false, g, xAxis, d3.axisLeft(y), newXScaleRef, newYScaleRef, getSubBandScale, xNum, props.studentsChecked);

        // Apply the zoom behavior to the SVG
        svg.call(zoomBehavior)

        // Add color legend
        ColorLegend(identityClasses, "classID", svg, 200, margin);   

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

        const {svg, g, margin, innerWidth, innerHeight, sumstat, y, x0, xAxis, getSubBandScale, lastingClassGroups }  = PreparePlotStructure(svgRef, props.filteredData, props.yField, props.width, props.height);
        
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
        const subBandWidth = x0.bandwidth() *0.2;
        function bandedX(d) {
            const season = d.value.season.toString();
            const clazz = d.value.class.toString();
            const x1 = getSubBandScale(season); // Get x1 scale for the current season
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
            .attr("y", d => y(d.value.q3))
            .attr("height", d => y(d.value.q1) - y(d.value.q3))
            .attr("width", d => {
                return subBandWidth;
            })
            .style("fill", d => {
                const classID = getLastingClassID(d.value.school, d.value.season, d.value.class);
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


        g.selectAll(".medianText")
            .data(sumstat)
            .enter().append("text")
            .attr("class", "medianText") 
            .attr("x", d => {
                return bandedX(d) + subBandWidth/2;
            })
            .attr("y", d => y(d.value.median) - 5) 
            .style("text-anchor", "middle")
            .text(d => d.value.median);


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
                        const classID = getLastingClassID(startPoint.value.school, startPoint.value.season, startPoint.value.class);
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
            PresentIndividuals(props.filteredData, props.yField, g, x0, getSubBandScale, y, subBandWidth)  //getSubBandScale,
        }


        if( svg.node() &&  d3.zoomTransform(svg.node()) && d3.zoomTransform(svg.node()) !== d3.zoomIdentity) {                  
            const zoomState = d3.zoomTransform(svg.node()); // Get the current zoom state
            boxZoomRender( zoomState, x0, y, 'band', 'linear', 'season', props.yField, null, false, g, xAxis, d3.axisLeft(y), newXScaleRef, newYScaleRef, getSubBandScale, props.studentsChecked);
        }

        // Setup zoom behavior
        const zoomBehavior = createBoxZoomBehavior(x0, y, 'band', 'linear', 'season', props.yField, null, false, g, xAxis, d3.axisLeft(y), newXScaleRef, newYScaleRef, getSubBandScale, props.studentsChecked);
        // Apply the zoom behavior to the SVG
        svg.call(zoomBehavior)

        // Add color legend
        //ColorLegend(identityClasses, "classID", svg, 200, margin);          

        // ... rest of the zoom and event logic remains unchanged ...
    }, [props.filteredData, props.xField, props.yField, props.colorField, props.width, props.height,  props.selectedRecord, props.studentsChecked,formatDate, parseDate, props.onBoxClick, props.classColors]); 
    return (
        <svg className="scatter-canvas" ref={svgRef} width={props.width} height={props.height}></svg>
    );

}


function PresentIndividuals(data, yField, g, x0, getSubBandScale, y , subBandWidth)
{
    g.selectAll(".indvPoints")
        .data(data)
        .enter().append("circle")
        .attr("class", "indvPoints")
        .attr("cx", d => {                    
            const season = Season(d.Testdatum).toString(); // or whatever field you use for the season
            const clazz = d.Klass.toString();
            const x1 = getSubBandScale(season); // get the x1 scale for the current season
            return x0(season) + x1(clazz)  + subBandWidth/2 + indv_offset- indv_jitterWidth/2 + Math.random()*indv_jitterWidth;
        })
        .attr("cy", d => { return y(d[yField])})
        .attr("r", 2)
        .style("fill", "white")
        .attr("stroke", "black")
        .style("fill-opacity", 0.5)
        .style("stroke-opacity", 0.5)  
        .attr("indv_season", d => {return Season(d.Testdatum).toString()})
        .attr("indv_class", d => { return d.Klass.toString()})
        .attr("jitterOffset", () => { return indv_offset- indv_jitterWidth/2 + Math.random()*indv_jitterWidth});
}


function Season(dateObject) {
    //console.log("dataObject for data:", dateObject)
    const year = dateObject.getFullYear();
    const month = dateObject.getMonth(); // 0 = January, 1 = February, ..., 11 = December

    //return `${year}-${Math.ceil((month + 1) / 3)}`;
    return `${year}-${Math.floor(month / 3)*3 +1}`;
}


function identityClass(data)
{
    // Create identity classes
    const identityClassesMap = new Map();

    data.forEach(record => {
        const year = parseInt(record.Läsår.split('/')[0]);
        const skola = record.Skola;
        const klassNum = parseInt(record.Klass[0]);
        const klassSuffix = record.Klass.length >1?  record.Klass[1]: '';
        const classId = `${skola.substring(0,4).replace(/\s+/g, '_')}:${year - klassNum + 1}-${1}${klassSuffix}`;

        //const existingClass = identityClassesMap.get(classId)&identityClassesMap.get(classId)[0];
        let existingClass;
        const classArray = identityClassesMap.get(classId);
        if (classArray && classArray.length > 0) {
            existingClass = classArray[0];
        }
        if (existingClass) {
            const existingRecord = existingClass.find(r => r.Läsår === record.Läsår && r.Klass === record.Klass);
            if (existingRecord) {
                existingRecord.ElevIDs.push(record.ElevID);
            } else {
                existingClass.push({ Läsår: record.Läsår, Klass: record.Klass, ElevIDs: [record.ElevID] });
            }
        } else {
            identityClassesMap.set(classId, [[{ Läsår: record.Läsår, Klass: record.Klass, ElevIDs: [record.ElevID] }], skola]);
        }
    });

    const identityClasses = Array.from(identityClassesMap).map(([key, value]) => {
        return { classID: key, classes: value[0], school: value[1] };
    });

    return identityClasses;

}; 


function getLastingClassID(school, seasonKey, classKey)
{
    const klassNum = parseInt(classKey[0]);
    const testYear = parseInt(seasonKey.split('-')[0]) - 2000;
    const testSeason = parseInt(seasonKey.split('-')[1]);
    const initYear = testSeason <7? testYear - klassNum : testYear - klassNum + 1  ;
    const klassSuffix = classKey.length>1? classKey[1]: '';
    const skola_short = school.toString().substring(0,4).replace(/\s+/g, '_');
    return `${skola_short}:${initYear}-${1}${klassSuffix}`;
}


function PreparePlotStructure(svgRef, filteredData, yField, width, height, isViolin=false){
            const svg = d3.select(svgRef.current);
            svg.selectAll('*').remove();
            
            const identityClasses = identityClass(filteredData);  // Call the identityClass function to get the identity classes.
            //console.log("identityClasses", identityClasses);
            const colorDomain = identityClasses.map(ic => ic.classID);  // Get the unique classIDs.
            const numColors = 20;
            const quantizedScale = d3.scaleQuantize()
                .domain([0, colorDomain.length - 1])
                .range(d3.range(numColors).map(d => interpolateSpectral(d / (numColors - 1))));
            
            const colorScale = d3.scaleOrdinal()
                .domain(colorDomain)
                .range(colorDomain.map((_, i) => quantizedScale(i)));


            //set margin for svg
            const margin = { top: 20, right: 20, bottom: 80, left: 80 };
            const innerWidth = width - margin.left - margin.right;
            const innerHeight = height - margin.top - margin.bottom;
            const g = svg.append('g').attr('transform', `translate(${margin.left}, ${margin.top})`);

            // Create main linear scale for y-axis
            const [yMin, yMax] = d3.extent(filteredData, d => d[yField]);
            const y = d3.scaleLinear()
                .domain([yMin, yMax])
                .range([innerHeight, 0]);

            // Group the individuals based on Klass and Testdatum (season), with season as first level and Klass as second level.
            const sumstat = [];
            if(isViolin){

                const histogram = d3.bin().domain(y.domain()).thresholds(y.ticks(30)).value(d => d);
                const grouped = d3.group(filteredData, d => Season(d.Testdatum), d => d.Skola, d => d.Klass);   

                grouped.forEach((seasonGroup, seasonKey) => {
                    seasonGroup.forEach((schoolGroup, schoolKey) => {
                        schoolGroup.forEach((values, klassKey) => {
                            const input = values.map(g => g[yField]);
                            const bins = histogram(input);
                            const bin_values = bins.flatMap(bin => bin.slice(0, bin.length));
                            const sortedValues = bin_values.sort(d3.ascending);
                            const q1 = d3.quantile(sortedValues, 0.25);
                            const median = d3.quantile(sortedValues, 0.5);
                            const q3 = d3.quantile(sortedValues, 0.75);
                            const interQuantileRange = q3 - q1;
                            const min = q1 - 1.5 * interQuantileRange;
                            const max = q3 + 1.5 * interQuantileRange;

                            sumstat.push({
                                key: `${klassKey}-${seasonKey}`,
                                value: {
                                    lastingclass: getLastingClassID(schoolKey, seasonKey, klassKey),                                
                                    season: seasonKey,
                                    school: schoolKey,
                                    class: klassKey,
                                    bins: bins,
                                    q1: q1, 
                                    median: median, 
                                    q3: q3, 
                                    interQuantileRange: interQuantileRange, 
                                    min: min, 
                                    max: max,
                                    count: sortedValues.length
                                }
                            });
                        });
                    });
                });

            }
            else {
                const grouped = d3.group(filteredData,  function(d){ return Season(d.Testdatum)}, d =>d.Skola, d => d.Klass); //d => Season(d.Testdatum)
                grouped.forEach((seasonGroup, seasonKey) => {
                    seasonGroup.forEach((schoolGroup, schoolKey) => {
                        schoolGroup.forEach((values, klassKey) => {

                            const sortedValues = values.map(g => g[yField]).sort(d3.ascending);
                            
                            const q1 = d3.quantile(sortedValues, 0.25);
                            const median = d3.quantile(sortedValues, 0.5);
                            const q3 = d3.quantile(sortedValues, 0.75);
                            const interQuantileRange = q3 - q1;
                            const min = q1 - 1.5 * interQuantileRange;
                            const max = q3 + 1.5 * interQuantileRange;

                            sumstat.push({
                                key: `${klassKey}-${seasonKey}`,
                                value: {
                                    lastingclass: getLastingClassID(schoolKey, seasonKey, klassKey),
                                    school: schoolKey,
                                    class: klassKey,
                                    season: seasonKey,
                                    q1: q1, 
                                    median: median, 
                                    q3: q3, 
                                    interQuantileRange: interQuantileRange, 
                                    min: min, 
                                    max: max,
                                    count: sortedValues.length
                                }
                            });
                        });
                    });
                });
            }


            // Sort the sumstat by key to ensure boxes layout horizontally within each season:
            // Here sumstat is in a flat structure.
            sumstat.sort((a, b) => {
                const xComp = d3.ascending(a.season, b.season);
                return xComp !== 0 ? xComp : d3.ascending(a.class, b.class);
            });

            const lastingClassGroups = d3.group(sumstat, d => d.value.lastingclass);

            // Create an array of unique seasons
            const seasons = Array.from(new Set(sumstat.map(d => d.value.season.toString())));  // d => d.key.split('-')[1]  d => d.value.season.toString()


            // Create a mapping of each season to its classes
            const seasonToClasses = {};

            seasons.forEach(season => {
                let classesForSeason = sumstat
                    .filter(d => d.value.season === season)
                    .map(d => d.value.class);
                classesForSeason.sort((a, b) => a.toString().localeCompare(b.toString()));
                seasonToClasses[season] = classesForSeason;
                //console.log("seasonToClasses", season, seasonToClasses[season]);

            });

            // Create a function to get the sub-band scale for classes within a given season
            function getSubBandScale(season) {
                return d3.scaleBand()
                    .padding(0.05)   //0.05
                    .domain(seasonToClasses[season])
                    .range([0, x0.bandwidth()]);
            }

            // Create main band scale for seasons
            const x0 = d3.scaleBand()
            .domain(seasons)
            .range([0, innerWidth])
            .paddingInner(0.5)
            .paddingOuter(0.5);

            // Generate the tick values (just the combined class-season strings now)
            let tickValues = seasons; 

            // Create the x-axis using the new band scale `x1`
            const xAxis = d3.axisBottom(x0)
                .tickValues(tickValues) // Use the combined class-season strings
                .tickFormat(d => d);  // The tick format is just the string itself now


                
            return {svg, g, margin, innerWidth, innerHeight, colorScale, sumstat, seasons, y, x0, xAxis, getSubBandScale, lastingClassGroups, identityClasses};

}


function createBoxZoomBehavior(xScale, yScale, xType, yType, xField, yField, line, showLines, g, xAxis, yAxis, newXScaleRef, newYScaleRef, getSubBandScale, studentsChecked) {
    return d3.zoom()
      .scaleExtent([0.5, 10])
      .on('zoom', (event) => {
        const zoomState = event.transform;
        boxZoomRender(zoomState,xScale, yScale, xType, yType, xField, yField, line, showLines, g, xAxis, yAxis, newXScaleRef, newYScaleRef, getSubBandScale, studentsChecked);

        });
  }


function boxZoomRender(zoomState,xScale, yScale, xType, yType, xField, yField, line, showLines, g, xAxis, yAxis, newXScaleRef, newYScaleRef, getSubBandScale, studentsChecked)
{
    const {zoomXScale, zoomYScale, subBandWidth, zoomedX} = init_ZoomSetting(zoomState, xScale, yScale, xType, yType, g, xAxis, yAxis, newXScaleRef, newYScaleRef, getSubBandScale);
    // Apply zoom transformation to boxes
    g.selectAll('.boxes, .medianText')  //
    .attr("x", d => {  
        return zoomedX(d);      
    })
    .attr("width", d => {
        return subBandWidth; })

    g.selectAll('.medianLines')
    .attr("x1", d => {
        return zoomedX(d); 
    })
    .attr("x2", d => {
        return zoomedX(d) + subBandWidth;
    })


    g.selectAll('.vertLines')
    .attr("x1", d => {
        return zoomedX(d) + subBandWidth / 2;
    })
    .attr("x2", d => {
        return zoomedX(d) + subBandWidth / 2;
    })


    g.selectAll('.lastingClassLines')
    .attr("x1", function(){
        const startSeason = d3.select(this).attr('startSeason');
        const startClass = d3.select(this).attr('startClass');
        return zoomXScale(startSeason) + getSubBandScale(startSeason)(startClass)* zoomState.k + subBandWidth / 2;
    })
    .attr("x2", function(){
        const endSeason = d3.select(this).attr('endSeason');
        const endClass = d3.select(this).attr('endClass');
        return zoomXScale(endSeason) + getSubBandScale(endSeason)(endClass)* zoomState.k + subBandWidth / 2;
    })


    // Apply zoom transformation to lines
    if (showLines) {
        g.selectAll('.line-path')
        .attr('d', line.x(d => zoomXScale(d[xField])).y(d => zoomYScale(d[yField])));
    }

    if( studentsChecked) {
        zoomIndividualJitter( g, zoomXScale, zoomState, subBandWidth, getSubBandScale);
    }
}


function createViolinZoomBehavior(xScale, yScale, xType, yType, xField, yField, line, showLines, g, xAxis, yAxis, newXScaleRef, newYScaleRef, getSubBandScale, xNum, studentsChecked)
{

    return d3.zoom()
      .scaleExtent([0.5, 10])
      .on('zoom', (event) => {
            const zoomState = event.transform;
            violinZoomRender(zoomState,xScale, yScale, xType, yType, xField, yField, line, showLines, g, xAxis, yAxis, newXScaleRef, newYScaleRef, getSubBandScale, xNum, studentsChecked);

      });

}


function violinZoomRender(zoomState,xScale, yScale, xType, yType, xField, yField, line, showLines, g, xAxis, yAxis, newXScaleRef, newYScaleRef, getSubBandScale, xNum, studentsChecked)
{
    const {zoomXScale, zoomYScale, subBandWidth, zoomedX} = init_ZoomSetting(zoomState, xScale, yScale, xType, yType, g, xAxis, yAxis, newXScaleRef, newYScaleRef, getSubBandScale);
            
    g.selectAll('.violins')
    .attr("transform",  d => {
        return `translate(${zoomedX(d)}, 0)`;  
        })
    .selectAll('.area')
    .attr("d", d3.area()
        .x0(d => xNum(-d.length* subBandWidth*singleViolinWidthRatio))  //
        .x1(d => xNum(d.length* subBandWidth*singleViolinWidthRatio) )  
        .y(d => yScale(d.x0))   //d.x0
        .curve(d3.curveCatmullRom)
                );  

    g.selectAll('.lastingClassLines')
    .attr("x1", function(){
        const startSeason = d3.select(this).attr('startSeason');
        const startClass = d3.select(this).attr('startClass');
        return zoomXScale(startSeason) + getSubBandScale(startSeason)(startClass)* zoomState.k + subBandWidth / 2;
    })
    .attr("x2", function(){
        const endSeason = d3.select(this).attr('endSeason');
        const endClass = d3.select(this).attr('endClass');
        return zoomXScale(endSeason) + getSubBandScale(endSeason)(endClass)* zoomState.k + subBandWidth / 2;
    })


    // Apply zoom transformation to lines
    if (showLines) {
        g.selectAll('.line-path')
        .attr('d', line.x(d => zoomXScale(d[xField])).y(d => zoomYScale(d[yField])));
    }

    
    if( studentsChecked) {
        zoomIndividualJitter( g, zoomXScale, zoomState, subBandWidth, getSubBandScale);
    }
    
}


function init_ZoomSetting(zoomState,xScale, yScale, xType, yType, g, xAxis, yAxis, newXScaleRef, newYScaleRef, getSubBandScale)
{
    //const zoomState = event.transform;    
    const zoomXScale = rescale(xScale, zoomState, xType, 'x');         
    const zoomYScale = rescale(yScale, zoomState, yType, 'y' );

    newXScaleRef.current = zoomXScale;
    newYScaleRef.current = zoomYScale;
    const subBandWidth = zoomXScale.bandwidth() * 0.1;  //xScale.bandwidth() * 0.2
    //console.log("subBandWidth", subBandWidth)

    function zoomedX(d) {
        const season = d.value.season.toString();
        const clazz = d.value.class.toString();
        const x1 = getSubBandScale(season); // Get x1 scale for the current season
        const value = zoomXScale(season) + x1(clazz) * zoomState.k   //zoomXScale(season) + x1(clazz) 
        return isNaN(value) ? 0 : value;         
    }

    // Update the axes with the new scales
    const xAxisGroup = g.select('.x-axis');
    const yAxisGroup = g.select('.y-axis');

    if (xType === 'point') {  
        xAxisGroup.call(xAxis.scale(zoomXScale).tickValues(xScale.domain()));
    } else {
        xAxisGroup.call(xAxis.scale(zoomXScale));
    }

    if (yType === 'point') {  
        yAxisGroup.call(yAxis.scale(zoomYScale).tickValues(yScale.domain()));
    } else {
        yAxisGroup.call(yAxis.scale(zoomYScale));
    }

    return {zoomState, zoomXScale, zoomYScale, subBandWidth, zoomedX};

}


function zoomIndividualJitter( g, zoomXScale, zoomState, subBandWidth, getSubBandScale)
{
    g.selectAll(".indvPoints")
    .attr("cx", function() {
        const season = d3.select(this).attr("indv_season");
        const clazz = d3.select(this).attr("indv_class");
        const jitterOffset = d3.select(this).attr("jitterOffset");
        //console.log(d +  " length: " + d.length )                    
        return zoomXScale(season) + getSubBandScale(season)(clazz) * zoomState.k + subBandWidth/2 + jitterOffset*zoomState.k;
    })
}


export default AggregateCanvas;



