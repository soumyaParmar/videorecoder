/* eslint-disable react/prop-types */
// eslint-disable-next-line react/prop-types

// import React, { useEffect, useState } from "react";
// import PitchFinder from "pitchfinder";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
} from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, Title);

const PitchDetector = (props) => {
  return (
    <div style={{ textAlign: "center", marginTop: "240px", marginRight:"120px"}}>
      <div
        style={{
          marginTop: "180px",
          width: "20px",
          height: "200px",
          margin: "auto",
        }}
      >
        <Bar
          data={props.data}
          options={{
            indexAxis: "x",
            scales: {
              x: {
                display: false,
                beginAtZero: true,
                suggestedMax: 1000,
              },
              y: {
                display: false,
              },
            },
            elements: {
              bar: {
                borderWidth: 0,
                barPercentage: 0.5, // Narrower bar width
              },
            },
            plugins: {
              legend: { display: false },
              tooltip: { enabled: false },
            },
            responsive: true,
            maintainAspectRatio: false,
          }}
        />
      </div>
    </div>
  );
};

export default PitchDetector;
