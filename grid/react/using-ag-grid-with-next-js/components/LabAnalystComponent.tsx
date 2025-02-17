"use client";

"use client";

import { AgGridReact } from "ag-grid-react";
import { Children, useEffect, useMemo, useState } from "react";
import type {
  ColDef,
  RowSelectionOptions,
  ColGroupDef,
} from "ag-grid-community";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
// import 'ag-grid-enterprise';
import { ContextMenuModule, IntegratedChartsModule, LicenseManager, ColumnsToolPanelModule } from 'ag-grid-enterprise';
import { AgChartsEnterpriseModule } from 'ag-charts-enterprise';
import data from "../public/lab_analyst.json";

import {
  ClientSideRowModelModule,
  ColumnAutoSizeModule,
  NumberFilterModule,
  TextFilterModule,
  ValidationModule,
  createGrid,
  ProcessCellForExportParams,
  ProcessGroupHeaderForExportParams,
  ProcessHeaderForExportParams,
} from "ag-grid-community";
import {
  ColumnMenuModule,
} from "ag-grid-enterprise";
import { json } from "stream/consumers";

// Set your license key here
LicenseManager.setLicenseKey(process.env.NEXT_PUBLIC_AG_GRID_LICENSE_KEY || '');

ModuleRegistry.registerModules([
    AllCommunityModule,
    ContextMenuModule,
    ColumnsToolPanelModule,
    IntegratedChartsModule.with(AgChartsEnterpriseModule),

    TextFilterModule,
    NumberFilterModule,
    ClientSideRowModelModule,
    ColumnsToolPanelModule,
    ColumnMenuModule,
    ContextMenuModule,
    ColumnAutoSizeModule,
]);

