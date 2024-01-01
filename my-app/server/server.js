
const all_title_func = require('../src/database/all_title.js');
const all_artist_func = require('../src/database/all_artist.js');
const title_weight_func = require('../src/database/title_weight.js');

const rank = require('../src/database/rank.js');


const express = require('express');
const cors = require('cors');
const mysql = require('mysql');
const { default: axios, all } = require('axios');

let path = require('path');

const app = express();
const port = 3001;

app.use(express.static(path.join(__dirname, '../build')));


app.use(cors());

const bodyParser = require('body-parser');

app.use(express.json())
app.use(express.urlencoded({ extends: true}))

const connection = mysql.createConnection({
  host: 'sumjo-database.cec1fez6orz0.ap-northeast-2.rds.amazonaws.com',
  user: 'admin',
  password: '12345678',
  database: 'test',
});

const dbConfig = {
  host: 'sumjo-database.cec1fez6orz0.ap-northeast-2.rds.amazonaws.com',
  user: 'admin',
  password: '12345678',
  database: 'test',
};

connection.connect();

const pool = mysql.createPool(dbConfig);


app.get('/weight_list', (req, res) => {
  const query = 'SELECT * FROM title_weight ORDER BY weight DESC';
  connection.query(query, (error, results) => {
    if (error) {
      console.log(error);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      res.json(results);
    }
  });
  console.log("update");
});

app.get('/all_title', (req, res) => {
  const query = 'SELECT * FROM all_title';
  connection.query(query, (error, results) => {
    if (error) {
      console.log(error);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      res.json(results);
    }
  });
});

app.get('/find_max_change_title', (req, res) => {
  const genieQuery = 'SELECT * FROM genie_rank';
  const melonQuery = 'SELECT * FROM melon_rank';
  const bugsQuery = 'SELECT * FROM bugs_rank';

  const titleChanges = {}; // Object to store the sum of changes for each cleanTitle

  const handleQuery = (query, callback) => {
    connection.query(query, (error, results) => {
      if (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
      } else {
        callback(results);
      }
    });
  };

  const processResults = (results) => {
    results.forEach((result) => {
      const cleanedTitle = cleanTitle(result.title);
      const change = parseFloat(result.change) || 0; // Convert to float, default to 0 if not a valid number

      if (!titleChanges[cleanedTitle]) {
        titleChanges[cleanedTitle] = 0;
      }

      titleChanges[cleanedTitle] += change;
    });
  };

  const handleGenieQuery = (genieResults) => {
    processResults(genieResults);
    handleQuery(melonQuery, handleMelonQuery);
  };

  const handleMelonQuery = (melonResults) => {
    processResults(melonResults);
    handleQuery(bugsQuery, handleBugsQuery);
  };

  const handleBugsQuery = (bugsResults) => {
    processResults(bugsResults);

    // Find the cleanTitle with the maximum change
    let maxChangeTitle = '';
    let maxChange = -Infinity;

    Object.entries(titleChanges).forEach(([cleanedTitle, change]) => {
      if (change > maxChange) {
        maxChange = change;
        maxChangeTitle = cleanedTitle;
      }
    });

    res.json({ maxChange, maxChangeTitle });
  };

  handleQuery(genieQuery, handleGenieQuery);
});


app.get('/find_img/:title', async (req, res) => {

  let { title }  = req.params; 

  console.log(title);

  title = cleanTitle(title);

  let melon = await axios.get(`http://localhost:3001/melon_rank`);
  let genie = await axios.get(`http://localhost:3001/genie_rank`);

  

      for (let i = 0; i < melon.data.length; i++) {
        console.log(cleanTitle(melon.data[i].title).substring(0,4));
        console.log(title.substring(0,4));
        if (cleanTitle(melon.data[i].title).substring(0,4) === title.substring(0,4)) {
          console.log(melon.data[i].img);
          res.json(melon.data[i].img);
          return;
        }
        if (cleanArtistName(melon.data[i].artist).substring(0,3) === title.substring(0,3)) {
          console.log(melon.data[i].img);
          res.json(melon.data[i].img);
          return;
        }
      }

      for (let i = 0; i < genie.data.length; i++) {
        if (cleanTitle(genie.data[i].title).substring(0,4) === title.substring(0,4)) {
          console.log(genie.data[i].img);
          res.json(genie.data[i].img);
          return;
        }
        if (cleanArtistName(genie.data[i].artist).substring(0,3) === title.substring(0,3)) {
          console.log(genie.data[i].img);
          res.json(genie.data[i].img);
          return;
        }
      }
      res.json('https://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885__480.jpg');
});


