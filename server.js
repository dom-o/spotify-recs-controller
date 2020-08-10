require('dotenv').config()
const express = require('express')
const axios = require('axios')
const axiosRetry = require('axios-retry')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const app = express()
const port = 3000
const payload = process.env.CLIENT_ID+':'+process.env.CLIENT_SECRET
const encodedPayload = new Buffer(payload).toString('base64')
const redirect_uri = 'http://localhost:3000/callback'

app.use(express.json())
   .use(cookieParser())
   .use(cors({
     origin: 'http://localhost:8080',
     credentials: true,
   }))

axiosRetry(axios, { retryDelay: axiosRetry.exponentialDelay })
axios.interceptors.response.use(null, (error) =>{
  if(error.config && error.response && error.response.status === 401) {
    console.log('error, interceptor')
    return (axios.post('https://accounts.spotify.com/api/token', 'grant_type=client_credentials', {
      headers: {
        'Authorization': 'Basic '+ encodedPayload,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })).then(response => {
      process.env.ACCESS_TOKEN = response.data.access_token
      error.config.headers['Authorization'] = 'Bearer '+ process.env.ACCESS_TOKEN
      return axios.request(error.config)
    })
  }
  return Promise.reject(error)
})


app.get('/refresh', function(req, res) {
  console.log('/refresh')
  let refresh_token = null
  if(req.query.refresh_token) {
    refresh_token = req.query.refresh_token
  }

  if(refresh_token) {
    axios.post('https://accounts.spotify.com/api/token',
    'grant_type=refresh_token&refresh_token='+refresh_token,
    {
      headers: {
        'Authorization': 'Basic '+ encodedPayload,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }).then(response => {
      res.json(response.data)
    }).catch(error => {
      console.log('error')
      res.send({error})
    })
  }
})

function randomString(len) {
  let str = ''
  let charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890'
  for (var i=0; i<len; i++) {
    str += charSet[Math.floor(Math.random() * charSet.length)]
  }
  return str
}
stateKey = 'spotify_auth_state'

app.get('/login', function(req, res) {
  console.log('/login')
  const state = randomString(16)
  res.cookie(stateKey, state)
  const scope = 'playlist-modify-public user-read-email' //user-library-modify if we want to let the user add the songs to their library individually, playlist-modify-private if we want to interact with private playlists (we might)
  res.redirect('https://accounts.spotify.com/authorize' +
    '?response_type=code' +
    '&client_id=' + process.env.CLIENT_ID +
    (scope ? '&scope=' + encodeURIComponent(scope) : '') +
    '&redirect_uri=' + encodeURIComponent(redirect_uri) +
    '&show_dialog=true' +
    '&state=' + state
  )
})

app.get('/callback', function(req, res) {
  console.log('/callback')
  let state = req.query.state
  let storedState = req.cookies ? req.cookies[stateKey] : null

  if(state === null || state !== storedState) {
    //ERROR
    res.status(500).send('State mismatch')
  } else {
    res.clearCookie(stateKey)
    const params = {
      grant_type: 'authorization_code',
      code: req.query.code,
      redirect_uri: redirect_uri,
    }
    const urlParams = Object.entries(params)
      .map(([key, val]) => `${encodeURIComponent(key)}=${encodeURIComponent(val)}`)
      .join('&')

    axios.post('https://accounts.spotify.com/api/token', urlParams, {
      headers: {
        'Authorization': 'Basic ' + encodedPayload,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }).then(response => {
      process.env.USER_ACCESS_TOKEN = response.data.access_token
      process.env.USER_REFRESH_TOKEN = response.data.refresh_token
      res.redirect('http://localhost:8080/export'+
        '?access_token=' + encodeURIComponent(response.data.access_token) +
        '&refresh_token=' + encodeURIComponent(response.data.refresh_token)
      )
    }).catch(error => {
      console.log('error')
      res.send({error})
    })
  }
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
  }).then(response => { res.json(response.data) })
  .catch(error => {
    console.log('error')
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
  }).catch(error => {
    console.log('error')
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
    }).then(response => { res.json(response.data) })
    .catch(error => {
      console.log('error')
      res.send({error})
    })
  }
})

app.listen(port, () => console.log(`Listening on port ${port}!`))

function get_track_features(ids) {
  return axios.get('/audio-features', {
    baseURL: 'https://api.spotify.com/v1/',
    params: { ids: ids },
    headers: {
      'Authorization': 'Bearer '+ process.env.ACCESS_TOKEN
    },
  })
}

function get_artists(ids) {
  return axios.get('/artists', {
    baseURL: 'https://api.spotify.com/v1/',
    params: { ids: ids },
    headers: {
      'Authorization': 'Bearer '+ process.env.ACCESS_TOKEN
    },
  })
}
