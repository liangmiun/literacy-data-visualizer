import ReactFilterBox ,{ AutoCompleteOption, SimpleResultProcessing, Expression }from 'react-filter-box';
import 'react-filter-box/lib/react-filter-box.css';
import * as React from 'react';
import * as _ from "lodash";
//import "fixed-data-table/dist/fixed-data-table.min.css";

const LogicCanvas = ({fields, data, setFilteredData}) => {

  if (!fields || fields.length === 0) return null;

  const field_options = fields.slice(0,7).map(field => ({
    columnField: field,
    type: 'text',
  }));

  const testLiteracyData = (() => {
    const output = fields.reduce((result, field) => {
      result[field] = 'content';
      return result;
    }, {});
  
    return [output,output,output];
  })();

  return (
    <div className='logic-canvas'>
      <h4>Symbolic Filter, e.g., "Skola.contains Bo AND Lexplore Score &gt; 500"</h4>

      {/* <ReactFilterBox
        data={testLiteracyData}
        options={field_options}
      /> */}
      <FilterDemo data={data} options={field_options}  setFilteredData={setFilteredData}   />
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
      this.setData = props.setFilteredData

  }

  onParseOk(expressions) {

      var newData = new SimpleResultProcessing(this.options).process(this.state.data, expressions);
      //this.setState({ data: newData });   // change to set filtered data.
      this.setData(newData);
  }

  render() {
      return <div className="main-container">
          <ReactFilterBox
              query={this.state.query}
              data={this.state.data}
              options={this.options}
              onParseOk={this.onParseOk.bind(this)}
          />
      </div>
  }
}

export default LogicCanvas;
