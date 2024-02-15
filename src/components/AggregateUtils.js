import * as d3 from 'd3';
import {  rescale } from '../Utils';

export const singleViolinWidthRatio = 1; // The width of a single violin relative to the sub-band width
const indv_jitterWidth = 10;
const indv_offset =0;

export function PresentIndividuals(data, yField, g, x0, getSubBandScale, y , subBandWidth )
{
    g.selectAll(".indvPoints")
        .data(data)
        .enter().append("circle")
        .attr("class", "indvPoints")
        .attr("cx", d => {                    
            const season = Season(d.Testdatum).toString(); // or whatever field you use for the season
            const clazz = d.Klass.toString();
            const classID = getLastingClassID(d.Skola, season, clazz);
            const x1 = getSubBandScale(season); // get the x1 scale for the current season
            return x0(season) + x1(classID)  + subBandWidth/2 + indv_offset- indv_jitterWidth/2 + Math.random()*indv_jitterWidth;
        })
        .attr("cy", d => { return y(d[yField])})
        .attr("r", 2)
        .style("fill", "white")
        .attr("stroke", "black")
        .style("fill-opacity", 0.5)
        .style("stroke-opacity", 0.5)  
        .attr("indv_season", d => {return Season(d.Testdatum).toString()})
        .attr("indv_classID", d => { return getLastingClassID(d.Skola, Season(d.Testdatum).toString(), d.Klass.toString())})
        .attr("jitterOffset", () => { return indv_offset- indv_jitterWidth/2 + Math.random()*indv_jitterWidth});

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
    const initYear = testSeason <7? testYear - klassNum : testYear - klassNum + 1  ;

    const schoolYear = testSeason <7? testYear - 1 : testYear;

    const klassSuffix = classKey.length>1? classKey[1]: '';
    const skolaShort = school.toString().substring(0,4).replace(/\s+/g, '_');
    const newKlassNum = 3* ( Math.ceil(klassNum / 3) - 1) + 1;
    return `${skolaShort}:${schoolYear - klassNum +  newKlassNum}-${newKlassNum}${klassSuffix}`;

}


export function PreparePlotStructure(svgRef, filteredData, yField, width, height, aggregateType)  {

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();           

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
    const sumstat = setSumStat(filteredData, y, yField, aggregateType);

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
            .range([0, x0.bandwidth()]);
    }

    // Create main band scale for seasons
    const x0 = d3.scaleBand()
    .domain(seasons)
    .range([0, innerWidth])
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
    const xAxis = d3.axisBottom(x0)
        .tickValues(tickValues) ;// Use the combined class-season strings,  .tickFormat(d => d)
        
    return {svg, g, margin, innerWidth, innerHeight, sumstat, seasons, y, x0, xAxis, getSubBandScale, lastingClassGroups};

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


export function createBoxZoomBehavior(xScale, yScale, xType, yType, xField, yField, line, showLines, g, xAxis, yAxis, newXScaleRef, newYScaleRef, getSubBandScale, studentsChecked, subBandCount) {
    return d3.zoom()
      .scaleExtent([1, 20])
      .on('zoom', (event) => {
        const zoomState = event.transform;
        boxZoomRender(zoomState,xScale, yScale, xType, yType, xField, yField, line, showLines, g, xAxis, yAxis, newXScaleRef, newYScaleRef, getSubBandScale, studentsChecked, subBandCount);

        });
  }


export function boxZoomRender(zoomState,xScale, yScale, xType, yType, xField, yField, line, showLines, g, xAxis, yAxis, newXScaleRef, newYScaleRef, getSubBandScale, studentsChecked, subBandCount)
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
    if (showLines) {
        g.selectAll('.line-path')
        .attr('d', line.x(d => zoomXScale(d[xField])).y(d => zoomYScale(d[yField])));
    }

    if( studentsChecked) {
        zoomIndividualJitter( g, zoomXScale, zoomState, subBandWidth, getSubBandScale);
    }
}


