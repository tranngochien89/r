'use client';

import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';

const candidatesByStageData = [
  { stage: 'Applied', count: 45 },
  { stage: 'Screening', count: 28 },
  { stage: 'Interview', count: 15 },
  { stage: 'Offered', count: 5 },
  { stage: 'Hired', count: 2 },
];

const timeToHireData = [
  { month: 'Jan', days: 35 },
  { month: 'Feb', days: 32 },
  { month: 'Mar', days: 41 },
  { month: 'Apr', days: 38 },
  { month: 'May', days: 29 },
  { month: 'Jun', days: 34 },
];

const chartConfig = {
  count: {
    label: 'Candidates',
    color: 'hsl(var(--primary))',
  },
  days: {
    label: 'Days',
    color: 'hsl(var(--accent))',
  },
};

export default function ReportsPage() {
  return (
    <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Candidate Pipeline</CardTitle>
          <CardDescription>Number of candidates in each recruitment stage.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={candidatesByStageData} margin={{ top: 20, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="stage" tickLine={false} tickMargin={10} axisLine={false} />
                <YAxis />
                <Tooltip cursor={false} content={<ChartTooltipContent />} />
                <Bar dataKey="count" fill="var(--color-count)" radius={4} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Average Time to Hire</CardTitle>
          <CardDescription>Average number of days to fill a position per month.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeToHireData} margin={{ top: 20, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
                <YAxis />
                <Tooltip cursor={false} content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="days" stroke="var(--color-days)" strokeWidth={3} dot={{r: 6, fill: 'var(--color-days)'}} activeDot={{r:8}}/>
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
