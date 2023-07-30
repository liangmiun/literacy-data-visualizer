import React, { useCallback } from 'react';
import ReactFilterBox, {AutoCompleteOption, SimpleResultProcessing } from 'react-filter-box';
import 'react-filter-box/lib/react-filter-box.css';
//import "fixed-data-table/dist/fixed-data-table.min.css";

const LogicCanvas = ({fields, data}) => {

  const field_options = fields.map(field => ({
    columnField: field,
    type: 'text',
  }));

    console.log(field_options);

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

  const options2 = [
    {
      columnField: 'Forename',
      type: 'text',
    },
    {
      columnField: 'Title',
      type: 'text',
    }
  ]

  console.log("options ", options);

  const testData = [
    {
        'Name':'Jim',
        'Description':'dscrpt',
        'Status':'stts',
        'Email @':'email'

    }
   ]


  const onParseOk = useCallback((expressions) => {
    let data = [];
    let newData = new SimpleResultProcessing(field_options).process(data, expressions);
    //your new data here, which is filtered out of the box by SimpleResultProcessing
  }, [field_options]);  //options

  return (
    <div className='logic-canvas'>
      <h5>Symbolic Filter</h5>
      <ReactFilterBox
        //query={this.state.query}
        //AutoCompleteOption= {AutoCompleteOption}
        data={testLiteracyData}
        options={options}
        //onParseOk={onParseOk}
      />
    </div>
  );
};

export default LogicCanvas;
