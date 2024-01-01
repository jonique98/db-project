const axios = require('axios');

const bugsCrawler = () => {

const postData = {
  key1: 'value1',
  key2: 'value2',
};

axios.post('https://e00tl528jj.execute-api.ap-northeast-2.amazonaws.com/sumjo-stage/sumjo', postData)
  .then(response => {
    console.log(response.data);
  })
  .catch(error => {
    console.error('Error sending POST request:', error);
  });
};

module.exports = bugsCrawler;