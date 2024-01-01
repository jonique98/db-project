import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import '../index.css';
import util from '../util/util.js';
import axios from 'axios';
import { useState, useEffect } from 'react';

import MyChart from './MyChart.js';
import MyChartSmall from './MyChartSmall.js';
import { useMyChart } from './MyChartContext.js';




function Modal({ selectedRow, handleClosePopup, findTitle, findArtist, findImg, myChart }) {

  const { updateMyChart } = useMyChart();
  
  const [list, setList] = useState({});
  const [myList, setMyList] = useState(myChart);
  
  const [melon, setmelon] = useState([]);
  const [genie, setgenie] = useState([]);
  const [bugs, setbugs] = useState([]);

  useEffect(() => {
    const uploadListToDatabase = async () => {
      try {
        await axios.post('http://localhost:3001/my-list-upload', {title: list.title, artist: list.artist });

        const response = await axios.get('http://localhost:3001/my-list');
        updateMyChart(response.data);
        setMyList(response.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    // list 상태가 변경될 때마다 데이터베이스에 업로드
    if (Object.keys(list).length > 0) {
      uploadListToDatabase();
    }
  }, [list]);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:3001/melon_rank');
        setmelon(response.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData(); // Fetch data when the component mounts
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:3001/genie_rank');
        setgenie(response.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }

    fetchData(); // Fetch data when the component mounts
  }, []);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:3001/bugs_rank');
        setbugs(response.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }
    fetchData(); // Fetch data when the component mounts
  }, []);


  function findMelonChange(title) {
    for (let i = 0; i < melon.length; i++) {
      if (util.cleanTitle(melon[i].title) === title) {
        return melon[i].change;
      }
    }
  }

  function findGenieChange(title) {
    for (let i = 0; i < genie.length; i++) {
      if (util.cleanTitle(genie[i].title) === title) {
        return genie[i].change;
      }
    }
  }

  function findBugsChange(title) {
    for (let i = 0; i < bugs.length; i++) {
      if (util.cleanTitle(bugs[i].title) === title) {
        return bugs[i].change;
      }
    }
  }

  const modalStyle = {
    display: 'block',
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: '#428bca', // 랜덤 컬러 적용
    padding: '15px',
    zIndex: 1000,
    boxShadow: '0 0 100px rgba(0, 0, 0, 0.3)',
    color: '#ddd',
    borderRadius: '5px',
    textAlign: 'center',
  };

  const handleBackgroundClick = (event) => {
    if (event.target.id === 'modal') {
      handleClosePopup();
    }
  };

  const addMyList = (selectedRow) => {
    setList(selectedRow);
  }

  return (
    selectedRow && (
      <div id="modal" style={modalStyle} onClick={handleBackgroundClick}>
        <div className="modal-header">
          <h4 className="modal-title">{findTitle(selectedRow.title)}</h4>
          <button type="button" className="btn-close" onClick={handleClosePopup} />
        </div>
        <div className="modal-body">
          <div className="row">
            <div className="col-4">
              <img src={findImg(selectedRow.title)} width="200" height="200" alt={`Album cover for ${selectedRow.title}`} />
            </div>
            <div className="col-8">
              <p>Artist: {findArtist(selectedRow.artist)}</p>
              <p>Melon Change: {findMelonChange(selectedRow.title)}</p>
              <p>Bugs Change: {findBugsChange(selectedRow.title)}</p>
              <p>Genie Change: {findGenieChange(selectedRow.title)}</p>
              <p>weight: {selectedRow.weight}</p>
            </div>
          </div>
        </div>
        {/* 추가 버튼 */}
        <button onClick={() => addMyList(selectedRow)} type="button" className="btn btn-primary">
          추가
        </button>
        {myList && <MyChartSmall data={myList} />}
      </div>
    )
  );
}



export default Modal;