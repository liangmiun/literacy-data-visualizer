import ReactFilterBox ,{ SimpleResultProcessing }from 'react-filter-box';
import 'react-filter-box/lib/react-filter-box.css';
import * as React from 'react';
import { set } from 'd3-collection';
//import * as _ from "lodash";

const LogicCanvas = ({fields, data, setLogicFilteredData, expression, setExpression, query,setQuery }) => {

  if (!fields || fields.length === 0) return null;

  const field_options = ['Skola',  'Årskurs',  'Klass', 'ElevID',  'Läsår',  'Lexplore Score',  'Stanine', 'StandardPoäng'].map(field => ({
    columnField: field,
    type: 'text',
  }));

  return (
    <div className='logic-canvas'>
      <h4>Symbolic Filter, e.g., "Skola.contains Bo AND Lexplore Score &gt; 500"</h4>
      <FilterDemo data={data} options={field_options}  setFilteredData={setLogicFilteredData} 
        expression={expression}  setExpression={setExpression}  query={query}  setQuery={setQuery}  />
    </div>
    
  );
};


export class FilterDemo extends React.Component {

  options;
  constructor(props) {
      super(props);
      this.state = {
          data: props.data
      }
      this.options = props.options;
      this.setData = props.setFilteredData;
      this.setPresetExpression = props.setExpression     

  }

  componentDidMount() {
    // Set initial data when the component mounts
    this.setData(this.state.data);
}

  componentDidUpdate(prevProps) {
    //Check if loadedExpression prop has changed
    if (this.props.query !== prevProps.query) {
      this.setState({ query: this.props.query },
        () => {
          var newData = new SimpleResultProcessing(this.options).process(this.state.data, this.props.expression);
          this.setData(newData);
        }
      );
    }
  }

  onChange(queryInput) {
    this.setState({ query:queryInput });
  }

  onParseOk(expressions) {

      var newData = new SimpleResultProcessing(this.options).process(this.state.data, expressions);
      this.setData(newData);
      console.log("Type of this.props.setQuery:", typeof this.props.setQuery);
      console.log("Value of this.props.setQuery:", this.props.setQuery);
      console.log("Value of this.props:", this.props);

      this.props.setQuery(this.state.query);
      this.props.setExpression(expressions);
      // set string, set expression
  }

  render() {
      return <div className="main-container">
          <ReactFilterBox
              query={this.state.query}
              data={this.state.data}
              options={this.options}
              onParseOk={this.onParseOk.bind(this)}
              onChange={this.onChange.bind(this)}
          />
      </div>
  }
}

export default LogicCanvas;
