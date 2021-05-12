// allows us to read csv files
let csv = require('neat-csv')

// allows us to read files from disk
let fs = require('fs')
const { SSL_OP_SSLEAY_080_CLIENT_DH_BUG } = require('constants')

// defines a lambda function
exports.handler = async function(event) {
  // write the event object to the back-end console
  //console.log(event)

  // read movies CSV file from disk
  let moviesFile = fs.readFileSync(`./movies.csv`)
  
  // turn the movies file into a JavaScript object, wait for that to happen
  let moviesFromCsv = await csv(moviesFile)

  // write the movies to the back-end console, check it out
  //console.log(moviesFromCsv[0])

  // 🔥 hw6: your recipe and code starts here!
  let year = event.queryStringParameters.year
  let genre = event.queryStringParameters.genre

  if (year == undefined || genre == undefined) {
    return {
      statusCode: 200, // https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
      body: `Syntax Error Year and Genre required
      Please format as follows: .netlify/functions/movies?year=2018&genre=Comedy`// a string of data
    }
  }
  else {
    let returnValue = {
      numResults: 0,
      movies: []
    }
    for (let i=0; i < moviesFromCsv.length; i++) {
      //define a variable for the movie title
      let objectTitle = moviesFromCsv[i].primaryTitle
      //define objectYear and objectGenre for comparison
      let objectYear = moviesFromCsv[i].startYear
      //runtimeMinutes variable for testing
      let objectRuntime = moviesFromCsv[i].runtimeMinutes
      //empty array of genres to fill for movie object; not sure this is completely necesary but have a feeling may leed to problems or weird formating if not done
      let objectGenres = []
      //split genres for correct formating
      let genreReturn = moviesFromCsv[i].genres.split(",")
                            //switch to lowercase for future matching - drove me crazy that I was not matching lower case in URL
      for (let g=0;g<genreReturn.length;g++){
        objectGenres.push(genreReturn[g])
      }
      //created to convert genres to lowercase for consistent matching yet still preserving the case in the return data; tried adding .toLowercase() inline in the below match but being an array did not work.
      let genreMatch = []
      for (let t=0;t<objectGenres.length;t++){genreMatch.push(objectGenres[t].toLowerCase())}
      genre = genre.toLowerCase()
      //skip any movies that have \\N for Genre or runtime
      if (objectRuntime == `\\N` || genreMatch.includes(`\\N`)) {continue}

      //check if year and genre match
      if (year==objectYear && genreMatch.includes(genre)){
        //increment count
        returnValue.numResults++
        //create returnObject with required fields
        let movie = {
          Title: objectTitle,
          Released: objectYear,
          //Runtime: objectRuntime,
          Genres: objectGenres
        }
        //add movie to return results
        returnValue.movies.push(movie)
      }
    }

    // a lambda function returns a status code and a string of data
    return {
      statusCode: 200, // https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
      body: JSON.stringify(returnValue)//`Hello from the back-end!` // a string of data
    }
  }
}