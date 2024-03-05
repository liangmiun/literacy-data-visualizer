import ReactFilterBox ,{ SimpleResultProcessing }from 'react-filter-box';
import 'react-filter-box/lib/react-filter-box.css';
import * as React from 'react';
import Tooltip from '@mui/material/Tooltip';

const LogicCanvas = ({fields, data, setLogicFilteredData, expression, setExpression, query,setQuery }) => {

  if (!fields || fields.length === 0) return null;

  const field_options = ['Skola',  'Årskurs',  'Klass', 'ElevID',  'Läsår',  'Lexplore Score',  'Stanine', 'StandardPoäng'].map(field => ({
    columnField: field,
    type: 'text',
  }));

  return (
    <div className='logic-canvas'>
      <h4  style={{ margin:'1%', padding:'2%'}}>
      <Tooltip title='Filter data using logical expressions  with "( , ) , == , != , contains , !contains , > , <" operators.' followCursor>  
        Symbolic Filter, e.g., "Skola.contains Bo AND Lexplore Score &gt; 500"
      </Tooltip>
      </h4>
      <FilterDemo 
        data={data} options={field_options}  setLogicFilteredData={setLogicFilteredData} 
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
      this.setLogicData = props.setLogicFilteredData;  
      this.setPresetExpression = props.setExpression     

  }

  componentDidMount() {
    // Set initial data when the component mounts
    this.setLogicData(this.state.data);
}

  componentDidUpdate(prevProps) {
    //Check if loadedExpression prop has changed
    if (this.props.query !== prevProps.query) {
      this.setState({ query: this.props.query },
        () => {
          var newData = new SimpleResultProcessing(this.options).process(this.state.data, this.props.expression);
          this.setLogicData(newData);
        }
      );
    }
  }

  onChange(queryInput) {
    this.setState({ query:queryInput });
  }

  onParseOk(expressions) {

      var newData = new SimpleResultProcessing(this.options).process(this.state.data, expressions);
      this.setLogicData(newData);

      this.props.setQuery(this.state.query);
      this.props.setExpression(expressions);
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
