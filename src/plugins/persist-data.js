const plugin = store => {
  store.subscribe((mutation, state) => {
    if(mutation.type === "updateSavedQuery") {
      try {
        localStorage.setItem('saved_query', JSON.stringify(state.saved_query))
      } catch(error) { console.log(error) }
    }
    if(mutation.type=== 'updateSongRecs') {
      try {
        localStorage.setItem('song_recs', JSON.stringify(state.song_recs))
        localStorage.setItem('seed_params_changed', JSON.stringify(state.seed_params_changed))
      } catch(error) { console.log(error) }
    } else if(mutation.type === 'addSong' || mutation.type === 'removeSong') {
      try {
        localStorage.setItem('seed_songs', JSON.stringify(state.seed_songs))
        localStorage.setItem('seed_params_changed', JSON.stringify(state.seed_params_changed))
      } catch(error) { console.log(error) }
    } else if(mutation.type === 'addArtist' || mutation.type === 'removeArtist') {
      try {
        localStorage.setItem('seed_artists', JSON.stringify(state.seed_artists))
        localStorage.setItem('seed_params_changed', JSON.stringify(state.seed_params_changed))
      } catch(error) { console.log(error) }
    } else if(mutation.type === 'addGenre' || mutation.type === 'removeGenre') {
      try {
        localStorage.setItem('seed_genres', JSON.stringify(state.seed_genres))
        localStorage.setItem('seed_params_changed', JSON.stringify(state.seed_params_changed))
      } catch(error) { console.log(error) }
    } else if(mutation.type === 'toggleAudioFeature' ||
      mutation.type === 'changeCompareOption' ||
      mutation.type === 'changeFeatureNumber' ||
      mutation.type === 'changeSecondFeatureNumber')
    {
      try {
        localStorage.setItem('audio_features', JSON.stringify(state.audio_features))
        localStorage.setItem('seed_params_changed', JSON.stringify(state.seed_params_changed))
      } catch (error) { console.log(error) }
    } else if(mutation.type === 'setCallbackState') {
      try { localStorage.setItem('callback_state', JSON.stringify(state.callback_state)) }
      catch(error) { console.log(error) }
    } else if(mutation.type === 'setAccessToken') {
      try { localStorage.setItem('access_token', JSON.stringify(state.access_token)) }
      catch(error) { console.log(error) }
    } else if(mutation.type === 'clearAccessToken') {
      try { localStorage.removeItem('access_token') }
      catch(error) { console.log(error) }
    } else if(mutation.type === 'retrieveState') {
      retrieveStorage('song_recs', 'setSongRecs', store)
      retrieveStorage('audio_features', 'setAudioFeatures', store)
      retrieveStorage('seed_artists', 'setSeedArtists', store)
      retrieveStorage('seed_genres', 'setSeedGenres', store)
      retrieveStorage('seed_songs', 'setSeedSongs', store)
      retrieveStorage('seed_params_changed', 'setSeedParamsChanged', store)
      retrieveStorage('saved_query', 'updateSavedQuery', store)
      retrieveStorage('callback_state', 'setCallbackState', store)
      retrieveStorage('access_token', 'setAccessToken', store)
    } else if (mutation.type === 'resetState') {
      localStorage.clear()
    }
  })
}

function retrieveStorage(item_name, mutation, store, timestamp_name=null) {
  let storage = null, timestamp = null
  try {
    storage = localStorage.getItem(item_name)

    if(storage) { storage = JSON.parse(storage) }
  } catch(error) { console.log(error) }

  if(timestamp_name) {
    try {
      timestamp = localStorage.getItem(timestamp_name)
      if (timestamp) { timestamp = JSON.parse(timestamp)
      }
    } catch(error) { console.log(error) }
  }

  if (storage) {
    if (timestamp_name) {
      if (timestamp && new Date().getTime() < timestamp) {
        store.commit(mutation, storage)
      } else {
        localStorage.removeItem(item_name)
        localStorage.removeItem(timestamp_name)
      }
    } else {
      store.commit(mutation, storage)
    }
  }
}

export default plugin
