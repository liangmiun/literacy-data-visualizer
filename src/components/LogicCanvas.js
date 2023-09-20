import React  from 'react';
import ReactFilterBox from 'react-filter-box';
import 'react-filter-box/lib/react-filter-box.css';
//import "fixed-data-table/dist/fixed-data-table.min.css";

const LogicCanvas = ({fields, data}) => {

  const field_options = fields.slice(0,4).map(field => ({
    columnField: field.toString(),
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



  const options2 = [
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


  const options = [
    {
      columnField: 'Skola',
      type: 'n',
    },
    {
      columnField: 'Årskurs',
      type: 't',
    },
    {
      columnField: 'Klass',
      type: 's', 
    },
    {
      columnField: 'ElevID',
      type: 't',
    },
  ];

  console.log('start');
  field_options.forEach(option => {
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
      <ReactFilterBox
        data={testLiteracyData}
        options={options}
      />


    </div>
    
  );
};

export default LogicCanvas;
