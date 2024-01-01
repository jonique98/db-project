import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Statistics3({ statistics_name }) {
  const [minDeviation, setMinDeviation] = useState({});
  const [img, setImg] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch the title with the minimum deviation
        const response = await axios.get('http://localhost:3001/min_deviation_title');
        const match = await axios.get(`http://localhost:3001/right_title/${response.data.minDeviationTitle}`);
        response.data.minDeviationTitle = match.data.name;

        setMinDeviation(response.data);

        // Fetch melon rank data
        const melonRankResponse = await axios.get('http://localhost:3001/melon_rank');
        const melonData = melonRankResponse.data;

        // Find the matching melon data for the title
        const matchingMelonData = melonData.find(
          (item) => cleanTitle(item.title.toLowerCase()) === cleanTitle(response.data.minDeviationTitle.toLowerCase())
        );

        if (matchingMelonData) {
          setImg(matchingMelonData.img);
        } else {
          setImg(null);
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
      <p
        style={{
          textAlign: 'center',
          fontSize: '20px',
          marginTop: '15px',
          width: '90%',
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1,
        }}
      >
        {statistics_name}
      </p>
      {/* 나머지 내용 */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <p id = 'stat' style={{ marginTop: '30px' }}>{`${minDeviation.minDeviationTitle}`}</p>
        {img && <img src={img} width="150" height="150" alt={`Album cover for ${minDeviation.minDeviationTitle}`} />}
        <p id = 'stat'>차트 간 편차의 합 {minDeviation.minDeviation}</p>
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

  return cleanedTitle;
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

  return cleanedArtist;
}

export default Statistics3;