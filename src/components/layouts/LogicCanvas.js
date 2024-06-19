import ReactFilterBox, { SimpleResultProcessing } from "react-filter-box";
import AppLevelContext from "context/AppLevelContext";
import "react-filter-box/lib/react-filter-box.css";
import * as React from "react";
import Tooltip from "@mui/material/Tooltip";

const LogicCanvas = () => {
  const {
    fields,
    data,
    setLogicFilteredData,
    expression,
    setExpression,
    query,
    setQuery,
  } = React.useContext(AppLevelContext);

  if (!fields || fields.length === 0) return null;

  const field_options = [
    "Skola",
    "Årskurs",
    "Klass",
    "ElevID",
    "Läsår",
    "Lexplore Score",
    "Stanine",
    "StandardPoäng",
  ].map((field) => ({
    columnField: field,
    type: "text",
  }));

  return (
    <div
      className="logic-canvas"
      style={{
        display: "grid",
        gridTemplateRows: "1fr 1fr",
        overflow: "hidden",
      }}
    >
      <h4
        style={{ height: "50%", gridRow: "1 / 2", margin: "1%", padding: "0%" }}
      >
        <Tooltip
          title="Filtrera inom datan med logiska uttryck. Läs mer i instruktionerna för detaljer och exempel."
          followCursor
        >
          <label>
            Symbolic Filter, e.g., "Skola.contains Bo AND Lexplore Score &gt;
            500"{" "}
          </label>
        </Tooltip>
      </h4>
      <FilterDemo
        style={{ height: "50%", gridRow: "2 / 3" }}
        data={data}
        options={field_options}
        setLogicFilteredData={setLogicFilteredData}
        expression={expression}
        setExpression={setExpression}
        query={query}
        setQuery={setQuery}
      />
    </div>
  );
};

export class FilterDemo extends React.Component {
  options;
  constructor(props) {
    super(props);
    this.state = {
      data: props.data,
    };
    this.options = props.options;
    this.setLogicData = props.setLogicFilteredData;
    this.setPresetExpression = props.setExpression;
  }

  componentDidUpdate(prevProps) {
    //Check if data has loaded from app.js
    if (this.props.data.length > 0 && this.props.data !== prevProps.data) {
      this.setState({ data: this.props.data });
    }
  }

  onChange(queryInput) {
    this.setState({ query: queryInput });
  }

  onParseOk(expressions) {
    var newData = new SimpleResultProcessing(this.options).process(
      this.state.data,
      expressions
    );
    this.props.setQuery(this.state.query);
    this.props.setExpression(expressions);
    this.setLogicData(newData);
  }

  render() {
    return (
      <div className="main-container">
        <ReactFilterBox
          query={this.state.query}
          data={this.state.data}
          options={this.options}
          onParseOk={this.onParseOk.bind(this)}
          onChange={this.onChange.bind(this)}
        />
      </div>
    );
  }
}

export default LogicCanvas;