export function createCircleZoomBehavior(xScale, yScale, xType, yType, xField, yField, line, showLines, g, xAxis, yAxis, newXScaleRef, newYScaleRef, getSubBandScale, studentsChecked, subBandCount) {
    return d3.zoom()
      .scaleExtent([1, 20])
      .on('zoom', (event) => {
        const zoomState = event.transform;
        circleZoomRender(zoomState,xScale, yScale, xType, yType, xField, yField, line, showLines, g, xAxis, yAxis, newXScaleRef, newYScaleRef, getSubBandScale, studentsChecked, subBandCount);

        });
  }


export function circleZoomRender(zoomState,xScale, yScale, xType, yType, xField, yField, line, showLines, g, xAxis, yAxis, newXScaleRef, newYScaleRef, getSubBandScale, studentsChecked, subBandCount)
{
    const {zoomXScale, zoomYScale, subBandWidth, zoomedX} = init_ZoomSetting(zoomState, xScale, yScale, xType, yType, g, xAxis, yAxis, newXScaleRef, newYScaleRef, getSubBandScale, subBandCount);
    // Apply zoom transformation to circles
    g.selectAll('.circles')  //
    .attr("cx", d => {  
        return zoomedX(d)+ subBandWidth / 2;      
    })


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
    if (showLines) {
        g.selectAll('.line-path')
        .attr('d', line.x(d => zoomXScale(d[xField])).y(d => zoomYScale(d[yField])));
    }

    if( studentsChecked) {
        zoomIndividualJitter( g, zoomXScale, zoomState, subBandWidth, getSubBandScale);
    }
}


export function createViolinZoomBehavior(xScale, yScale, xType, yType, xField, yField, line, showLines, g, xAxis, yAxis, newXScaleRef, newYScaleRef, getSubBandScale, xNum, studentsChecked, subBandCount)
{

    return d3.zoom()
      .scaleExtent([1, 20])
      .on('zoom', (event) => {
            const zoomState = event.transform;
            violinZoomRender(zoomState,xScale, yScale, xType, yType, xField, yField, line, showLines, g, xAxis, yAxis, newXScaleRef, newYScaleRef, getSubBandScale, xNum, studentsChecked, subBandCount);

      });

}


export function violinZoomRender(zoomState,xScale, yScale, xType, yType, xField, yField, line, showLines, g, xAxis, yAxis, newXScaleRef, newYScaleRef, getSubBandScale, xNum, studentsChecked, subBandCount)
{
    const {zoomXScale, zoomYScale, subBandWidth, zoomedX} = init_ZoomSetting(zoomState, xScale, yScale, xType, yType, g, xAxis, yAxis, newXScaleRef, newYScaleRef, getSubBandScale, subBandCount);
          
    g.selectAll('.violins')
    .attr("transform",  d => {
        return `translate(${zoomedX(d)}, 0)`;  
        })
    .selectAll('.area')
    .attr("d", d3.area()
        .x0(d => xNum(-d.length *singleViolinWidthRatio)*zoomState.k)  //
        .x1(d => xNum(d.length *singleViolinWidthRatio) *zoomState.k)  
        .y(d => yScale(d.x0))   //d.x0
        .curve(d3.curveCatmullRom)
                );  

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
    if (showLines) {
        g.selectAll('.line-path')
        .attr('d', line.x(d => zoomXScale(d[xField])).y(d => zoomYScale(d[yField])));
    }

    
    if( studentsChecked) {
        zoomIndividualJitter( g, zoomXScale, zoomState, subBandWidth, getSubBandScale);
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


export function zoomIndividualJitter( g, zoomXScale, zoomState, subBandWidth, getSubBandScale)
{
    g.selectAll(".indvPoints")
    .attr("cx", function() {
        const season = d3.select(this).attr("indv_season");
        const classID = d3.select(this).attr("indv_classID");
        const jitterOffset = d3.select(this).attr("jitterOffset");
        return zoomXScale(season) + getSubBandScale(season)(classID) * zoomState.k + subBandWidth/2 + jitterOffset*zoomState.k;
    })
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
