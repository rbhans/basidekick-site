import type { CalcSection } from "../types";

export const section07: CalcSection = {
  num: "07",
  title: "Scheduling & time",
  calculators: [
    {
      id: "optimal-stop-time-calculator",
      title: "Optimal Stop Time",
      note: "Simple coast-time subtraction. Validate comfort drift before enabling stop optimization.",
      inputs: [
        { key: "coastTime", kind: "number", label: "Coast Time", unit: "min", default: "30" },
        { key: "occEnd", kind: "text", label: "Occupancy End", default: "17:00" },
      ],
      compute: (v) => {
        const coast = parseInt(v.coastTime, 10);
        if (Number.isNaN(coast) || !v.occEnd) {
          return [{ label: "Equipment Stop Time", value: "—" }];
        }
        const [h, m] = v.occEnd.split(":").map(Number);
        let stopM = h * 60 + m - coast;
        if (stopM < 0) stopM += 24 * 60;
        const stopH = Math.floor(stopM / 60);
        const stopMin = stopM % 60;
        return [
          {
            label: "Equipment Stop Time",
            value: `${stopH.toString().padStart(2, "0")}:${stopMin.toString().padStart(2, "0")}`,
          },
        ];
      },
    },
    {
      id: "holiday-date-calculator",
      title: "Holiday Date (nth Weekday)",
      note: "Useful for BAS exception schedule dates like fourth Thursday or last Monday.",
      inputs: [
        {
          key: "month",
          kind: "select",
          label: "Month",
          default: "11",
          options: Array.from({ length: 12 }, (_, i) => ({
            value: String(i + 1),
            label: new Date(2024, i).toLocaleString("default", { month: "long" }),
          })),
        },
        {
          key: "nth",
          kind: "select",
          label: "Which",
          default: "4",
          options: [
            { value: "1", label: "1st" },
            { value: "2", label: "2nd" },
            { value: "3", label: "3rd" },
            { value: "4", label: "4th" },
            { value: "-1", label: "Last" },
          ],
        },
        {
          key: "dayOfWeek",
          kind: "select",
          label: "Day of Week",
          default: "4",
          options: [
            { value: "0", label: "Sunday" },
            { value: "1", label: "Monday" },
            { value: "2", label: "Tuesday" },
            { value: "3", label: "Wednesday" },
            { value: "4", label: "Thursday" },
            { value: "5", label: "Friday" },
            { value: "6", label: "Saturday" },
          ],
        },
        { key: "year", kind: "number", label: "Year", default: "2026" },
      ],
      compute: (v) => {
        const month = parseInt(v.month, 10);
        const nth = parseInt(v.nth, 10);
        const dayOfWeek = parseInt(v.dayOfWeek, 10);
        const year = parseInt(v.year, 10);
        if ([month, nth, dayOfWeek, year].some(Number.isNaN)) {
          return [{ label: "Date", value: "—" }];
        }
        if (nth === -1) {
          for (let d = 31; d >= 1; d--) {
            const date = new Date(year, month - 1, d);
            if (date.getMonth() !== month - 1) continue;
            if (date.getDay() === dayOfWeek) {
              return [
                {
                  label: "Date",
                  value: date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
                },
              ];
            }
          }
        }
        let count = 0;
        for (let d = 1; d <= 31; d++) {
          const date = new Date(year, month - 1, d);
          if (date.getMonth() !== month - 1) break;
          if (date.getDay() === dayOfWeek) {
            count++;
            if (count === nth) {
              return [
                {
                  label: "Date",
                  value: date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
                },
              ];
            }
          }
        }
        return [{ label: "Date", value: "Invalid" }];
      },
    },
    {
      id: "occupied-hours-per-year-calculator",
      title: "Occupied Hours per Year",
      note: "Handles overnight schedules by rolling the end time into the next day.",
      inputs: [
        { key: "start", kind: "text", label: "Start Time", default: "07:00" },
        { key: "end", kind: "text", label: "End Time", default: "18:00" },
        { key: "days", kind: "number", label: "Days per Week", default: "5" },
      ],
      compute: (v) => {
        if (!v.start || !v.end) {
          return [{ label: "Hours per Year", value: "—", unit: "hrs" }];
        }
        const [sh, sm] = v.start.split(":").map(Number);
        const [eh, em] = v.end.split(":").map(Number);
        const days = parseInt(v.days, 10);
        if (Number.isNaN(days)) {
          return [{ label: "Hours per Year", value: "—", unit: "hrs" }];
        }
        let minutesPerDay = eh * 60 + em - (sh * 60 + sm);
        if (minutesPerDay < 0) minutesPerDay += 24 * 60;
        const hoursPerDay = minutesPerDay / 60;
        const weeksPerYear = 52;
        const total = hoursPerDay * days * weeksPerYear;
        return [{ label: "Hours per Year", value: total.toFixed(0), unit: "hrs" }];
      },
    },
    {
      id: "trend-sample-rate-calculator",
      title: "Trend Sample Rate",
      note: "Starting point for trend setup. Alarms, diagnostics, and metering may need faster or COV logging.",
      inputs: [
        {
          key: "process",
          kind: "select",
          label: "Process Type",
          default: "temperature",
          options: [
            { value: "temperature", label: "Temperature" },
            { value: "pressure", label: "Pressure" },
            { value: "flow", label: "Flow" },
            { value: "status", label: "Binary Status" },
            { value: "power", label: "Power/Energy" },
            { value: "humidity", label: "Humidity" },
          ],
        },
      ],
      compute: (v) => {
        const recommendations: Record<string, string> = {
          temperature: "5-15 min (slow thermal mass)",
          pressure: "1-5 min (moderate dynamics)",
          flow: "1-5 min (moderate dynamics)",
          status: "1 min or COV (binary states)",
          power: "15 min (energy totalization)",
          humidity: "5-15 min (slow response)",
        };
        return [{ label: "Recommended Interval", value: recommendations[v.process] || "—" }];
      },
    },
  ],
};
