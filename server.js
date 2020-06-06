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

const redirect_uri = 'http://localhost:3000/callback'
let song_id_list = []
app.get('/login', function(req, res) {
  console.log('/login')

  const scope = 'playlist-modify-public user-read-email' //user-library-modify if we want to let the user add the songs to th eir library individually, playlist-modify-private if we want to interact with private playlists (we might)
  res.redirect('https://accounts.spotify.com/authorize' +
    '?response_type=code' +
    '&client_id=' + process.env.CLIENT_ID +
    (scope ? '&scope=' + encodeURIComponent(scope) : '') +
    '&redirect_uri=' + encodeURIComponent(redirect_uri) //+
    // '&state=' +
  )
})

app.get('/callback', function(req, res) {
  console.log('/callback')
  const params = {
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
    grant_type: 'authorization_code',
    code: req.query.code,
    redirect_uri: redirect_uri,
  }
  const urlParams = Object.entries(params)
    .map(([key, val]) => `${encodeURIComponent(key)}=${encodeURIComponent(val)}`)
    .join('&')

  const payload = process.env.CLIENT_ID+':'+process.env.CLIENT_SECRET
  const encodedPayload = new Buffer(payload).toString('base64')

  axios.post('https://accounts.spotify.com/api/token', urlParams, {
    headers: {
      'Authorization': 'Basic ' + encodedPayload,
      "Content-Type": "application/x-www-form-urlencoded",
    },
  })
  .then(response => {
    console.log(response.data)
    process.env.ACCESS_TOKEN = response.data.access_token
    process.env.REFRESH_TOKEN = response.data.refresh_token
    res.redirect('http://localhost:8080/export'+
      '?access_token=' + encodeURIComponent(process.env.ACCESS_TOKEN) +
      '&refresh_token=' + encodeURIComponent(process.env.REFRESH_TOKEN)
    )
  })
  .catch(error => {
    console.log('error')
    res.send({error})
  })
})

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
