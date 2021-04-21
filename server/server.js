require('dotenv').config({
  path: '../.env.server.local'
})
const debug = require('debug')('express:server')
const express = require('express')
const helmet = require('helmet')
const axios = require('axios')
const axiosRetry = require('axios-retry')
const cors = require('cors')
// const { body } = require('express-validator')
const app = express()
const port = 3000
const payload = process.env.VUE_APP_SPOTIFY_CLIENT_ID+':'+process.env.SPOTIFY_CLIENT_SECRET
const encodedPayload = Buffer.from(payload).toString('base64')
var access_token = "xxx"

axios.post('https://accounts.spotify.com/api/token', 'grant_type=client_credentials', {
  headers: {
    'Authorization': 'Basic '+ encodedPayload,
    'Content-Type': 'application/x-www-form-urlencoded',
  },
}).then(response => {
  access_token = response.data.access_token
}).catch(error => { debug(error) })


app.use(express.json())
   .use(helmet())
   // .use(cookieParser())
   .use(cors({
     origin: process.env.VUE_APP_CLIENT_URL,
     credentials: true,
     optionsSuccessStatus: 200,
   }))

axiosRetry(axios, { retryDelay: axiosRetry.exponentialDelay })

axios.interceptors.response.use(null, (error) =>{
  if(error.config && error.response && error.response.status === 401) {
    debug('401 error, interceptor, refreshing general access token')
    return (axios.post('https://accounts.spotify.com/api/token', 'grant_type=client_credentials', {
      headers: {
        'Authorization': 'Basic '+ encodedPayload,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })).then(response => {
      access_token = response.data.access_token
      error.config.headers['Authorization'] = 'Bearer '+ access_token
      return axios.request(error.config)
    })
  }
  return Promise.reject(error)
})

app.get('/search', function(req, res, next) {
  debug('/search')
  if(req.query.query) {
    axios.get('/search', {
      baseURL: 'https://api.spotify.com/v1/',
      params: {
        q: req.query.query,
        type: 'track,artist',
        limit: 6,
      },
      headers: {
        'Authorization': 'Bearer '+ access_token
      },
    }).then(response => { res.json(response.data) })
    .catch(next)
  } else {
    res.status(400).send('No search query.')
  }
})

app.get('/genres', function(req, res, next) {
  console.log('genres')
  debug('/genres')
  axios.get('/recommendations/available-genre-seeds', {
    baseURL: 'https://api.spotify.com/v1/',
    headers: {
      'Authorization': 'Bearer '+ access_token
    },
  }).then(response => { res.json(response.data) })
  .catch(next)
})

app.get('/info', function(req, res, next) {
  debug('/info')
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
  }).catch(next)
})

app.get('/rec', function(req, res, next) {
  debug('/rec')

  if(req.query) {
    debug(req.query)
    for(let key in req.query) {
      req.query[key] = req.query[key].toString()
    }

    axios.get('/recommendations', {
      baseURL: 'https://api.spotify.com/v1/',
      params: req.query,
      headers: {
        'Authorization': 'Bearer '+ access_token
      },
    }).then(response => { res.json(response.data) })
    .catch(next)
  } else {
    res.status(400).send('No recommendation parameters.')
  }
})

app.listen(port, () => debug(`Listening on port ${port}!`))

function get_track_features(ids) {
  return axios.get('/audio-features', {
    baseURL: 'https://api.spotify.com/v1/',
    params: { ids: ids },
    headers: {
      'Authorization': 'Bearer '+ access_token
    },
  })
}

function get_artists(ids) {
  return axios.get('/artists', {
    baseURL: 'https://api.spotify.com/v1/',
    params: { ids: ids },
    headers: {
      'Authorization': 'Bearer '+ access_token
    },
  })
}
