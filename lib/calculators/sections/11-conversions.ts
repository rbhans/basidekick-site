import type { CalcSection } from "../types";

export const section11: CalcSection = {
  num: "11",
  title: "Unit conversions",
  calculators: [
    {
      id: "pressure-conversion-calculator",
      title: "Pressure",
      inputs: [
        { key: "value", kind: "number", label: "Value", default: "1" },
        {
          key: "unit",
          kind: "select",
          label: "Unit",
          default: "iwc",
          options: [
            { value: "iwc", label: "in WC" },
            { value: "pa", label: "Pa" },
            { value: "psi", label: "PSI" },
            { value: "kpa", label: "kPa" },
          ],
        },
      ],
      compute: (v) => {
        const val = parseFloat(v.value);
        if (Number.isNaN(val)) {
          return [
            { label: "in WC", value: "—" },
            { label: "Pa", value: "—" },
            { label: "PSI", value: "—" },
            { label: "kPa", value: "—" },
          ];
        }
        let iwc: number;
        switch (v.unit) {
          case "pa":
            iwc = val / 249.09;
            break;
          case "psi":
            iwc = val * 27.68;
            break;
          case "kpa":
            iwc = val * 4.0147;
            break;
          case "iwc":
          default:
            iwc = val;
        }
        return [
          { label: "in WC", value: iwc.toFixed(3) },
          { label: "Pa", value: (iwc * 249.09).toFixed(2) },
          { label: "PSI", value: (iwc / 27.68).toFixed(4) },
          { label: "kPa", value: (iwc / 4.0147).toFixed(4) },
        ];
      },
    },
    {
      id: "airflow-cfm-conversion-calculator",
      title: "Airflow",
      inputs: [
        { key: "value", kind: "number", label: "Value", default: "1000" },
        {
          key: "unit",
          kind: "select",
          label: "Unit",
          default: "cfm",
          options: [
            { value: "cfm", label: "CFM" },
            { value: "ls", label: "L/s" },
            { value: "m3h", label: "m³/h" },
          ],
        },
      ],
      compute: (v) => {
        const val = parseFloat(v.value);
        if (Number.isNaN(val)) {
          return [
            { label: "CFM", value: "—" },
            { label: "L/s", value: "—" },
            { label: "m³/h", value: "—" },
          ];
        }
        let cfm: number;
        switch (v.unit) {
          case "ls":
            cfm = val * 2.119;
            break;
          case "m3h":
            cfm = val * 0.5886;
            break;
          case "cfm":
          default:
            cfm = val;
        }
        return [
          { label: "CFM", value: cfm.toFixed(1) },
          { label: "L/s", value: (cfm / 2.119).toFixed(2) },
          { label: "m³/h", value: (cfm / 0.5886).toFixed(1) },
        ];
      },
    },
    {
      id: "temperature-conversion-calculator",
      title: "Temperature",
      inputs: [
        { key: "value", kind: "number", label: "Value", default: "72" },
        {
          key: "unit",
          kind: "select",
          label: "Unit",
          default: "f",
          options: [
            { value: "f", label: "°F" },
            { value: "c", label: "°C" },
            { value: "k", label: "K" },
          ],
        },
      ],
      compute: (v) => {
        const val = parseFloat(v.value);
        if (Number.isNaN(val)) {
          return [
            { label: "°F", value: "—" },
            { label: "°C", value: "—" },
            { label: "K", value: "—" },
          ];
        }
        let f: number;
        switch (v.unit) {
          case "c":
            f = (val * 9) / 5 + 32;
            break;
          case "k":
            f = ((val - 273.15) * 9) / 5 + 32;
            break;
          case "f":
          default:
            f = val;
        }
        return [
          { label: "°F", value: f.toFixed(2) },
          { label: "°C", value: (((f - 32) * 5) / 9).toFixed(2) },
          { label: "K", value: ((((f - 32) * 5) / 9) + 273.15).toFixed(2) },
        ];
      },
    },
  ],
};
