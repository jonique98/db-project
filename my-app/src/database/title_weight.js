const mysql = require("mysql");

// MySQL 연결 정보
const connection = mysql.createConnection({
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_NAME,
});


// 연결
const title_weight_func = () => {

connection.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err);
  } else {
    console.log("Connected to MySQL");

    // Create title_weight Table
    const createTableQuery = `
			DELETE FROM title_weight where 1
    `;
    connection.query(createTableQuery, (err, results) => {
      if (err) {
        console.error(`Error creating title_weight table:`, err);
      } else {
        console.log(`title_weight table created successfully`);
      }
    });
  }
	calculateWeights();
});
}

// Calculate Weights Function
const calculateWeights = () => {
  // Fetch titles from all_title
  const selectTitlesQuery = `SELECT title,artist FROM all_title`;
 
  connection.query(selectTitlesQuery, async (err, titles) => {
    if (err) {
      console.error(`Error reading titles from all_title:`, err);
    } else {

      try {
        // Use Promise.all to wait for all getRank calls to complete

        await Promise.all(titles.map(async (titleObj) => {
          const title = cleanTitle(titleObj.title);

          const [genieRank, melonRank, bugsRank] = await Promise.all([
            getRank("genie_rank", title),
            getRank("melon_rank", title),
            getRank("bugs_rank", title)
          ]);

          // Calculate weight based on ranks
          const calculatedWeight = calculateWeight(genieRank, melonRank, bugsRank);

          // Insert data into the database
          await insertData(titleObj.title, titleObj.artist, calculatedWeight, genieRank, melonRank, bugsRank);
        }));
      } catch (error) {
        console.error(`Error processing titles:`, error);
      }
    }
  });
};

let i = 0;

const insertData = (title, artist, weight, genie, melon, bugs) => {
	return new Promise((resolve, reject) => {
		const insertQuery = `INSERT INTO title_weight VALUES (?, ?, ?, ?, ?, ?, ?)`;
		connection.query(insertQuery, [title, weight, artist, genie, melon, bugs, cleanArtistName(artist)], (err, results) => {
			if (err) {
				console.error(`Error inserting data into title_weight:`, err);
				reject(err);
			} else {
				i+=1;
				console.log(i);
				// console.log(`Data inserted into title_weight successfully: ${title} - ${artist} - ${weight}`);
				resolve();
			}
		});
	});
}

const getRank = (tableName, title) => {
  return new Promise((resolve, reject) => {
    const titleQuery = `SELECT \`rank\`, \`title\` FROM ${tableName};`;

    connection.query(titleQuery, (err, results) => {
      if (err) {
        reject(err);
      } else {
        for (const t of results) {
          if (cleanTitle(t.title) === title) {
            resolve(t.rank);
            return; // 중복된 타이틀이 없다고 가정하고 처리
          }
        }
        resolve(0); // 일치하는 타이틀이 없을 경우
      }
    });
  });
};

const rank_sec = (rank) => {

	if(rank === 0)
		return 0;
	if (rank >= 1 && rank <= 10) {
    return 50;
  } else if (rank >= 11 && rank <= 20) {
    return 48;
  } else if (rank >= 21 && rank <= 30) {
		return 45;
	}
	else if (rank >= 31 && rank <= 40) {
		return 41;
	}
	else if (rank >= 41 && rank <= 50) {
		return 36;
	}
	else if (rank >= 51 && rank <= 60) {
		return	30;
	}
	else if (rank >= 61 && rank <= 70) {
		return 23;
	}
	else if (rank >= 71 && rank <= 80) {
		return 15;
	}
	else if (rank >= 81 && rank <= 90) {
		return 6;
	}
	else if (rank >= 91 && rank <= 100) {
		return 1;
	}
}

const section = (rank) => {
	if(rank === 0)
		return 0;
	return (100 -rank);
}

// Calculate Weight Function
const calculateWeight = (genieRank, melonRank, bugsRank) => {
  // Implement your logic to calculate weights based on ranks
  // Example: Assign weights based on rank intervals
  // You can customize this logic according to your requirements

	let weight = 0;

	weight += rank_sec(melonRank);
	weight += rank_sec(bugsRank) ;
	weight += rank_sec(genieRank);

	weight += Math.round(section(melonRank) * 0.7);
	weight += Math.round(section(bugsRank) * 0.6);
	weight += Math.round(section(genieRank) * 0.55);

	if(genieRank === 0)
		weight -= 15;
	if(melonRank === 0)
		weight -= 15;
	if(bugsRank === 0)
		weight -= 15;


	if(genieRank !== 0 && melonRank !== 0 && bugsRank !== 0) {
		if(Math.abs(genieRank - melonRank) <= 10 && Math.abs(genieRank - bugsRank) <= 10 && Math.abs(melonRank - bugsRank) <= 10) {
			weight += 25;
		}

		else if (Math.abs(genieRank - melonRank) <= 15 && Math.abs(genieRank - bugsRank) <= 15 && Math.abs(melonRank - bugsRank) <= 15) {
			weight += 15;
		}

		else if (Math.abs(genieRank - melonRank) <= 20 && Math.abs(genieRank - bugsRank) <= 20 && Math.abs(melonRank - bugsRank) <= 20) {
			weight += 10;
		}
		return weight;
	}


	if(genieRank !== 0 && melonRank !== 0) {

	if(Math.abs(genieRank - melonRank) <= 10) {
		weight += 10;
		}
	else if (Math.abs(genieRank - melonRank) <= 15) {
		weight += 6;
		}
	else if (Math.abs(genieRank - melonRank) <= 20) {
		weight += 3;
		}
	else if (Math.abs(genieRank - melonRank) > 25) {
		weight -= 10;
	}
	else
		weight -= 15;
}

	if(genieRank !== 0 && bugsRank !== 0) {
		
		if(Math.abs(genieRank - bugsRank) <= 10) {
			weight += 10;
			}
		else if (Math.abs(genieRank - bugsRank) <= 15) {
			weight += 6;
			}
		else if (Math.abs(genieRank - bugsRank) <= 20) {
			weight += 3;
			}
		else if (Math.abs(genieRank - bugsRank) > 25) {
			weight -= 10;
	}
	else
		weight -= 15;
}

	if(melonRank !== 0 && bugsRank !== 0) {
		if(Math.abs(melonRank - bugsRank) <= 10) {
			weight += 10;
			}
		else if (Math.abs(melonRank - bugsRank) <= 15) {
			weight += 6;
		}
		else if (Math.abs(melonRank - bugsRank) <= 20) {
			weight += 3;
		}
		else if (Math.abs(melonRank - bugsRank) > 25) {
			weight -= 10;
	}
	else 
		weight -= 15;
}
return weight;
	}

// Close MySQL connection after calculations
const closeConnection = () => {
  connection.end((err) => {
    if (err) {
      console.error("Error closing MySQL connection:", err);
    } else {
      console.log("MySQL connection closed");
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

module.exports = title_weight_func;