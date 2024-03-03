const axios = require('axios');
const cheerio = require('cheerio');
const mysql = require("mysql");
require('dotenv').config();


function melonCrawler() {
  const URL = `https://www.melon.com/chart/`;

  axios.get(URL).then(res => {
    console.log(res.status);
    if (res.status === 200) {
      // 노래 정보를 담을 빈 배열
      let crawledMusic = [];

      // res.data에서 tag를 cheerio로 검색하여 변수에 저장
      const $ = cheerio.load(res.data);
      const $musicList50 = $('#lst50');
      const $musicList100 = $('#lst100');

      $musicList50.each(function(i) {
        let changeText = $(this).find('#lst50 > td > div > span > span').text();
        let change = 0;
      
        if (changeText.includes("상승")) {
          change = parseInt(changeText.match(/\d+/)[0]);
        } else if (changeText.includes("하락")) {
          change = -parseInt(changeText.match(/\d+/)[0]);
        }
      
        // 각 노래의 정보를 객체에 저장
        crawledMusic[i] = {
          title: $(this).find('#lst50 > td > div > div > div.ellipsis.rank01 > span > a').text().trim(),
          artist: $(this).find('#lst50 > td > div > div > div.ellipsis.rank02 > a').text(),
          img: $(this).find('#lst50 > td > div > a > img').attr('src'),
          change: change
        };
      });
      
      $musicList100.each(function(i) {
        let changeText = $(this).find('#lst100 > td > div > span > span').text();
        let change = 0;
      
        if (changeText.includes("상승")) {
          change = parseInt(changeText.match(/\d+/)[0]);
        } else if (changeText.includes("하락")) {
          change = -parseInt(changeText.match(/\d+/)[0]);
        }

        // 각 노래의 정보를 객체에 저장
        crawledMusic[i + 50] = {
          title: $(this).find('#lst100 > td > div > div > div.ellipsis.rank01 > span > a').text().trim(),
          artist: $(this).find('#lst100 > td > div > div > div.ellipsis.rank02 > a').text(),
          img: $(this).find('#lst100 > td > div > a > img').attr('src'),
          change: change
        };
      });



      // 상위 100개 데이터를 추출하고 rank를 추가하여 새로운 배열 생성
      const topHundredData = crawledMusic.slice(0, 100).map((item, index) => {
        return {
          rank: index + 1,
          title: item.title,
          title_nospace: cleanTitle(item.title),
          artist: item.artist,
          artist_nospace: cleanArtistName(item.artist),
          img: item.img,
          change: item.change
        };
      });

      // console.log(topHundredData)

      // MySQL에 데이터 저장
      saveDataToMySQL(topHundredData);
    } else {
      console.log("서버 응답 오류");
    }
  });
}

const saveDataToMySQL = (data) => {
  const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
  });

  connection.connect((err) => {

    const deletequery = `DELETE FROM melon_rank where 1`;
    connection.query(deletequery, (err, results) => {
      if (err) {
        console.error(`Error deleting existing titles from all_title:`, err);
      } else {
        // console.log(`Deleted existing titles from all_title`);
      }
    });

    if (err) {
      console.error("MySQL에 연결 중 오류 발생:", err);
    } else {
      // rank가 100까지 있는 테이블에 데이터를 삽입 또는 업데이트
      data.forEach((item) => {
        const { rank, title, title_nospace, artist, artist_nospace, img, change } = item;
        const insertOrUpdateQuery = `
          INSERT INTO melon_rank
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [rank, title, title_nospace, artist, artist_nospace, img, change];

        connection.query(insertOrUpdateQuery, values, (err, result) => {
          if (err) {
            console.error("MySQL에 데이터를 삽입 또는 업데이트 중 오류 발생:", err);
          } else {
            if (result.affectedRows > 0) {
              // console.log(`rank ${rank}에 대한 데이터를 성공적으로 삽입 또는 업데이트했습니다.`);
            } else {
              console.log(`rank ${rank}에 대한 데이터를 삽입 또는 업데이트하지 못했습니다.`);
            }
          }
        });
      });
    }
  });
};


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

// 크롤러 실행
module.exports = melonCrawler;
