require('dotenv').config()
const express = require('express')
const helmet = require('helmet')
const axios = require('axios')
const axiosRetry = require('axios-retry')
const cors = require('cors')
const cookieParser = require('cookie-parser')
// const { body } = require('express-validator')
const app = express()
const port = 3000
const payload = process.env.CLIENT_ID+':'+process.env.CLIENT_SECRET
const encodedPayload = new Buffer(payload).toString('base64')
const redirect_uri = 'http://localhost:3000/callback'
const persistInterval = 1000 * 60 * 60 * 24 * 7

app.use(express.json())
   .use(helmet())
   .use(cookieParser())
   .use(cors({
     origin: 'http://localhost:8080', //'domonicmilesi.com',
     credentials: true,
     optionsSuccessStatus: 200,
   }))

axiosRetry(axios, { retryDelay: axiosRetry.exponentialDelay })
axios.interceptors.request.use(req => {
  if(process.env.USER_REFRESH_TOKEN && process.env.USER_DATA_TIMESTAMP && new Date().getTime() < process.env.USER_DATA_TIMESTAMP) {
    process.env.USER_DATA_TIMESTAMP = new Date().getTime() + persistInterval
  } else {
    delete process.env.USER_REFRESH_TOKEN
    delete process.env.USER_ACCESS_TOKEN
  }
  return req
})

axios.interceptors.response.use(null, (error) =>{
  if(error.config && error.response && error.response.status === 401) {
    console.log('401 error, interceptor')
    if(process.env.USER_REFRESH_TOKEN) {
      return axios.post('https://accounts.spotify.com/api/token',
      'grant_type=refresh_token&refresh_token='+process.env.USER_REFRESH_TOKEN,
      {
        headers: {
          'Authorization': 'Basic '+ encodedPayload,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }).then(response => {
        process.env.USER_ACCESS_TOKEN = response.data.access_token
        error.config.headers['Authorization'] = 'Bearer '+ process.env.USER_ACCESS_TOKEN
        return axios.request(error.config)
      })
    } else {
      console.log('no user token, refreshing general access token')
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
  }
  return Promise.reject(error)
})

function randomString(len) {
  let str = ''
  let charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890'
  for (var i=0; i<len; i++) {
    str += charSet[Math.floor(Math.random() * charSet.length)]
  }
  return str
}
const stateKey = 'spotify_auth_state'

app.post('/logout', function(req, res) {
  delete process.env.USER_REFRESH_TOKEN
  delete process.env.USER_ACCESS_TOKEN
  res.status(200).send('Logged out successfully.')
})

app.get('/isLoggedIn', function(req, res) {
  console.log('/isLoggedIn')
  if(!(process.env.USER_REFRESH_TOKEN && process.env.USER_ACCESS_TOKEN)) {
    res.send(false)
  } else {
    axios.get('https://api.spotify.com/v1/me', {
      headers: {
        'Authorization': 'Bearer '+ process.env.USER_ACCESS_TOKEN
      }
    }).then(response => {
      res.send(true)
    }).catch(error => {
      res.send(false)
    })
  }
})

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
      process.env.USER_DATA_TIMESTAMP = new Date().getTime() + persistInterval

      res.redirect('http://localhost:8080/export')
    }).catch(error => {
      console.log('error')
      console.log(error)
      res.send({error})
    })
  }
})

app.get('/search', function(req, res) {
  console.log('/search')
  if(req.query.query) {
    axios.get('/search', {
      baseURL: 'https://api.spotify.com/v1/',
      params: {
        q: req.query.query,
        type: 'track,artist',
        limit: 6,
      },
      headers: {
        'Authorization': 'Bearer '+ (process.env.USER_ACCESS_TOKEN ? process.env.USER_ACCESS_TOKEN : process.env.ACCESS_TOKEN)
      },
    })
    .then(response => { res.json(response.data) })
    .catch(error => {
      console.log('error')
      res.send({error})
    })
  } else {
    res.status(400).send('No search query.')
  }
})

app.get('/genres', function(req, res) {
  console.log('/genres')
  axios.get('/recommendations/available-genre-seeds', {
    baseURL: 'https://api.spotify.com/v1/',
    headers: {
      'Authorization': 'Bearer '+ (process.env.USER_ACCESS_TOKEN ? process.env.USER_ACCESS_TOKEN : process.env.ACCESS_TOKEN)
    },
  }).then(response => { res.json(response.data) })
  .catch(error => {
    console.log('error, genres')
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
        'Authorization': 'Bearer '+ (process.env.USER_ACCESS_TOKEN ? process.env.USER_ACCESS_TOKEN : process.env.ACCESS_TOKEN)
      },
    }).then(response => { res.json(response.data) })
    .catch(error => {
      console.log('error')
      res.send({error})
    })
  } else {
    res.status(400).send('No recommendation parameters.')
  }
})

app.get('/playlist', function(req, res) {
  console.log('/playlist')
  if(!(process.env.USER_REFRESH_TOKEN && process.env.USER_ACCESS_TOKEN)) {
    console.log('in /playlist, user tokens invalid')
    res.status(400).send('User not logged into Spotify.')
  }
  else if(req.query.uris) {
    var playlist_url = ''
    axios.get('https://api.spotify.com/v1/me', {
      headers: {
        'Authorization': 'Bearer '+ process.env.USER_ACCESS_TOKEN
      }
    }).then(response => {
      console.log('user data aquired, creating playlist now')
      const user_id = response.data.id
      const name = req.query.playlist_name ? req.query.playlist_name : 'recs-controller-export'
      return axios.post("https://api.spotify.com/v1/users/"+user_id+"/playlists", JSON.stringify({name: name}), {
        headers: {
          'Authorization': 'Bearer '+ process.env.USER_ACCESS_TOKEN,
          'Content-Type': 'application/json',
        },
      })
    }).then(response => {
      console.log('playlist created, adding tracks now')
      const playlist_id = response.data.id
      playlist_url = response.data.external_urls.spotify
      return axios.post('https://api.spotify.com/v1/playlists/'+playlist_id+'/tracks', JSON.stringify({uris:req.query.uris}), {
        headers: {
          'Authorization': 'Bearer '+ process.env.USER_ACCESS_TOKEN,
          'Content-Type': 'application/json',
        },
      })
    }).then(response => {
      console.log('tracks added, playlist success')
      res.json(playlist_url)
    }).catch(error => {
      console.log(error)
      res.send(error)
    })
  } else {
    res.status(400).send('No tracks found to add to playlist.')
  }
})

app.listen(port, () => console.log(`Listening on port ${port}!`))

function get_track_features(ids) {
  return axios.get('/audio-features', {
    baseURL: 'https://api.spotify.com/v1/',
    params: { ids: ids },
    headers: {
      'Authorization': 'Bearer '+ (process.env.USER_ACCESS_TOKEN ? process.env.USER_ACCESS_TOKEN : process.env.ACCESS_TOKEN)
    },
  })
}

function get_artists(ids) {
  return axios.get('/artists', {
    baseURL: 'https://api.spotify.com/v1/',
    params: { ids: ids },
    headers: {
      'Authorization': 'Bearer '+ (process.env.USER_ACCESS_TOKEN ? process.env.USER_ACCESS_TOKEN : process.env.ACCESS_TOKEN)
    },
  })
}
