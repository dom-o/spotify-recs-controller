module.exports ={
  publicPath: process.env.NODE_ENV === 'production'
    ? '/spotify-recs-controller'
    : '/'
}
