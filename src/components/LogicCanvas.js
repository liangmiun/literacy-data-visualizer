import React  from 'react';
import ReactFilterBox from 'react-filter-box';
import 'react-filter-box/lib/react-filter-box.css';
//import "fixed-data-table/dist/fixed-data-table.min.css";

const LogicCanvas = ({fields, data}) => {

  if (!fields || fields.length === 0) return null;

  const field_options = fields.slice(0,7).map(field => ({
    columnField: field,
    type: 'text',
  }));

  const made_options = ['a','b','c','d'].map(field => ({
    columnField: field,
    type: 'text',
  }));

  

    //console.log(field_options);

  const testLiteracyData = (() => {
    const output = fields.reduce((result, field) => {
      result[field] = 'content';
      return result;
    }, {});
  
    return [output,output,output];
  })();



  const options = [
    {
      columnField: 'Place',
      type: 'number',
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




  console.log('start');
  made_options.forEach(option => {
    console.log('fo:'+ option.columnField +  ' ' + option.type);
  });
  options.forEach(option => {
    console.log('op:'+ option.columnField + ' ' + option.type);
  });


  return (
    <div className='logic-canvas'>
      <h5>Symbolic Filter</h5>

      <ReactFilterBox
        data={testLiteracyData}
        options={field_options}
      />
    </div>
    
  );
};

export default LogicCanvas;
