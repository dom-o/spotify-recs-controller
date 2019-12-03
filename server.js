require('dotenv').config()
const express = require('express')
const axios = require('axios')
const axiosRetry = require('axios-retry')
const cors = require('cors')
const app = express()
const port = 3000

app.use(cors({
  origin: 'http://localhost:8080',
  credentials: true,
}))
app.use(express.json())
axiosRetry(axios, { retryDelay: axiosRetry.exponentialDelay })

app.get('/search', function(req, res) {
  console.log('/search')
  console.log(req.query)
  if(req.query.query) {
    axios.get('/search', {
      baseURL: 'https://api.spotify.com/v1/',
      params: {
        q: req.query.query,
        type: 'track,artist',
        limit: 6,
      },
      headers: {
        'Authorization': 'Bearer '+ process.env.ACCESS_TOKEN
      },
    })
    .then(response => { res.json(response.data) })
    .catch(error => {
      if(error.response.status===401) { get_access_token() }
      console.log('error')
      res.send({error})
    })
  }
})

app.get('/genres', function(req, res) {
  console.log('/genres')
  axios.get('/recommendations/available-genre-seeds', {
    baseURL: 'https://api.spotify.com/v1/',
    headers: {
      'Authorization': 'Bearer '+ process.env.ACCESS_TOKEN
    },
  })
  .then(response => { res.json(response.data) })
  .catch(error => {
    console.log(error)
    res.send({error})
  })
})

app.get('/info', function(req, res) {
  console.log('/info')
  const methods = req.query.tracks
    ? [get_track_features(req.query.tracks.toString())]
    : []

  axios.all(methods)
  .then((results) => {
    const converted =
      results
      .map(r => r.data)
      .reduce((obj, item) => Object.assign(obj, item))

    res.json(converted)
  })
  .catch(error => {
    console.log(error.response)
    res.send({error})
  })
})

app.get('/rec', function(req, res) {
  console.log('/rec')

  if(req.query) {
    for(let key in req.query) {
      req.query[key] = req.query[key].toString()
    }


    axios.get('/recommendations', {
      baseURL: 'https://api.spotify.com/v1/',
      params: req.query,
      headers: {
        'Authorization': 'Bearer '+ process.env.ACCESS_TOKEN
      },
    })
    .then(response => {
      res.json(response.data) })
    .catch(error => {
      console.log(error.response)
      res.send({error})
    })
  }
})

app.listen(port, () => console.log(`Listening on port ${port}!`))
get_access_token()
const token_interval = setInterval(get_access_token, 3300000)

function get_track_features(ids) {
  return axios.get('/audio-features', {
    baseURL: 'https://api.spotify.com/v1/',
    params: {
      ids: ids
    },
    headers: {
      'Authorization': 'Bearer '+ process.env.ACCESS_TOKEN
    },
  })
}

function get_artists(ids) {
  return axios.get('/artists', {
    baseURL: 'https://api.spotify.com/v1/',
    params: {
      ids: ids
    },
    headers: {
      'Authorization': 'Bearer '+ process.env.ACCESS_TOKEN
    },
  })
}

function get_access_token() {
  console.log('new access token')
  const payload = process.env.CLIENT_ID+':'+process.env.CLIENT_SECRET
  const encodedPayload = new Buffer(payload).toString('base64')

  axios.post('https://accounts.spotify.com/api/token', 'grant_type=client_credentials', {
    headers: {
      'Authorization': 'Basic '+ encodedPayload,
      "Content-Type": "application/x-www-form-urlencoded",
    },
  })
  .then(response => { process.env.ACCESS_TOKEN = response.data.access_token })
  .catch(error => { console.log(error) })
}
