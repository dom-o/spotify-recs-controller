const persistInterval = 1000 * 60 * 60 * 24

const plugin = store => {
  store.subscribe((mutation, state) => {
    if(mutation.type=== 'updateSongRecs') {
      try {
        localStorage.setItem('song_recs', JSON.stringify(state.song_recs))
      } catch(error) {}
    } else if(mutation.type === 'addSong' || mutation.type === 'removeSong')
    {
      try {
        localStorage.setItem('seed_songs', JSON.stringify(state.seed_songs))
      } catch(error) {}
    } else if(mutation.type === 'addArtist' || mutation.type === 'removeArtist')
    {
      try {
        localStorage.setItem('seed_artists', JSON.stringify(state.seed_artists))
      } catch(error) {}
    } else if(mutation.type === 'addGenre' || mutation.type === 'removeGenre')
    {
      try {
        localStorage.setItem('seed_genres', JSON.stringify(state.seed_genres))
      } catch(error) {}
    } else if(mutation.type === 'toggleAudioFeature' ||
      mutation.type === 'changeCompareOption' ||
      mutation.type === 'changeFeatureNumber' ||
      mutation.type === 'changeSecondFeatureNumber')
    {
      try {
        localStorage.setItem('audio_features', JSON.stringify(state.audio_features))
      } catch (error) {}
    } else if(mutation.type === 'retrieveState') {
      retrieveStorage('song_recs', 'updateSongRecs', store)
      retrieveStorage('audio_features', 'setAudioFeatures', store)
      retrieveStorage('seed_artists', 'setSeedArtists', store)
      retrieveStorage('seed_genres', 'setSeedGenres', store)
      retrieveStorage('seed_songs', 'setSeedSongs', store)
    } else if (mutation.type === 'resetSearchState') {
      localStorage.removeItem('song_recs')
      localStorage.removeItem('audio_features')
      localStorage.removeItem('seed_artists')
      localStorage.removeItem('seed_genres')
      localStorage.removeItem('seed_songs')
    } else if(mutation.type === 'clearStorage') {
      localStorage.clear()
    }
  })
}

function retrieveStorage(item_name, mutation, store, timestamp_name=null) {
  let storage = null, timestamp = null
  try {
    storage = localStorage.getItem(item_name)

    if(storage) { storage = JSON.parse(storage) }
  } catch(error) {}

  if(timestamp_name) {
    try {
      timestamp = localStorage.getItem(timestamp_name)
      if (timestamp) { timestamp = JSON.parse(timestamp)
      }
    } catch(error) {}
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
