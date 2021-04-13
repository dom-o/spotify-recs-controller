import Vue from 'vue'
import Vuex from 'vuex'
import persistDataPlugin from '../plugins/persist-data'

Vue.use(Vuex)

const getDefaultState = () => {
  return {
    seed_params_changed: false,
    saved_query: "",
    seed_songs: [],
    seed_genres: [],
    seed_artists: [],
    song_results: [],
    artist_results: [],
    song_recs: [],
    callback_state: '',
    access_token: '',
    login_error: null,
    audio_features: {
      acousticness: {
        name:'acousticness',
        display_name:'Acousticness',
        description:"A confidence measure from 0.0 to 1.0 of whether the track is acoustic. 1.0 represents high confidence the track is acoustic.",
        on: false, number:0, number2:null, compareOption: 'exactly', min: 0.0, max: 1.0
      },
      danceability: {
        name:'danceability',
        display_name:'Danceability',
        description:"Danceability describes how suitable a track is for dancing based on a combination of musical elements including tempo, rhythm stability, beat strength, and overall regularity. A value of 0.0 is least danceable and 1.0 is most danceable.",
        on: false, number:0, number2:null, compareOption: 'exactly', min: 0.0, max: 1.0
      },
      duration_ms: {
        name:'duration_ms',
        display_name:'Duration (ms)',
        description:"The duration of the track in milliseconds.",
        on: false, number:0, number2:null, compareOption: 'exactly', min: 0.0
      },
      energy: {
        name:'energy',
        display_name:'Energy',
        description:"Energy is a measure from 0.0 to 1.0 and represents a perceptual measure of intensity and activity. Typically, energetic tracks feel fast, loud, and noisy. For example, death metal has high energy, while a Bach prelude scores low on the scale. Perceptual features contributing to this attribute include dynamic range, perceived loudness, timbre, onset rate, and general entropy.",
        on: false, number:0, number2:null, compareOption: 'exactly', min: 0.0, max: 1.0
      },
      instrumentalness: {
        name:'instrumentalness',
        display_name:'Instrumentalness',
        description:"Predicts whether a track contains no vocals. “Ooh” and “aah” sounds are treated as instrumental in this context. Rap or spoken word tracks are clearly “vocal”. The closer the instrumentalness value is to 1.0, the greater likelihood the track contains no vocal content. Values above 0.5 are intended to represent instrumental tracks, but confidence is higher as the value approaches 1.0.",
        on: false, number:0, number2:null, compareOption: 'exactly', min: 0.0, max: 1.0
      },
      key: {
        name:'key',
        display_name:'Key',
        description:"The key the track is in. Integers map to pitches using standard Pitch Class notation. E.g. 0 = C, 1 = C♯/D♭, 2 = D, and so on.",
        on: false, number:0, number2:null, compareOption: 'exactly'
      },
      liveness: {
        name:'liveness',
        display_name:'Liveness',
        description:"Detects the presence of an audience in the recording. Higher liveness values represent an increased probability that the track was performed live. A value above 0.8 provides strong likelihood that the track is live.",
        on: false, number:0, number2:null, compareOption: 'exactly', min: 0.0, max: 1.0
      },
      loudness: {
        name:'loudness',
        display_name:'Loudness',
        description:"The overall loudness of a track in decibels (dB). Loudness values are averaged across the entire track and are useful for comparing relative loudness of tracks. Loudness is the quality of a sound that is the primary psychological correlate of physical strength (amplitude). Values typical range between -60 and 0 db.",
        on: false, number:0, number2:null, compareOption: 'exactly'
      },
      mode: {
        name:'mode',
        display_name:'Mode',
        description:"Mode indicates the modality (major or minor) of a track, the type of scale from which its melodic content is derived. Major is represented by 1 and minor is 0.",
        on: false, number:0, number2:null, compareOption: 'exactly'
      },
      popularity: {
        name:'popularity',
        display_name:'Popularity',
        description:"The popularity of the track. The value will be between 0 and 100, with 100 being the most popular. The popularity is calculated by algorithm and is based, in the most part, on the total number of plays the track has had and how recent those plays are.",
        on: false, number:0, number2:null, compareOption: 'exactly', min: 0, max: 100
      },
      speechiness: {
        name:'speechiness',
        display_name:'Speechiness',
        description:"Speechiness detects the presence of spoken words in a track. The more exclusively speech-like the recording (e.g. talk show, audio book, poetry), the closer to 1.0 the attribute value. Values above 0.66 describe tracks that are probably made entirely of spoken words. Values between 0.33 and 0.66 describe tracks that may contain both music and speech, either in sections or layered, including such cases as rap music. Values below 0.33 most likely represent music and other non-speech-like tracks.",
        on: false, number:0, number2:null, compareOption: 'exactly', min: 0.0, max: 1.0
      },
      tempo: {
        name:'tempo',
        display_name:'Tempo',
        description:"The overall estimated tempo of a track in beats per minute (BPM). In musical terminology, tempo is the speed or pace of a given piece and derives directly from the average beat duration.",
        on: false, number:0, number2:null, compareOption: 'exactly'
      },
      time_signature: {
        name:'time_signature',
        display_name:'Time Signature',
        description:"An estimated overall time signature of a track. The time signature (meter) is a notational convention to specify how many beats are in each bar (or measure).",
        on: false, number:0, number2:null, compareOption: 'exactly'
      },
      valence: {
        name:'valence',
        display_name:'Valence',
        description:"A measure from 0.0 to 1.0 describing the musical positiveness conveyed by a track. Tracks with high valence sound more positive (e.g. happy, cheerful, euphoric), while tracks with low valence sound more negative (e.g. sad, depressed, angry).",
        on: false, number:0, number2:null, compareOption: 'exactly', min: 0.0, max: 1.0
      },
    }
  }
}

