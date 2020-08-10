const plugin = store => {
  store.subscribe((mutation, state) => {
    if(mutation.type=== 'updateSongRecs') {
      try {
        localStorage.setItem('song_recs', JSON.stringify(state.song_recs))
      } catch(error) {}
    } else if(mutation.type === 'addSong' ||
      mutation.type === 'removeSong')
    {
      try {
        localStorage.setItem('seed_songs', JSON.stringify(state.seed_songs))
      } catch(error) {}
    } else if(mutation.type === 'addArtist' ||
      mutation.type === 'removeArtist')
    {
      try {
        localStorage.setItem('seed_artists', JSON.stringify(state.seed_artists))
      } catch(error) {}
    } else if(mutation.type === 'addGenre' ||
      mutation.type === 'removeGenre')
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
    } else if(mutation.type === 'setAccessToken') {
      try {
        localStorage.setItem('access_token', JSON.stringify(state.access_token))
      } catch (error) {}
    } else if(mutation.type === 'setRefreshToken') {
      try{
        localStorage.setItem('refresh_token', JSON.stringify(state.refresh_token))
      } catch (error) {}
    } else if(mutation.type === 'retrieveData') {
      retrieveStorage('song_recs', 'updateSongRecs', store)
      retrieveStorage('audio_features', 'setAudioFeatures', store)
      retrieveStorage('seed_artists', 'setSeedArtists', store)
      retrieveStorage('seed_genres', 'setSeedGenres', store)
      retrieveStorage('seed_songs', 'setSeedSongs', store)
      retrieveStorage('access_token', 'setAccessToken', store)
      retrieveStorage('refresh_token', 'setRefreshToken', store)
    } else if(mutation.type === 'retrieveAuthState') {
      retrieveStorage('access_token', 'setAccessToken', store)
      retrieveStorage('refresh_token', 'setRefreshToken', store)
    } else if (mutation.type === 'resetSearchState') {
      localStorage.removeItem('song_recs')
      localStorage.removeItem('audio_features')
      localStorage.removeItem('seed_artists')
      localStorage.removeItem('seed_genres')
      localStorage.removeItem('seed_songs')
    } else if(mutation.type === 'resetAuthState') {
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('access_token')
    } else if(mutation.type === 'clearStorage') {
      localStorage.clear()
    }
  })
}

function retrieveStorage(item_name, mutation, store) {
  let storage = null
  try {
    storage = localStorage.getItem(item_name)
    if(storage) {
      storage = JSON.parse(storage)
    }
  } catch(error) {}

  if(storage) {
    store.commit(mutation, storage)
  }
}

export default plugin
