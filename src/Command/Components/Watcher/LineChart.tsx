import Chart from "react-apexcharts";
import "./LineChart.css";
import { ErrorBoundary } from "react-error-boundary";
import React, { PureComponent } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

type PropTypes = {
  chartData: number[];
};

const MyLineChart = ({ chartData }: PropTypes) => {
  var options = {
    chart: {
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },
    },
    grid: {
      show: false,
    },
    stroke: {
      width: [2, 2],
    },
    xaxis: {
      labels: {
        show: false,
      },
      tooltip: {
        enabled: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: [
      {
        show: false,
      },
    ],
    
    tooltip: {
      enabled: false,
    },
  };

  const series: any = []

  // let cd = [1,2,3,1,2,0];
  // cd.forEach((datum) => series.push({data: datum}))
  chartData.forEach((datum) => series.push({data: datum}))

  // const series = [
  //   {
  //     data: chartData,
  //   },
  // ];
  
  return (
    <div className="line-chart">
       {/* <ErrorBoundary fallback={<div></div>}><Chart type="line" options={options} series={series} height="100%" /></ErrorBoundary> */}
       <LineChart width={300} height={100} data={series}>
        <Line type="monotone" dataKey="data" stroke="#8884d8" strokeWidth={2} />
      </LineChart>
    </div>
  );
};

export default MyLineChart;
