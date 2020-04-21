const axios = require('axios');
function getuser(id) {
  return axios.get(`https://jsonplaceholder.typicode.com/users/${id}`)
    .then(res => res.data)
}
module.exports = getuser;