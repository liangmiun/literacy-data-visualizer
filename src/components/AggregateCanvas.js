
import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { ColorLegend } from './ScatterCanvas';
import { interpolateSpectral } from 'd3-scale-chromatic';


const AggregateCanvas = ({ data, filteredData, xField, yField, colorField, width, height, 
    onPartClick, selectedRecord, studentsChecked, showViolin }) => {

    //showViolin= true;
    filteredData = filteredData.filter(d => d[xField] !== null && d[yField] !== null);   

    if(showViolin) {
      return ViolinPlots(filteredData, xField, yField, colorField, width, height, onPartClick, selectedRecord, studentsChecked);
    }
    return BoxPlots(filteredData, xField, yField, colorField, width, height, onPartClick, selectedRecord, studentsChecked );   


};


const ViolinPlots = (filteredData, xField, yField, colorField, width, height,  onViolinClick, selectedRecord, studentsChecked ) => {
        const svgRef = useRef();
        const parseDate = d3.timeParse('%y%m%d');
        const formatDate = d3.timeFormat('%y-%m-%d');

        useEffect(() => {

            const {svg, g, margin, innerWidth, innerHeight, colorScale, box_sumstat, seasons, y, x0, xAxis, getSubBandScale, lastingClassGroups, identityClasses}  = PreparePlotStructure(svgRef, filteredData, yField, width, height);

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
                .call(xAxis);        


            g.append('g').call(d3.axisLeft(y).tickFormat(d => {
                if(yField==='Födelsedatum'||yField==='Testdatum')
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
            .text(yField); 

            
            const subBandWidth = x0.bandwidth() * 0.2;
            const histogram = d3.bin().domain(y.domain()).thresholds(y.ticks(30)).value(d => d);
            const grouped = d3.group(filteredData, d => Season(d.Testdatum), d => d.Skola, d => d.Klass);

            const sumstat = [];
            grouped.forEach((seasonGroup, seasonKey) => {
                seasonGroup.forEach((schoolGroup, schoolKey) => {
                    schoolGroup.forEach((values, klassKey) => {
                        const input = values.map(g => g[yField]);
                        const bins = histogram(input);
                        sumstat.push({
                            key: `${klassKey}-${seasonKey}`,
                            value: {
                                lastingclass: getLastingClassID(schoolKey, seasonKey, klassKey),                                
                                season: seasonKey,
                                school: schoolKey,
                                class: klassKey,
                                bins: bins
                            }
                        });
                    });
                });
            });

            var maxNum = 0;
            for (var i in sumstat) {
                var allBins = sumstat[i].value.bins
                var lengths = allBins.map(a => a.length)
                var longest = d3.max(lengths)
                if (longest > maxNum) { maxNum = longest }
            }

            const xNum = d3.scaleLinear().range([0, subBandWidth]).domain([-maxNum, maxNum]);

            const widthNum = 2;
            g.selectAll("myViolin")
                .data(sumstat)
                .enter().append("g")
                .attr("transform",  d => {
                    const season = d.value.season;
                    const clazz = d.value.class;
                    const x1 = getSubBandScale(season); // Get x1 scale for the current season
                    return `translate(${x0(season) + x1(clazz)}, 0)`;
                })
                .style("fill", d => {
                    const classId = getLastingClassID(d.value.school, d.value.season, d.value.class);
                    return colorScale(classId);
                })
                .on("click", (event, d) => {

                    const values = d.value.bins.flatMap(bin => bin.slice(0, bin.length));
                    const sortedValues = values.sort(d3.ascending);
                    const q1 = d3.quantile(sortedValues, 0.25);
                    const median = d3.quantile(sortedValues, 0.5);
                    const q3 = d3.quantile(sortedValues, 0.75);
                    const interQuantileRange = q3 - q1;
                    const min = q1 - 1.5 * interQuantileRange;
                    const max = q3 + 1.5 * interQuantileRange;
                    console.log("violin click:", d, d.value);
                    onViolinClick([{
                        lastingclass: d.value.lastingclass,
                        class: d.value.class,
                        season: d.value.season,
                        min: parseInt(min,10),
                        max: parseInt(max,10),
                        median: parseInt(median,10),
                        q1: parseInt(q1,10),
                        q3: parseInt(q3,10)
                    }]);
                })
                .append("path")
                .datum(
                    function(d){ 
                        return d.value.bins;
                    }
                )
                .style("stroke", "none")
                //.style("fill", "#69b3a2")
                .attr("d", d3.area()
                    .x0(d => xNum(-d.length* widthNum))  
                    .x1(d => xNum(d.length* widthNum))  
                    .y(d => y(d.x0))   //d.x0
                    .curve(d3.curveCatmullRom)
                )
;  


            lastingClassGroups.forEach((values, lastingClassKey) => {
                for(let i = 0; i < values.length - 1; i++) {
                    const startPoint = values[i];
                    const endPoint = values[i + 1];        
                    g.append("line")
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
                            const classId = getLastingClassID(startPoint.value.skola, startPoint.value.season, startPoint.value.class);
                            return colorScale(classId);}) 
                        .attr('stroke-width', 2); 
                }
            }); 


            // Add individual points with jitter
  
            if(studentsChecked) {       
                PresentIndividuals(filteredData, yField, g, x0, getSubBandScale, y, subBandWidth)       
                
            }

            // Add color legend
            ColorLegend(identityClasses, "classID", svg, 200, margin);   

        }, [filteredData,xField, yField, colorField, width, height, selectedRecord, studentsChecked, formatDate, parseDate, onViolinClick]);
        
        return (
            <svg className="scatter-canvas" ref={svgRef} width={width} height={height}></svg>
        );
    };


const BoxPlots = (filteredData, xField, yField, colorField, width, height, onBoxClick, selectedRecord, studentsChecked ) => {
    const svgRef = useRef();
    const parseDate = d3.timeParse('%y%m%d');
    const formatDate = d3.timeFormat('%y-%m-%d');
    
    // In your useEffect: 
    useEffect(() => {

        const {svg, g, margin, innerWidth, innerHeight, colorScale, sumstat, seasons, y, x0, xAxis, getSubBandScale, lastingClassGroups, identityClasses}  = PreparePlotStructure(svgRef, filteredData, yField, width, height);

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
            .call(xAxis);        
 

        g.append('g').call(d3.axisLeft(y).tickFormat(d => {
            if(yField==='Födelsedatum'||yField==='Testdatum')
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
        .text(yField); 

        // Vertical lines
        const subBandWidth = x0.bandwidth() *0.2;
        g.selectAll("vertLines")
            .data(sumstat)
            .enter().append("line")
            .attr("x1", d => {
                const season = d.value.season.toString();
                const clazz = d.value.class.toString();
                const x1 = getSubBandScale(season); // Get x1 scale for the current season
                return x0(season) + x1(clazz) + subBandWidth / 2;
            })
            .attr("x2", d => {
                const season = d.value.season.toString();
                const clazz = d.value.class.toString();
                const x1 = getSubBandScale(season); // Get x1 scale for the current season
                return x0(season) + x1(clazz) + subBandWidth / 2;
            })
            .attr("y1", d => y(d.value.min))
            .attr("y2", d => y(d.value.max))
            .attr("stroke", "black")
            .style("width", 40);

        // Boxes
        g.selectAll("boxes")
            .data(sumstat)
            .enter().append("rect")
            .attr("x", d => {
                const season = d.value.season.toString();
                const clazz = d.value.class.toString();
                const x1 = getSubBandScale(season); // Get x1 scale for the current season
                return x0(season) + x1(clazz);
            })
            .attr("y", d => y(d.value.q3))
            .attr("height", d => y(d.value.q1) - y(d.value.q3))
            .attr("width", d => {
                return subBandWidth;
            })
            .attr("stroke", "black")
            .style("fill", d => {
                const classId = getLastingClassID(d.value.skola, d.value.season, d.value.class);
                return colorScale(classId);
            })
            .on("click", (event,d) =>{             
                onBoxClick([{
                lastingclass: d.value.lastingclass,
                class: d.value.class,
                season: d.value.season,
                min: parseInt(d.value.min,10),
                max: parseInt(d.value.max,10),
                median: parseInt(d.value.median,10),
                q1: parseInt(d.value.q1,10),
                q3: parseInt(d.value.q3,10)
            }])});

        // Median lines
        g.selectAll("medianLines")
            .data(sumstat)
            .enter().append("line")
            .attr("x1", d => {
                const season = d.value.season.toString();
                const clazz = d.value.class.toString();
                const x1 = getSubBandScale(season); // Get x1 scale for the current season
                return x0(season) + x1(clazz);
            })
            .attr("x2", d => {
                const season = d.value.season.toString();
                const clazz = d.value.class.toString();
                const x1 = getSubBandScale(season); // Get x1 scale for the current season
                return x0(season) + x1(clazz) + subBandWidth;
            })
            .attr("y1", d => y(d.value.median))
            .attr("y2", d => y(d.value.median))
            .attr("stroke", "black")
            .style("width", 40);


        g.selectAll("medianText")
            .data(sumstat)
            .enter().append("text")
            .attr("x", d => {
                const season = d.value.season.toString();
                const clazz = d.value.class.toString();
                const x1 = getSubBandScale(season); // Get x1 scale for the current season
                return x0(season) + x1(clazz) + subBandWidth/2;
            })
            //.attr("x", d => x0(d.key.split('-')[1]) + x1(d.key.split('-')[0]) +  boxWidth/2)
            .attr("y", d => y(d.value.median) - 5) 
            .style("text-anchor", "middle")
            .text(d => d.value.median);


        lastingClassGroups.forEach((values, lastingClassKey) => {
            for(let i = 0; i < values.length - 1; i++) {
                const startPoint = values[i];
                const endPoint = values[i + 1];        
                g.append("line")
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
                        const classId = getLastingClassID(startPoint.value.skola, startPoint.value.season, startPoint.value.class);
                        return colorScale(classId);}) 
                    .attr('stroke-width', 2); 
            }
        });           


        // Add individual points with jitter
        if(studentsChecked) {
            PresentIndividuals(filteredData, yField, g, x0, getSubBandScale, y, subBandWidth)  //getSubBandScale,
        }

        // Add color legend
        ColorLegend(identityClasses, "classID", svg, 200, margin);          

        // ... rest of the zoom and event logic remains unchanged ...
    }, [filteredData, xField, yField, colorField, width, height,  selectedRecord, studentsChecked,formatDate, parseDate, onBoxClick]);
    return (
        <svg className="scatter-canvas" ref={svgRef} width={width} height={height}></svg>
    );

}


function PresentIndividuals(data, yField, g, x0, getSubBandScale, y , subBandWidth)
{
    const jitterWidth = 20;
    const offset =0;

    g.selectAll("indPoints")
        .data(data)
        .enter().append("circle")
        .attr("cx", d => {                    
            const season = Season(d.Testdatum).toString(); // or whatever field you use for the season
            const clazz = d.Klass.toString();
            const x1 = getSubBandScale(season); // get the x1 scale for the current season
            return x0(season) + x1(clazz) + offset + subBandWidth/2 - jitterWidth/2 + Math.random()*jitterWidth;
        })
        .attr("cy", d => { return y(d[yField])})
        .attr("r", 2)
        .style("fill", "white")
        .attr("stroke", "black")
        .style("fill-opacity", 0.5)
        .style("stroke-opacity", 0.5);  
}


function Season(dateObject) {
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
        const classId = `${skola.substring(0,4)}:${year - klassNum + 1}-${1}${klassSuffix}`;

        const existingClass = identityClassesMap.get(classId);
        if (existingClass) {
            const existingRecord = existingClass.find(r => r.Läsår === record.Läsår && r.Klass === record.Klass);
            if (existingRecord) {
                existingRecord.ElevIDs.push(record.ElevID);
            } else {
                existingClass.push({ Läsår: record.Läsår, Klass: record.Klass, ElevIDs: [record.ElevID] });
            }
        } else {
            identityClassesMap.set(classId, [{ Läsår: record.Läsår, Klass: record.Klass, ElevIDs: [record.ElevID] }]);
        }
    });

    const identityClasses = Array.from(identityClassesMap).map(([key, value]) => {
        return { classID: key, classes: value };
    });

    return identityClasses;

}; 