export default new Vuex.Store({
  plugins: [persistDataPlugin],
  state: getDefaultState(),
  mutations: {
    updateSavedQuery(state, query) {
      state.saved_query =  query
    },
    setSeedParamsChanged(state, value) {
      state.seed_params_changed = Boolean(value)
    },
    removeArtist(state, seed_to_remove) {
      state.seed_artists = state.seed_artists.filter(seed => seed.id != seed_to_remove.id)
      state.seed_params_changed = true
    },
    removeGenre(state, seed_to_remove) {
      state.seed_genres = state.seed_genres.filter(seed => seed != seed_to_remove)
      state.seed_params_changed = true
    },
    removeSong(state, seed_to_remove) {
      state.seed_songs = state.seed_songs.filter(seed => seed.id != seed_to_remove.id)
      state.seed_params_changed = true
    },
    addArtist(state, seed) {
      if(
        state.seed_artists.length+state.seed_genres.length+state.seed_songs.length < 5
        && !state.seed_artists.some(el => el.id == seed.id)
      ) {
        state.seed_artists.push(seed)
        state.seed_params_changed = true
      }
    },
    addGenre(state, seed) {
      if(
        state.seed_artists.length+state.seed_genres.length+state.seed_songs.length < 5
        && !state.seed_genres.includes(seed)
      ) {
        state.seed_genres.push(seed)
        state.seed_params_changed = true
      }
    },
    addSong(state, seed) {
      if(
        state.seed_artists.length+state.seed_genres.length+state.seed_songs.length < 5
        && !state.seed_songs.some(el => el.id == seed.id)
      ) {
        state.seed_songs.push(seed)
        state.seed_params_changed = true
      }
    },
    toggleAudioFeature(state, feature) {
      state.audio_features[feature.id].on = feature.data
      state.seed_params_changed = true
    },
    changeCompareOption(state, feature) {
      state.audio_features[feature.id].compareOption = feature.data
      state.seed_params_changed = true
    },
    changeFeatureNumber(state, feature) {
      state.audio_features[feature.id].number = feature.data
      state.seed_params_changed = true
    },
    changeSecondFeatureNumber(state, feature) {
      state.audio_features[feature.id].number2 = feature.data
      state.seed_params_changed = true
    },
    updateSongResults(state, data) {
      state.song_results = data
    },
    updateArtistResults(state, data) {
      state.artist_results = data
    },
    updateSongRecs(state, data) {
      state.song_recs = data
      state.seed_params_changed = false
    },
    setSongRecs(state, data) {
      state.song_recs = data
    },
    setSeedSongs(state, seeds) {
      state.seed_songs = seeds
    },
    setSeedGenres(state, seeds) {
      state.seed_genres = seeds
    },
    setSeedArtists(state, seeds) {
      state.seed_artists = seeds
    },
    setAudioFeatures(state, features) {
      state.audio_features = features
    },
    setCallbackState(state, callback_state) {
      state.callback_state = callback_state
    },
    setAccessToken(state, token) {
      state.access_token = token
    },
    clearAccessToken(state) {
      state.access_token = getDefaultState().access_token
    },
    setLoginError(state, error) {
      state.login_error = error
    },
    retrieveState() {},
    resetSearchState(state) {
      const save = state.access_token
      Object.assign(state, getDefaultState())
      state.access_token = save
    },
    resetState(state) {
      Object.assign(state, getDefaultState())
    }
  },
  getters: {
    seed_count: state => {
      return (state.seed_artists.length
        + state.seed_genres.length
        + state.seed_songs.length)
    },
  },
})