const LabAnalystComponent = () => {
  const [rowData, setRowData] = useState<any[]>([]);
  const [metrics, setMetrics] = useState([]);
  const [arrayedData, setArrayedData] = useState<any[]>([]);
  const [responseData, setResponseData] = useState();

  // array of object
  // id row itu
  // value 
  // nama attribute

  // Load JSON in here is really difficult
  // Column definitions for Sheet 2
  const [labAnalystColumn, setLabAnalystColumn] = useState<
    any[]
  >([
    {
      headerName: "Tanggal",
      field: "metric_date",
      filter: "agDateColumnFilter",
      pinned: "left",
    },
    {
        headerName: "Kolam",
      field: "pond_name",
      pinned: "left",
    },
    {
        headerName: "DOC/DOP",
      field: "day_number",
      pinned: "left",
    },
    {
        headerName: "Keterangan DOC.DOP",
      field: "doc_or_dop",
      pinned: "left",
    },
    {
      headerName: "Fisika",
      children: [
        {
          headerName: "Salinitas",
          children: [
              {
                  headerName: "Salinitas \n 25 ~ 33",
                  field: "sal",
              },
              {
                  headerName: "Waktu Salinitas",
                field: "salinity_time",
              },
          ]
      },
      {
          headerName: "DO",
          children: [
              {
                  headerName: "DO Pagi",
                field: "do_time0500",
              },
              {
                  headerName: "Waktu DO Pagi",
                field: "do_time0500_time",
              },
              {
                  headerName: "DO Siang",
                field: "do_time1300",
              },
              {
                  headerName: "Waktu DO Siang",
                field: "do_time1300_time",
              },
              {
                  headerName: "DO Malam",
                field: "do_time2100",
              },
              {
                  headerName: "Waktu DO Malam",
                field: "do_time2100_time",
              },
          ]
      },
      {
        headerName: "pH",
        children: [
          {
            headerName: "pH Pagi",
          field: "ph_time0430",
        },
        {
            headerName: "Waktu pH Pagi",
          field: "ph_time0430_time",
        },
        {
            headerName: "pH Siang",
          field: "ph_time1300",
        },
        {
            headerName: "Waktu pH Siang",
          field: "ph_time1300_time",
        },
        {
          headerName: "pH Range",
          field: "range_ph",
          valueGetter: (params: any) => {
            let number = params.data.ph_time1300 - params.data.ph_time0430
            return number.toPrecision(2)
          }
        },
        ]
      },
      {
        headerName: "Temperature",
        children: [
          {
            headerName: "Temperature Pagi",
          field: "temperature_time0500",
        },
        {
            headerName: "Waktu Temperature Pagi",
          field: "temperature_time0500_time",
        },
        {
            headerName: "Temperature Siang",
          field: "temperature_time1400",
        },
        {
            headerName: "Waktu Temperature Siang",
          field: "temperature_time1400_time",
        },
        {
            headerName: "Temperature Malam",
          field: "temperature_time2100",
        },
        {
            headerName: "Waktu Temperature Malam",
          field: "temperature_time2100_time",
        },
        ]
      },
      ]
    },
    
    {
        headerName: "ORP Pagi",
      field: "orp_time_0500",
    },
    {
        headerName: "NO3",
      field: "no3",
    },
    {
        headerName: "TVC Black",
      field: "bactery_black",
    },
    {
        headerName: "Green Algae",
        children: [
            {
                headerName: "Actinastrum",
              field: "actinastrum",
            },
            {
                headerName: "ankistrodesmus",
              field: "ankistrodesmus",
            },
            {
                headerName: "asterococcus",
              field: "asterococcus",
            },
            {
                headerName: "carteria",
              field: "carteria",
            },
            {
                headerName: "chlamydomonos",
              field: "chlamydomonos",
            },
            {
                headerName: "chlorella",
              field: "chlorella",
            },
            {
                headerName: "chloroccoccum",
              field: "chloroccoccum",
            },
            {
                headerName: "chodotaella",
              field: "chodatella",
            },
            {
                headerName: "coelastrum",
              field: "coelastrum",
            },
            {
                headerName: "cosmarium",
              field: "cosmarium",
            },
            {
                headerName: "chlorogonium",
              field: "chlorogonium",
            },
            {
                headerName: "closterium",
              field: "closterium",
            },
            {
                headerName: "crucigenia",
              field: "crucigenia",
            },
            {
                headerName: "dictyosphaerium",
              field: "dictyosphaerium",
            },
            {
                headerName: "desmidium",
              field: "desmidium",
            },
            {
                headerName: "dunaliella",
              field: "dunaliella",
            },
            {
                headerName: "eudorina",
              field: "echinosphaerella",
            },
            {
                headerName: "gloeocystis",
              field: "gloeocystis",
            },
            {
                headerName: "kirchneriella",
              field: "kirchneriella",
            },
            {
                headerName: "micrastinium",
              field: "micractinium",
            },
            {
                headerName: "micrasterias",
              field: "micrasterias",
            },
            {
                headerName: "monorapidium",
              field: "monorapidium",
            },
            {
                headerName: "nannochloropsis",
              field: "nannochloropsis",
            },
            {
                headerName: "oocystis",
              field: "oocystis",
            },
            {
                headerName: "pandorina",
              field: "pandorina",
            },
            {
                headerName: "planktosphaeria",
              field: "planktosphaeria",
            },
            {
                headerName: "pediastrum",
              field: "pediastrum",
            },
            {
                headerName: "pyramimonas",
              field: "pyramimonas",
            },
            {
                headerName: "selenastrum",
              field: "selenastrum",
            },
            {
                headerName: "scenedesmus",
              field: "scenedesmus",
            },
            {
                headerName: "spinogyra",
              field: "spinogyra",
            },
            {
                headerName: "staurastrum",
              field: "staurastrum",
            },
            {
                headerName: "tetraedron",
              field: "tetraedron",
            },
            {
                headerName: "tetraselmis",
              field: "tetraselmis",
            },
            {
                headerName: "tribonema",
              field: "tribonema",
            },
            {
                headerName: "treubaria",
              field: "treubaria",
            },
            {
                headerName: "volvox",
              field: "volvox",
            },
            {
                headerName: "westella",
              field: "westella",
            },
            {
                headerName: "other_green_algae",
              field: "other_green_algae",
            },
        ],
    },
    {
        headerName: "anabaena",
      field: "anabaena",
    },
    {
        headerName: "anabaenopsis",
      field: "anabaenopsis",
    },
    {
        headerName: "anacystis",
      field: "anacystis",
    },
    {
        headerName: "aphanochapsa",
      field: "aphanochapsa",
    },
    {
        headerName: "aphanothece",
      field: "aphanothece",
    },
    {
        headerName: "chroococus",
      field: "chroococus",
    },
    {
        headerName: "coleosphaerium",
      field: "coleosphaerium",
    },
    {
        headerName: "gleocapsa",
      field: "gloeocapsa",
    },
    {
      field: "gomphospaeria",
    },
    {
      field: "lyngbya",
    },
    {
      field: "merismopedia",
    },
    {
      field: "microcystis",
    },
    {
      field: "oscillatoria",
    },
    {
      field: "pesudoanabayna",
    },
    {
      field: "spirulina",
    },
    {
      field: "other_blue_green_algae",
    },
    {
      field: "achnaetes",
    },
    {
      field: "amphipora",
    },
    {
      field: "amphora",
    },
    {
      field: "biddulphia",
    },
    {
      field: "ceratulina",
    },
    {
      field: "chaetocerus",
    },
    {
      field: "cocconeis",
    },
    {
      field: "coscinodiscus",
    },
    {
      field: "cyclotella",
    },
    {
      field: "cylindropyxis",
    },
    {
      field: "cymbella",
    },
    {
      field: "diploneis",
    },
    {
      field: "ditylum",
    },
    {
      field: "gomphonema",
    },
    {
      field: "gyrosigma",
    },
    {
      field: "melosria",
    },
    {
      field: "navicula",
    },
    {
      field: "nitzchia",
    },
    {
      field: "odontella",
    },
    {
      field: "pinularia",
    },
    {
      field: "pleurosigma",
    },
    {
      field: "rhizosolenia",
    },
    {
      field: "skeletonema",
    },
    {
      field: "streptotecha",
    },
    {
      field: "tabellaria",
    },
    {
      field: "thalassiosira",
    },
    {
      field: "other_chrisophyta",
    },
    {
      field: "astasia",
    },
    {
      field: "cryptoglena",
    },
    {
      field: "euglena",
    },
    {
      field: "trachelomonas",
    },
    {
      field: "phacus",
    },
    {
      field: "rynchomonas",
    },
    {
      field: "other_euglenophyta",
    },
    {
      field: "alexandrium",
    },
    {
      field: "gonyaulax",
    },
    {
      field: "gonyostomum",
    },
    {
      field: "gymnodinium",
    },
    {
      field: "gyrodinium",
    },
    {
      field: "noctilluca",
    },
    {
      field: "peridinium",
    },
    {
      field: "protoceraterium",
    },
    {
      field: "prorocentrum",
    },
    {
      field: "protoperidinium",
    },
    {
      field: "symbiodinium",
    },
    {
      field: "other_dinoflagellata",
    },
    {
      field: "acanthocystis",
    },
    {
      field: "actinophrys",
    },
    {
      field: "alona",
    },
    {
      field: "amoeba",
    },
    {
      field: "amphileptus",
    },
    {
      field: "brachionus",
    },
    {
      field: "coleps",
    },
    {
      field: "cyclidium",
    },
    {
      field: "entosiphon",
    },
    {
      field: "epiphanes",
    },
    {
      field: "euplotes",
    },
    {
      field: "mesodinium",
    },
    {
      field: "paramecium",
    },
    {
      field: "stentor",
    },
    {
      field: "strombidinopsis",
    },
    {
      field: "strombidinium",
    },
    {
      field: "tintinopsis",
    },
    {
      field: "trichocerca",
    },
    {
      field: "vorticella",
    },
    {
      field: "zoothamnium",
    },
    {
      field: "other_zooplankton",
    },
    {
      field: "cryptomonas",
    },
    {
      field: "prymenesium",
    },
    {
      field: "isochrysis",
    },
    {
      field: "other_plankton",
    },
    {
      field: "h2so4_ap",
    },
    {
      field: "h2so4_bt",
    },
    {
      field: "n_asam",
    },
    {
      field: "sample_volume_alkalinity",
    },
    {
      field: "nitrit_dilution_factor",
    },
    {
      field: "nitrit_blanko",
    },
    {
      field: "nitrit_abs_as",
    },
    {
      field: "nitrit_sample_volume",
    },
    {
      field: "nitrit_description",
    },
    {
      field: "fosfat_dilution_factor",
    },
    {
      field: "fosfat_blanko",
    },
    {
      field: "fosfat_abs_as",
    },
    {
      field: "fosfat_sample_volume",
    },
    {
      field: "fosfat_description",
    },
    {
      field: "tan_dilution_factor",
    },
    {
      field: "tan_blanko",
    },
    {
      field: "tan_abs_as",
    },
    {
      field: "tan_sample_volume",
    },
    {
      field: "tan_description",
    },
    {
      field: "x_volume",
    },
    {
      field: "y_volume",
    },
    {
      field: "n_kmno4",
    },
    {
      field: "sample_volume_titration",
    },
    {
      field: "cu_volume",
    },
    {
      field: "v_edta_a",
    },
    {
      field: "v_edta_b",
    },
    {
      field: "m_edta",
    },
    {
      field: "inoculum_tvc_1",
    },
    {
      field: "dilution_factor_tvc_1",
    },
    {
      field: "yellow_petri1_tvc_1",
    },
    {
      field: "green_petri1_tvc_1",
    },
    {
      field: "black_petri1_tvc_1",
    },
    {
      field: "yellow_petri2_tvc_1",
    },
    {
      field: "green_petri2_tvc_1",
    },
    {
      field: "black_petri2_tvc_1",
    },
    {
      field: "dilution_factor_tvc_2",
    },
    {
      field: "yellow_petri1_tvc_2",
    },
    {
      field: "green_petri1_tvc_2",
    },
    {
      field: "black_petri1_tvc_2",
    },
    {
      field: "yellow_petri2_tvc_2",
    },
    {
      field: "green_petri2_tvc_2",
    },
    {
      field: "black_petri2_tvc_2",
    },
    {
      field: "inoculum_tbc_1",
    },
    {
      field: "dilution_factor_tbc_1",
    },
    {
      field: "yellow_petri1_tbc_1",
    },
    {
      field: "green_petri1_tbc_1",
    },
    {
      field: "black_petri1_tbc_1",
    },
    {
      field: "yellow_petri2_tbc_1",
    },
    {
      field: "green_petri2_tbc_1",
    },
    {
      field: "black_petri2_tbc_1",
    },
  ]);


  const handleFunction = function (params: any) {
    let column = params.column.colId;
    let newValue = params.newValue;
    let id = params.data.id;

    let newItem = 
      {
        id: id,
        attribute_name: column,
        value: newValue,
      }

      setArrayedData((prevArrayedData) => [...prevArrayedData, newItem]);
  }

  const handleButtonClick = async () => {
    const res = await fetch("http://localhost:8080/public/v1/ag-grid/metrics", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(arrayedData),
    });

    const data = await res.json();

    setResponseData(data);
  }

  const [defaultColDef, setDefaultColDef] = useState({
    resizable: true,
    editable: true,
    onCellValueChanged: (params: any) => handleFunction(params),
    enableCellExpresions: true,
  });

  // const postMetrics = async () => {
  //   const res = await fetch("/api/post-metrics", {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //     body: JSON.stringify({
  //       key1: "value1",
  //       key2: "value2",
  //     }),
  //   });

  //   const data = await res.json();
  //   // setResponse(data);
  // };

  const rowSelection = useMemo(() => {
    return {
      mode: "multiRow",
    };
  }, []);

  useEffect(() => {
    async function fetchMetrics() {
      const res = await fetch('http://localhost:8080/public/v1/ag-grid/metrics?disableLimit=true');
      const response = await res.json();
      setMetrics(response.data); // Adjust based on the actual structure of the response
    }
    fetchMetrics();
  }, []);

  // useEffect(() => {
  //   setRowData(data);
  // }, []);

  console.log(metrics)

  const cellSelectionMemo = useMemo(() => { 
    return {
          handle: {
              mode: 'fill',
              direction: 'y', // Fill Handle can only be dragged horizontally
          }
      };
  }, []);

  function processCellForClipboard(params: ProcessCellForExportParams) {
    return "C-" + params.value;
  }
  
  function processHeaderForClipboard(params: ProcessHeaderForExportParams) {
    const colDef = params.column.getColDef();
    let headerName = colDef.headerName || colDef.field || "";
  
    if (colDef.headerName !== "") {
      headerName = headerName.charAt(0).toUpperCase() + headerName.slice(1);
    }
  
    return "H-" + headerName;
  }
  
  function processGroupHeaderForClipboard(
    params: ProcessGroupHeaderForExportParams,
  ) {
    const colGroupDef = params.columnGroup.getColGroupDef() || ({} as any);
    const headerName = colGroupDef.headerName || "";
  
    if (headerName === "") {
      return "";
    }
  
    return "GH-" + headerName;
  }
  
  function processCellFromClipboard(params: ProcessCellForExportParams) {
    return "Z-" + params.value;
  }

  return (
    <>
      {JSON.stringify(arrayedData)}

      {JSON.stringify(responseData)}

      <button onClick={handleButtonClick} style={{ padding: "10px 20px", fontSize: "16px" }}>TOMBOL</button>
      <div style={{ width: "100%", height: "100vh" }}>
      <AgGridReact
        // rowData={rowData}
        rowData={metrics}
        columnDefs={labAnalystColumn}
        defaultColDef={defaultColDef}
        enableCharts={true} // Enable the Charting features
        cellSelection={cellSelectionMemo}
        rowSelection={rowSelection as RowSelectionOptions}
        // processCellForClipboard={processCellForClipboard}
        // processHeaderForClipboard={processHeaderForClipboard}
        // processGroupHeaderForClipboard={processGroupHeaderForClipboard}
        // processCellFromClipboard={processCellFromClipboard}
      />
    </div>
    </>
  );
};

export default LabAnalystComponent;
