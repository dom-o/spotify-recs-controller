const plugin = store => {
  store.subscribe((mutation, state) => {
    if(mutation.type=== 'updateSongRecs') {
      try {
        localStorage.setItem('song_recs', JSON.stringify(state.song_recs))
      } catch(error) {}
    }
    if(mutation.type === 'addSong' ||
      mutation.type === 'removeSong')
    {
      try {
        localStorage.setItem('seed_songs', JSON.stringify(state.seed_songs))
      } catch(error) {}
    }
    if(mutation.type === 'addArtist' ||
      mutation.type === 'removeArtist')
    {
      try {
        localStorage.setItem('seed_artists', JSON.stringify(state.seed_artists))
      } catch(error) {}
    }
    if(mutation.type === 'addGenre' ||
      mutation.type === 'removeGenre')
    {
      try {
        localStorage.setItem('seed_genres', JSON.stringify(state.seed_genres))
      } catch(error) {}
    }
    if(mutation.type === 'toggleAudioFeature' ||
      mutation.type === 'changeCompareOption' ||
      mutation.type === 'changeFeatureNumber' ||
      mutation.type === 'changeSecondFeatureNumber')
    {
      try {
        localStorage.setItem('audio_features', JSON.stringify(state.audio_features))
      } catch (error) {}
    }
    if(mutation.type === 'setUserAccessToken') {
      try {
        localStorage.setItem('user_access_token', JSON.stringify(state.user_access_token))
      } catch (error) {}
    }
    if(mutation.type === 'setUserRefreshToken') {
      try{
        localStorage.setItem('user_refresh_token', JSON.stringify(state.user_refresh_token))
      } catch (error) {}
    }
    if(mutation.type === 'retrieveData') {
      retrieveStorage('song_recs', 'updateSongRecs', store)
      retrieveStorage('audio_features', 'setAudioFeatures', store)
      retrieveStorage('seed_artists', 'setSeedArtists', store)
      retrieveStorage('seed_genres', 'setSeedGenres', store)
      retrieveStorage('seed_songs', 'setSeedSongs', store)
      retrieveStorage('user_access_token', 'setUserAccessToken', store)
      retrieveStorage('user_refresh_token', 'setUserRefreshToken', store)
    }
    if(mutation.type === 'clearStorage') {
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
