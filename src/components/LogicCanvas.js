import ReactFilterBox ,{ AutoCompleteOption, SimpleResultProcessing, Expression }from 'react-filter-box';
import 'react-filter-box/lib/react-filter-box.css';
import * as React from 'react';
import * as _ from "lodash";
//import "fixed-data-table/dist/fixed-data-table.min.css";

const LogicCanvas = ({fields, data, setFilteredData}) => {

  if (!fields || fields.length === 0) return null;

  const field_options = ['Skola',  'Årskurs',  'Klass', 'ElevID',  'Läsår',  'Lexplore Score',  'Stanine', 'StandardPoäng'].map(field => ({
    columnField: field,
    type: 'text',
  }));


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

  componentDidMount() {
    // Set initial data when the component mounts
    this.setData(this.state.data);
}

  onParseOk(expressions) {

      var newData = new SimpleResultProcessing(this.options).process(this.state.data, expressions);
      this.setData(newData);
      //console.log("symbolic data updated", newData);
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
