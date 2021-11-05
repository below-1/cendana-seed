const axios = require('axios')

module.exports = async () => {
  const signupResponse = await axios.post('http://localhost:5000/auth/signup', {
    username: 'adminzero',
    password: 'adminzero',
    name: 'adminzero'
  })
  const loginResponse = await axios.post('http://localhost:5000/auth/login', {
    username: 'adminzero',
    password: 'adminzero'
  })
  const currentUserResponse = await axios.get('http://localhost:5000/auth/me', {
    headers: {
      Authorization: `Bearer ${loginResponse.data.token}`
    }
  })
  return currentUserResponse.data
}