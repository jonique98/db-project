import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Statistics2({ statistics_name }) {
  const [maxChangeData, setMaxChangeData] = useState({});
  const [melon, setMelon] = useState({});
  const [genie, setGenie] = useState({});
  const [img, setImg] = useState(null);

  useEffect(() => {
    const fetchData = async () => {

        const response = await axios.get('http://localhost:3001/find_max_change_title');

        const match = await axios.get(`http://localhost:3001/right_title/${response.data.maxChangeTitle}`);
        response.data.maxChangeTitle = match.data.name;
        setMaxChangeData(response.data);


        const titleToFind = response.data.maxChangeTitle;

        const genieRankResponse = await axios.get('http://localhost:3001/genie_rank');
        setGenie(genieRankResponse.data);

        const matchingGenieData = genieRankResponse.data.find(
          (item) => cleanTitle(item.title_nospace) === cleanTitle(titleToFind)
        );

        if(matchingGenieData) {
          setImg(matchingGenieData.img);
        }
        else{
          const melonRankResponse = await axios.get('http://localhost:3001/melon_rank');
          setMelon(melonRankResponse.data);
        // Find the matching melon data for the title
          const matchingMelonData = melonRankResponse.data.find(
            (item) => cleanTitle(item.title_nospace).substring(0.4) === cleanTitle(titleToFind).subsstring(0.4)(0,4)
          );
    
          // Only set the image if matchingMelonData is available
          if (matchingMelonData) {
            setImg(matchingMelonData.img);
          } else {
            setImg(null); // Set img to null if matchingMelonData is not available
          }
        }
    };
  
    fetchData(); // Fetch data when the component mounts
  }, []); // Empty dependency array to run only once

  // const findImg = (title_nospace) => {


  //   const match2 = genie.find((i) => cleanTitle(i.title) === cleanTitle(title_nospace));
  //   if(match2){
  //     setImg(match2.img)
  //   }
    
	// 	const match = melon.find((i) => cleanTitle(i.title) === cleanTitle(title_nospace));
  //   if(match)
  //     setImg(match.img);
	// }

  return (
    <div className="col-2" style={{ position: 'relative' }}>
      <p style={{ textAlign: 'center', fontSize: '20px', marginTop: '15px', width: '90%', position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', zIndex: 1 }}>
        {statistics_name}
      </p>
      {/* 나머지 내용 */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <p id='stat' style={{ marginTop: '30px' }}> {maxChangeData.maxChangeTitle} </p>
        <img src={img} width="150" height="150" alt={`Album cover for ${maxChangeData.maxChangeTitle}`} />
        <p id='stat'>{maxChangeData.maxChange}계단 상승</p>
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

  return cleanedArtist;
}

export default Statistics2;