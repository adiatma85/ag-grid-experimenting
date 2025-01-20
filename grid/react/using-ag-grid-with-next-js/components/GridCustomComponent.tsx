'use client';

import React, { useState } from 'react';
import type { ColDef, RowSelectionOptions, ColGroupDef } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css'; // Import Ag-Grid styles
import 'ag-grid-community/styles/ag-theme-alpine.css'; // Alpine theme

const GridCustomComponent = () => {
    const [activeSheet, setActiveSheet] = useState('sheet1'); // Track active sheet

    // Data for Sheet 1 and Sheet 2
    const sheet1Data = [{ id: 1, columnA: 10 }, { id: 2, columnA: 15 }];
    const sheet2Data = [{ id: 1, columnB: 20 }, { id: 2, columnB: 25 }];
  
    // Function to fetch data from Sheet 2
    const getSheet2Value = (rowId: any) => {
      const match = sheet2Data.find((row) => row.id === rowId);
      return match ? match.columnB : 0; // Default to 0 if no match
    };
  
    // Column definitions for Sheet 1
    const [sheet1ColumnDefs, setColumn1Def] = useState<ColDef[]>([
      { field: 'columnA', headerName: 'Column A', editable: true },
      {
        headerName: 'Column C (from Sheet 2)',
        valueGetter: (params) => params.data.columnA + getSheet2Value(params.data.id),
      },
    ]);
  
    // Column definitions for Sheet 2
    const [sheet2ColumnDefs, setColumn2Def] = useState<ColGroupDef[]>([
        {
            headerName: 'Column B',
            children: [
                { field: 'columnB', headerName: 'Column B', editable: true },
                // {
                // headerName: 'Column D (from Sheet 1)',
                // valueGetter: (params) => params.data.columnB + getSheet1Value(params.data.id),
                // },
            ],
        },
    //   { field: 'columnB', headerName: 'Column B', editable: true },
    ]);
  
    // Content of the current sheet
    const sheetContent = () => {
      if (activeSheet === 'sheet1') {
        return (
          <div className="ag-theme-alpine" style={{ height: 400, width: 600 }}>
            <AgGridReact rowData={sheet1Data} columnDefs={sheet1ColumnDefs} />
          </div>
        );
      }
      if (activeSheet === 'sheet2') {
        return (
          <div className="ag-theme-alpine" style={{ height: 400, width: 400 }}>
            <AgGridReact rowData={sheet2Data} columnDefs={sheet2ColumnDefs} />
          </div>
        );
      }
    };
  
    return (
      <div>
        <h1>Ag-Grid with Multiple Sheets</h1>
  
        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button
            onClick={() => setActiveSheet('sheet1')}
            style={{ padding: '10px', backgroundColor: activeSheet === 'sheet1' ? '#4caf50' : '#ddd' }}
          >
            Sheet 1
          </button>
          <button
            onClick={() => setActiveSheet('sheet2')}
            style={{ padding: '10px', backgroundColor: activeSheet === 'sheet2' ? '#4caf50' : '#ddd' }}
          >
            Sheet 2
          </button>
        </div>
  
        {/* Active Sheet Content */}
        {sheetContent()}
      </div>
    );
  };
  
  export default GridCustomComponent;