function getLastingClassID(skola, seasonKey, classKey)
{
    const klassNum = parseInt(classKey[0]);
    const testYear = parseInt(seasonKey.split('-')[0]);
    const testSeason = parseInt(seasonKey.split('-')[1]);
    const initYear = testSeason <7? testYear - klassNum : testYear - klassNum + 1  ;
    const klassSuffix = classKey.length>1? classKey[1]: '';
    const skola_short = skola.toString().substring(0,4);
    return `${skola_short}:${initYear}-${1}${klassSuffix}`;
}


function PreparePlotStructure(svgRef, filteredData, yField, width, height){
            const svg = d3.select(svgRef.current);
            svg.selectAll('*').remove();
            
            const identityClasses = identityClass(filteredData);  // Call the identityClass function to get the identity classes.
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


            // Group the individuals based on Klass and Testdatum (season), with season as first level and Klass as second level.
            const grouped = d3.group(filteredData,  d => Season(d.Testdatum), d =>d.Skola, d => d.Klass);
            const sumstat = [];
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
                                skola: schoolKey,
                                class: klassKey,
                                season: seasonKey,
                                q1: q1, 
                                median: median, 
                                q3: q3, 
                                interQuantileRange: interQuantileRange, 
                                min: min, 
                                max: max
                            }
                        });
                    });
                });
            });

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

            });

            // Create a function to get the sub-band scale for classes within a given season
            function getSubBandScale(season) {
                return d3.scaleBand()
                    .padding(0.05)   //0.05
                    .domain(seasonToClasses[season])
                    .range([0, x0.bandwidth()]);
            }

            // Create main linear scale for y-axis
            const [yMin, yMax] = d3.extent(filteredData, d => d[yField]);
            const y = d3.scaleLinear()
                .domain([yMin, yMax])
                .range([innerHeight, 0]);

            // Create main band scale for seasons
            const x0 = d3.scaleBand()
                .domain(seasons)
                .range([0, innerWidth])
                .paddingInner(0.5)
                .paddingOuter(0.5);

            // 2. Generate the tick values (just the combined class-season strings now)
            let tickValues = seasons; 

            // 3. Create the x-axis using the new band scale `x1`
            const xAxis = d3.axisBottom(x0)
                .tickValues(tickValues) // Use the combined class-season strings
                .tickFormat(d => d);  // The tick format is just the string itself now
                
            return {svg, g, margin, innerWidth, innerHeight, colorScale, sumstat, seasons, y, x0, xAxis, getSubBandScale, lastingClassGroups, identityClasses};

}


export default AggregateCanvas;


