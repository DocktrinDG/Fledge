import React from "react";
import { Bar } from "react-chartjs-2";
import { CDBContainer } from "cdbreact";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const Chart = ({ chartData }) => {
  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: "top",
      },
      tooltip: {
        enabled: true,
      },
    },
    scales: {
      x: {
        beginAtZero: true,
      },
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <CDBContainer>
      <h3 className="mt-5">Performance Analysis</h3>
      {chartData ? <Bar data={chartData} options={options} /> : <p>Loading...</p>}
    </CDBContainer>
  );
};

export default Chart;
