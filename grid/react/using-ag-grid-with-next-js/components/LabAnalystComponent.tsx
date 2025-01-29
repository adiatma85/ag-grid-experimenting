"use client";

"use client";

import { AgGridReact } from "ag-grid-react";
import { Children, useEffect, useMemo, useState } from "react";
import type {
  ColDef,
  RowSelectionOptions,
  ColGroupDef,
} from "ag-grid-community";
import { AllCommunityModule, ModuleRegistry, GridApi } from "ag-grid-community";
// import 'ag-grid-enterprise';
import {
  ContextMenuModule,
  IntegratedChartsModule,
  LicenseManager,
  ColumnsToolPanelModule,
} from "ag-grid-enterprise";
import { AgChartsEnterpriseModule } from "ag-charts-enterprise";
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
import { ColumnMenuModule, ClipboardModule, ExcelExportModule } from "ag-grid-enterprise";
import { json } from "stream/consumers";

import customStyles from "./LabAnalystComponent.module.css";
import { tree } from "next/dist/build/templates/app-page";

// Set your license key here
LicenseManager.setLicenseKey(process.env.NEXT_PUBLIC_AG_GRID_LICENSE_KEY || "");

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
  ClipboardModule,
  ExcelExportModule,
]);

const LabAnalystComponent = () => {
  let gridApi: GridApi;

  const [rowData, setRowData] = useState<any[]>([]);
  const [metrics, setMetrics] = useState([]);
  const [arrayedData, setArrayedData] = useState<any[]>([]);
  const [arrayedFormulaData, setArrayedFormulaData] = useState<any[]>([]);
  const [responseData, setResponseData] = useState();
  const [responseFormulaData, setResponseForulaData] = useState();

  // state for the sheets
  const [labAnalystSheet, setLabAnalystSheet] = useState<boolean>(true);
  // const [labPlankton, setLabPlanktonSheet] = useState<boolean>(true);
  const [labCalculation, setLabCalculationSheet] = useState<boolean>(false);

  let colunDefs: (ColDef | ColGroupDef)[] = [
    {
      headerName: "Tanggal",
      field: "metric_date",
      filter: "agDateColumnFilter",
      pinned: "left",
      headerClass: customStyles.header_general,
    },
    {
      headerName: "Kolam",
      field: "pond_name",
      pinned: "left",
      headerClass: customStyles.header_general,
    },
    {
      headerName: "DOC/DOP",
      field: "day_number",
      pinned: "left",
      headerClass: customStyles.header_general,
    },
    {
      headerName: "Keterangan DOC.DOP",
      field: "doc_or_dop",
      pinned: "left",
      headerClass: customStyles.header_general,
    },
    {
      headerName: "Fisika",
      headerClass: customStyles.header_fisika_level_1,
      hide: !labAnalystSheet,
      children: [
        {
          headerName: "Salinitas",
          headerClass: customStyles.header_fisika_level_2,
          children: [
            {
              headerName: "Pagi \n 25 ~ 33",
              field: "sal",
              headerClass: customStyles.header_fisika_level_2,
              hide: !labAnalystSheet,
            },
            {
              headerName: "Jam Berapa",
              field: "salinity_time",
              headerClass: customStyles.header_fisika_level_2,
              hide: !labAnalystSheet,
            },
          ],
        },
        {
          headerName: "DO",
          headerClass: customStyles.header_fisika_level_2,
          hide: !labAnalystSheet,
          children: [
            {
              headerName: "Pagi",
              field: "do_time0500",
              headerClass: customStyles.header_fisika_level_2,
              hide: !labAnalystSheet,
            },
            {
              headerName: "Jam Berapa",
              field: "do_time0500_time",
              headerClass: customStyles.header_fisika_level_2,
              hide: !labAnalystSheet,
            },
            {
              headerName: "Siang",
              field: "do_time1300",
              headerClass: customStyles.header_fisika_level_2,
              hide: !labAnalystSheet,
            },
            {
              headerName: "Jam Berapa",
              field: "do_time1300_time",
              headerClass: customStyles.header_fisika_level_2,
              hide: !labAnalystSheet,
            },
            {
              headerName: "Malam",
              field: "do_time2100",
              headerClass: customStyles.header_fisika_level_2,
              hide: !labAnalystSheet,
            },
            {
              headerName: "Jam Berapa",
              field: "do_time2100_time",
              headerClass: customStyles.header_fisika_level_2,
              hide: !labAnalystSheet,
            },
          ],
        },
        {
          headerName: "pH",
          headerClass: customStyles.header_fisika_level_2,
          hide: !labAnalystSheet,
          children: [
            {
              headerName: "Pagi",
              field: "ph_time0430",
              headerClass: customStyles.header_fisika_level_2,
              hide: !labAnalystSheet,
            },
            {
              headerName: "Jam Berapa",
              field: "ph_time0430_time",
              headerClass: customStyles.header_fisika_level_2,
              hide: !labAnalystSheet,
            },
            {
              headerName: "Siang",
              field: "ph_time1300",
              headerClass: customStyles.header_fisika_level_2,
              hide: !labAnalystSheet,
            },
            {
              headerName: "Jam Berapa",
              field: "ph_time1300_time",
              headerClass: customStyles.header_fisika_level_2,
              hide: !labAnalystSheet,
            },
            {
              headerName: "Range",
              field: "range_ph",
              headerClass: customStyles.header_fisika_level_2,
              editable: false,
              cellClass: customStyles.shaded_column,
              hide: !labAnalystSheet,
              valueGetter: (params: any) => {
                if (params.data.ph_time0430 && params.data.ph_time1300) {
                  let number =
                    params.data.ph_time1300 - params.data.ph_time0430;
                  handleFormulaValueChange(params, number.toFixed(2));
                  return number.toFixed(2);
                }

                return "";
              },
            },
          ],
        },
        {
          headerName: "Temperature",
          headerClass: customStyles.header_fisika_level_2,
          hide: !labAnalystSheet,
          children: [
            {
              headerName: "Temperature Pagi",
              field: "temperature_time0500",
              headerClass: customStyles.header_fisika_level_2,
              hide: !labAnalystSheet,
            },
            {
              headerName: "Jam Berapa",
              field: "temperature_time0500_time",
              headerClass: customStyles.header_fisika_level_2,
              hide: !labAnalystSheet,
            },
            {
              headerName: "Temperature Siang",
              field: "temperature_time1400",
              headerClass: customStyles.header_fisika_level_2,
              hide: !labAnalystSheet,
            },
            {
              headerName: "Jam Berapa",
              field: "temperature_time1400_time",
              headerClass: customStyles.header_fisika_level_2,
              hide: !labAnalystSheet,
            },
            {
              headerName: "Temperature Malam",
              field: "temperature_time2100",
              headerClass: customStyles.header_fisika_level_2,
              hide: !labAnalystSheet,
            },
            {
              headerName: "Jam Berapa",
              field: "temperature_time2100_time",
              headerClass: customStyles.header_fisika_level_2,
              hide: !labAnalystSheet,
            },
          ],
        },
        {
          headerName: "ORP",
          field: "orp_time_0500",
          headerClass: customStyles.header_fisika_level_2,
          hide: !labAnalystSheet,
        },
      ],
    },
    {
      headerName: "Parameter Kimia",
      headerClass: customStyles.header_kimia_level_1,
      hide: !labAnalystSheet,
      children: [
        {
          headerName: "TAN",
          field: "tan",
          headerClass: customStyles.header_kimia_level_2,
          hide: !labAnalystSheet,
          cellDataType: "number",
          editable: false,
          cellClass: customStyles.shaded_column,
          valueGetter: (params) => {
            if (!params.getValue("tan_conc_c")) {
              return 0.0;
            }

            if (params.getValue("tan_conc_c") >= 0) {
              return parseFloat(params.getValue("tan_conc_c"));
            }

            return 0.0;
          },
        },
        {
          headerName: "NH₃",
          field: "nh3",
          headerClass: customStyles.header_kimia_level_2,
          hide: !labAnalystSheet,
          editable: false,
          cellClass: customStyles.shaded_column,
          valueGetter: (params) => {
            let tan: number = params.getValue("tan") || 0.0;
            let nh3Fraction: number =
              parseFloat(params.getValue("fraction_nh3")) / 100; // this in percentage

            if (!nh3Fraction) {
              return "";
            }

            let calculation: number = tan * nh3Fraction;
            handleFormulaValueChange(params, calculation.toFixed(3));

            return calculation.toFixed(3);
          },
        },
        {
          headerName: "NH₄",
          field: "nh4",
          headerClass: customStyles.header_kimia_level_2,
          hide: !labAnalystSheet,
          editable: false,
          cellClass: customStyles.shaded_column,
          valueGetter: (params) => {
            let tan: number = params.getValue("tan") || 0.0;
            let nh4Fraction: number =
              parseFloat(params.getValue("fraction_nh4")) / 100; // this in percentage

            if (!nh4Fraction) {
              return "";
            }

            let calculation: number = tan * nh4Fraction;
            handleFormulaValueChange(params, calculation.toFixed(3));

            return calculation.toFixed(3);
          },
        },
        {
          headerName: "NO₃",
          field: "no3",
          headerClass: customStyles.header_kimia_level_2,
          hide: !labAnalystSheet,
        },
        {
          headerName: "NO₂",
          field: "no2",
          headerClass: customStyles.header_kimia_level_2,
          hide: !labAnalystSheet,
          editable: false,
          cellClass: customStyles.shaded_column,
          valueGetter: (params) => {
            if (!params.getValue("nitrit_conc_c")) {
              return 0.0;
            }

            if (params.getValue("nitrit_conc_c") >= 0) {
              return parseFloat(params.getValue("nitrit_conc_c"));
            }

            return 0.0;
          },
        },
        {
          headerName: "PO₄",
          field: "po4",
          headerClass: customStyles.header_kimia_level_2,
          hide: !labAnalystSheet,
          editable: false,
          cellClass: customStyles.shaded_column,
          valueGetter: (params) => {
            if (!params.getValue("fosfat_conc_c")) {
              return 0.0;
            }

            if (params.getValue("fosfat_conc_c") >= 0) {
              return parseFloat(params.getValue("fosfat_conc_c"));
            }

            return 0.0;
          },
        },
        {
          headerName: "Ratio N:P",
          field: "ratio_np",
          headerClass: customStyles.header_kimia_level_2,
          hide: !labAnalystSheet,
          editable: false,
          cellClass: customStyles.shaded_column,
          valueGetter: (params) => {
            let nh4: number = parseFloat(params.getValue("nh4"));
            let nh3: number = parseFloat(params.getValue("nh3"));
            let no2: number = parseFloat(params.getValue("no2"));
            let no3: number = parseFloat(params.getValue("no3"));
            let po4: number = parseFloat(params.getValue("po4"));

            if (!nh4 || !nh3 || !no2 || !no3 || !po4) {
              return "";
            }

            // Calculate the numerator
            const numerator =
              (14 / 18) * nh4 +
              (14 / 17) * nh3 +
              (14 / 46) * no2 +
              (14 / 62) * no3;

            // Calculate the denominator
            const denominator = (30 / 96) * po4;

            // Check for division by zero
            if (denominator === 0) {
              return "";
            }

            // Calculate the result
            const result = numerator / denominator;

            handleFormulaValueChange(params, result.toFixed(3));

            return result.toFixed(3);
          },
        },
        {
          headerName: "Alkalinitas",
          headerClass: customStyles.header_kimia_level_2,
          hide: !labAnalystSheet,
          children: [
            {
              headerName: "OH⁻",
              field: "oh",
              headerClass: customStyles.header_kimia_level_3,
              hide: !labAnalystSheet,
              editable: false,
              cellClass: customStyles.shaded_column,
              valueGetter: (params) => {
                let p_alkalinity: number = parseFloat(
                  params.getValue("p_alkalinity")
                );
                let t_alkalinity: number = parseFloat(
                  params.getValue("t_alkalinity")
                );

                if (!p_alkalinity || !t_alkalinity) {
                  return "";
                }

                let calculation: number = 0.0;

                // Check conditions and return the appropriate result
                if (p_alkalinity === 0) {
                  calculation = 0.0;
                } else if (p_alkalinity < t_alkalinity / 2) {
                  calculation = 0.0;
                } else if (p_alkalinity === t_alkalinity / 2) {
                  calculation = 0.0;
                } else if (p_alkalinity > t_alkalinity / 2) {
                  calculation = 2 * p_alkalinity - t_alkalinity;
                } else if (p_alkalinity === t_alkalinity) {
                  calculation = t_alkalinity;
                  return t_alkalinity;
                } else {
                  return "";
                }

                handleFormulaValueChange(params, calculation.toFixed(3));
                return calculation.toFixed(3);
              },
            },
            {
              headerName: "CO₃²⁻",
              field: "co3",
              headerClass: customStyles.header_kimia_level_3,
              hide: !labAnalystSheet,
              editable: false,
              cellClass: customStyles.shaded_column,
              valueGetter: (params) => {
                let p_alkalinity: number = parseFloat(
                  params.getValue("p_alkalinity")
                );
                let t_alkalinity: number = parseFloat(
                  params.getValue("t_alkalinity")
                );

                if (!p_alkalinity || !t_alkalinity) {
                  return "";
                }

                let calculation: number = 0.0;

                // Check conditions and return the appropriate result
                if (p_alkalinity === 0) {
                  calculation = 0;
                } else if (p_alkalinity < t_alkalinity / 2) {
                  calculation = 2 * p_alkalinity;
                } else if (p_alkalinity === t_alkalinity / 2) {
                  calculation = 2 * p_alkalinity;
                } else if (p_alkalinity > t_alkalinity / 2) {
                  calculation = 2 * (t_alkalinity - p_alkalinity);
                } else if (p_alkalinity === t_alkalinity) {
                  calculation = 0;
                } else {
                  return "";
                }

                handleFormulaValueChange(params, calculation.toFixed(3));
                return calculation.toFixed(3);
              },
            },
            {
              headerName: "HCO₃⁻",
              field: "hco3",
              headerClass: customStyles.header_kimia_level_3,
              hide: !labAnalystSheet,
              editable: false,
              cellClass: customStyles.shaded_column,
              valueGetter: (params) => {
                let p_alkalinity: number = parseFloat(
                  params.getValue("p_alkalinity")
                );
                let t_alkalinity: number = parseFloat(
                  params.getValue("t_alkalinity")
                );

                if (!p_alkalinity || !t_alkalinity) {
                  return "";
                }

                let calculation: number = 0.0;

                if (p_alkalinity === 0) {
                  calculation = t_alkalinity; // Return t_alkalinity if p_alkalinity is 0
                } else if (p_alkalinity < t_alkalinity / 2) {
                  calculation = t_alkalinity - 2 * p_alkalinity; // Return t_alkalinity - (2 * p_alkalinity) if p_alkalinity is less than half of t_alkalinity
                } else if (p_alkalinity === t_alkalinity / 2) {
                  calculation = 0; // Return 0 if p_alkalinity is exactly half of t_alkalinity
                } else if (p_alkalinity > t_alkalinity / 2) {
                  return "";
                } else if (p_alkalinity === t_alkalinity) {
                  return "";
                } else {
                  return "";
                }

                handleFormulaValueChange(params, calculation.toFixed(3));
                return calculation.toFixed(3);
              },
            },
            {
              headerName: "Total",
              field: "t_alk",
              headerClass: customStyles.header_kimia_level_3,
              hide: !labAnalystSheet,
              editable: false,
              cellClass: customStyles.shaded_column,
              valueGetter: (params) => {
                let h2so4_ap: number = parseFloat(params.getValue("h2so4_ap"));
                let h2so4_bt: number = parseFloat(params.getValue("h2so4_bt"));
                let n_asam: number = parseFloat(params.getValue("n_asam"));
                let v_sample: number = parseFloat(
                  params.getValue("sample_volume_alkalinity")
                );

                if (!h2so4_ap || !h2so4_bt || !n_asam || !v_sample) {
                  return "";
                }

                // Step 1: Add D1447 and E1447
                const sum = h2so4_ap + h2so4_bt;

                // Step 2: Multiply the sum by F1447
                const product1 = sum * n_asam;

                // Step 3: Multiply the result by 50 and then by 1000
                const product2 = product1 * 50 * 1000;

                // Step 4: Divide the result by G1447
                const result = product2 / v_sample;

                // // Return the result
                // return result;

                handleFormulaValueChange(params, result.toFixed(3));
                return result.toFixed(3);
              },
            },
          ],
        },
        {
          headerName: "Hardness",
          headerClass: customStyles.header_kimia_level_2,
          hide: !labAnalystSheet,
          children: [
            {
              headerName: "Ca",
              field: "ca",
              headerClass: customStyles.header_kimia_level_3,
              hide: !labAnalystSheet,
              editable: false,
              cellClass: customStyles.shaded_column,
              valueGetter: (params) => {
                let cu_volume: number = parseFloat(
                  params.getValue("cu_volume")
                );
                let v_edta_b: number = parseFloat(params.getValue("v_edta_b"));
                let m_edta: number = parseFloat(params.getValue("m_edta"));
                let ar_ca: number = parseFloat(params.getValue("ar_ca"));

                if (!cu_volume || !v_edta_b || !m_edta || !ar_ca) {
                  return "";
                }

                // Step 1: Divide 1000 by AP1447
                const division = 1000 / cu_volume;

                // Step 2: Multiply the result by AR1447, AS1447, and AU1447
                const product1 = division * v_edta_b * m_edta * ar_ca;

                // Step 3: Multiply the result by 2.49700598802395
                const result = product1 * 2.49700598802395;

                handleFormulaValueChange(params, result.toFixed(3));
                return result.toFixed(3);
              },
            },
            {
              headerName: "Mg",
              field: "mg",
              headerClass: customStyles.header_kimia_level_3,
              hide: !labAnalystSheet,
              editable: false,
              cellClass: customStyles.shaded_column,
              valueGetter: (params) => {
                let cu_volume: number = parseFloat(
                  params.getValue("cu_volume")
                );
                let v_edta_a: number = parseFloat(params.getValue("v_edta_a"));
                let v_edta_b: number = parseFloat(params.getValue("v_edta_b"));
                let m_edta: number = parseFloat(params.getValue("m_edta"));
                let ar_mg: number = parseFloat(params.getValue("ar_mg"));

                if (!cu_volume || !v_edta_a || !v_edta_b || !m_edta || !ar_mg) {
                  return "";
                }

                // Step 1: Divide 1000 by AP1447
                const division = 1000 / cu_volume;

                // Step 2: Subtract AR1447 from AQ1447
                const subtraction = v_edta_a - v_edta_b;

                // Step 3: Multiply the result of Step 1 by the result of Step 2
                const product1 = division * subtraction;

                // Step 4: Multiply the result by AS1447 and AV1447
                const product2 = product1 * m_edta * ar_mg;

                // Step 5: Multiply the result by 4.11851851851851
                const result = product2 * 4.11851851851851;

                handleFormulaValueChange(params, result.toFixed(3));
                return result.toFixed(3);
              },
            },
            {
              headerName: "Ca:Mg",
              field: "camg",
              headerClass: customStyles.header_kimia_level_3,
              hide: !labAnalystSheet,
              editable: false,
              cellClass: customStyles.shaded_column,
              valueGetter: (params) => {
                let ca: number = parseFloat(params.getValue("ca"));
                let mg: number = parseFloat(params.getValue("mg"));

                if (!ca || !mg) {
                  return "";
                }

                const result: number = ca / mg;

                handleFormulaValueChange(params, result.toFixed(3));
                return result.toFixed(3);
              },
            },
            {
              headerName: "Mg:Ca",
              field: "mgca",
              headerClass: customStyles.header_kimia_level_3,
              hide: !labAnalystSheet,
              editable: false,
              cellClass: customStyles.shaded_column,
              valueGetter: (params) => {
                let ca: number = parseFloat(params.getValue("ca"));
                let mg: number = parseFloat(params.getValue("mg"));

                if (!ca || !mg) {
                  return "";
                }

                const result: number = mg / ca;

                handleFormulaValueChange(params, result.toFixed(3));
                return result.toFixed(3);
              },
            },
            {
              headerName: "Total",
              field: "t_hard",
              headerClass: customStyles.header_kimia_level_3,
              hide: !labAnalystSheet,
              editable: false,
              cellClass: customStyles.shaded_column,
              valueGetter: (params) => {
                let cu_volume: number = parseFloat(
                  params.getValue("cu_volume")
                );
                let v_edta_a: number = parseFloat(params.getValue("v_edta_a"));
                let m_edta: number = parseFloat(params.getValue("m_edta"));
                let mr_caco3: number = parseFloat(params.getValue("mr_caco3"));

                if (!cu_volume || !v_edta_a || !m_edta || !mr_caco3) {
                  return "";
                }

                // Step 1: Divide 1000 by AP1447
                const division = 1000 / cu_volume;

                // Step 2: Multiply the result by AQ1447, AS1447, and AT1447
                const result = division * v_edta_a * m_edta * mr_caco3;

                handleFormulaValueChange(params, result.toFixed(3));
                return result.toFixed(3);
              },
            },
          ],
        },
      ],
    },
    {
      headerName: "Parameter Plankton",
      headerClass: customStyles.header_plankton_level_1,
      hide: !labAnalystSheet,
      children: [
        {
          headerName: "Green Algae",
          headerClass: customStyles.header_plankton_green_level_1,
          hide: !labAnalystSheet,
          children: [
            {
              headerName: "Actinastrum",
              field: "actinastrum",
              headerClass: customStyles.header_plankton_green_level_1,
              hide: !labAnalystSheet,
            },
            {
              headerName: "Ankistrodesmus",
              field: "ankistrodesmus",
              headerClass: customStyles.header_plankton_green_level_1,
              hide: !labAnalystSheet,
            },
            {
              headerName: "Asterococcus",
              field: "asterococcus",
              headerClass: customStyles.header_plankton_green_level_1,
              hide: !labAnalystSheet,
            },
            {
              headerName: "Carteria",
              field: "carteria",
              headerClass: customStyles.header_plankton_green_level_1,
              hide: !labAnalystSheet,
            },
            {
              headerName: "Chlamydomonos",
              field: "chlamydomonos",
              headerClass: customStyles.header_plankton_green_level_1,
              hide: !labAnalystSheet,
            },
            {
              headerName: "Chlorella",
              field: "chlorella",
              headerClass: customStyles.header_plankton_green_level_1,
              hide: !labAnalystSheet,
            },
            {
              headerName: "Chloroccoccum",
              field: "chloroccoccum",
              headerClass: customStyles.header_plankton_green_level_1,
              hide: !labAnalystSheet,
            },
            {
              headerName: "Chodotaella",
              field: "chodatella",
              headerClass: customStyles.header_plankton_green_level_1,
              hide: !labAnalystSheet,
            },
            {
              headerName: "Coelastrum",
              field: "coelastrum",
              headerClass: customStyles.header_plankton_green_level_1,
              hide: !labAnalystSheet,
            },
            {
              headerName: "Cosmarium",
              field: "cosmarium",
              headerClass: customStyles.header_plankton_green_level_1,
              hide: !labAnalystSheet,
            },
            {
              headerName: "Chlorogonium",
              field: "chlorogonium",
              headerClass: customStyles.header_plankton_green_level_1,
              hide: !labAnalystSheet,
            },
            {
              headerName: "Closterium",
              field: "closterium",
              headerClass: customStyles.header_plankton_green_level_1,
              hide: !labAnalystSheet,
            },
            {
              headerName: "Crucigenia",
              field: "crucigenia",
              headerClass: customStyles.header_plankton_green_level_1,
              hide: !labAnalystSheet,
            },
            {
              headerName: "Dictyosphaerium",
              field: "dictyosphaerium",
              headerClass: customStyles.header_plankton_green_level_1,
              hide: !labAnalystSheet,
            },
            {
              headerName: "Desmidium",
              field: "desmidium",
              headerClass: customStyles.header_plankton_green_level_1,
              hide: !labAnalystSheet,
            },
            {
              headerName: "Dunaliella",
              field: "dunaliella",
              headerClass: customStyles.header_plankton_green_level_1,
              hide: !labAnalystSheet,
            },
            {
              headerName: "Eudorina",
              field: "echinosphaerella",
              headerClass: customStyles.header_plankton_green_level_1,
              hide: !labAnalystSheet,
            },
            {
              headerName: "Gloeocystis",
              field: "gloeocystis",
              headerClass: customStyles.header_plankton_green_level_1,
              hide: !labAnalystSheet,
            },
            {
              headerName: "Kirchneriella",
              field: "kirchneriella",
              headerClass: customStyles.header_plankton_green_level_1,
              hide: !labAnalystSheet,
            },
            {
              headerName: "Micrastinium",
              field: "micractinium",
              headerClass: customStyles.header_plankton_green_level_1,
              hide: !labAnalystSheet,
            },
            {
              headerName: "Micrasterias",
              field: "micrasterias",
              headerClass: customStyles.header_plankton_green_level_1,
              hide: !labAnalystSheet,
            },
            {
              headerName: "Monorapidium",
              field: "monorapidium",
              headerClass: customStyles.header_plankton_green_level_1,
              hide: !labAnalystSheet,
            },
            {
              headerName: "Nannochloropsis",
              field: "nannochloropsis",
              headerClass: customStyles.header_plankton_green_level_1,
              hide: !labAnalystSheet,
            },
            {
              headerName: "Oocystis",
              field: "oocystis",
              headerClass: customStyles.header_plankton_green_level_1,
              hide: !labAnalystSheet,
            },
            {
              headerName: "Pandorina",
              field: "pandorina",
              headerClass: customStyles.header_plankton_green_level_1,
              hide: !labAnalystSheet,
            },
            {
              headerName: "Planktosphaeria",
              field: "planktosphaeria",
              headerClass: customStyles.header_plankton_green_level_1,
              hide: !labAnalystSheet,
            },
            {
              headerName: "Pediastrum",
              field: "pediastrum",
              headerClass: customStyles.header_plankton_green_level_1,
              hide: !labAnalystSheet,
            },
            {
              headerName: "Pyramimonas",
              field: "pyramimonas",
              headerClass: customStyles.header_plankton_green_level_1,
              hide: !labAnalystSheet,
            },
            {
              headerName: "Selenastrum",
              field: "selenastrum",
              headerClass: customStyles.header_plankton_green_level_1,
              hide: !labAnalystSheet,
            },
            {
              headerName: "Scenedesmus",
              field: "scenedesmus",
              headerClass: customStyles.header_plankton_green_level_1,
              hide: !labAnalystSheet,
            },
            {
              headerName: "Spinogyra",
              field: "spinogyra",
              headerClass: customStyles.header_plankton_green_level_1,
              hide: !labAnalystSheet,
            },
            {
              headerName: "Staurastrum",
              field: "staurastrum",
              headerClass: customStyles.header_plankton_green_level_1,
              hide: !labAnalystSheet,
            },
            {
              headerName: "Tetraedron",
              field: "tetraedron",
              headerClass: customStyles.header_plankton_green_level_1,
              hide: !labAnalystSheet,
            },
            {
              headerName: "Tetraselmis",
              field: "tetraselmis",
              headerClass: customStyles.header_plankton_green_level_1,
              hide: !labAnalystSheet,
            },
            {
              headerName: "Tribonema",
              field: "tribonema",
              headerClass: customStyles.header_plankton_green_level_1,
              hide: !labAnalystSheet,
            },
            {
              headerName: "Treubaria",
              field: "treubaria",
              headerClass: customStyles.header_plankton_green_level_1,
              hide: !labAnalystSheet,
            },
            {
              headerName: "Volvox",
              field: "volvox",
              headerClass: customStyles.header_plankton_green_level_1,
              hide: !labAnalystSheet,
            },
            {
              headerName: "Westella",
              field: "westella",
              headerClass: customStyles.header_plankton_green_level_1,
              hide: !labAnalystSheet,
            },
            {
              headerName: "Lainnya",
              field: "other_green_algae",
              headerClass: customStyles.header_plankton_green_level_1,
              hide: !labAnalystSheet,
            },
          ],
        },
        {
          headerName: "Blue Green Algae",
          headerClass: customStyles.header_plankton_blue_level_1,
          hide: !labAnalystSheet,
          children: [
            {
              headerName: "Anabaena",
              field: "anabaena",
              headerClass: customStyles.header_plankton_blue_level_2,
              hide: !labAnalystSheet,
            },
            {
              headerName: "Anabaenopsis",
              field: "anabaenopsis",
              headerClass: customStyles.header_plankton_blue_level_2,
              hide: !labAnalystSheet,
            },
            {
              headerName: "Anacystis",
              field: "anacystis",
              headerClass: customStyles.header_plankton_blue_level_2,
              hide: !labAnalystSheet,
            },
            {
              headerName: "Aphanochapsa",
              field: "aphanochapsa",
              headerClass: customStyles.header_plankton_blue_level_2,
              hide: !labAnalystSheet,
            },
            {
              headerName: "Aphanothece",
              field: "aphanothece",
              headerClass: customStyles.header_plankton_blue_level_2,
              hide: !labAnalystSheet,
            },
            {
              headerName: "Chroococus",
              field: "chroococus",
              headerClass: customStyles.header_plankton_blue_level_2,
              hide: !labAnalystSheet,
            },
            {
              headerName: "Coleosphaerium",
              field: "coleosphaerium",
              headerClass: customStyles.header_plankton_blue_level_2,
              hide: !labAnalystSheet,
            },
            {
              headerName: "Gleocapsa",
              field: "gloeocapsa",
              headerClass: customStyles.header_plankton_blue_level_2,
              hide: !labAnalystSheet,
            },
            {
              headerName: "Gomphospaeria",
              field: "gomphospaeria",
              headerClass: customStyles.header_plankton_blue_level_2,
              hide: !labAnalystSheet,
            },
            {
              headerName: "Lyngbya",
              field: "lyngbya",
              headerClass: customStyles.header_plankton_blue_level_2,
              hide: !labAnalystSheet,
            },
            {
              headerName: "Merismopedia",
              field: "merismopedia",
              headerClass: customStyles.header_plankton_blue_level_2,
              hide: !labAnalystSheet,
            },
            {
              headerName: "Microcystis",
              field: "microcystis",
              headerClass: customStyles.header_plankton_blue_level_2,
              hide: !labAnalystSheet,
            },
            {
              headerName: "Oscillatoria",
              field: "oscillatoria",
              headerClass: customStyles.header_plankton_blue_level_2,
              hide: !labAnalystSheet,
            },
            {
              headerName: "Pesudoanabayna",
              field: "pesudoanabayna",
              headerClass: customStyles.header_plankton_blue_level_2,
              hide: !labAnalystSheet,
            },
            {
              headerName: "Spirulina",
              field: "spirulina",
              headerClass: customStyles.header_plankton_blue_level_2,
              hide: !labAnalystSheet,
            },
            {
              headerName: "Lainnya",
              field: "other_blue_green_algae",
              headerClass: customStyles.header_plankton_blue_level_2,
              hide: !labAnalystSheet,
            },
          ],
        },
        {
          headerName: "Chrysophyta",
          headerClass: customStyles.header_plankton_diatom_level_1,
          hide: !labAnalystSheet,
          children: [
            {
              headerName: "Achnaetes",
              field: "achnaetes",
              headerClass: customStyles.header_plankton_diatom_level_2,
              hide: !labAnalystSheet,
            },
            {
              headerName: "Amphipora",
              field: "amphipora",
              headerClass: customStyles.header_plankton_diatom_level_2,
              hide: !labAnalystSheet,
            },
            {
              headerName: "Amphora",
              field: "amphora",
              headerClass: customStyles.header_plankton_diatom_level_2,
              hide: !labAnalystSheet,
            },
            {
              headerName: "Biddulphia",
              field: "biddulphia",
              headerClass: customStyles.header_plankton_diatom_level_2,
              hide: !labAnalystSheet,
            },
            {
              headerName: "Ceratulina",
              field: "ceratulina",
              headerClass: customStyles.header_plankton_diatom_level_2,
              hide: !labAnalystSheet,
            },
            {
              headerName: "Chaetocerus",
              field: "chaetocerus",
              headerClass: customStyles.header_plankton_diatom_level_2,
              hide: !labAnalystSheet,
            },
            {
              headerName: "Cocconeis",
              field: "cocconeis",
              headerClass: customStyles.header_plankton_diatom_level_2,
              hide: !labAnalystSheet,
            },
            {
              headerName: "Coscinodiscus",
              field: "coscinodiscus",
              headerClass: customStyles.header_plankton_diatom_level_2,
              hide: !labAnalystSheet,
            },
            {
              headerName: "Cyclotella",
              field: "cyclotella",
              headerClass: customStyles.header_plankton_diatom_level_2,
              hide: !labAnalystSheet,
            },
            {
              headerName: "Cylindropyxis",
              field: "cylindropyxis",
              headerClass: customStyles.header_plankton_diatom_level_2,
              hide: !labAnalystSheet,
            },
            {
              headerName: "Cymbella",
              field: "cymbella",
              headerClass: customStyles.header_plankton_diatom_level_2,
              hide: !labAnalystSheet,
            },
            {
              headerName: "Diploneis",
              field: "diploneis",
              headerClass: customStyles.header_plankton_diatom_level_2,
              hide: !labAnalystSheet,
            },
            {
              headerName: "Ditylum",
              field: "ditylum",
              headerClass: customStyles.header_plankton_diatom_level_2,
              hide: !labAnalystSheet,
            },
            {
              headerName: "Gomphonema",
              field: "gomphonema",
              headerClass: customStyles.header_plankton_diatom_level_2,
              hide: !labAnalystSheet,
            },
            {
              headerName: "Gyrosigma",
              field: "gyrosigma",
              headerClass: customStyles.header_plankton_diatom_level_2,
              hide: !labAnalystSheet,
            },
            {
              headerName: "Melosria",
              field: "melosria",
              headerClass: customStyles.header_plankton_diatom_level_2,
              hide: !labAnalystSheet,
            },
            {
              headerName: "Navicula",
              field: "navicula",
              headerClass: customStyles.header_plankton_diatom_level_2,
              hide: !labAnalystSheet,
            },
            {
              headerName: "Nitzchia",
              field: "nitzchia",
              headerClass: customStyles.header_plankton_diatom_level_2,
              hide: !labAnalystSheet,
            },
            {
              headerName: "Odontella",
              field: "odontella",
              headerClass: customStyles.header_plankton_diatom_level_2,
              hide: !labAnalystSheet,
            },
            {
              headerName: "Pinularia",
              field: "pinularia",
              headerClass: customStyles.header_plankton_diatom_level_2,
              hide: !labAnalystSheet,
            },
            {
              headerName: "Pleurosigma",
              field: "pleurosigma",
              headerClass: customStyles.header_plankton_diatom_level_2,
              hide: !labAnalystSheet,
            },
            {
              headerName: "Rhizosolenia",
              field: "rhizosolenia",
              headerClass: customStyles.header_plankton_diatom_level_2,
              hide: !labAnalystSheet,
            },
            {
              headerName: "Skeletonema",
              field: "skeletonema",
              headerClass: customStyles.header_plankton_diatom_level_2,
              hide: !labAnalystSheet,
            },
            {
              headerName: "Streptotecha",
              field: "streptotecha",
              headerClass: customStyles.header_plankton_diatom_level_2,
              hide: !labAnalystSheet,
            },
            {
              headerName: "Tabellaria",
              field: "tabellaria",
              headerClass: customStyles.header_plankton_diatom_level_2,
              hide: !labAnalystSheet,
            },
            {
              headerName: "Thalassiosira",
              field: "thalassiosira",
              headerClass: customStyles.header_plankton_diatom_level_2,
              hide: !labAnalystSheet,
            },
            {
              headerName: "Lainnya",
              field: "other_chrisophyta",
              headerClass: customStyles.header_plankton_diatom_level_2,
              hide: !labAnalystSheet,
            },
          ],
        },
        {
          headerName: "Euglenophyta",
          headerClass: customStyles.header_plankton_euglenophyta_level_1,
          hide: !labAnalystSheet,
          children: [
            {
              headerName: "Astasia",
              field: "astasia",
              headerClass: customStyles.header_plankton_euglenophyta_level_2,
              hide: !labAnalystSheet,
            },
            {
              headerName: "Cryptoglena",
              field: "cryptoglena",
              headerClass: customStyles.header_plankton_euglenophyta_level_2,
              hide: !labAnalystSheet,
            },
            {
              headerName: "Euglena",
              field: "euglena",
              headerClass: customStyles.header_plankton_euglenophyta_level_2,
              hide: !labAnalystSheet,
            },
            {
              headerName: "Trachelomonas",
              field: "trachelomonas",
              headerClass: customStyles.header_plankton_euglenophyta_level_2,
              hide: !labAnalystSheet,
            },
            {
              headerName: "Phacus",
              field: "phacus",
              headerClass: customStyles.header_plankton_euglenophyta_level_2,
              hide: !labAnalystSheet,
            },
            {
              headerName: "Rynchomonas",
              field: "rynchomonas",
              headerClass: customStyles.header_plankton_euglenophyta_level_2,
              hide: !labAnalystSheet,
            },
            {
              headerName: "Lainnya",
              field: "other_euglenophyta",
              headerClass: customStyles.header_plankton_euglenophyta_level_2,
              hide: !labAnalystSheet,
            },
          ],
        },
        {
          headerName: "Dinoflagellata",
          headerClass: customStyles.header_plankton_dinoflagellata_level_1,
          hide: !labAnalystSheet,
          children: [
            {
              headerName: "Alexandrium",
              field: "alexandrium",
              headerClass: customStyles.header_plankton_dinoflagellata_level_2,
              hide: !labAnalystSheet,
            },
            {
              headerName: "Gonyaulax",
              field: "gonyaulax",
              headerClass: customStyles.header_plankton_dinoflagellata_level_2,
              hide: !labAnalystSheet,
            },
            {
              headerName: "Gonyostomum",
              field: "gonyostomum",
              headerClass: customStyles.header_plankton_dinoflagellata_level_2,
              hide: !labAnalystSheet,
            },
            {
              headerName: "Gymnodinium",
              field: "gymnodinium",
              headerClass: customStyles.header_plankton_dinoflagellata_level_2,
              hide: !labAnalystSheet,
            },
            {
              headerName: "Gyrodinium",
              field: "gyrodinium",
              headerClass: customStyles.header_plankton_dinoflagellata_level_2,
              hide: !labAnalystSheet,
            },
            {
              headerName: "Noctilluca",
              field: "noctilluca",
              headerClass: customStyles.header_plankton_dinoflagellata_level_2,
              hide: !labAnalystSheet,
            },
            {
              headerName: "Peridinium",
              field: "peridinium",
              headerClass: customStyles.header_plankton_dinoflagellata_level_2,
              hide: !labAnalystSheet,
            },
            {
              headerName: "Protoceraterium",
              field: "protoceraterium",
              headerClass: customStyles.header_plankton_dinoflagellata_level_2,
              hide: !labAnalystSheet,
            },
            {
              headerName: "Prorocentrum",
              field: "prorocentrum",
              headerClass: customStyles.header_plankton_dinoflagellata_level_2,
              hide: !labAnalystSheet,
            },
            {
              headerName: "Protoperidinium",
              field: "protoperidinium",
              headerClass: customStyles.header_plankton_dinoflagellata_level_2,
              hide: !labAnalystSheet,
            },
            {
              headerName: "Symbiodinium",
              field: "symbiodinium",
              headerClass: customStyles.header_plankton_dinoflagellata_level_2,
              hide: !labAnalystSheet,
            },
            {
              headerName: "Lainnya",
              field: "other_dinoflagellata",
              headerClass: customStyles.header_plankton_dinoflagellata_level_2,
              hide: !labAnalystSheet,
            },
          ],
        },
        {
          headerName: "Zooplankton",
          headerClass: customStyles.header_plankton_zooplankton_level_1,
          hide: !labAnalystSheet,
          children: [
            {
              headerName: "Acanthocystis",
              field: "acanthocystis",
              headerClass: customStyles.header_plankton_zooplankton_level_2,
              hide: !labAnalystSheet,
            },
            {
              headerName: "Actinophrys",
              field: "actinophrys",
              headerClass: customStyles.header_plankton_zooplankton_level_2,
              hide: !labAnalystSheet,
            },
            {
              headerName: "Alona",
              field: "alona",
              headerClass: customStyles.header_plankton_zooplankton_level_2,
              hide: !labAnalystSheet,
            },
            {
              headerName: "Amoeba",
              field: "amoeba",
              headerClass: customStyles.header_plankton_zooplankton_level_2,
              hide: !labAnalystSheet,
            },
            {
              headerName: "Amphileptus",
              field: "amphileptus",
              headerClass: customStyles.header_plankton_zooplankton_level_2,
              hide: !labAnalystSheet,
            },
            {
              headerName: "Brachionus",
              field: "brachionus",
              headerClass: customStyles.header_plankton_zooplankton_level_2,
              hide: !labAnalystSheet,
            },
            {
              headerName: "Coleps",
              field: "coleps",
              headerClass: customStyles.header_plankton_zooplankton_level_2,
              hide: !labAnalystSheet,
            },
            {
              headerName: "Cyclidium",
              field: "cyclidium",
              headerClass: customStyles.header_plankton_zooplankton_level_2,
              hide: !labAnalystSheet,
            },
            {
              headerName: "Entosiphon",
              field: "entosiphon",
              headerClass: customStyles.header_plankton_zooplankton_level_2,
              hide: !labAnalystSheet,
            },
            {
              headerName: "Epiphanes",
              field: "epiphanes",
              headerClass: customStyles.header_plankton_zooplankton_level_2,
              hide: !labAnalystSheet,
            },
            {
              headerName: "Euplotes",
              field: "euplotes",
              headerClass: customStyles.header_plankton_zooplankton_level_2,
              hide: !labAnalystSheet,
            },
            {
              headerName: "Mesodinium",
              field: "mesodinium",
              headerClass: customStyles.header_plankton_zooplankton_level_2,
              hide: !labAnalystSheet,
            },
            {
              headerName: "Paramecium",
              field: "paramecium",
              headerClass: customStyles.header_plankton_zooplankton_level_2,
              hide: !labAnalystSheet,
            },
            {
              headerName: "Stentor",
              field: "stentor",
              headerClass: customStyles.header_plankton_zooplankton_level_2,
              hide: !labAnalystSheet,
            },
            {
              headerName: "Strombidinopsis",
              field: "strombidinopsis",
              headerClass: customStyles.header_plankton_zooplankton_level_2,
              hide: !labAnalystSheet,
            },
            {
              headerName: "Strombidinium",
              field: "strombidinium",
              headerClass: customStyles.header_plankton_zooplankton_level_2,
              hide: !labAnalystSheet,
            },
            {
              headerName: "Tintinopsis",
              field: "tintinopsis",
              headerClass: customStyles.header_plankton_zooplankton_level_2,
              hide: !labAnalystSheet,
            },
            {
              headerName: "Trichocerca",
              field: "trichocerca",
              headerClass: customStyles.header_plankton_zooplankton_level_2,
              hide: !labAnalystSheet,
            },
            {
              headerName: "Vorticella",
              field: "vorticella",
              headerClass: customStyles.header_plankton_zooplankton_level_2,
              hide: !labAnalystSheet,
            },
            {
              headerName: "Zoothamnium",
              field: "zoothamnium",
              headerClass: customStyles.header_plankton_zooplankton_level_2,
              hide: !labAnalystSheet,
            },
            {
              headerName: "Lainnya",
              field: "other_zooplankton",
              headerClass: customStyles.header_plankton_zooplankton_level_2,
              hide: !labAnalystSheet,
            },
          ],
        },
        {
          headerName: "Others",
          headerClass: customStyles.header_plankton_others_level_1,
          hide: !labAnalystSheet,
          children: [
            {
              headerName: "Cryptomonas",
              field: "cryptomonas",
              headerClass: customStyles.header_plankton_others_level_2,
              hide: !labAnalystSheet,
            },
            {
              headerName: "Prymnesium",
              field: "prymenesium",
              headerClass: customStyles.header_plankton_others_level_2,
              hide: !labAnalystSheet,
            },
            {
              headerName: "Isochrysis",
              field: "isochrysis",
              headerClass: customStyles.header_plankton_others_level_2,
              hide: !labAnalystSheet,
            },
            {
              headerName: "Other_plankton",
              field: "other_plankton",
              headerClass: customStyles.header_plankton_others_level_2,
              hide: !labAnalystSheet,
            },
          ],
        },
        {
          headerName: "Total",
          field: "bactery_total",
          headerClass: customStyles.header_plankton_total,
          hide: !labAnalystSheet,
          editable: false,
          cellClass: customStyles.shaded_column,
          valueGetter: (params) => {
            return 0.0;
          },
        },
      ],
    },
    {
      headerName: "Parameter Bakteri",
      headerClass: customStyles.header_bactery_level_1,
      hide: !labAnalystSheet,
      children: [
        {
          headerName: "Vibrio",
          headerClass: customStyles.header_bactery_vibrio_level_1,
          hide: !labAnalystSheet,
          children: [
            {
              headerName: "Yellow",
              field: "bactery_vibrio_y",
              headerClass: customStyles.header_bactery_vibrio_level_2,
              hide: !labAnalystSheet,
              cellClass: customStyles.shaded_column,
              valueGetter: (params) => {
                // Adjusted counts
                let adjusted_count_petri1_tvc_1: number =
                  parseFloat(params.getValue("adjusted_count_petri1_tvc_1")) ||
                  0;
                let adjusted_count_petri2_tvc_1: number =
                  parseFloat(params.getValue("adjusted_count_petri2_tvc_1")) ||
                  0;
                let adjusted_count_petri1_tvc_2: number =
                  parseFloat(params.getValue("adjusted_count_petri1_tvc_2")) ||
                  0;
                let adjusted_count_petri2_tvc_2: number =
                  parseFloat(params.getValue("adjusted_count_petri2_tvc_2")) ||
                  0;

                // Total Count per TVC
                let total_count_tvc_1: number = parseFloat(
                  params.getValue("total_count_tvc_1")
                );
                let total_count_tvc_2: number = parseFloat(
                  params.getValue("total_count_tvc_2")
                );
                let dilution: number = parseFloat(
                  params.getValue("dilution_factor_tvc_1")
                );

                // Yellow Vibrio
                let yellow_petri1_tvc_1: number = parseFloat(
                  params.getValue("yellow_petri1_tvc_1")
                );
                let yellow_petri2_tvc_1: number = parseFloat(
                  params.getValue("yellow_petri2_tvc_1")
                );
                let yellow_petri1_tvc_2: number = parseFloat(
                  params.getValue("yellow_petri1_tvc_2")
                );
                let yellow_petri2_tvc_2: number = parseFloat(
                  params.getValue("yellow_petri2_tvc_2")
                );

                // Inoculum
                let inoculum: number = parseFloat(
                  params.getValue("inoculum_tvc_1")
                );

                if (
                  adjusted_count_petri1_tvc_1 === null ||
                  adjusted_count_petri1_tvc_1 === undefined ||
                  adjusted_count_petri2_tvc_1 === null ||
                  adjusted_count_petri2_tvc_1 === undefined ||
                  adjusted_count_petri2_tvc_1 === null ||
                  adjusted_count_petri2_tvc_1 === undefined ||
                  adjusted_count_petri2_tvc_2 === null ||
                  adjusted_count_petri2_tvc_2 === undefined
                ) {
                  return ""; // Return empty string if any cell is blank or missing
                }

                // Step 2: Calculate the denominator
                const denominator: number =
                  1 * total_count_tvc_1 + 0.1 * total_count_tvc_2;

                // Step 3: Check if the denominator is 0
                if (denominator === 0) {
                  return 0; // Return 0 if the denominator is 0
                }

                // Step 4: Calculate the numerator sums
                const sumAY: number =
                  adjusted_count_petri1_tvc_1 !== 0 ? yellow_petri1_tvc_1 : 0; // Sum AY1428 if BB1428 is not 0
                const sumBC: number =
                  adjusted_count_petri2_tvc_1 !== 0 ? yellow_petri2_tvc_1 : 0; // Sum BC1428 if BF1428 is not 0
                const sumBI: number =
                  adjusted_count_petri1_tvc_2 !== 0 ? yellow_petri1_tvc_2 : 0; // Sum BI1428 if BL1428 is not 0
                const sumBM: number =
                  adjusted_count_petri2_tvc_2 !== 0 ? yellow_petri2_tvc_2 : 0; // Sum BM1428 if BP1428 is not 0

                const numerator = sumAY + sumBC + sumBI + sumBM;

                // Step 5: Determine the multiplier based on AW1428
                let multiplier;
                switch (inoculum) {
                  case 50:
                    multiplier = 20;
                    break;
                  case 100:
                    multiplier = 10;
                    break;
                  case 200:
                    multiplier = 5;
                    break;
                  default:
                    multiplier = 1; // Default case (optional, can be adjusted)
                }

                // Step 6: Calculate the final result
                const result =
                  (numerator * multiplier * Math.pow(10, dilution)) /
                  denominator;
                handleFormulaValueChange(params, result.toFixed(2));

                return result.toFixed(2);
              },
            },
            {
              headerName: "Green",
              field: "bactery_vibrio_g",
              headerClass: customStyles.header_bactery_vibrio_level_2,
              hide: !labAnalystSheet,
              cellClass: customStyles.shaded_column,
              valueGetter: (params) => {
                // Adjusted counts
                let adjusted_count_petri1_tvc_1: number =
                  parseFloat(params.getValue("adjusted_count_petri1_tvc_1")) ||
                  0;
                let adjusted_count_petri2_tvc_1: number =
                  parseFloat(params.getValue("adjusted_count_petri2_tvc_1")) ||
                  0;
                let adjusted_count_petri1_tvc_2: number =
                  parseFloat(params.getValue("adjusted_count_petri1_tvc_2")) ||
                  0;
                let adjusted_count_petri2_tvc_2: number =
                  parseFloat(params.getValue("adjusted_count_petri2_tvc_2")) ||
                  0;

                // Total Count per TVC
                let total_count_tvc_1: number = parseFloat(
                  params.getValue("total_count_tvc_1")
                );
                let total_count_tvc_2: number = parseFloat(
                  params.getValue("total_count_tvc_2")
                );
                let dilution: number = parseFloat(
                  params.getValue("dilution_factor_tvc_1")
                );

                // Yellow Vibrio
                let green_petri1_tvc_1: number = parseFloat(
                  params.getValue("green_petri1_tvc_1")
                );
                let green_petri2_tvc_1: number = parseFloat(
                  params.getValue("green_petri2_tvc_1")
                );
                let green_petri1_tvc_2: number = parseFloat(
                  params.getValue("green_petri1_tvc_2")
                );
                let green_petri2_tvc_2: number = parseFloat(
                  params.getValue("green_petri2_tvc_2")
                );

                // Inoculum
                let inoculum: number = parseFloat(
                  params.getValue("inoculum_tvc_1")
                );

                if (
                  adjusted_count_petri1_tvc_1 === null ||
                  adjusted_count_petri1_tvc_1 === undefined ||
                  adjusted_count_petri2_tvc_1 === null ||
                  adjusted_count_petri2_tvc_1 === undefined ||
                  adjusted_count_petri2_tvc_1 === null ||
                  adjusted_count_petri2_tvc_1 === undefined ||
                  adjusted_count_petri2_tvc_2 === null ||
                  adjusted_count_petri2_tvc_2 === undefined
                ) {
                  return ""; // Return empty string if any cell is blank or missing
                }

                // Step 2: Calculate the denominator
                const denominator: number =
                  1 * total_count_tvc_1 + 0.1 * total_count_tvc_2;

                // Step 3: Check if the denominator is 0
                if (denominator === 0) {
                  return 0; // Return 0 if the denominator is 0
                }

                // Step 4: Calculate the numerator sums
                const sumAY: number =
                  adjusted_count_petri1_tvc_1 !== 0 ? green_petri1_tvc_1 : 0; // Sum AY1428 if BB1428 is not 0
                const sumBC: number =
                  adjusted_count_petri2_tvc_1 !== 0 ? green_petri2_tvc_1 : 0; // Sum BC1428 if BF1428 is not 0
                const sumBI: number =
                  adjusted_count_petri1_tvc_2 !== 0 ? green_petri1_tvc_2 : 0; // Sum BI1428 if BL1428 is not 0
                const sumBM: number =
                  adjusted_count_petri2_tvc_2 !== 0 ? green_petri2_tvc_2 : 0; // Sum BM1428 if BP1428 is not 0

                const numerator = sumAY + sumBC + sumBI + sumBM;

                // Step 5: Determine the multiplier based on AW1428
                let multiplier;
                switch (inoculum) {
                  case 50:
                    multiplier = 20;
                    break;
                  case 100:
                    multiplier = 10;
                    break;
                  case 200:
                    multiplier = 5;
                    break;
                  default:
                    multiplier = 1; // Default case (optional, can be adjusted)
                }

                // Step 6: Calculate the final result
                const result =
                  (numerator * multiplier * Math.pow(10, dilution)) /
                  denominator;
                handleFormulaValueChange(params, result.toFixed(2));

                return result.toFixed(2);
              },
            },
            {
              headerName: "Black",
              field: "bactery_black",
              headerClass: customStyles.header_bactery_vibrio_level_2,
              hide: !labAnalystSheet,
            },
            {
              headerName: "TVC",
              field: "bactery_vibrio_tvc",
              headerClass: customStyles.header_bactery_vibrio_level_2,
              hide: !labAnalystSheet,
              editable: false,
              valueGetter: (params) => {
                let yellow: number =
                  parseFloat(params.getValue("bactery_vibrio_y")) || 0;
                let green: number =
                  parseFloat(params.getValue("bactery_vibrio_g")) || 0;

                const result: number = yellow + green;
                handleFormulaValueChange(params, result.toFixed(2));

                return result.toFixed(2);
              },
            },
          ],
        },
        {
          headerName: "TBC",
          headerClass: customStyles.header_bactery_tbc,
          hide: !labAnalystSheet,
          field: "bactery_tbc",
          cellClass: customStyles.shaded_column,
          valueGetter: (params) => {
            // Adjusted counts
            let adjusted_count_petri1_tbc_1: number =
              parseFloat(params.getValue("adjusted_count_petri1_tbc_1")) || 0;
            let adjusted_count_petri2_tbc_1: number =
              parseFloat(params.getValue("adjusted_count_petri2_tbc_1")) || 0;
            let adjusted_count_petri1_tbc_2: number =
              parseFloat(params.getValue("adjusted_count_petri1_tbc_2")) || 0;
            let adjusted_count_petri2_tbc_2: number =
              parseFloat(params.getValue("adjusted_count_petri2_tbc_2")) || 0;

            // Total Count per TBC
            let total_count_tbc_1: number = parseFloat(
              params.getValue("total_count_tbc_1")
            );
            let total_count_tbc_2: number = parseFloat(
              params.getValue("total_count_tbc_2")
            );
            let dilution: number = parseFloat(
              params.getValue("dilution_factor_tbc_1")
            );

            // Step 1: Add Value 1, Value 2, Value 3, and Value 4
            const sum =
              adjusted_count_petri1_tbc_1 +
              adjusted_count_petri2_tbc_1 +
              adjusted_count_petri1_tbc_2 +
              adjusted_count_petri2_tbc_2;

            // Step 2: Calculate the denominator
            const denominator = 1 * total_count_tbc_1 + 0.1 * total_count_tbc_2;

            // Step 3: Check if the denominator is 0 (to avoid division by zero)
            if (denominator === 0) {
              return ""; // Return an empty string if the denominator is 0
            }

            // Step 4: Divide the sum by the denominator
            const result = (sum * Math.pow(10, dilution)) / denominator;

            handleFormulaValueChange(params, result.toFixed(2));

            return result.toFixed(2);
          },
        },
        {
          headerName: "TVC:TBC %",
          headerClass: customStyles.header_bactery_tvc_tbc,
          hide: !labAnalystSheet,
          field: "bactery_tvc_tbc",
          cellClass: customStyles.shaded_column,
          valueGetter: (params) => {
            let tvc: number =
              parseFloat(params.getValue("bactery_vibrio_tvc")) || 0;
            let tbc: number = parseFloat(params.getValue("bactery_tbc")) || 0;

            if (tbc === 0) {
              return "";
            }

            const result = (tvc / tbc) * 100;
            handleFormulaValueChange(params, result.toFixed(2));

            return result.toFixed(2);
          },
        },
      ],
    },
    {
      headerName: "Alkalinitas",
      headerClass: customStyles.header_alkalinitas_level_1,
      hide: !labCalculation,
      children: [
        {
          headerName: "Volume H2SO4/ A / P",
          field: "h2so4_ap",
          headerClass: customStyles.header_alkalinitas_level_2,
          hide: !labCalculation,
        },
        {
          headerName: "Volume H2SO4/ B / T",
          field: "h2so4_bt",
          headerClass: customStyles.header_alkalinitas_level_2,
          hide: !labCalculation,
        },
        {
          headerName: "N Asam",
          field: "n_asam",
          headerClass: customStyles.header_alkalinitas_level_2,
          hide: !labCalculation,
        },
        {
          headerName: "V Sampel",
          field: "sample_volume_alkalinity",
          headerClass: customStyles.header_alkalinitas_level_2,
          hide: !labCalculation,
        },
        {
          headerName: "Perbandingan P & T",
          field: "pt_alkalinity_diff",
          headerClass: customStyles.header_alkalinitas_level_2,
          hide: !labCalculation,
          editable: false,
          cellClass: customStyles.shaded_column,
          valueGetter: (params) => {
            if (params.data.h2so4_bt) {
              return (params.data.h2so4_bt / 2).toFixed(2);
            }

            return "";
          },
        },
        {
          headerName: "Alkalinitas P",
          field: "p_alkalinity",
          headerClass: customStyles.header_alkalinitas_level_2,
          hide: !labCalculation,
          editable: false,
          cellClass: customStyles.shaded_column,
          valueGetter: (params) => {
            if (
              params.data.h2so4_ap &&
              params.data.n_asam &&
              params.data.sample_volume_alkalinity
            ) {
              return (
                (params.data.h2so4_ap * params.data.n_asam * 50 * 1000) /
                params.data.sample_volume_alkalinity
              ).toFixed(2);
            }

            return "";
          },
        },
        {
          headerName: "Alkalinitas T",
          field: "t_alkalinity",
          headerClass: customStyles.header_alkalinitas_level_2,
          hide: !labCalculation,
          editable: false,
          cellClass: customStyles.shaded_column,
          valueGetter: (params) => {
            if (
              params.data.h2so4_ap &&
              params.data.n_asam &&
              params.data.sample_volume_alkalinity &&
              params.data.h2so4_bt
            ) {
              return (
                ((params.data.h2so4_ap + params.data.h2so4_bt) *
                  params.data.n_asam *
                  50 *
                  1000) /
                params.data.sample_volume_alkalinity
              ).toFixed(2);
            }

            return "";
          },
        },
      ],
    },
    {
      headerName: "Nitrit",
      headerClass: customStyles.header_nitrit_level_1,
      hide: !labCalculation,
      children: [
        {
          headerName: "Dilution Factor",
          field: "nitrit_dilution_factor",
          headerClass: customStyles.header_nitrit_level_2,
          hide: !labCalculation,
        },
        {
          headerName: "Blanco",
          field: "nitrit_blanko",
          headerClass: customStyles.header_nitrit_level_2,
          hide: !labCalculation,
        },
        {
          headerName: "Abs As",
          field: "nitrit_abs_as",
          headerClass: customStyles.header_nitrit_level_2,
          hide: !labCalculation,
        },
        {
          headerName: "Vol of Sample",
          field: "nitrit_volume_sample",
          headerClass: customStyles.header_nitrit_level_2,
          hide: !labCalculation,
        },
        {
          headerName: "Conc. C",
          field: "nitrit_conc_c",
          headerClass: customStyles.header_nitrit_level_2,
          hide: !labCalculation,
          editable: false,
          cellClass: customStyles.shaded_column,
          valueGetter: (params) => {
            let calculation: number =
              ((params.data.nitrit_abs_as -
                params.data.nitrit_blanko -
                params.data.nitrit_intercept) *
                params.data.nitrit_dilution_factor) /
              params.data.nitrit_slope;

            params.data.nitrit_conc_c = calculation.toFixed(10);
            return calculation.toFixed(10);
          },
        },
        {
          headerName: "Remark",
          field: "nitrit_description",
          headerClass: customStyles.header_nitrit_level_2,
          hide: !labCalculation,
        },
      ],
    },
    {
      headerName: "Fosfat",
      headerClass: customStyles.header_fosfat_level_1,
      hide: !labCalculation,
      children: [
        {
          headerName: "Dilution Factor",
          field: "fosfat_dilution_factor",
          headerClass: customStyles.header_fosfat_level_2,
          hide: !labCalculation,
        },
        {
          headerName: "Blanco",
          field: "fosfat_blanko",
          headerClass: customStyles.header_fosfat_level_2,
          hide: !labCalculation,
        },
        {
          headerName: "Abs As",
          field: "fosfat_abs_as",
          headerClass: customStyles.header_fosfat_level_2,
          hide: !labCalculation,
        },
        {
          headerName: "Vol of Sample",
          field: "fosfat_volume_sample",
          headerClass: customStyles.header_fosfat_level_2,
          hide: !labCalculation,
        },
        {
          headerName: "Conc. C",
          field: "fosfat_conc_c",
          headerClass: customStyles.header_fosfat_level_2,
          hide: !labCalculation,
          editable: false,
          cellClass: customStyles.shaded_column,
          valueGetter: (params) => {
            let calculation: number =
              ((params.data.fosfat_abs_as -
                params.data.fosfat_blanko -
                params.data.phosphat_intercept) *
                params.data.fosfat_dilution_factor) /
              params.data.phosphat_slope;

            params.data.fosfat_conc_c = calculation.toFixed(10);
            return calculation.toFixed(10);
          },
        },
        {
          headerName: "Remark",
          field: "fosfat_description",
          headerClass: customStyles.header_fosfat_level_2,
          hide: !labCalculation,
        },
      ],
    },
    {
      headerName: "TAN",
      headerClass: customStyles.header_tan_level_1,
      hide: !labCalculation,
      children: [
        {
          headerName: "Dilution Factor",
          field: "tan_dilution_factor",
          headerClass: customStyles.header_tan_level_2,
          hide: !labCalculation,
          cellDataType: "number",
        },
        {
          headerName: "Blanco",
          field: "tan_blanko",
          headerClass: customStyles.header_tan_level_2,
          hide: !labCalculation,
          cellDataType: "number",
        },
        {
          headerName: "Abs As",
          field: "tan_abs_as",
          headerClass: customStyles.header_tan_level_2,
          hide: !labCalculation,
          cellDataType: "number",
        },
        {
          headerName: "Vol of Sample",
          field: "tan_volume_sample",
          headerClass: customStyles.header_tan_level_2,
          hide: !labCalculation,
          cellDataType: "number",
        },
        {
          headerName: "Conc. C",
          field: "tan_conc_c",
          headerClass: customStyles.header_tan_level_2,
          hide: !labCalculation,
          editable: false,
          cellClass: customStyles.shaded_column,
          valueGetter: (params) => {
            let calculation: number =
              ((params.data.tan_abs_as -
                params.data.tan_blanko -
                params.data.tan_intercept) *
                params.data.tan_dilution_factor) /
              params.data.tan_slope;

            // Assign the value
            params.data.tan_conc_c = calculation.toFixed(10);

            return calculation.toFixed(10);
          },
        },
        {
          headerName: "Remark",
          field: "tan_description",
          headerClass: customStyles.header_tan_level_2,
          hide: !labCalculation,
        },
      ],
    },
    {
      headerName: "Unionized NH₃",
      headerClass: customStyles.header_unionized_level_1,
      hide: !labCalculation,
      children: [
        {
          headerName: "TAN",
          field: "unionized_tan",
          headerClass: customStyles.header_unionized_level_2,
          hide: !labCalculation,
          editable: false,
          cellClass: customStyles.shaded_column,
        },
        {
          headerName: "pH Pagi",
          field: "ph_time0430",
          headerClass: customStyles.header_unionized_level_2,
          hide: !labCalculation,
          editable: false,
          cellClass: customStyles.shaded_column,
        },
        {
          headerName: "Temperature Pagi",
          field: "temperature_time0500",
          headerClass: customStyles.header_unionized_level_2,
          hide: !labCalculation,
          editable: false,
          cellClass: customStyles.shaded_column,
        },
        {
          headerName: "Salinity",
          field: "sal",
          headerClass: customStyles.header_unionized_level_2,
          hide: !labCalculation,
          editable: false,
          cellClass: customStyles.shaded_column,
        },
        {
          headerName: "I",
          field: "i",
          headerClass: customStyles.header_unionized_level_2,
          hide: !labCalculation,
          editable: false,
          cellClass: customStyles.shaded_column,
          valueGetter: (params) => {
            let salinity: number = params.getValue("sal");

            if (!salinity) {
              return "";
            }

            let calculation: number =
              (19.973 * salinity) / (1000 - 1.2005109 * salinity);
            handleFormulaValueChange(params, calculation.toFixed(10));

            return calculation.toFixed(10);
          },
        },
        {
          headerName: "pKa,S",
          field: "pka_s",
          headerClass: customStyles.header_unionized_level_2,
          hide: !labCalculation,
          editable: false,
          cellClass: customStyles.shaded_column,
          valueGetter: (params) => {
            let temperature: number =
              params.getValue("temperature_time0500") || 0;
            let i: number = params.getValue("i");

            if (!i) {
              return "";
            }

            let calculation: number =
              0.0901821 +
              2729.92 / (temperature + 273.2) +
              (0.1552 - 0.0003142 * temperature) * i;
            handleFormulaValueChange(params, calculation.toFixed(10));

            return calculation.toFixed(10);
          },
        },
        {
          headerName: "Fraction NH₃",
          field: "fraction_nh3",
          headerClass: customStyles.header_unionized_level_2,
          hide: !labCalculation,
          editable: false,
          cellClass: customStyles.shaded_column,
          valueGetter: (params) => {
            let pkaS: number = params.getValue("pka_s");
            let ph: number = params.getValue("ph_time0430");

            if (!pkaS || !ph) {
              return "";
            }

            let calculation: number = 1 / (Math.pow(10, pkaS - ph) + 1);
            handleFormulaValueChange(params, calculation.toFixed(5));

            return (calculation * 100).toFixed(2) + "%";
          },
        },
        {
          headerName: "Fraction NH₄",
          field: "fraction_nh4",
          headerClass: customStyles.header_unionized_level_2,
          hide: !labCalculation,
          editable: false,
          cellClass: customStyles.shaded_column,
          valueGetter: (params) => {
            let nh3Fraction: number = parseFloat(
              params.getValue("fraction_nh3")
            );

            if (!nh3Fraction) {
              return "";
            }

            let calculation: number = 100 - nh3Fraction;
            handleFormulaValueChange(params, calculation.toFixed(5));

            return calculation.toFixed(2) + "%";
          },
        },
      ],
    },
    {
      headerName: "Total Organic Matter",
      headerClass: customStyles.header_total_organic_matter_level_1,
      hide: !labCalculation,
      children: [
        {
          headerName: "X",
          field: "x_volume",
          headerClass: customStyles.header_total_organic_matter_level_2,
          hide: !labCalculation,
        },
        {
          headerName: "Y",
          field: "y_volume",
          headerClass: customStyles.header_total_organic_matter_level_2,
          hide: !labCalculation,
        },
        {
          headerName: "BE. KMnO₄",
          field: "be_kmno4",
          headerClass: customStyles.header_total_organic_matter_level_2,
          hide: !labCalculation,
          editable: false,
          cellClass: customStyles.konstanta_column,
          valueGetter: (params) => {
            return 31.6;
          },
        },
        {
          headerName: "N. KMnO₄",
          field: "n_kmno4",
          headerClass: customStyles.header_total_organic_matter_level_2,
          hide: !labCalculation,
        },
        {
          headerName: "V Sample",
          field: "sample_volume_titration",
          headerClass: customStyles.header_total_organic_matter_level_2,
          hide: !labCalculation,
        },
      ],
    },
    {
      headerName: "Hardness",
      headerClass: customStyles.header_calculation_hardness_level_1,
      hide: !labCalculation,
      children: [
        {
          headerName: "V c.u.",
          field: "cu_volume",
          headerClass: customStyles.header_calculation_hardness_level_2,
          hide: !labCalculation,
        },
        {
          headerName: "V. EDTA(a)",
          field: "v_edta_a",
          headerClass: customStyles.header_calculation_hardness_level_2,
          hide: !labCalculation,
        },
        {
          headerName: "V. EDTA(b)",
          field: "v_edta_b",
          headerClass: customStyles.header_calculation_hardness_level_2,
          hide: !labCalculation,
        },
        {
          headerName: "M. EDTA(a)",
          field: "m_edta",
          headerClass: customStyles.header_calculation_hardness_level_2,
          hide: !labCalculation,
        },
        {
          headerName: "Mr CaCO₃",
          field: "mr_caco3",
          headerClass: customStyles.header_calculation_hardness_level_2,
          hide: !labCalculation,
          editable: false,
          cellClass: customStyles.konstanta_column,
          valueGetter: (params) => {
            return 100;
          },
        },
        {
          headerName: "Ar Ca",
          field: "ar_ca",
          headerClass: customStyles.header_calculation_hardness_level_2,
          hide: !labCalculation,
          editable: false,
          cellClass: customStyles.konstanta_column,
          valueGetter: (params) => {
            return 40;
          },
        },
        {
          headerName: "Ar Mg",
          field: "ar_mg",
          headerClass: customStyles.header_calculation_hardness_level_2,
          hide: !labCalculation,
          editable: false,
          cellClass: customStyles.konstanta_column,
          valueGetter: (params) => {
            return 24;
          },
        },
      ],
    },
    {
      headerName: "TVC:TBC",
      headerClass: customStyles.header_calculation_bactery_level_1,
      hide: !labCalculation,
      children: [
        {
          headerName: "TVC",
          headerClass: customStyles.header_calculation_bactery_level_2,
          hide: !labCalculation,
          children: [
            {
              headerName: "Inoculum",
              field: "inoculum_tvc_1",
              headerClass: customStyles.header_calculation_bactery_level_3,
              hide: !labCalculation,
              cellEditor: "agSelectCellEditor",
              cellEditorParams: {
                values: [50, 100, 200],
              },
              cellDataType: "number",
            },
            {
              headerName: "Dilusi 1",
              field: "dilution_factor_tvc_1",
              headerClass: customStyles.header_calculation_bactery_level_4,
              hide: !labCalculation,
              cellEditor: "agSelectCellEditor",
              cellEditorParams: {
                values: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
              },
              cellDataType: "number",
            },
            {
              headerName: "Petri 1",
              headerClass: customStyles.header_calculation_bactery_level_4,
              hide: !labCalculation,
              children: [
                {
                  headerName: "Yellow",
                  field: "yellow_petri1_tvc_1",
                  headerClass: customStyles.header_calculation_bactery_level_5,
                  hide: !labCalculation,
                  cellDataType: "number",
                },
                {
                  headerName: "Green",
                  field: "green_petri1_tvc_1",
                  headerClass: customStyles.header_calculation_bactery_level_5,
                  hide: !labCalculation,
                  cellDataType: "number",
                },
                {
                  headerName: "Black",
                  field: "black_petri1_tvc_1",
                  headerClass: customStyles.header_calculation_bactery_level_5,
                  hide: !labCalculation,
                  cellDataType: "number",
                },
                {
                  headerName: "Adjusted Count",
                  field: "adjusted_count_petri1_tvc_1",
                  headerClass: customStyles.header_calculation_bactery_level_5,
                  hide: !labCalculation,
                  cellDataType: "number",
                  valueSetter: (params) => {
                    const newVal = params.newValue;
                    const valueChanged = params.data.b !== newVal;
                    if (valueChanged) {
                      params.data.adjusted_count_petri1_tvc_1 = newVal;
                    }

                    return valueChanged;
                  },
                  valueGetter: (params) => {
                    let inoculum: number = params.data.inoculum_tvc_1
                      ? params.data.inoculum_tvc_1
                      : 0;
                    let dilution: number = params.data.dilution_factor_tvc_1
                      ? params.data.dilution_factor_tvc_1
                      : 0;
                    let yellow: number = params.data.yellow_petri1_tvc_1
                      ? params.data.yellow_petri1_tvc_1
                      : 0;
                    let green: number = params.data.green_petri1_tvc_1
                      ? params.data.green_petri1_tvc_1
                      : 0;

                    // Helper function to determine the multiplier based on AW8
                    const getMultiplier = (inoculum: number) => {
                      if (inoculum === 50) return 20;
                      if (inoculum === 100) return 10;
                      if (inoculum === 200) return 5;
                      return 0;
                    };

                    const sum: number = yellow + green;

                    // Case 1: AX8 is 0
                    if (dilution === 0) {
                      if (sum >= 0 && sum <= 250) {
                        params.data.adjusted_count_petri1_tvc_1 =
                          sum * getMultiplier(inoculum);
                        return sum * getMultiplier(inoculum);
                      } else {
                        params.data.adjusted_count_petri1_tvc_1 = 0;
                        return 0;
                      }
                    }

                    // Case 2: AX8 is between 1 and 10
                    if (dilution >= 1 && dilution <= 10) {
                      if (sum >= 25 && sum <= 250) {
                        params.data.adjusted_count_petri1_tvc_1 =
                          sum * getMultiplier(inoculum);
                        return sum * getMultiplier(inoculum);
                      } else {
                        params.data.adjusted_count_petri1_tvc_1 = 0;
                        return 0;
                      }
                    }

                    params.data.adjusted_count_petri1_tvc_1 = 0;
                    return 0;
                  },
                },
              ],
            },
            {
              headerName: "Petri 2",
              headerClass: customStyles.header_calculation_bactery_level_4,
              hide: !labCalculation,
              children: [
                {
                  headerName: "Yellow",
                  field: "yellow_petri2_tvc_1",
                  headerClass: customStyles.header_calculation_bactery_level_5,
                  hide: !labCalculation,
                  cellDataType: "number",
                },
                {
                  headerName: "Green",
                  field: "green_petri2_tvc_1",
                  headerClass: customStyles.header_calculation_bactery_level_5,
                  hide: !labCalculation,
                  cellDataType: "number",
                },
                {
                  headerName: "Black",
                  field: "black_petri2_tvc_1",
                  headerClass: customStyles.header_calculation_bactery_level_5,
                  hide: !labCalculation,
                  cellDataType: "number",
                },
                {
                  headerName: "Adjusted Count",
                  field: "adjusted_count_petri2_tvc_1",
                  headerClass: customStyles.header_calculation_bactery_level_5,
                  hide: !labCalculation,
                  editable: false,
                  cellDataType: "number",
                  valueSetter: (params) => {
                    const newVal = params.newValue;
                    const valueChanged = params.data.b !== newVal;
                    if (valueChanged) {
                      params.data.adjusted_count_petri2_tvc_1 = newVal;
                    }
                    return valueChanged;
                  },
                  valueGetter: (params) => {
                    let inoculum = params.data.inoculum_tvc_1
                      ? params.data.inoculum_tvc_1
                      : 0;
                    let dilution = params.data.dilution_factor_tvc_1
                      ? params.data.dilution_factor_tvc_1
                      : 0;
                    let yellow = params.data.yellow_petri2_tvc_1
                      ? params.data.yellow_petri2_tvc_1
                      : 0;
                    let green = params.data.green_petri2_tvc_1
                      ? params.data.green_petri2_tvc_1
                      : 0;

                    // Helper function to determine the multiplier based on AW8
                    const getMultiplier = (inoculum: number) => {
                      if (inoculum === 50) return 20;
                      if (inoculum === 100) return 10;
                      if (inoculum === 200) return 5;
                      return 0;
                    };

                    const sum = yellow + green;

                    // Case 1: AX8 is 0
                    if (dilution === 0) {
                      if (sum >= 0 && sum <= 250) {
                        params.data.adjusted_count_petri2_tvc_1 =
                          sum * getMultiplier(inoculum);
                        return sum * getMultiplier(inoculum);
                      } else {
                        params.data.adjusted_count_petri2_tvc_1 = 0;
                        return 0;
                      }
                    }

                    // Case 2: AX8 is between 1 and 10
                    if (dilution >= 1 && dilution <= 10) {
                      if (sum >= 25 && sum <= 250) {
                        params.data.adjusted_count_petri2_tvc_1 =
                          sum * getMultiplier(inoculum);
                        return sum * getMultiplier(inoculum);
                      } else {
                        params.data.adjusted_count_petri2_tvc_1 = 0;
                        return 0;
                      }
                    }

                    params.data.adjusted_count_petri2_tvc_1 = 0;
                    return 0;
                  },
                },
              ],
            },
            {
              headerName: "Total Count",
              field: "total_count_tvc_1",
              headerClass: customStyles.header_calculation_bactery_level_5,
              hide: !labCalculation,
              editable: false,
              cellDataType: "number",
              valueGetter: (params) => {
                let petri1 =
                  params.data.adjusted_count_petri1_tvc_1 > 0 ? 1 : 0;
                let petri2 =
                  params.data.adjusted_count_petri2_tvc_1 > 0 ? 1 : 0;
                return petri1 + petri2;
              },
            },
            {
              headerName: "Dilusi 2",
              field: "dilution_factor_tvc_2",
              headerClass: customStyles.header_calculation_bactery_level_4,
              hide: !labCalculation,
              cellEditor: "agSelectCellEditor",
              cellEditorParams: {
                values: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
              },
              cellDataType: "number",
            },
            {
              headerName: "Petri 1",
              headerClass: customStyles.header_calculation_bactery_level_4,
              hide: !labCalculation,
              children: [
                {
                  headerName: "Yellow",
                  field: "yellow_petri1_tvc_2",
                  headerClass: customStyles.header_calculation_bactery_level_5,
                  hide: !labCalculation,
                  cellDataType: "number",
                },
                {
                  headerName: "Green",
                  field: "green_petri1_tvc_2",
                  headerClass: customStyles.header_calculation_bactery_level_5,
                  hide: !labCalculation,
                  cellDataType: "number",
                },
                {
                  headerName: "Black",
                  field: "black_petri1_tvc_2",
                  headerClass: customStyles.header_calculation_bactery_level_5,
                  hide: !labCalculation,
                  cellDataType: "number",
                },
                {
                  headerName: "Adjusted Count",
                  field: "adjusted_count_petri1_tvc_2",
                  headerClass: customStyles.header_calculation_bactery_level_5,
                  hide: !labCalculation,
                  cellDataType: "number",
                  valueGetter: (params) => {
                    let inoculum = params.data.inoculum_tvc_1
                      ? params.data.inoculum_tvc_1
                      : 0;
                    let dilution = params.data.dilution_factor_tvc_2
                      ? params.data.dilution_factor_tvc_2
                      : 0;
                    let yellow = params.data.yellow_petri1_tvc_2
                      ? params.data.yellow_petri1_tvc_2
                      : 0;
                    let green = params.data.green_petri1_tvc_2
                      ? params.data.green_petri1_tvc_2
                      : 0;

                    // Helper function to determine the multiplier based on AW8
                    const getMultiplier = (inoculum: number) => {
                      if (inoculum === 50) return 20;
                      if (inoculum === 100) return 10;
                      if (inoculum === 200) return 5;
                      return 0;
                    };

                    const sum = yellow + green;

                    // Case 1: AX8 is 0
                    if (dilution === 0) {
                      if (sum >= 0 && sum <= 250) {
                        params.data.adjusted_count_petri1_tvc_2 =
                          sum * getMultiplier(inoculum);
                        return sum * getMultiplier(inoculum);
                      } else {
                        params.data.adjusted_count_petri1_tvc_2 = 0;
                        return 0;
                      }
                    }

                    // Case 2: AX8 is between 1 and 10
                    if (dilution >= 1 && dilution <= 10) {
                      if (sum >= 25 && sum <= 250) {
                        params.data.adjusted_count_petri1_tvc_2 =
                          sum * getMultiplier(inoculum);
                        return sum * getMultiplier(inoculum);
                      } else {
                        params.data.adjusted_count_petri1_tvc_2 = 0;
                        return 0;
                      }
                    }

                    params.data.adjusted_count_petri1_tvc_2 = 0;
                    return 0;
                  },
                },
              ],
            },
            {
              headerName: "Petri 2",
              headerClass: customStyles.header_calculation_bactery_level_4,
              hide: !labCalculation,
              children: [
                {
                  headerName: "Yellow",
                  field: "yellow_petri2_tvc_2",
                  headerClass: customStyles.header_calculation_bactery_level_5,
                  hide: !labCalculation,
                  cellDataType: "number",
                },
                {
                  headerName: "Green",
                  field: "green_petri2_tvc_2",
                  headerClass: customStyles.header_calculation_bactery_level_5,
                  hide: !labCalculation,
                  cellDataType: "number",
                },
                {
                  headerName: "Black",
                  field: "black_petri2_tvc_2",
                  headerClass: customStyles.header_calculation_bactery_level_5,
                  hide: !labCalculation,
                  cellDataType: "number",
                },
                {
                  headerName: "Adjusted Count",
                  field: "adjusted_count_petri2_tvc_2",
                  headerClass: customStyles.header_calculation_bactery_level_5,
                  hide: !labCalculation,
                  cellDataType: "number",
                  valueGetter: (params) => {
                    let inoculum = params.data.inoculum_tvc_1
                      ? params.data.inoculum_tvc_1
                      : 0;
                    let dilution = params.data.dilution_factor_tvc_2
                      ? params.data.dilution_factor_tvc_2
                      : 0;
                    let yellow = params.data.yellow_petri2_tvc_2
                      ? params.data.yellow_petri2_tvc_2
                      : 0;
                    let green = params.data.green_petri2_tvc_2
                      ? params.data.green_petri2_tvc_2
                      : 0;

                    // Helper function to determine the multiplier based on AW8
                    const getMultiplier = (inoculum: number) => {
                      if (inoculum === 50) return 20;
                      if (inoculum === 100) return 10;
                      if (inoculum === 200) return 5;
                      return 0;
                    };

                    const sum = yellow + green;

                    // Case 1: AX8 is 0
                    if (dilution === 0) {
                      if (sum >= 0 && sum <= 250) {
                        params.data.adjusted_count_petri2_tvc_2 =
                          sum * getMultiplier(inoculum);
                        return sum * getMultiplier(inoculum);
                      } else {
                        params.data.adjusted_count_petri2_tvc_2 = 0;
                        return 0;
                      }
                    }

                    // Case 2: AX8 is between 1 and 10
                    if (dilution >= 1 && dilution <= 10) {
                      if (sum >= 25 && sum <= 250) {
                        params.data.adjusted_count_petri2_tvc_2 =
                          sum * getMultiplier(inoculum);
                        return sum * getMultiplier(inoculum);
                      } else {
                        params.data.adjusted_count_petri2_tvc_2 = 0;
                        return 0;
                      }
                    }

                    params.data.adjusted_count_petri2_tvc_2 = 0;
                    return 0;
                  },
                },
              ],
            },
            {
              headerName: "Total Count",
              field: "total_count_tvc_2",
              headerClass: customStyles.header_calculation_bactery_level_4,
              hide: !labCalculation,
              editable: false,
              cellDataType: "number",
              valueGetter: (params) => {
                let petri1 =
                  params.data.adjusted_count_petri1_tvc_2 > 0 ? 1 : 0;
                let petri2 =
                  params.data.adjusted_count_petri2_tvc_2 > 0 ? 1 : 0;
                return petri1 + petri2;
              },
            },
          ],
        },
        {
          headerName: "TBC",
          headerClass: customStyles.header_calculation_bactery_level_2,
          hide: !labCalculation,
          children: [
            {
              headerName: "Inoculum",
              field: "inoculum_tbc_1",
              headerClass: customStyles.header_calculation_bactery_level_3,
              hide: !labCalculation,
              cellEditor: "agSelectCellEditor",
              cellEditorParams: {
                values: [50, 100, 200],
              },
              cellDataType: "number",
            },
            {
              headerName: "Dilusi 1",
              field: "dilution_factor_tbc_1",
              headerClass: customStyles.header_calculation_bactery_level_4,
              hide: !labCalculation,
              cellEditor: "agSelectCellEditor",
              cellEditorParams: {
                values: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
              },
              cellDataType: "number",
            },
            {
              headerName: "Petri",
              headerClass: customStyles.header_calculation_bactery_level_4,
              hide: !labCalculation,
              children: [
                {
                  headerName: "Petri 1",
                  field: "petri1_tbc_1",
                  headerClass: customStyles.header_calculation_bactery_level_5,
                  hide: !labCalculation,
                  cellDataType: "number",
                },
                {
                  headerName: "Adjusted Count",
                  field: "adjusted_count_petri1_tbc_1",
                  headerClass: customStyles.header_calculation_bactery_level_5,
                  hide: !labCalculation,
                  cellDataType: "number",
                  valueGetter: (params) => {
                    let inoculum = params.data.inoculum_tbc_1
                      ? params.data.inoculum_tbc_1
                      : 0;
                    let dilution = params.data.dilution_factor_tbc_1
                      ? params.data.dilution_factor_tbc_1
                      : 0;
                    let petri = params.data.petri1_tbc_1
                      ? params.data.petri1_tbc_1
                      : 0;

                    // Helper function to determine the multiplier based on AW8
                    const getMultiplier = (inoculum: number) => {
                      if (inoculum === 50) return 20;
                      if (inoculum === 100) return 10;
                      if (inoculum === 200) return 5;
                      return 0;
                    };

                    const sum = petri;

                    // Case 1: AX8 is 0
                    if (dilution === 0) {
                      if (sum >= 0 && sum <= 250) {
                        params.data.adjusted_count_petri1_tbc_1 =
                          sum * getMultiplier(inoculum);
                        return sum * getMultiplier(inoculum);
                      } else {
                        params.data.adjusted_count_petri1_tbc_1 = 0;
                        return 0;
                      }
                    }

                    // Case 2: AX8 is between 1 and 10
                    if (dilution >= 1 && dilution <= 10) {
                      if (sum >= 25 && sum <= 250) {
                        params.data.adjusted_count_petri1_tbc_1 =
                          sum * getMultiplier(inoculum);
                        return sum * getMultiplier(inoculum);
                      } else {
                        params.data.adjusted_count_petri1_tbc_1 = 0;
                        return 0;
                      }
                    }

                    params.data.adjusted_count_petri1_tbc_1 = 0;
                    return 0;
                  },
                },
                {
                  headerName: "Petri 2",
                  field: "petri2_tbc_1",
                  headerClass: customStyles.header_calculation_bactery_level_5,
                  hide: !labCalculation,
                  cellDataType: "number",
                },
                {
                  headerName: "Adjusted Count",
                  field: "adjusted_count_petri2_tbc_1",
                  headerClass: customStyles.header_calculation_bactery_level_5,
                  hide: !labCalculation,
                  cellDataType: "number",
                  valueGetter: (params) => {
                    let inoculum = params.data.inoculum_tbc_1
                      ? params.data.inoculum_tbc_1
                      : 0;
                    let dilution = params.data.dilution_factor_tbc_1
                      ? params.data.dilution_factor_tbc_1
                      : 0;
                    let petri = params.data.petri2_tbc_1
                      ? params.data.petri2_tbc_1
                      : 0;

                    // Helper function to determine the multiplier based on AW8
                    const getMultiplier = (inoculum: number) => {
                      if (inoculum === 50) return 20;
                      if (inoculum === 100) return 10;
                      if (inoculum === 200) return 5;
                      return 0;
                    };

                    const sum = petri;

                    // Case 1: AX8 is 0
                    if (dilution === 0) {
                      if (sum >= 0 && sum <= 250) {
                        params.data.adjusted_count_petri2_tbc_1 =
                          sum * getMultiplier(inoculum);
                        return sum * getMultiplier(inoculum);
                      } else {
                        params.data.adjusted_count_petri2_tbc_1 = 0;
                        return 0;
                      }
                    }

                    // Case 2: AX8 is between 1 and 10
                    if (dilution >= 1 && dilution <= 10) {
                      if (sum >= 25 && sum <= 250) {
                        params.data.adjusted_count_petri2_tbc_1 =
                          sum * getMultiplier(inoculum);
                        return sum * getMultiplier(inoculum);
                      } else {
                        params.data.adjusted_count_petri2_tbc_1 = 0;
                        return 0;
                      }
                    }

                    params.data.adjusted_count_petri2_tbc_1 = 0;
                    return 0;
                  },
                },
              ],
            },
            {
              headerName: "Total Count",
              field: "total_count_tbc_1",
              headerClass: customStyles.header_calculation_bactery_level_5,
              hide: !labCalculation,
              cellDataType: "number",
              valueGetter: (params) => {
                let petri1 =
                  params.data.adjusted_count_petri1_tbc_1 > 0 ? 1 : 0;
                let petri2 =
                  params.data.adjusted_count_petri2_tbc_1 > 0 ? 1 : 0;
                return petri1 + petri2;
              },
            },
            {
              headerName: "Dilusi 2",
              field: "dilution_factor_tbc_2",
              headerClass: customStyles.header_calculation_bactery_level_4,
              hide: !labCalculation,
              cellEditor: "agSelectCellEditor",
              cellEditorParams: {
                values: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
              },
              cellDataType: "number",
            },
            {
              headerName: "Petri",
              headerClass: customStyles.header_calculation_bactery_level_4,
              hide: !labCalculation,
              children: [
                {
                  headerName: "Petri 1",
                  field: "petri1_tbc_2",
                  headerClass: customStyles.header_calculation_bactery_level_5,
                  hide: !labCalculation,
                  cellDataType: "number",
                },
                {
                  headerName: "Adjusted Count",
                  field: "adjusted_count_petri1_tbc_2",
                  headerClass: customStyles.header_calculation_bactery_level_5,
                  hide: !labCalculation,
                  cellDataType: "number",
                  valueGetter: (params) => {
                    let inoculum = params.data.inoculum_tbc_1
                      ? params.data.inoculum_tbc_1
                      : 0;
                    let dilution = params.data.dilution_factor_tbc_2
                      ? params.data.dilution_factor_tbc_2
                      : 0;
                    let petri = params.data.petri1_tbc_2
                      ? params.data.petri1_tbc_2
                      : 0;

                    // Helper function to determine the multiplier based on AW8
                    const getMultiplier = (inoculum: number) => {
                      if (inoculum === 50) return 20;
                      if (inoculum === 100) return 10;
                      if (inoculum === 200) return 5;
                      return 0;
                    };

                    const sum = petri;

                    // Case 1: AX8 is 0
                    if (dilution === 0) {
                      if (sum >= 0 && sum <= 250) {
                        params.data.adjusted_count_petri1_tbc_2 =
                          sum * getMultiplier(inoculum);
                        return sum * getMultiplier(inoculum);
                      } else {
                        params.data.adjusted_count_petri1_tbc_2 = 0;
                        return 0;
                      }
                    }

                    // Case 2: AX8 is between 1 and 10
                    if (dilution >= 1 && dilution <= 10) {
                      if (sum >= 25 && sum <= 250) {
                        params.data.adjusted_count_petri1_tbc_2 =
                          sum * getMultiplier(inoculum);
                        return sum * getMultiplier(inoculum);
                      } else {
                        params.data.adjusted_count_petri1_tbc_2 = 0;
                        return 0;
                      }
                    }

                    params.data.adjusted_count_petri1_tbc_2 = 0;
                    return 0;
                  },
                },
                {
                  headerName: "Petri 2",
                  field: "petri2_tbc_2",
                  headerClass: customStyles.header_calculation_bactery_level_5,
                  hide: !labCalculation,
                  cellDataType: "number",
                },
                {
                  headerName: "Adjusted Count",
                  field: "adjusted_count_petri2_tbc_2",
                  headerClass: customStyles.header_calculation_bactery_level_5,
                  hide: !labCalculation,
                  cellDataType: "number",
                  valueGetter: (params) => {
                    let inoculum = params.data.inoculum_tbc_1
                      ? params.data.inoculum_tbc_1
                      : 0;
                    let dilution = params.data.dilution_factor_tbc_2
                      ? params.data.dilution_factor_tbc_2
                      : 0;
                    let petri = params.data.petri2_tbc_2
                      ? params.data.petri2_tbc_2
                      : 0;

                    // Helper function to determine the multiplier based on AW8
                    const getMultiplier = (inoculum: number) => {
                      if (inoculum === 50) return 20;
                      if (inoculum === 100) return 10;
                      if (inoculum === 200) return 5;
                      return 0;
                    };

                    const sum = petri;

                    // Case 1: AX8 is 0
                    if (dilution === 0) {
                      if (sum >= 0 && sum <= 250) {
                        params.data.adjusted_count_petri2_tbc_2 =
                          sum * getMultiplier(inoculum);
                        return sum * getMultiplier(inoculum);
                      } else {
                        params.data.adjusted_count_petri2_tbc_2 = 0;
                        return 0;
                      }
                    }

                    // Case 2: AX8 is between 1 and 10
                    if (dilution >= 1 && dilution <= 10) {
                      if (sum >= 25 && sum <= 250) {
                        params.data.adjusted_count_petri2_tbc_2 =
                          sum * getMultiplier(inoculum);
                        return sum * getMultiplier(inoculum);
                      } else {
                        params.data.adjusted_count_petri2_tbc_2 = 0;
                        return 0;
                      }
                    }

                    params.data.adjusted_count_petri2_tbc_2 = 0;
                    return 0;
                  },
                },
              ],
            },
            {
              headerName: "Total Count",
              field: "total_count_tbc_2",
              headerClass: customStyles.header_calculation_bactery_level_5,
              hide: !labCalculation,
              cellDataType: "number",
              valueGetter: (params) => {
                let petri1 =
                  params.data.adjusted_count_petri1_tbc_2 > 0 ? 1 : 0;
                let petri2 =
                  params.data.adjusted_count_petri2_tbc_2 > 0 ? 1 : 0;
                return petri1 + petri2;
              },
            },
          ],
        },
      ],
    },
    {
      headerName: "Calibration Curvature",
      hide: !labCalculation,
      children: [
        {
          headerName: "Nitrit",
          hide: !labCalculation,
          children: [
            {
              headerName: "Slope",
              field: "nitrit_slope",
              cellDataType: "number",
              hide: !labCalculation,
            },
            {
              headerName: "Intercept",
              field: "nitrit_intercept",
              cellDataType: "number",
              hide: !labCalculation,
            },
          ],
        },
        {
          headerName: "Phosphate",
          hide: !labCalculation,
          children: [
            {
              headerName: "Slope",
              field: "phosphat_slope",
              cellDataType: "number",
              hide: !labCalculation,
            },
            {
              headerName: "Intercept",
              field: "phosphat_intercept",
              cellDataType: "number",
              hide: !labCalculation,
            },
          ],
        },
        {
          headerName: "TAN",
          hide: !labCalculation,
          children: [
            {
              headerName: "Slope",
              field: "tan_slope",
              cellDataType: "number",
              hide: !labCalculation,
            },
            {
              headerName: "Intercept",
              field: "tan_intercept",
              cellDataType: "number",
              hide: !labCalculation,
            },
          ],
        },
      ],
    },
  ];

  // Load JSON in here is really difficult
  // Column definitions for Sheet 2
  const [labAnalystColumn, setLabAnalystColumn] =
    useState<(ColDef | ColGroupDef)[]>(colunDefs);

  const handleFunction = function (params: any) {
    let column = params.column.colId;
    let newValue = params.newValue;
    let id = params.data.id;

    let newItem = {
      id: id,
      attribute_name: column,
      value: newValue,
    };

    setArrayedData((prevArrayedData) => [...prevArrayedData, newItem]);
  };

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
  };

  const handleFormulaClick = async () => {
    const res = await fetch("http://localhost:8080/public/v1/ag-grid/metrics", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(arrayedFormulaData),
    });

    const data = await res.json();

    setResponseForulaData(data);
  };

  const handleFormulaValueChange = (params: any, newValue: any) => {
    let column = params.column.colId;
    let id = params.data.id;

    let newItem = {
      id: id,
      attribute_name: column,
      value: newValue,
    };

    setArrayedFormulaData((prevArrayedData) => [...prevArrayedData, newItem]);
  };

  const handleLabAnalystSheet = async () => {
    setLabAnalystSheet(!labAnalystSheet);
    setLabCalculationSheet(!labCalculation);

    setLabAnalystColumn(colunDefs);

    gridApi!.setGridOption("columnDefs", colunDefs);
  };

  // function setHeaderNames() {
  //   COL_DEFS.forEach((colDef, index) => {
  //     colDef.headerName = "C" + index;
  //   });
  //   gridApi!.setGridOption("columnDefs", COL_DEFS);
  // }

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
      pinned: "left",
      checkboxLocation: "autoGroupColumn",
    };
  }, []);

  useEffect(() => {
    async function fetchMetrics() {
      const res = await fetch(
        "http://localhost:8080/public/v1/ag-grid/metrics?disableLimit=true"
      );
      const response = await res.json();
      setMetrics(response.data); // Adjust based on the actual structure of the response
    }
    fetchMetrics();
  }, []);

  // useEffect(() => {
  //   setRowData(data);
  // }, []);

  const cellSelectionMemo = useMemo(() => {
    return {
      handle: {
        mode: "fill",
        direction: "y", // Fill Handle can only be dragged horizontally
      },
    };
  }, []);

  function processHeaderForClipboard(params: ProcessHeaderForExportParams) {
    const colDef = params.column.getColDef();
    let headerName = colDef.headerName || colDef.field || "";

    if (colDef.headerName !== "") {
      headerName = headerName.charAt(0).toUpperCase() + headerName.slice(1);
    }

    return "H-" + headerName;
  }

  function processGroupHeaderForClipboard(
    params: ProcessGroupHeaderForExportParams
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
      {/* {JSON.stringify(arrayedData)}

      {JSON.stringify(responseData)} */}

      {/* {JSON.stringify(arrayedFormulaData)}

      {JSON.stringify(responseFormulaData)} */}

      <button
        onClick={handleButtonClick}
        style={{ padding: "10px 20px", fontSize: "16px" }}
      >
        TOMBOL NGESAVE GAN
      </button>

      <button
        onClick={handleFormulaClick}
        style={{ padding: "10px 20px", fontSize: "16px" }}
      >
        TOMBOL NGESAVE FORMULA GAN
      </button>

      <button
        onClick={handleLabAnalystSheet}
        style={{ padding: "10px 20px", fontSize: "16px" }}
      >
        TOMBOL TOGEL
      </button>

      <div style={{ width: "100%", height: "100vh" }}>
        <AgGridReact
          // rowData={rowData}
          rowData={metrics}
          columnDefs={labAnalystColumn}
          defaultColDef={defaultColDef}
          enableCharts={true} // Enable the Charting features
          cellSelection={cellSelectionMemo}
          animateRows={true}
          rowDragManaged={true}
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
