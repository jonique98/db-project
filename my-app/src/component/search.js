import React, { useState, useEffect } from 'react';
import { InputGroup, DropdownButton, Dropdown, Form, Table } from 'react-bootstrap';
import axios from 'axios';

function Search() {
  const [searchTerm, setSearchTerm] = useState('');
  const [freqdata, setFreqData] = useState({});
  const [highdata, setHighData] = useState({});
  const [titledata, setTitleData] = useState({});
  const [changedata, setChangeData] = useState({});
  const [bool, setBool] = useState(false);

    const fetchSearchData = async () => {
      const cleanedSearchTerm = cleanArtistName(searchTerm);

      try {

        const frequent_response = await axios.get(`http://localhost:3001/search_first/${cleanedSearchTerm}`);
        setFreqData(frequent_response.data);
  
        const high_response = await axios.get(`http://localhost:3001/search_second/${cleanedSearchTerm}`);
        setHighData(high_response.data);
     
        const title_response = await axios.get(`http://localhost:3001/search_third/${high_response.data.value}`);

        if(title_response.data.value === '정보 없음') {
          setTitleData(title_response.data); 
        }

        else{
        for(let i = 0; i < title_response.data.results.length; i++) {
          if(cleanArtistName(title_response.data.results[i].artist_nospace) === cleanedSearchTerm) {
            title_response.data = {
              name: '곡명 정보',
              value: title_response.data.results[i].title,
            };
            break;
          }
        }
        setTitleData(title_response.data);
      }


        let change = 0;
        const bugs = await axios.get("http://localhost:3001/bugs_rank");
        for (let i = 0; i < bugs.data.length; i++) {
          if (cleanArtistName(bugs.data[i].artist.substring(0,3)) === cleanArtistName(cleanedSearchTerm).substring(0,3)) {
            change += bugs.data[i].change;
          }
        }

        const change_response = await axios.get(`http://localhost:3001/search_fourth/${cleanedSearchTerm}`);
        change_response.data.value += change;

        if (change_response.data.value > 0) {
          change_response.data.value += " 상승";
        } else if (change_response.data.value < 0) {
          change_response.data.value *= -1;
          change_response.data.value += " 하락";
        } else {
          change_response.data.value = " 변동 없음";
        }

        setChangeData(change_response.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
      setBool(true);
    };

    // Fetch data only if searchTerm is not empty
    const handleSearch = (row) => {
      setBool(false);
      setFreqData({});
      setHighData({});
      setTitleData({});
      setChangeData({});
      // Fetch data when the search button is clicked
      fetchSearchData(row);
    };

    return (
      <div>
        <InputGroup className="mb-3" id="search">
          <DropdownButton
            variant="secondary"
            title="artist"
            id="input-group-dropdown-1"
          >
            <Dropdown.Item>artist</Dropdown.Item>
          </DropdownButton>
          <Form.Control
            aria-label="Text input with dropdown button"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="btn btn-primary" onClick={(e) => handleSearch(e.target.value)}>
            Search
          </button>
        </InputGroup>
    
        {bool && (
          <Table striped bordered hover>
            <thead>
              <tr>
                <th id = "blue">{freqdata.name}</th>
                <th id = "blue">{highdata.name}</th>
                <th id = "blue">{titledata.name}</th>
                <th id = "blue">{changedata.name}</th>
                
              </tr>
            </thead>
            <tbody>
              {bool && <tr>
                <td>{freqdata.value}</td>
                <td>{highdata.value}</td>
                <td>{titledata.value}</td>
                <td>{changedata.value}</td>
              </tr>}
            </tbody>
          </Table>
        )}
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

  
export default Search;