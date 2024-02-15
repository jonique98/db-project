const axios = require('axios');

const bugsCrawler = () => {

// const postData = {
//   key1: 'value1',
//   key2: 'value2',
// };

// axios.post(' https://m2g27gtzoj.execute-api.ap-northeast-2.amazonaws.com/default/sumjo', postData)
//   .then(response => {
//     console.log(response.data);
//   })
//   .catch(error => {
//     console.error('Error sending POST request:', error);
//   });
// };

axios.get('https://rhtfz29a97.execute-api.ap-northeast-2.amazonaws.com/default/sumjo')
  .then(response => {
    console.log(response.data);
  })
  .catch(error => {
    console.error('Error sending GET request:', error);
  });
}

module.exports = bugsCrawler;