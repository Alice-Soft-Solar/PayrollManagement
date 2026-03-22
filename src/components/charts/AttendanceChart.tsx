"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { AttendanceTrendPoint } from "@/types/attendance";

interface AttendanceChartProps {
  data: AttendanceTrendPoint[];
}

export const AttendanceChart = ({ data }: AttendanceChartProps) => {
  return (
    <div className="chart-wrap">
      <ResponsiveContainer width="100%" height={280} minWidth={0} minHeight={280}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="presentGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2563eb" stopOpacity={0.6} />
              <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Area
            type="monotone"
            dataKey="presentCount"
            stroke="#2563eb"
            fill="url(#presentGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
