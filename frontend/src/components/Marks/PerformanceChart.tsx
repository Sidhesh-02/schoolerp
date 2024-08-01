/* eslint-disable @typescript-eslint/no-explicit-any */
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ChartOptions } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const PerformanceChart = ({ marks, examType } : {marks : any , examType : string| undefined}) => {
  const filteredMarks = marks.filter((mark : any) => mark.examinationType === examType);

  const data = {
    labels: filteredMarks.map((mark : any) => mark.subjectName),
    datasets: [
      {
        label: 'Obtained Marks',
        data: filteredMarks.map((mark : any)=> mark.obtainedMarks),
        borderColor: 'rgba(75,192,192,1)',
        backgroundColor: 'rgba(75,192,192,0.2)',
        fill: true,
      },
      {
        label: 'Total Marks',
        data: filteredMarks.map((mark : any) => mark.totalMarks),
        borderColor: 'rgba(153,102,255,1)',
        backgroundColor: 'rgba(153,102,255,0.2)',
        fill: true,
      },
    ],
  };

  const options: ChartOptions<"line"> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: `Performance Chart for ${examType} Exam`,
        color: '#000',
        font: {
            weight: 'bold',
            size: 16,
        },
      },
    },
  };
  
  return  <div style={{ width: '1000px', height: '650px', backgroundColor :"#e2e2e2" , borderRadius : "20px", padding:"10px" }}><Line data={data} options={options} /></div>;
};

export default PerformanceChart;
