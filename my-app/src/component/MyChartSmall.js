import React from 'react';
import { useMyChart } from './MyChartContext.js';

function MyChartSmall() {
  const { myChartData } = useMyChart();

  return (
    <div>
      <h2>My Chart</h2>
      <table className="table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Artist</th>
            {/* Add more columns based on your data structure */}
          </tr>
        </thead>
        <tbody>
          {myChartData.map((item, index) => (
            <tr key={index}>
              <td>{item.title}</td>
              <td>{item.artist}</td>
              {/* Add more cells based on your data structure */}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default MyChartSmall;