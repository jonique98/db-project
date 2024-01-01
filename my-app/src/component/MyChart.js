import React, { useEffect } from 'react';
import { useMyChart } from './MyChartContext';
import axios from 'axios';
import playButtonImage from '../img/free-icon-play-button-375.png';

function MyChart() {
  const { myChartData, updateMyChart } = useMyChart();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:3001/my-list'); // Adjust the API endpoint
        updateMyChart(response.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData(); // Fetch data when the component mounts
  }, [updateMyChart]);

  const handleDelete = async (item) => {
    try {
      await axios.delete(`http://localhost:3001/my-chart/${item.id}`); // Adjust the API endpoint
      const updatedData = myChartData.filter((data) => data.id !== item.id);
      updateMyChart(updatedData);
    } catch (error) {
      console.error('Error deleting data:', error);
    }
  };

	return (
		<div id="my-chart" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
			<div style={{ height: '50px' }}></div>
			<h2>My Chart</h2>
			<table className="table" style={{ maxWidth: '600px' }}>
				<thead>
					<tr>
						<th>Album</th>
						<th>Title</th>
						<th>Artist</th>
						<th>재생</th>
						<th>삭제</th>
						{/* Add more columns based on your data structure */}
					</tr>
				</thead>
				<tbody>
					{myChartData.map((item, index) => (
						<tr key={index}>
							<td>
								<img src={item.img} width="50" height="50" alt={`Album cover for ${item.title}`} />
							</td>
							<td>{item.title}</td>
							<td>{item.artist}</td>
							<td><img src={playButtonImage} style={{ width: '30px', height: '30px' }} alt="Play button" /></td>
							<td>
								<button
									type="button"
									className="btn btn-primary"
									onClick={() => handleDelete(item)}
								>
									삭제
								</button>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}

export default MyChart;