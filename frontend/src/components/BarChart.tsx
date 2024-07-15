/* eslint-disable @typescript-eslint/no-explicit-any */
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, Title, Tooltip, Legend, BarElement } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const BarChart = ({ marks, examType }:{marks : any , examType : string| undefined}) => {
  const filteredMarks = marks.filter((mark : any) => mark.examinationType === examType);

  const data = {
    labels: filteredMarks.map((mark : any) => mark.subjectName),
    datasets: [
      {
        label: 'Obtained Marks',
        data: filteredMarks.map((mark : any) => mark.obtainedMarks),
        backgroundColor: 'rgba(75,192,192,0.6)',
      },
      {
        label: 'Total Marks',
        data: filteredMarks.map((mark : any) => mark.totalMarks),
        backgroundColor: 'rgba(153,102,255,0.6)',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: `Bar Chart for ${examType} Exam`,
        color: '#000',
        font: {
            weight: 'bold',
            size: 16,
        },
      },
    },

    layout: {
        padding: {
          left: 50,
          right: 50,
          top: 0,
          bottom: 0,
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'SUBJECTS',
            color: '#000',
            font: {
              weight: 'bold',
              size: 16,
            },
          },
        },
        y: {
          title: {
            display: true,
            text: 'MARKS',
            color: '#000',
            font: {
              weight: 'bold',
              size: 16,
            },
          },
        },
      },


  };
  return <div style={{ width: '1000px', height: '650px', backgroundColor :"#e2e2e2", borderRadius : "20px" }}><Bar data={data} options={options} /> </div> ;
};

export default BarChart;
