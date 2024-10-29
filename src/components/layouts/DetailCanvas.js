import React from "react";
import * as d3 from "d3";
import "assets/App.css";
import { isDateFieldString } from "utils/Utils";
import { personalFields } from "utils/personalFields";
import { aggr_panel_labels } from "utils/constants";

const DetailCanvas = ({ data, keyList, isClassView }) => {
  const formatDetailPanelDate = d3.timeFormat("%Y-%m-%d");
  const isIndividualList = data.length === 1;

  const DetailValue = (key, value) => {
    if (isDateFieldString(key)) {
      value = formatDetailPanelDate(value);
    } else if (key === "Persondetaljer") {
      value = parseInt(value, 10);
    }
    return value;
  };

  const personalValues = (d) => {
    const entries = [];
    personalFields.forEach((key) => {
      if (d[key] !== undefined) {
        entries.push(`${key}: ${d[key]}`);
      }
    });
    return `{${entries.join(", ")}}`;
  };

  const aggregateData = (key) => {
    if (isIndividualList) {
      if (key === "Persondetaljer") {
        return personalValues(data[0]);
      }
      return DetailValue(key, data[0][key]);
    }

    switch (key) {
      case "Skola":
      case "Klass":
      case "Läsår":
        const sortedStrings = data.map((record) => record[key]).sort();
        return `${sortedStrings[0]} - ${
          sortedStrings[sortedStrings.length - 1]
        }`;

      case "ElevID":
        const sortedNumbers = data
          .map((record) => parseInt(record[key], 10))
          .sort((a, b) => a - b);
        return `${sortedNumbers[0]} - ${
          sortedNumbers[sortedNumbers.length - 1]
        }`;

      case "Årskurs":
        const uniqueYears = [...new Set(data.map((record) => record[key]))];
        return uniqueYears.join(", ");
      case "Födelsedatum":
      case "Testdatum":
        const sortedDates = data
          .map((record) => record[key])
          .sort((a, b) => a - b);
        return `${formatDetailPanelDate(
          sortedDates[0]
        )} - ${formatDetailPanelDate(sortedDates[sortedDates.length - 1])}`;

      case "Standardpoäng":
      case "Lexplore Score":
        const mean =
          data.reduce((sum, record) => sum + record[key], 0) / data.length;
        return `${parseInt(mean, 10)} (mean)`;

      default:
        return "";
    }
  };

  const detailKey = (key) => {
    if (!isClassView) return key;
    return aggr_panel_labels[key];
  };

  return (
    <div className="detail-canvas" style={{ fontSize: "1.0em" }}>
      {data &&
        data.length > 0 &&
        keyList.map((key) => (
          <div key={key} className="detail-item">
            <strong>{detailKey(key)}:</strong> {aggregateData(key)}
          </div>
        ))}
    </div>
  );
};

export default DetailCanvas;
