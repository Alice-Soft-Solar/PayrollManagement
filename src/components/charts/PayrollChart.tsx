"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { PayrollDistribution } from "@/types/payroll";

interface PayrollChartProps {
  data: PayrollDistribution[];
}

const palette = ["#2563eb", "#1d4ed8", "#60a5fa", "#93c5fd"];

export const PayrollChart = ({ data }: PayrollChartProps) => {
  return (
    <div className="chart-wrap">
      <ResponsiveContainer width="100%" height={280} minWidth={0} minHeight={280}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="label"
            innerRadius={60}
            outerRadius={95}
            paddingAngle={4}
          >
            {data.map((entry, index) => (
              <Cell key={entry.label} fill={palette[index % palette.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
