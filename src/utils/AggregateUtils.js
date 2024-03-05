import * as d3 from 'd3';
import {  rescale, translateExtentStartEnd, formatDate } from 'utils/Utils';
import { innerAggrWidth, innerAggrHeight } from './constants';

export const singleViolinWidthRatio = 1; // The width of a single violin relative to the sub-band width
const indv_jitterWidth = 5;
const indv_offset =0;

export function PresentIndividuals(data, yField, g, x0, getSubBandScale, y , subBandWidth, connectIndividual )
{
    // Step 1: Group data by ElevID
    //const groupedData = d3.group(data, d => d.ElevID);

    // Calculate positions and draw circles
    const positions = []; // To store the positions of circles
    g.selectAll(".indvPoints")
        .data(data)
        .enter().append("circle")
        .attr("class", "indvPoints")
        .attr("cx", d => {                    
            const season = Season(d.Testdatum).toString(); // or whatever field you use for the season
            const clazz = d.Klass.toString();
            const classID = getLastingClassID(d.Skola, season, clazz);
            const x1 = getSubBandScale(season); // get the x1 scale for the current season

            // Unique string for hashing, combining properties that uniquely identify this data point
            const uniqueIdentifier = `${d.ElevID}`; //`${d.Skola}-${season}-${clazz}`
            const hashValue = simpleHash(uniqueIdentifier);
            const jitterOffset = consistentRandom(hashValue, -indv_jitterWidth / 2, indv_jitterWidth / 2);
            const cx = x0(season) + x1(classID)  + subBandWidth/2 + indv_offset + jitterOffset;   //- indv_jitterWidth/2 + Math.random()*indv_jitterWidth

            const record_id = d.ElevID +"-" + formatDate(d.Testdatum);

            positions.push({ ElevID: d.ElevID, cx, cy: y(d[yField]), record_id: record_id});
            return cx;
        })
        .attr("cy", d => { return y(d[yField])})
        .attr("r", 2)
        .style("fill", "white")
        .attr("stroke", "black")
        .style("fill-opacity", 0.5)
        .style("stroke-opacity", 0.5) 
        .attr("record_id", d => { return d.ElevID +"-" + formatDate(d.Testdatum)}) 
        .attr("indv_season", d => {return Season(d.Testdatum).toString()})
        .attr("indv_classID", d => { return getLastingClassID(d.Skola, Season(d.Testdatum).toString(), d.Klass.toString())})
        .attr("jitterOffset", (d) => { 
            const uniqueIdentifier = `${d.ElevID}`;
            const hashValue = simpleHash(uniqueIdentifier);
            return  consistentRandom(hashValue, -indv_jitterWidth / 2, indv_jitterWidth / 2);        
        });

    const groupedPositions = d3.group(positions, d => d.ElevID);
    groupedPositions.forEach((value, key) => {
        const points = value;

        for (let i = 0; i < points.length - 1; i++) {
            g.append("line")
                .attr("class", "indvLines")
                .attr("x1", points[i].cx)
                .attr("y1", points[i].cy)
                .attr("x2", points[i + 1].cx)
                .attr("y2", points[i + 1].cy)
                .attr("stroke", "black")
                .attr("stroke-width", 0.5)
                .attr("stroke-opacity", 0.5)
                .attr("start_record_id", points[i].record_id)
                .attr("end_record_id", points[i + 1].record_id)
                .style("visibility", connectIndividual ? "visible" : "hidden");;
        }
    });

}


export function Season(dateObject) {
    const year = dateObject.getFullYear();
    const month = dateObject.getMonth(); // 0 = January, 1 = February, ..., 11 = December
    //const day = dateObject.getDate();
    return `${year}-${month + 1}`;  //-${day}

}


export function getLastingClassID(school, seasonKey, classKey)
{
    const klassNum = parseInt(classKey[0]);
    const testYear = parseInt(seasonKey.split('-')[0]) - 2000;
    const testSeason = parseInt(seasonKey.split('-')[1]);
    const schoolYear = testSeason <7? testYear - 1 : testYear;

    const klassSuffix = classKey.length>1? classKey[1]: '';
    const skolaShort = school.toString().substring(0,4).replace(/\s+/g, '_');
    const newKlassNum = 3* ( Math.ceil(klassNum / 3) - 1) + 1;
    return `${skolaShort}:${schoolYear - klassNum +  newKlassNum}-${newKlassNum}${klassSuffix}`;

}


