import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import type { Job, Status } from "@/lib/types";

interface Props {
  jobs: Job[];
  statuses: Status[];
  onSliceClick?: (status: string) => void;
}

export function StatusPieChart({ jobs, statuses, onSliceClick }: Props) {
  const data = statuses
    .map((s) => ({
      name: s.name,
      value: jobs.filter((j) => j.currentStatus === s.name).length,
      color: s.color,
    }))
    .filter((d) => d.value > 0);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        No jobs yet
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          outerRadius={70}
          dataKey="value"
          label={({ name, value }) => `${name}: ${value}`}
          onClick={(_, index) => onSliceClick?.(data[index].name)}
          className="cursor-pointer"
        >
          {data.map((entry, index) => (
            <Cell key={index} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
}
