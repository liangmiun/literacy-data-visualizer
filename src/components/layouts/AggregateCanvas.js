import React, { useRef, useEffect, useState } from "react";
import * as d3 from "d3";
import {
  formatTickValue,
  aggrColorLegend,
  drawAggregateAverageTemporalLines,
} from "utils/Utils";
import * as AggregateUtils from "utils/AggregateUtils";
import { plotMargin } from "utils/constants";

const AggregateCanvas = (props) => {
  const { selectedClasses, groupOption, triggerRenderByConfig } = props;
  const [dimensions, setDimensions] = useState({
    width: 0.6 * window.innerWidth,
    height: 0.85 * window.innerHeight,
  });
  const gridRef = useRef(null);
  const [checkedClasses, setCheckedClasses] = useState([]);

  useEffect(() => {
    const tempSet = new Set(
      selectedClasses.map((item) => {
        const sequenceID = AggregateUtils.sequenceIDfromYearSchoolClass(
          parseInt(item.schoolYear.split("/")[0]),
          item.school,
          item.class,
          groupOption
        );
        return `${item.school}.${sequenceID}`;
      })
    );

    setCheckedClasses(Array.from(tempSet));
  }, [selectedClasses, groupOption]);

  useEffect(() => {
    // resize the plot canvas when the browser window is resized.
    const updateDimensions = () => {
      if (gridRef.current) {
        const rect = gridRef.current.getBoundingClientRect();
        setDimensions({ width: rect.width, height: rect.height });
      }
    };

    updateDimensions(); // Update dimensions on mount

    window.addEventListener("resize", updateDimensions); // Update on resize

    // Cleanup
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  return (
    <div ref={gridRef} className="scatter-canvas">
      {
        // filteredData.length > 0 &&
        <>
          {props.aggregateType === "violin" && (
            <ViolinPlots
              allData={props.allData}
              shownData={props.shownData}
              seasonField={props.seasonField}
              yField={props.yField}
              onViolinClick={props.onPartClick}
              dimensions={dimensions}
              checkedClasses={checkedClasses}
              studentsChecked={props.studentsChecked}
              classColors={props.classColors}
              groupOption={groupOption}
              showLines={props.showLines}
              connectIndividual={props.connectIndividual}
              triggerRenderByConfig={triggerRenderByConfig}
              showAverageLine={props.showAverageLine}
              meanScores={props.meanScores}
            />
          )}

          {props.aggregateType === "box" && (
            <BoxPlots
              allData={props.allData}
              shownData={props.shownData}
              seasonField={props.seasonField}
              yField={props.yField}
              onBoxClick={props.onPartClick}
              dimensions={dimensions}
              checkedClasses={checkedClasses}
              studentsChecked={props.studentsChecked}
              classColors={props.classColors}
              groupOption={groupOption}
              showLines={props.showLines}
              connectIndividual={props.connectIndividual}
              triggerRenderByConfig={triggerRenderByConfig}
              showAverageLine={props.showAverageLine}
              meanScores={props.meanScores}
            />
          )}

          {props.aggregateType === "circle" && (
            <CirclePlots
              allData={props.allData}
              shownData={props.shownData}
              seasonField={props.seasonField}
              yField={props.yField}
              onCircleClick={props.onPartClick}
              dimensions={dimensions}
              checkedClasses={checkedClasses}
              studentsChecked={props.studentsChecked}
              classColors={props.classColors}
              groupOption={groupOption}
              showLines={props.showLines}
              connectIndividual={props.connectIndividual}
              triggerRenderByConfig={triggerRenderByConfig}
              showAverageLine={props.showAverageLine}
              selectedClasses={selectedClasses}
              meanScores={props.meanScores}
            />
          )}
        </>
      }
    </div>
  );
};

const ViolinPlots = (props) => {
  const svgRef = useRef();
  const newXScaleRef = useRef(null);
  const newYScaleRef = useRef(null);
  const {
    shownData,
    groupOption,
    yField,
    checkedClasses,
    seasonField,
    onViolinClick,
    studentsChecked,
    showLines,
    classColors,
    connectIndividual,
    dimensions,
    triggerRenderByConfig,
    showAverageLine,
    meanScores,
  } = props;

  useEffect(() => {
    const subBandCount = checkedClasses.length;

    const {
      svg,
      g,
      sumstat,
      yScale,
      xMainBandScale,
      xAxis,
      getSubBandScale,
      lastingClassGroups,
    } = AggregateUtils.PreparePlotStructure(
      svgRef,
      shownData,
      seasonField,
      yField,
      "violin",
      plotMargin,
      dimensions,
      groupOption
    );

    drawCommonAggrParts(svg, g, xAxis, yField, yScale, dimensions);

    const aggregate = g
      .append("g")
      .attr("id", "aggregate")
      .attr("clip-path", "url(#clip)");

    const subBandWidth = xMainBandScale.bandwidth() / subBandCount;

    const bandedX = (d) => getBandedX(d, xMainBandScale, getSubBandScale);

    var maxNum = 0;
    for (var i in sumstat) {
      var allBins = sumstat[i].value.bins;
      var lengths = allBins.map((a) => a.length);
      var longest = d3.max(lengths);
      if (longest > maxNum) {
        maxNum = longest;
      }
    }

    const xNumScale = d3
      .scaleLinear()
      .domain([-maxNum, maxNum])
      .range([-subBandWidth / 2, subBandWidth / 2]);

    aggregate
      .selectAll(".violins")
      .data(sumstat)
      .enter()
      .append("g")
      .attr("class", "violins")
      .attr("transform", (d) => {
        return `translate(${bandedX(d)}, 0)`;
      })
      .style("fill", (d) => {
        const sequenceID = AggregateUtils.getLastingSequenceID(
          d.value.school,
          d.value.season,
          d.value.class,
          groupOption
        );
        return classColors[d.value.school][sequenceID];
      })
      .on("click", function (event, d) {
        d3.selectAll(".violins").attr("stroke-width", 0);
        d3.select(this).attr("stroke", "black").attr("stroke-width", 1);

        onViolinClick([
          {
            // lastingclass: d.value.lastingclass,
            school: d.value.school,
            class: d.value.class,
            season: d.value.season,
            min: parseInt(d.value.min),
            max: parseInt(d.value.max),
            median: parseInt(d.value.median),
            q1: parseInt(d.value.q1),
            q3: parseInt(d.value.q3),
            count: parseInt(d.value.count),
          },
        ]);
      })
      .append("path")
      .attr("class", "area")
      .datum(function (d) {
        //return d.value.bins;
        const filteredBins = d.value.bins.filter((bin) => {
          return bin.x0 >= d.value.min && bin.x0 <= d.value.max;
        });
        return filteredBins;
      })
      .attr(
        "d",
        d3
          .area()
          .x0((d) => {
            return xNumScale(-d.length * AggregateUtils.singleViolinWidthRatio);
          }) //* subBandWidth
          .x1((d) =>
            xNumScale(d.length * AggregateUtils.singleViolinWidthRatio)
          ) //* subBandWidth
          .y((d) => yScale(d.x0)) //d.x0
          .curve(d3.curveCatmullRom)
      );

    AggregateUtils.presentLines(
      showLines,
      lastingClassGroups,
      aggregate,
      xMainBandScale,
      getSubBandScale,
      yScale,
      subBandWidth,
      classColors,
      groupOption
    );

    if (studentsChecked) {
      AggregateUtils.PresentIndividuals(
        shownData,
        seasonField,
        yField,
        aggregate,
        xMainBandScale,
        getSubBandScale,
        yScale,
        subBandWidth,
        connectIndividual,
        classColors,
        groupOption
      );
    }

    if (showAverageLine) {
      drawAggregateAverageTemporalLines(
        aggregate,
        xMainBandScale,
        yScale,
        meanScores,
        subBandWidth,
        seasonField
      );
    }

    setAggregationZoom(
      "violin",
      svg,
      g,
      xMainBandScale,
      yScale,
      yField,
      xAxis,
      getSubBandScale,
      newXScaleRef,
      newYScaleRef,
      studentsChecked,
      subBandCount,
      connectIndividual,
      xNumScale
    );

    aggrColorLegend(
      checkedClasses,
      classColors,
      svg,
      dimensions.width - plotMargin.right,
      plotMargin,
      groupOption
    );
  }, [
    shownData,
    groupOption,
    seasonField,
    yField,
    studentsChecked,
    onViolinClick,
    showLines,
    checkedClasses,
    classColors,
    connectIndividual,
    dimensions,
    triggerRenderByConfig,
    showAverageLine,
    meanScores,
  ]);
  return (
    <svg
      className="plot-svg"
      ref={svgRef}
      width={dimensions.width}
      height={dimensions.height}
    ></svg>
  );
};

const BoxPlots = (props) => {
  const svgRef = useRef();
  const newXScaleRef = useRef(null);
  const newYScaleRef = useRef(null);
  const {
    shownData,
    groupOption,
    seasonField,
    yField,
    onBoxClick,
    studentsChecked,
    classColors,
    checkedClasses,
    showLines,
    connectIndividual,
    dimensions,
    triggerRenderByConfig,
    showAverageLine,
    meanScores,
  } = props;

  // In your useEffect:
  useEffect(() => {
    const subBandCount = checkedClasses.length;

    const {
      svg,
      g,
      sumstat,
      yScale,
      xMainBandScale,
      xAxis,
      getSubBandScale,
      lastingClassGroups,
    } = AggregateUtils.PreparePlotStructure(
      svgRef,
      shownData,
      seasonField,
      yField,
      "box",
      plotMargin,
      dimensions,
      groupOption
    );

    drawCommonAggrParts(svg, g, xAxis, yField, yScale, dimensions);

    const aggregate = g
      .append("g")
      .attr("id", "aggregate")
      .attr("clip-path", "url(#clip)");

    const subBandWidth = xMainBandScale.bandwidth() / subBandCount;

    const bandedX = (d) => getBandedX(d, xMainBandScale, getSubBandScale);

    aggregate
      .selectAll(".vertLines")
      .data(sumstat)
      .enter()
      .append("line")
      .attr("class", "vertLines")
      .attr("x1", (d) => {
        return bandedX(d) + subBandWidth / 2;
      })
      .attr("x2", (d) => {
        return bandedX(d) + subBandWidth / 2;
      })
      .attr("y1", (d) => yScale(d.value.min))
      .attr("y2", (d) => yScale(d.value.max))
      .attr("stroke", "black")
      .style("stroke-width", 0.2);

    // Boxes
    aggregate
      .selectAll(".boxes")
      .data(sumstat)
      .enter()
      .append("rect")
      .attr("class", "boxes")
      .attr("x", (d) => {
        return bandedX(d);
      })
      .attr("y", (d) => {
        const distance = yScale(d.value.q1) - yScale(d.value.q3);
        return distance > 0 ? yScale(d.value.q3) : yScale(d.value.q3) - 2.5;
      })
      .attr("height", (d) => {
        const distance = yScale(d.value.q1) - yScale(d.value.q3);
        return distance > 0 ? distance : 5;
      })
      .attr("width", (d) => {
        return subBandWidth;
      })
      .style("fill", (d) => {
        const sequenceID = AggregateUtils.getLastingSequenceID(
          d.value.school,
          d.value.season,
          d.value.class,
          groupOption
        );
        return classColors[d.value.school][sequenceID];
      })
      .on("click", function (event, d) {
        d3.selectAll(".boxes").attr("stroke-width", 0);
        d3.select(this).attr("stroke", "black").attr("stroke-width", 3);

        onBoxClick([
          {
            // lastingclass: d.value.lastingclass,
            school: d.value.school,
            class: d.value.class,
            season: d.value.season,
            min: parseInt(d.value.min, 10),
            max: parseInt(d.value.max, 10),
            median: parseInt(d.value.median, 10),
            q1: parseInt(d.value.q1, 10),
            q3: parseInt(d.value.q3, 10),
            count: parseInt(d.value.count, 10),
          },
        ]);
      });

    // Median lines
    aggregate
      .selectAll(".medianLines")
      .data(sumstat)
      .enter()
      .append("line")
      .attr("class", "medianLines")
      .attr("x1", (d) => {
        return bandedX(d);
      })
      .attr("x2", (d) => {
        return bandedX(d) + subBandWidth;
      })
      .attr("y1", (d) => yScale(d.value.median))
      .attr("y2", (d) => yScale(d.value.median))
      .attr("stroke", "black")
      .style("stroke-width", 2);

    AggregateUtils.presentLines(
      showLines,
      lastingClassGroups,
      aggregate,
      xMainBandScale,
      getSubBandScale,
      yScale,
      subBandWidth,
      classColors,
      groupOption
    );

    // Add individual points with jitter
    if (studentsChecked) {
      AggregateUtils.PresentIndividuals(
        shownData,
        seasonField,
        yField,
        aggregate,
        xMainBandScale,
        getSubBandScale,
        yScale,
        subBandWidth,
        connectIndividual,
        classColors,
        groupOption
      );
    }

    if (showAverageLine) {
      drawAggregateAverageTemporalLines(
        aggregate,
        xMainBandScale,
        yScale,
        meanScores,
        subBandWidth,
        seasonField
      );
    }

    setAggregationZoom(
      "box",
      svg,
      g,
      xMainBandScale,
      yScale,
      yField,
      xAxis,
      getSubBandScale,
      newXScaleRef,
      newYScaleRef,
      studentsChecked,
      subBandCount,
      connectIndividual,
      null
    );

    aggrColorLegend(
      checkedClasses,
      classColors,
      svg,
      dimensions.width - plotMargin.right,
      plotMargin,
      groupOption
    );
  }, [
    shownData,
    groupOption,
    seasonField,
    yField,
    studentsChecked,
    onBoxClick,
    classColors,
    showLines,
    checkedClasses,
    connectIndividual,
    dimensions,
    triggerRenderByConfig,
    showAverageLine,
    meanScores,
  ]);
  return (
    <svg
      className="plot-svg"
      ref={svgRef}
      width={dimensions.width}
      height={dimensions.height}
    ></svg>
  );
};

const CirclePlots = (props) => {
  const [shownDataLoaded, setShownDataLoaded] = useState(false);
  const svgRef = useRef();
  const newXScaleRef = useRef(null);
  const newYScaleRef = useRef(null);
  const {
    allData,
    shownData,
    groupOption,
    seasonField,
    yField,
    onCircleClick,
    studentsChecked,
    classColors,
    checkedClasses,
    showLines,
    connectIndividual,
    dimensions,
    triggerRenderByConfig,
    showAverageLine,
    selectedClasses,
    meanScores,
  } = props;

  useEffect(() => {
    if (shownData.length > 0) {
      setShownDataLoaded(true);
    }
  }, [shownData]);

  useEffect(() => {
    if (shownDataLoaded) {
      const subBandCount =
        checkedClasses.length > 0 ? checkedClasses.length : 1;

      const {
        svg,
        g,
        sumstat,
        yScale,
        xMainBandScale,
        xAxis,
        getSubBandScale,
        lastingClassGroups,
        seasons,
      } = AggregateUtils.PreparePlotStructure(
        svgRef,
        shownData,
        seasonField,
        yField,
        "circle",
        plotMargin,
        dimensions,
        groupOption
      );

      const toTrackTrajectory =
        groupOption === "trajectory" && selectedClasses.length > 0;

      const { trajectorySumstat, trajectorySeasons } = toTrackTrajectory
        ? AggregateUtils.PrepareTrajectoryData(
            allData,
            seasons,
            yScale,
            yField,
            seasonField,
            "circle",
            groupOption,
            selectedClasses[0]
          )
        : { trajectorySumstat: [], trajectorySeasons: [] };

      xMainBandScale.domain(toTrackTrajectory ? trajectorySeasons : seasons);

      drawCommonAggrParts(svg, g, xAxis, yField, yScale, dimensions);

      const aggregate = g
        .append("g")
        .attr("id", "aggregate")
        .attr("clip-path", "url(#clip)");

      const subBandWidth = xMainBandScale.bandwidth() / subBandCount;

      const bandedX = (d) => getBandedX(d, xMainBandScale, getSubBandScale);

      aggregate
        .selectAll(".circles")
        .data(sumstat)
        .enter()
        .append("circle")
        .attr("class", "circles")
        .attr("cx", function (d) {
          return bandedX(d) + subBandWidth / 2;
        })
        .attr("cy", (d) => yScale(d.value.median))
        .attr("r", 6)
        .attr("fill", (d) => {
          const sequenceID = AggregateUtils.getLastingSequenceID(
            d.value.school,
            d.value.season,
            d.value.class,
            groupOption
          );
          return classColors[d.value.school][sequenceID];
        })
        .attr("stroke", (d) => {
          const sequenceID = AggregateUtils.getLastingSequenceID(
            d.value.school,
            d.value.season,
            d.value.class,
            groupOption
          );
          return classColors[d.value.school][sequenceID];
        }) // Setting the stroke color to black
        .attr("stroke-width", 2) // Setting the stroke width to 2 pixels
        .on("click", function (event, d) {
          d3.selectAll(".circles").attr("stroke-width", 0);
          d3.select(this).attr("stroke", "black").attr("stroke-width", 3);
          console.log(d.value.lastingclass, d.value.class);
          onCircleClick([
            {
              // lastingclass: d.value.lastingclass,
              school: d.value.school,
              class: d.value.class,
              season: d.value.season,
              min: parseInt(d.value.min, 10),
              max: parseInt(d.value.max, 10),
              median: parseInt(d.value.median, 10),
              q1: parseInt(d.value.q1, 10),
              q3: parseInt(d.value.q3, 10),
              count: parseInt(d.value.count, 10),
            },
          ]);
        });

      if (toTrackTrajectory) {
        const trajectoryBandedX = (d, sumstatInput) => {
          function getTrajectorySubBandScale(season, sumstatInput) {
            const seasons = Array.from(
              new Set(sumstatInput.map((d) => d.value.season.toString()))
            );
            const seasonToClasses = AggregateUtils.getSeasonToClasses(
              seasons,
              sumstatInput
            );
            return d3
              .scaleBand()
              .padding(0.05) //0.05
              .domain(seasonToClasses[season])
              .range([0, xMainBandScale.bandwidth()]);
          }

          function getTrajectoryBandedX(d, xMain, sumstatInput) {
            const season = d.value.season.toString();
            const clazz = d.value.lastingclass.toString(); //.class
            const xSub = getTrajectorySubBandScale(season, sumstatInput); // Get x1 scale for the current season
            return xMain(season) + xSub(clazz);
          }

          return getTrajectoryBandedX(d, xMainBandScale, sumstatInput);
        };

        aggregate
          .selectAll(".hollow-circles")
          .data(trajectorySumstat)
          .enter()
          .append("circle")
          .attr("class", "hollow-circles")
          .attr("cx", function (d) {
            return trajectoryBandedX(d, trajectorySumstat) + subBandWidth / 2;
          })
          .attr("cy", (d) => yScale(d.value.median))
          .attr("r", 6)
          .attr("fill", "white")
          .attr("stroke", () => {
            const item = selectedClasses[0];
            const sequenceID = AggregateUtils.sequenceIDfromYearSchoolClass(
              parseInt(item.schoolYear.split("/")[0]),
              item.school,
              item.class,
              groupOption
            );
            return classColors[item.school][sequenceID];
            //return "black";
          }) // Setting the stroke color to black
          .attr("stroke-width", 2) // Setting the stroke width to 2 pixels
          .on("click", function (event, d) {
            d3.selectAll(".hollow-circles").attr("stroke-width", 2);
            d3.select(this).attr("stroke", "black").attr("stroke-width", 3);
            console.log(d.value.lastingclass, d.value.class);
            onCircleClick([
              {
                // lastingclass: d.value.lastingclass,
                school: d.value.school,
                class: d.value.class,
                season: d.value.season,
                min: parseInt(d.value.min, 10),
                max: parseInt(d.value.max, 10),
                median: parseInt(d.value.median, 10),
                q1: parseInt(d.value.q1, 10),
                q3: parseInt(d.value.q3, 10),
                count: parseInt(d.value.count, 10),
              },
            ]);
          });
      }

      AggregateUtils.presentLines(
        showLines,
        lastingClassGroups,
        aggregate,
        xMainBandScale,
        getSubBandScale,
        yScale,
        subBandWidth,
        classColors,
        groupOption
      );

      if (studentsChecked) {
        AggregateUtils.PresentIndividuals(
          shownData,
          seasonField,
          yField,
          aggregate,
          xMainBandScale,
          getSubBandScale,
          yScale,
          subBandWidth,
          connectIndividual,
          classColors,
          groupOption
        );
      }

      if (showAverageLine) {
        drawAggregateAverageTemporalLines(
          aggregate,
          xMainBandScale,
          yScale,
          meanScores,
          subBandWidth,
          seasonField
        );
      }

      setAggregationZoom(
        "circle",
        svg,
        g,
        xMainBandScale,
        yScale,
        yField,
        xAxis,
        getSubBandScale,
        newXScaleRef,
        newYScaleRef,
        studentsChecked,
        subBandCount,
        connectIndividual,
        null
      );

      aggrColorLegend(
        checkedClasses,
        classColors,
        svg,
        dimensions.width - plotMargin.right,
        plotMargin,
        groupOption
      );
    }
  }, [
    shownData,
    groupOption,
    seasonField,
    yField,
    studentsChecked,
    classColors,
    onCircleClick,
    showLines,
    checkedClasses,
    connectIndividual,
    dimensions,
    triggerRenderByConfig,
    showAverageLine,
    allData,
    shownDataLoaded,
    selectedClasses,
    meanScores,
  ]);

  return (
    <svg
      className="plot-svg"
      ref={svgRef}
      width={dimensions.width}
      height={dimensions.height}
    ></svg>
  );
};

function drawCommonAggrParts(svg, g, xAxis, yField, yScale, dimensions) {
  const innerAggrWidth = dimensions.width - plotMargin.left - plotMargin.right;
  const innerAggrHeight =
    dimensions.height - plotMargin.top - plotMargin.bottom;

  // eslint-disable-next-line no-unused-vars
  var clip = svg
    .append("defs")
    .append("svg:clipPath")
    .attr("id", "clip")
    .append("svg:rect")
    .attr("width", innerAggrWidth)
    .attr("height", innerAggrHeight)
    .attr("x", 0)
    .attr("y", 0);

  g.append("line")
    .style("stroke", "black") // Line color
    .style("stroke-width", 0.5) // Line width
    .attr("x1", 0) // Start of the line on the x-axis
    .attr("x2", innerAggrWidth) // End of the line on the x-axis (width of your plot)
    .attr("y1", innerAggrHeight) // Y-coordinate for the line
    .attr("y2", innerAggrHeight);

  // For the X axis label:
  g.append("text")
    .attr("y", innerAggrHeight + plotMargin.bottom / 2)
    .attr("x", innerAggrWidth / 2)
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("Periods of Testdatum");

  // Add the x-axis to the group element
  g.append("g")
    .attr("transform", `translate(0, ${innerAggrHeight})`)
    .call(xAxis)
    .attr("class", "x-axis")
    .attr("clip-path", "url(#clip)")
    .selectAll(".tick text")
    .style("text-anchor", "start")
    .attr("transform", "rotate(45)");

  const yAxis = d3
    .axisLeft(yScale)
    .tickFormat((d) => formatTickValue(d, yField));

  g.append("g").call(yAxis);

  g.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", -plotMargin.left)
    .attr("x", -innerAggrHeight / 2)
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text(yField);
}

function getBandedX(d, xMain, getSubBandScale) {
  const season = d.value.season.toString();
  const clazz = d.value.lastingclass.toString(); //.class
  const xSub = getSubBandScale(season); // Get x1 scale for the current season
  return xMain(season) + xSub(clazz);
}

function setAggregationZoom(
  aggrType,
  svg,
  g,
  xMainBandScale,
  yScale,
  yField,
  xAxis,
  getSubBandScale,
  newXScaleRef,
  newYScaleRef,
  studentsChecked,
  subBandCount,
  connectIndividual,
  xNumScale
) {
  var renderer;
  if (aggrType === "box") {
    renderer = AggregateUtils.boxZoomRender;
  } else if (aggrType === "violin") {
    renderer = AggregateUtils.violinZoomRender;
  } else {
    // circle
    renderer = AggregateUtils.circleZoomRender;
  }

  if (
    svg.node() &&
    d3.zoomTransform(svg.node()) &&
    d3.zoomTransform(svg.node()) !== d3.zoomIdentity
  ) {
    const zoomState = d3.zoomTransform(svg.node()); // Get the current zoom state
    renderer(
      zoomState,
      xMainBandScale,
      yScale,
      "band",
      "linear",
      "season",
      yField,
      null,
      connectIndividual,
      g,
      xAxis,
      d3.axisLeft(yScale),
      newXScaleRef,
      newYScaleRef,
      getSubBandScale,
      studentsChecked,
      subBandCount,
      xNumScale
    );
  }
  const zoomBehavior = AggregateUtils.createAggrZoomBehavior(
    renderer,
    xMainBandScale,
    yScale,
    "band",
    "linear",
    "season",
    yField,
    null,
    connectIndividual,
    svg,
    g,
    xAxis,
    d3.axisLeft(yScale),
    newXScaleRef,
    newYScaleRef,
    getSubBandScale,
    studentsChecked,
    subBandCount,
    xNumScale
  );
  svg.call(zoomBehavior);
}

export default AggregateCanvas;