export function PreparePlotStructure(svgRef, filteredData, yField, aggregateType, margin)  {

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();           

    //set margin for svg
    const g = svg.append('g').attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Create main linear scale for y-axis
    const [yMin, yMax] = d3.extent(filteredData, d => d[yField]);
    const yPadding = (yMax - yMin) * 0.1;
    const yScale = d3.scaleLinear()
        .domain([yMin - yPadding, yMax + yPadding])
        .range([innerAggrHeight(), 0]);

    // Group the individuals based on Klass and Testdatum (season), with season as first level and Klass as second level.
    const sumstat = setSumStat(filteredData, yScale, yField, aggregateType);

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
            .map(d => d.value.lastingclass);  // .class
        classesForSeason.sort((a, b) => a.toString().localeCompare(b.toString()));
        seasonToClasses[season] = classesForSeason;

    });

    // Create a function to get the sub-band scale for classes within a given season
    function getSubBandScale(season) {
        return d3.scaleBand()
            .padding(0.05)   //0.05
            .domain(seasonToClasses[season])
            .range([0, xMainBandScale.bandwidth()]);
    }

    // Create main band scale for seasons
    const xMainBandScale = d3.scaleBand()
    .domain(seasons)
    .range([0, innerAggrWidth()])
    .paddingInner(0.2)
    .paddingOuter(0.2);

    // g.selectAll(".padding-rect")
    // .data(seasons)
    // .enter().append("rect")
    // .attr("class", "padding-rect")
    // .attr("x", d => x0(d) - x0.step() * x0.paddingInner() / 2)
    // .attr("width", x0.step())
    // .attr("height", innerHeight)  // Set to the height of your chart area
    // .attr("fill", "white");  // Color for the padding areas

    // Generate the tick values (just the combined class-season strings now)
    let tickValues = seasons; 

    // Create the x-axis using the new band scale `x1`
    const xAxis = d3.axisBottom(xMainBandScale)
        .tickValues(tickValues) ;// Use the combined class-season strings,  .tickFormat(d => d)
        
    return {svg, g, sumstat, seasons, yScale, xMainBandScale, xAxis, getSubBandScale, lastingClassGroups};

}


