import React  from 'react';
import ReactFilterBox from 'react-filter-box';
import 'react-filter-box/lib/react-filter-box.css';
//import "fixed-data-table/dist/fixed-data-table.min.css";

const LogicCanvas = ({fields, data}) => {

  const field_options = fields.map(field => ({
    columnField: field,
    type: 'text',
  }));

    //console.log(field_options);

  const testLiteracyData = (() => {
    const output = fields.reduce((result, field) => {
      result[field] = 'content';
      return result;
    }, {});
  
    return [output];
  })();



  const options = [
    {
      columnField: 'Name',
      type: 'text',
    },
    {
      columnField: 'Description',
      type: 'text',
    },
    {
      columnField: 'Status',
      type: 'selection', // when using type selection, it will automatically suggest all possible values
    },
    {
      columnText: 'Email @',
      columnField: 'Email',
      type: 'text',
    },
  ];




  return (
    <div className='logic-canvas'>
      <h5>Symbolic Filter</h5>
      <ReactFilterBox
        data={testLiteracyData}
        options={options}
      />
    </div>
  );
};

export default LogicCanvas;
