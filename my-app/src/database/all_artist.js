const mysql = require('mysql');

// MySQL 연결 정보
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

const allArtistsSet = new Set();

const all_artist_func = () => {
// 연결
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
  } else {
    console.log('Connected to MySQL');

		const deleteQuery = `DELETE FROM all_artist where 1`;
connection.query(deleteQuery, (err, results) => {
	if (err) {
		console.error(`Error deleting existing artists from all_artist:`, err);
	} else {
		console.log(`Deleted existing artists from all_artist`);
	}
	});

    // 첫 번째 테이블에서 artist 중복 없이 추출
    readUniqueArtists('melon_rank')
      compareAndInsert('genie_rank')
        compareAndInsert('bugs_rank')

  }
});
}

// artist 중복 없이 추출하는 함수
function readUniqueArtists(tableName) {
  const query = `SELECT distinct artist FROM ${tableName}`;
  connection.query(query, (err, results) => {
    if (err) {
      console.error(`Error reading artists from ${tableName}:`, err);
    } else {
      // Set에 추가 (중복 제거)
      results.forEach((row) => {

				const insertQuery = `INSERT INTO all_artist VALUES (?,?)`;
				const artist = cleanArtistName(row.artist);
				connection.query(insertQuery, [row.artist, artist], (err, results) => {
					if (err) {
						console.error(`Error inserting artist into all_artist:`, err);
					}
				});
        allArtistsSet.add(row.artist);
      });
    }
  });
}

// artist 비교하여 중복 확인하고 새로운 아티스트를 특정 테이블에 삽입하는 함수
function compareAndInsert(tableName) {
  const query = `SELECT DISTINCT artist FROM ${tableName}`;
  connection.query(query, (err, results) => {
    if (err) {
      console.error(`Error reading artists from ${tableName}:`, err);
    } else {
      results.forEach((row) => {
        const artist = cleanArtistName(row.artist);

				console.log(artist);

        // 중복 여부 확인
        let isDuplicate = false;
        allArtistsSet.forEach((item) => {
          let newItem = cleanArtistName(item);
          if (newItem.substring(0,3) === artist.substring(0,3)) {
            isDuplicate = true;
          }
        });

        if (!isDuplicate) {
          allArtistsSet.add(row.artist);

          // 중복되지 않은 새로운 아티스트를 all_artist 테이블에 삽입
          const insertQuery = `INSERT INTO all_artist VALUES (?,?)`;
          connection.query(insertQuery, [row.artist, artist], (err, results) => {
            if (err) {
              console.error(`Error inserting artist into all_artist:`, err);
            } else {
              console.log(`Artist inserted into all_artist successfully: ${artist}`);
            }
          });
        }
      });
    }
  });
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

module.exports = all_artist_func