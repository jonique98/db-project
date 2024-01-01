import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../index.css';


import util from '../util/util.js';
import Modal from './modal.js';

function List() {
  const [data, setData] = useState([]);
  const [title, setTitle] = useState([]);
  const [artist, setArtist] = useState([]);
	const [img, setImg] = useState([]);
  const [img2, setImg2] = useState([]);
	const [selectedRow, setSelectedRow] = useState(null);
  const [myList, setMyList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:3001/my-list');
        setMyList(response.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData(); // Fetch data when the component mounts
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:3001/weight_list');
        setData(response.data);

      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData(); // Fetch data when the component mounts
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:3001/all_title');
        setTitle(response.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData(); // Fetch data when the component mounts
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:3001/all_artist');
        setArtist(response.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData(); // Fetch data when the component mounts
  }, []);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await axios.get('http://localhost:3001/melon_rank');
				setImg(response.data);
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
				setImg2(response.data);
			} catch (error) {
				console.error('Error fetching data:', error);
			}
		};

		fetchData(); // Fetch data when the component mounts
	}, []);

  // Function to find the matching title
  const findTitle = (title_nospace) => {
    const match = title.find((t) => util.cleanTitle(t.title_nospace) === util.cleanTitle(title_nospace));
    return match ? match.title : title_nospace;;
  };

  // Function to find the matching artist
  const findArtist = (artist_nospace) => {
    const match = artist.find((a) => a.artist_nospace === util.cleanArtistName(artist_nospace));
    return match ? match.artist : artist_nospace;
  };

	const findImg = (title_nospace) => {

    const match2 = img2.find((i) => util.cleanTitle(i.title) === util.cleanTitle(title_nospace));
    if(match2){
      return match2.img;
    }
    
		const match = img.find((i) => util.cleanTitle(i.title) === util.cleanTitle(title_nospace));
    if(match)
      return match.img;
	}

  const handleClosePopup = () => {
    setSelectedRow(null);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < Math.ceil(data.length / 50)) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className="container">
      <table className="rwd-table" style={{ width: '50%' }}>
        <tbody>
          <tr>
            <th>순위</th>
            <th>앨범</th>
            <th>곡 정보</th>
            <th><a href="https://www.melon.com/chart/index.htm" color="black">멜론 순위</a></th>
            <th><a href="https://music.bugs.co.kr/chart/track/realtime/total?wl_ref=M_contents_03_01">벅스 순위</a></th>
            <th><a href="https://www.genie.co.kr/chart/top200">지니 순위</a></th>
          </tr>
          {data.slice((currentPage - 1) * 50, currentPage * 50).map((item, index) => (
            <tr key={index} onClick={() => setSelectedRow(item)}>
              <td data-th="순위">{(currentPage -1) * 50 + index + 1}</td>
            <td data-th="앨범">
              <img src={findImg(item.title)} width="70" height="70" alt={`Album cover for ${item.title}`} />
            </td>
            <td data-th="곡 정보" className="song-info">
              <div className="song-title">{findTitle(item.title)}</div>
              <div className="artist">{findArtist(item.artist)}</div>
            </td>
            <td data-th="멜론 순위" >{item.melon_rank}</td>
            <td data-th="벅스 순위">{item.bugs_rank}</td>
            <td data-th="지니 순위">{item.genie_rank}</td>
            </tr>
          ))}
        </tbody>
      </table>

     {/* 팝업 모달 */}
		 {selectedRow && (
        <Modal
          selectedRow={selectedRow}
          handleClosePopup={handleClosePopup}
          findTitle={findTitle}
          findArtist={findArtist}
          findImg={findImg}
          myChart={myList}
        />
      )}
        <h3>
        <button onClick={handlePrevPage}>Prev</button>
        <button onClick={handleNextPage}>Next</button>
      </h3>
    </div>
  );
}

export default List;