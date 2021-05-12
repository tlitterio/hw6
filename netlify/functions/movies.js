// allows us to read csv files
let csv = require('neat-csv')

// allows us to read files from disk
let fs = require('fs')

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
      let objectRuntime = moviesFromCsv[i].runtimeMinutes
      //match lowercase - drove me crazy that I was not matching lower case in URL
      let objectGenres = []
      let genreTemp = moviesFromCsv[i].genres.split(",")
      for (let g=0;g<genreTemp.length;g++){
        objectGenres.push(genreTemp[g].toLowerCase())
      }
      //moviesFromCsv[i].genres.toLowerCase()
      genre = genre.toLowerCase()
      //skip any movies that have \\N for Genre or runtime
      if (objectRuntime == `\\N` || objectGenres.includes(`\\N`)) {continue}
      //check if year and genre match
      if (year==objectYear && objectGenres.includes(genre)){
        //increment count
        returnValue.numResults++
        //create returnObject with required fields
        let movie = {
          Title: objectTitle,
          Released: objectYear,
          Runtime: objectRuntime,
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