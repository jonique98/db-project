const { all } = require('axios');
const mysql = require('mysql');
require('dotenv').config();

// MySQL 연결 정보
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

const titleSet = new Set();

const all_title_func = () => {

// 연결
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
  } else {
    console.log('Connected to MySQL');

    // 기존 데이터 삭제
    const deleteQuery = `DELETE FROM all_title where 1`;
    connection.query(deleteQuery, (err, results) => {
      if (err) {
        console.error(`Error deleting existing titles from all_title:`, err);
      } else {
        console.log(`Deleted existing titles from all_title`);

        // 멜론 데이터 추가
        readUniqueTitles('melon_rank');

        setTimeout(() => {
          // 지니 데이터 추가
          compareAndInsert('genie_rank');
        }, 5000);

        setTimeout(() => {
          compareAndInsert('bugs_rank');
        }, 8000);


      }
    });
  }
});
}

// title 중복 없이 추출하는 함수
function readUniqueTitles(tableName) {
  const query = `SELECT title, artist FROM ${tableName}`;
  connection.query(query, (err, results) => {
    if (err) {
      console.error(`Error reading titles from ${tableName}:`, err);
    } else {
      results.forEach((row) => {
        titleSet.add(cleanTitle(row.title));
        const artist = cleanArtistName(row.artist);
				const insertQuery = `INSERT INTO all_title (title, artist, title_nospace) VALUES (?, ?, ?)`;
        connection.query(insertQuery, [row.title, row.artist, cleanTitle(row.title)], (err, results) => {
          if (err) {
            console.error(`Error inserting title into all_title:`, err);
          } else {
            console.log(`Title inserted into all_title successfully: ${row.title} - ${artist}`);
          }
        });
      });
    }
  });
}

// all_title 테이블에 title과 artist 추가하는 함수
function checkAndInsertTitle(title, artist) {
  // title에서 모든 공백을 제거
  const cleanedTitle = cleanTitle(title);

  // 이미 테이블에 있는 요소들을 가져옴 (모든 공백 제거)
  const selectQuery = `SELECT DISTINCT title FROM all_title`;
  connection.query(selectQuery, (err, results) => {
    if (err) {
      console.error(`Error reading titles from all_title:`, err);
    } else {
      // 이미 있는 title들과 비교하여 중복 여부 확인
      let isDuplicate = false;

      for(const row of results) {
        const cleanedExistingTitle = cleanTitle(row.title);

          if(cleanedExistingTitle.substring(0, 4) === cleanedTitle.substring(0, 4)) {
            isDuplicate = true;
            break;
          }
      }
			
      if (!isDuplicate) {
        if(!titleSet.has(cleanedTitle)) {
          titleSet.add(cleanedTitle);
        }
        else
          return;
        // 중복되지 않은 새로운 title을 특정 테이블에 삽입
        const insertQuery = `INSERT INTO all_title (title, artist, title_nospace) VALUES (?, ?, ?)`;
        connection.query(insertQuery, [title, artist, cleanedTitle], (err, results) => {
          if (err) {
            console.error(`Error inserting title into all_title:`, err);
          } else {
            console.log(`Title inserted into all_title successfully: ${title} - ${artist}`);
          }
        });
      } else {
        console.log(`Title already exists in all_title: ${title} - ${artist}`);
      }
    }
  });
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


// artist 이름 정리하는 함수 (이미 작성한 함수 재활용)
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

// 비교하여 중복 확인하고 새로운 title을 특정 테이블에 삽입하는 함수
function compareAndInsert(tableName) {
  const query = `SELECT DISTINCT title, artist FROM ${tableName}`;
  connection.query(query, (err, results) => {
    if (err) {
      console.error(`Error reading titles from ${tableName}:`, err);
    } else {
      results.forEach((row) => {
        const title = row.title;
        const artist = row.artist;
        checkAndInsertTitle(title, artist);
      });
    }
  });
}

module.exports = all_title_func;