function setSumStat(filteredData, y, yField, aggregateType)
{
    const sumstat = [];
    if(aggregateType === 'violin'){
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
    else  {
        const grouped = d3.group(filteredData,  function(d){ return Season(d.Testdatum)}, d =>d.Skola, d => d.Klass); //d => Season(d.Testdatum)
        grouped.forEach((seasonGroup, seasonKey) => {
            seasonGroup.forEach((schoolGroup, schoolKey) => {
                schoolGroup.forEach((values, classKey) => {

                    const sortedValues = values.map(g => g[yField]).sort(d3.ascending);                    
                    const q1 = d3.quantile(sortedValues, 0.25);
                    const median = d3.quantile(sortedValues, 0.5);
                    const q3 = d3.quantile(sortedValues, 0.75);
                    const interQuantileRange = q3 - q1;
                    const min = q1 - 1.5 * interQuantileRange;
                    const max = q3 + 1.5 * interQuantileRange;

                    sumstat.push({
                        key: `${classKey}-${seasonKey}`,
                        value: {
                            lastingclass: getLastingClassID(schoolKey, seasonKey, classKey),
                            school: schoolKey,
                            class: classKey,
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

    return sumstat;
}


export function createAggrZoomBehavior( renderer, xScale, yScale, xType, yType, xField, yField, line, connectIndividual, svg, g, xAxis, yAxis, newXScaleRef, newYScaleRef, getSubBandScale, studentsChecked, subBandCount, xNum) {   
    return d3.zoom()
      .scaleExtent([1, 20])
      .translateExtent( translateExtentStartEnd(1.1, 1, svg)) 
      .on('zoom', (event) => {
        const zoomState = event.transform;
        renderer(zoomState,xScale, yScale, xType, yType, xField, yField, line, connectIndividual, g, xAxis, yAxis, newXScaleRef, newYScaleRef, getSubBandScale, studentsChecked, subBandCount, xNum);
        });
}


export function boxZoomRender(zoomState,xScale, yScale, xType, yType, xField, yField, line, connectIndividual, g, xAxis, yAxis, newXScaleRef, newYScaleRef, getSubBandScale, studentsChecked, subBandCount)
{
    const {zoomXScale, zoomYScale, subBandWidth, zoomedX} = init_ZoomSetting(zoomState, xScale, yScale, xType, yType, g, xAxis, yAxis, newXScaleRef, newYScaleRef, getSubBandScale, subBandCount);
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

    commonPartRender( g, zoomXScale, zoomYScale, zoomState, subBandWidth, getSubBandScale, connectIndividual, xField, yField, line, studentsChecked);

}


export function circleZoomRender(zoomState,xScale, yScale, xType, yType, xField, yField, line, connectIndividual, g, xAxis, yAxis, newXScaleRef, newYScaleRef, getSubBandScale, studentsChecked, subBandCount)
{
    const {zoomXScale, zoomYScale, subBandWidth, zoomedX} = init_ZoomSetting(zoomState, xScale, yScale, xType, yType, g, xAxis, yAxis, newXScaleRef, newYScaleRef, getSubBandScale, subBandCount);
    // Apply zoom transformation to circles
    g.selectAll('.circles')  //
    .attr("cx", d => {  
        return zoomedX(d)+ subBandWidth / 2;      
    })

    commonPartRender( g, zoomXScale, zoomYScale, zoomState, subBandWidth, getSubBandScale, connectIndividual, xField, yField, line, studentsChecked);

}


export function violinZoomRender(zoomState,xScale, yScale, xType, yType, xField, yField, line, connectIndividual, g, xAxis, yAxis, newXScaleRef, newYScaleRef, getSubBandScale,  studentsChecked, subBandCount, xNum)
{
    const {zoomXScale, zoomYScale, subBandWidth, zoomedX} = init_ZoomSetting(zoomState, xScale, yScale, xType, yType, g, xAxis, yAxis, newXScaleRef, newYScaleRef, getSubBandScale, subBandCount);
          
    g.selectAll('.violins')
    .attr("transform",  d => {
        return `translate(${zoomedX(d)+ subBandWidth/2  }, 0)`;   
        })
    .selectAll('.area')
    .attr("d", d3.area()
        .x0(d => xNum(-d.length *singleViolinWidthRatio)*zoomState.k )  
        .x1(d => xNum(d.length *singleViolinWidthRatio) *zoomState.k)    
        .y(d => yScale(d.x0))   //d.x0
        .curve(d3.curveCatmullRom)
                );  

    commonPartRender( g, zoomXScale, zoomYScale, zoomState, subBandWidth, getSubBandScale, connectIndividual, xField, yField, line, studentsChecked);

    
}


function commonPartRender( g, zoomXScale, zoomYScale, zoomState, subBandWidth, getSubBandScale, connectIndividual, xField, yField, line, studentsChecked)
{
    g.selectAll('.lastingClassLines')
    .attr("x1", function(){
        const startSeason = d3.select(this).attr('startSeason');
        const startClassID = d3.select(this).attr('startClassID');
        return zoomXScale(startSeason) + getSubBandScale(startSeason)(startClassID)* zoomState.k + subBandWidth / 2;
    })
    .attr("x2", function(){
        const endSeason = d3.select(this).attr('endSeason');
        const endClassID = d3.select(this).attr('startClassID');
        return zoomXScale(endSeason) + getSubBandScale(endSeason)(endClassID)* zoomState.k + subBandWidth / 2;
    })

    // Apply zoom transformation to lines
    var filteredSelection = g.selectAll('.line-path')
    .filter(function() {
        return d3.select(this).style('visibility') === 'visible';
    });

    if (filteredSelection.size() > 0) {
    filteredSelection.attr('d', line.x(d => zoomXScale(d[xField])).y(d => zoomYScale(d[yField])));
    }
    
    if( studentsChecked) {
        zoomIndividualJitter( g, zoomXScale, zoomState, subBandWidth, getSubBandScale, connectIndividual);
    }

}


export function init_ZoomSetting(zoomState,xScale, yScale, xType, yType, g, xAxis, yAxis, newXScaleRef, newYScaleRef, getSubBandScale, subBandCount)
{
    //const zoomState = event.transform;    
    const zoomXScale = rescale(xScale, zoomState, xType, 'x');         
    const zoomYScale = rescale(yScale, zoomState, yType, 'y' );

    newXScaleRef.current = zoomXScale;
    newYScaleRef.current = zoomYScale;
    const subBandWidth = zoomXScale.bandwidth() / subBandCount;  

    function zoomedX(d) {
        const season = d.value.season.toString();
        const clazz = d.value.lastingclass.toString();
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


export function zoomIndividualJitter( g, zoomXScale, zoomState, subBandWidth, getSubBandScale,connectIndividual)
{
    g.selectAll(".indvPoints")
    .attr("cx", function() {
        const season = d3.select(this).attr("indv_season");
        const classID = d3.select(this).attr("indv_classID");
        const jitterOffset = d3.select(this).attr("jitterOffset");
        return zoomXScale(season) + getSubBandScale(season)(classID) * zoomState.k + subBandWidth/2 + jitterOffset*zoomState.k;
    })

   

    
    g.selectAll(".indvLines")
    .each(function() {
    // Current line element
    var line = d3.select(this);

    // Read the start_record_id and end_record_id from the line
    var startRecordId = line.attr("start_record_id");
    var endRecordId = line.attr("end_record_id");

    // Find the start and end circle elements based on record_id
    var dStart = g.select(`.indvPoints[record_id="${startRecordId}"]`);
    var dEnd = g.select(`.indvPoints[record_id="${endRecordId}"]`);

    // Ensure elements were found before attempting to read attributes
    if (!dStart.empty() && !dEnd.empty()) {
        // Set the line's x1 and x2 attributes based on the found circles' cx attributes
        line.attr("x1", dStart.attr("cx"))
            .attr("x2", dEnd.attr("cx"))
            .style("visibility", connectIndividual ? "visible" : "hidden");
    }
    }); 
    

}


export function presentLines(showLines, lastingClassGroups,  g, x0, getSubBandScale, y, subBandWidth, classColors)
{
    if(showLines) {
            
        lastingClassGroups.forEach((values, lastingClassKey) => {
            for(let i = 0; i < values.length - 1; i++) {
                const startPoint = values[i];
                const endPoint = values[i + 1]; 
                g.append("line")
                    .attr("class", "lastingClassLines")
                    .attr("x1", () => {
                        const season = startPoint.value.season.toString();
                        const clazz = startPoint.value.lastingclass.toString();
                        const x1 = getSubBandScale(season);
                        return x0(season) + x1(clazz) + subBandWidth / 2;
                    })
                    .attr("x2", () => {
                        const season = endPoint.value.season.toString();
                        const clazz = endPoint.value.lastingclass.toString();
                        const x1 = getSubBandScale(season);
                        return x0(season) + x1(clazz) + subBandWidth / 2;
                    })
                    .attr("y1", y(startPoint.value.median))
                    .attr("y2", y(endPoint.value.median))
                    .attr("stroke", () => {            
                        const classID = getLastingClassID(startPoint.value.school, startPoint.value.season, startPoint.value.class);
                        return  classColors[startPoint.value.school][classID]; }) 
                    .attr('stroke-width', 1)
                    .attr("startSeason", startPoint.value.season.toString())
                    .attr("startClassID", getLastingClassID(startPoint.value.school, startPoint.value.season, startPoint.value.class))
                    .attr("endSeason", endPoint.value.season.toString())
                    .attr("endClass", endPoint.value.class.toString())                  
                    ; 
            }
        }); 
    }



}


function simpleHash(s) {
    // A very basic hash function for demonstration purposes
    return s.split('').reduce((acc, char) => Math.imul(31, acc) + char.charCodeAt(0) | 0, 0);
}


function consistentRandom(hashValue, min, max) {
    // Pseudo-random function based on a hash value
    const rand = Math.abs(hashValue % 1000) / 1000; // Normalize hash value to [0, 1)
    return min + rand * (max - min); // Scale to [min, max)
}