app.post('/my-list-upload', async (req, res) => {
  try {
    const { title, artist } = req.body;

    const imgResponse = await axios.get(`http://localhost:3001/find_img/${title}`);
    const img = imgResponse.data;

    const query = 'INSERT INTO my_chart (title, artist, img) VALUES (?, ?, ?)';
    
    connection.query(query, [title, artist, img], (error, results) => {
      if (error) {
        console.error('Error executing query:', error);
        res.status(500).json({ error: 'Internal server error' });
      } else {
        res.json({ success: true, message: 'Data uploaded to my_chart table' });
      }
    });
  } catch (error) {
    console.error('Error uploading data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

  app.get('/my-list', (req, res) => {
    const query = `
      SELECT *
      FROM my_chart
  `;
    
    connection.query(query, (error, results) => {
      if (error) {
        console.error('Error executing query:', error);
        res.status(500).json({ error: 'Internal server error' });
      } else {
        res.json(results);
      }
    });
  })

  app.delete('/my-chart/:id', (req, res) => {
    const itemId = req.params.id;
  
    const query = `
      DELETE FROM my_chart
      WHERE id = ?
    `;
  
    connection.query(query, [itemId], (error, results) => {
      if (error) {
        console.error('Error executing query:', error);
        res.status(500).json({ error: 'Internal server error' });
      } else {
        res.json({ success: true });
      }
    });
  });


  app.get('/search_first/:searchTerm', async (req, res) => {
    const searchTerm = cleanArtistName(req.params.searchTerm);
    console.log(searchTerm); // path variable에서 값을 받아옴
  
        const query = `
        SELECT artist_nospace, COUNT(*) AS artistCount
        FROM title_weight
        WHERE artist_nospace = ?
        GROUP BY artist_nospace;
      `;
  
      connection.query(query, [searchTerm], (error, results) => {
        if (error) {
          console.error(error);
          res.status(500).json({ error: 'Internal server error' });
        } else {
          let frequencyData = 0;
          results.forEach((row) => {
            console.log(cleanArtistName(row.artist_nospace).toLowerCase());
            console.log(cleanArtistName(req.params.searchTerm).toLowerCase());
            frequencyData = row.artistCount;
          });
          res.json({
            name : '빈도',
            value : `${frequencyData}회`
          });
        }
      });
  });
  


const executeQuery = (query, values, callback) => {
  const connection = mysql.createConnection({
    host: 'sumjo-database.cec1fez6orz0.ap-northeast-2.rds.amazonaws.com',
    user: 'admin',
    password: '12345678',
    database: 'test',
  });

  connection.connect((err) => {
    if (err) {
      callback(err, null);
      return;
    }

    connection.query(query, values, (error, results) => {

      if (error) {
        callback(error, null);
      } else {
        callback(null, results);
      }
    });
  });
};


app.get('/search_second/:searchTerm', (req, res) => {
  const searchTerm = cleanArtistName(req.params.searchTerm);

  // Query to find the maximum rank from each source
  const melonQuery = `
    SELECT
      artist_nospace,
      MIN(melon_rank) AS melon_max
    FROM title_weight
    WHERE artist_nospace = ? AND melon_rank > 0
    GROUP BY artist_nospace;
  `;

  const genieQuery = `
    SELECT
      artist_nospace,
      MIN(genie_rank) AS genie_max
    FROM title_weight
    WHERE artist_nospace = ? AND genie_rank > 0
    GROUP BY artist_nospace;
  `;

  const bugs = axios.get(`http://localhost:3001/bugs_rank`);
  let min_rank = Infinity;
  for(let i = 0; i < bugs.length; i++){
    if(cleanArtistName(bugs[i].artist) === cleanArtistName(searchTerm)){
      if(bugs[i].bugs_rank < min_rank){
        min_rank = bugs[i].bugs_rank;
      }
    }
  }

  // Execute the queries
  executeQuery(melonQuery, [searchTerm], (melonError, melonResults) => {
    executeQuery(genieQuery, [searchTerm], (genieError, genieResults) => {
        try {
          // Handle errors
          if (melonError || genieError) {
            console.error('Error fetching data:', melonError || genieError);
            res.status(500).json({ error: 'Internal server error' });
            return;
          }

          // Extract max ranks from results
          const melonMax = melonResults.length > 0 ? melonResults[0].melon_max : Infinity;
          const genieMax = genieResults.length > 0 ? genieResults[0].genie_max : Infinity;
          const bugsMax = min_rank;

          console.log(melonMax, genieMax, bugsMax);

          // Find the minimum rank
          const minRank = Math.min(melonMax, genieMax, bugsMax);
          if(minRank === Infinity){
            res.json({
              name: '최고 순위',
              value: `정보 없음`,
            });
            return;
          }

          // Determine the source of the minimum rank
          let minRankSource;
          if (minRank === melonMax) {
            minRankSource = 'melon';
          } else if (minRank === genieMax) {
            minRankSource = 'genie';
          } else if (minRank === bugsMax) {
            minRankSource = 'bugs';
          } else {
            minRankSource = null;
          }

          res.json({
            name: '최고 순위',
            value: `${minRankSource} ${minRank}위`,
          });
        } catch (error) {
          console.error('Unexpected error:', error);
          res.status(500).json({ error: 'Internal server error' });
        }
    });
  });
});

app.get('/search_third/:rank', (req, res) => {

  let rank = req.params.rank;

  const prefix = rank.charAt(0);
  rank = parseInt(rank.match(/\d+/)?.[0] || 0);

  console.log(rank);

  let tableName, columnName;

  columnName = "\`rank\`";

  // Determine the table and column based on the prefix
  switch (prefix) {
    case 'g':
      tableName = 'genie_rank';
      break;
    case 'm':
      tableName = 'melon_rank';
      break;
    case 'b':
      tableName = 'bugs_rank';
      break;
    default:
      // If the prefix is not 'g', 'm', or 'b', set default values or handle the case as needed
      tableName = 0;
      break;
  }

  if (tableName) {
    // If tableName and rankColumn are valid, construct and execute the SQL query
    const query = `
      SELECT title, artist_nospace
      FROM ${tableName}
      WHERE ${columnName} = ?;
    `;

    executeQuery(query, [rank], (error, results) => {
      if (error) {
        console.error('Error executing query:', error);
        res.status(500).json({ error: 'Internal server error' });
      } else {
        if (results.length > 0) {
          res.json({
            results
          });
        } else {
          res.json({
            name: '곡명 정보',
            value: `정보 없음`,
          });
        }
      }
    });
  } else {
    res.json({
      name: '곡명 정보',
      value: '정보 없음',
    });
  }
});

app.get('/search_fourth/:artistName', (req, res) => {
  const artistName = req.params.artistName;

  // Query to select and sum the 'change' column from the 'melon_rank' table
  const melonQuery = `
    SELECT SUM(\`change\`) AS totalChange
    FROM melon_rank
    WHERE artist_nospace = ?;
  `;

  // Query to select and sum the 'change' column from the 'genie_rank' table
  const genieQuery = `
    SELECT SUM(\`change\`) AS totalChange
    FROM genie_rank
    WHERE artist_nospace = ?;
  `;

  // Initialize total change
  let totalChange = 0;

  // Execute the query for the 'melon_rank' table
  executeQuery(melonQuery, [artistName], (error, melonResults) => {
    if (error) {
      console.error('Error executing melon query:', error);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }

    // Add the melon change to the total change
  if(melonResults)
    totalChange += Number(melonResults[0].totalChange);

    // Execute the query for the 'genie_rank' table
    executeQuery(genieQuery, [artistName], (error, genieResults) => {
      if (error) {
        console.error('Error executing genie query:', error);
        res.status(500).json({ error: 'Internal server error' });
        return;
      }

      // Add the genie change to the total change
      if(genieResults)
        totalChange += Number(genieResults[0].totalChange);

      // Return the total change in the response
      res.json({
        name: '변화량',
        value: totalChange,
      });
    });
  });
});

app.get('/right_title/:title', (req, res) => {

  const title = cleanTitle(req.params.title);

  const query = `
  SELECT title
  FROM all_title
  WHERE title_nospace = ?
  `;

  connection.query(query, [title], (error, results) => {
    if (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      if (results.length > 0) {
        res.json({
          name: results[0].title,
        });
      } else {
        res.json({
          name: '정보 없음',
        });
      }
    }
  });
})

app.get('/right_artist/:artist', (req, res) => {

  const artist = cleanTitle(req.params.artist);

  const query = `
  SELECT artist
  FROM all_artist
  WHERE artist_nospace = ?
  `;

  connection.query(query, [artist], (error, results) => {
    if (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      if (results.length > 0) {
        res.json({
          name: results[0].artist,
        });
      } else {
        res.json({
          name: '정보 없음',
        });
      }
    }
  });
})


app.get('/all_artist', (req, res) => {
  const query = 'SELECT * FROM all_artist';
  connection.query(query, (error, results) => {
    if (error) {
      console.log(error);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      res.json(results);
    }
  });
});

app.get('/most_frequency_artist', (req, res) => {
  const query = `
    SELECT artist, COUNT(*) AS frequency
    FROM all_title
    GROUP BY artist
    ORDER BY frequency DESC
    LIMIT 1
  `;

  connection.query(query, (error, results) => {
    if (error) {
      console.log(error);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      if (results.length > 0) {
        const mostFrequentArtist = results[0].artist;
        const frequency = results[0].frequency;
        res.json({ mostFrequentArtist, frequency });
      } else {
        res.json({ mostFrequentArtist: null, frequency: 0 });
      }
    }
  });
});


app.get('/melon_rank', (req, res) => {
  const query = 'SELECT * FROM melon_rank';
  connection.query(query, (error, results) => {
    if (error) {
      console.log(error);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      res.json(results);
    }
  });
});

app.get('/genie_rank', (req, res) => {
  const query = 'SELECT * FROM genie_rank';
  connection.query(query, (error, results) => {
    if (error) {
      console.log(error);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      res.json(results);
    }
  });
});

app.get('/bugs_rank', (req, res) => {
  const query = 'SELECT * FROM bugs_rank';
  connection.query(query, (error, results) => {
    if (error) {
      console.log(error);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      res.json(results);
    }
  });
});

app.get('/min_deviation_title', (req, res) => {
  const query = 'SELECT * FROM title_weight';
  connection.query(query, (error, results) => {
    if (error) {
      console.log(error);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      let minDeviation = Infinity;
      let minDeviationTitle = '';

      // Iterate through the results to calculate deviation and find the minimum
      for (let i = 0; i < results.length; i++) {
        const title = results[i].title;
        const melonRank = results[i].melon_rank;
        const genieRank = results[i].genie_rank;
        const bugsRank = results[i].bugs_rank;

        if(melonRank === 0 || genieRank === 0 || bugsRank === 0) {
          continue;
        }

        // Calculate deviation
        const deviation = Math.abs(melonRank - genieRank) + Math.abs(melonRank - bugsRank) + Math.abs(genieRank - bugsRank);

        // Update minDeviation if the current deviation is smaller
        if (deviation < minDeviation) {
          minDeviation = deviation;
          minDeviationTitle = title;
        }
      }

      // Return the title with the minimum deviation
      res.json({ minDeviationTitle, minDeviation });
    }
  });
});

app.get('/search', (req, res) => {
  const { category, term } = req.query;

  if (category === 'artist') {
    searchArtist(req.query.term);
  } else if (category === 'title') {
    searchTitle(req.query.term);
  } else {
    // Handle other categories if needed
    res.json([]);
  }
});

app.get('/', function (요청, 응답) {
  응답.sendFile(path.join(__dirname, '../build/index.html'));
});




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

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);

    rank();

    setTimeout(() => {
      all_title_func();
      all_artist_func();
    }, 1000);

    setTimeout(() => {
      title_weight_func();
    }, 15000);

});