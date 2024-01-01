import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Statistics1({ statistics_name, sw }) {
	const [frequency, setFrequency] = useState([]);
	const [maxChangeData, setMaxChangeData] = useState({});
  
	const [melon, setMelon] = useState([]);
	const [img, setImg] = useState(null);
	
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch the most frequent artist
        const responseFrequency = await axios.get('http://localhost:3001/most_frequency_artist');
        const match = await axios.get(`http://localhost:3001/right_artist/${responseFrequency.data.mostFrequentArtist}`);

        responseFrequency.data.mostFrequentArtist = match.data.name;
        setFrequency(responseFrequency.data);

        // Fetch melon rank data
        const matchingMelonData = await axios.get(`http://localhost:3001/find_img/${responseFrequency.data.mostFrequentArtist}`);

        if (matchingMelonData) {
          setImg(matchingMelonData.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData(); // Fetch data when the component mounts
  }, []);

  return (
    <div className="col-2" style={{ position: 'relative' }}>
      {/* 박스 위에 글자(제목) */}
      <p style={{ textAlign: 'center', fontSize: '20px', marginTop: '15px', width: '90%', position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', zIndex: 1 }}>
        {statistics_name}
      </p>
      {/* 나머지 내용 */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <p id = 'stat' style={{ marginTop: '30px' }}>{`${frequency.mostFrequentArtist}`}</p>
        {img && <img src={img} width="150" height="150" alt={`Album cover for ${statistics_name}`} />}
        <p id = 'stat'>{frequency.frequency}곡</p>
      </div>
    </div>
  );
}

function cleanTitle(title) {
  let cleanedTitle = '';

  // 괄호 이전까지의 문자만 남김
  for (let i = 0; i < title.length; i++) {
    if (title[i] === '(') {
      break;
    }
    cleanedTitle += title[i];
  }

  // 쉼표와 온점을 제외한 특수문자와 공백 제거
  cleanedTitle = cleanedTitle.replace(/[^\w\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F,.]/g, '');

  return cleanedTitle.toLowerCase();
}

function cleanArtistName(artist) {
  let cleanedArtist = '';

  let insideParentheses = false;

  for (let i = 0; i < artist.length; i++) {
    if (artist[i] === '(') {
      insideParentheses = true;
      continue;
    }

    if (artist[i] === ')' && insideParentheses) {
      insideParentheses = false;
      continue;
    }

    if (!insideParentheses) {
      cleanedArtist += artist[i];
    }
  }

  // artist에서 한글, 영어, 숫자만 남기고 나머지는 제거
  cleanedArtist = cleanedArtist.replace(/[^\w\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F]/g, '');

  return cleanedArtist.toLowerCase();
}

export default Statistics1;
