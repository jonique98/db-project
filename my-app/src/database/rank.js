// rank.js\

const rank = () => {

const bugsCrawler = require('./bugs.js');
const genieCrawler = require('./genie.js');
const melonCrawler = require('./melon.js');

melonCrawler();
genieCrawler();
bugsCrawler();

}

module.exports = rank;




