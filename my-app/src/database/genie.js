



const axios = require("axios");
const cheerio = require("cheerio");
const mysql = require("mysql");


const genieCrawler = async () => {
  let prefix = "https:";

  try {
    // 1
    let html = await axios.get("https://www.genie.co.kr/chart/top200");
    let ulList = [];
    // 2
    let $ = cheerio.load(html.data);
    // 3
    let bodyList = $("tr.list");
    bodyList.each((i, element) => {
      let changeText = $(element).find("td.number span.rank span.rank span").text();

      let change = 0;

      if(changeText.includes("상승")) {
        change = parseInt(changeText.match(/\d+/)[0]);
      }
      else if(changeText.includes("하강")) {
        change = -parseInt(changeText.match(/\d+/)[0]);
      }
    
        // 뒤의 문자열은 title과 artist로 간주
        let title = $(element).find("td.info a.title").text().replace(/\s/g, "");
        let artist = $(element).find("td.info a.artist").text().replace(/\s/g, "");


        let img = $(element).find("td a img").attr("src");

         img = `${prefix}${img}`;

        ulList.push({
          rank: i + 1,
          change: change,
          title: title,
          title_nospace: cleanTitle(title),
          artist: artist,
          artist_nospace: cleanArtistName(artist),
          img: img,
        });

    });

    // 두 번째 페이지 처리
    html = await axios.get("https://www.genie.co.kr/chart/top200?ditc=D&ymd=20231209&hh=01&rtm=Y&pg=2");
    $ = cheerio.load(html.data);
    bodyList = $("tr.list");

    bodyList.each((i, element) => {

      let changeText = $(element).find("td.number span.rank span.rank span").text();

      let change = 0;

      if(changeText.includes("상승")) {
        change = parseInt(changeText.match(/\d+/)[0]);
      }
      else if(changeText.includes("하락")) {
        change = -parseInt(changeText.match(/\d+/)[0]);
      }

         // 뒤의 문자열은 title과 artist로 간주
         let title = $(element).find("td.info a.title").text().replace(/\s/g, "");
         let artist = $(element).find("td.info a.artist").text().replace(/\s/g, "");

         let img = $(element).find("td a img").attr("src");

         img = `${prefix}${img}`;
 
         ulList.push({
           rank: i + 50 + 1,
           change: change,
           title: title,
            title_nospace: cleanTitle(title),
           artist: artist,
            artist_nospace: cleanArtistName(artist),
            img: img,
         });
    });



    const topHundredData = ulList.slice(0, 100);

    // Save data to MySQL
    saveDataToMySQL(topHundredData);
  } catch (error) {
    console.error(error);
  }
};

const saveDataToMySQL = (data) => {
  const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  connection.connect((err) => {

    const deletequery = `DELETE FROM genie_rank where 1`;
    connection.query(deletequery, (err, results) => {
    });
  
    if (err) {
      console.error("Error connecting to MySQL:", err);
    } else {
      // Insert or update data in the 'genie_rank' table based on the rank
      data.forEach((item) => {
        const { rank, title, title_nospace, artist, artist_nospace, change , img} = item;
        const insertOrUpdateQuery = `
          INSERT INTO genie_rank
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [rank, title, title_nospace,  artist, artist_nospace, change, img];

        connection.query(insertOrUpdateQuery, values, (err, result) => {
          if (err) {
            console.error("Error inserting/updating data into MySQL:", err);
          } else {
            if (result.affectedRows > 0) {
              console.log(`Data inserted/updated successfully for rank ${rank}`);
            } else {
              console.log(`No rows inserted/updated for rank ${rank}`);
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

module.exports = genieCrawler;

