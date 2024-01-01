import React, { useState, useEffect } from 'react';
import { InputGroup, DropdownButton, Dropdown, Form, Table } from 'react-bootstrap';
import axios from 'axios';
import { useMyChart } from './MyChartContext.js';

// Assuming cleanTitle is a function that cleans the title
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

// Define the AddToMyChartButton component outside of Search2
function AddToMyChartButton({ title, artist }) {

  const { addToMyChart } = useMyChart();

  const handleAddToMyChart = async () => {
    if(title === '검색 결과가 없습니다')
      return;

    try {
      // 서버에 데이터 추가
      await axios.post('http://localhost:3001/my-list-upload', { title: title, artist: artist });

      // 마이 차트 업데이트
      const response = await axios.get('http://localhost:3001/my-list');
      addToMyChart(response.data);
    } catch (error) {
      console.error('Error adding to my chart:', error);
    }
  };

  return (
    <button type="button" className="btn btn-primary" onClick={handleAddToMyChart}>
      추가
    </button>
  );
}

function Search2() {
  const [searchTerm, setSearchTerm] = useState('');
  const [titleData, setTitleData] = useState({});
  const [bool, setBool] = useState(false);

  const fetchSearchData = async () => {
    const cleanedSearchTerm = cleanTitle(searchTerm);

    try {
      const titleResponse = await axios.get('http://localhost:3001/weight_list');

      // Find the title that matches the cleaned search term
      const matchedTitle = titleResponse.data.find(
        (item) => cleanTitle(item.title) === cleanedSearchTerm
      );

      if(!matchedTitle) {
        const d = {
          title: '검색 결과가 없습니다',
          artist: '없음',
          melon_rank: '없음',
          bugs_rank: '없음',
          genie_rank: '없음'
        }
        setTitleData(d);
      }

      if (matchedTitle) {
        setTitleData(matchedTitle);
        console.log(matchedTitle);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }

    setBool(true);
  };

  const handleSearch = () => {
    setTitleData({});
    setBool(false);
    fetchSearchData();
  };

  return (
    <div>
      <InputGroup className="mb-3" id="search">
        <DropdownButton variant="secondary" title="artist" id="input-group-dropdown-1">
          <Dropdown.Item>Title</Dropdown.Item>
        </DropdownButton>
        <Form.Control
          aria-label="Text input with dropdown button"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className="btn btn-primary" onClick={handleSearch}>
          Search
        </button>
      </InputGroup>

      {bool && (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th id="blue">title</th>
              <th id="blue">artist</th>
              <th id="blue">melon_chart</th>
              <th id="blue">bugs_chart</th>
              <th id="blue">genie_chart</th>
              <th id="blue">추가</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              {bool && <td>{titleData.title}</td>}
              {bool && <td>{titleData.artist}</td>}
              {bool && <td>{titleData.melon_rank}</td>}
              {bool && <td>{titleData.bugs_rank}</td>}
              {bool && <td>{titleData.genie_rank}</td>}
              {bool && <td><AddToMyChartButton title={titleData.title} artist={titleData.artist} /></td>}
            </tr>
          </tbody>
        </Table>
      )}
    </div>
  );
}

export default Search2;