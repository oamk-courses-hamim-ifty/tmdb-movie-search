addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request));
  });
  
  async function handleRequest(request) {
    const url = new URL(request.url);
  
    if (url.pathname === "/autocomplete") {
      const query = url.searchParams.get('query');
      if (!query) {
        return new Response(JSON.stringify([]), { headers: { "Content-Type": "application/json" } });
      }
  
      const searchUrl = `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(query)}`;
      const bearerToken = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJmNGM0NzE2MDNjNmE5N2U4NTZjNGEwYjgyMjQyODQ3NiIsIm5iZiI6MTcyODQ3NTA3OC4xNTk3MjMsInN1YiI6IjY3MDY2ZDJiN2UzY2VlN2QzZjljZDY1NyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.a-qfBj6dx6ckByJLLP5epWdkGVQAV2_tiSX-ha3GwW8';
  
      try {
        const response = await fetch(searchUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${bearerToken}`,
            'Content-Type': 'application/json',
          }
        });
  
        if (!response.ok) {
          return new Response('Error fetching suggestions', { status: response.status });
        }
  
        const data = await response.json();
        const suggestions = data.results.slice(0, 5).map(movie => movie.title);
        return new Response(JSON.stringify(suggestions), { headers: { "Content-Type": "application/json" } });
  
      } catch (error) {
        return new Response('Error occurred while fetching suggestions.', { status: 500 });
      }
    }
  
    if (request.method === 'GET' && !url.searchParams.has('query')) {
      return new Response(getFormHTML(), {
        headers: { "Content-Type": "text/html" },
      });
    }
  
    const query = url.searchParams.get('query');
    if (!query) {
      return new Response('Please provide a movie title to search.', { status: 400 });
    }
  
    const searchUrl = `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(query)}`;
    const bearerToken = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJmNGM0NzE2MDNjNmE5N2U4NTZjNGEwYjgyMjQyODQ3NiIsIm5iZiI6MTcyODQ3NTA3OC4xNTk3MjMsInN1YiI6IjY3MDY2ZDJiN2UzY2VlN2QzZjljZDY1NyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.a-qfBj6dx6ckByJLLP5epWdkGVQAV2_tiSX-ha3GwW8';
  
    try {
      const searchResponse = await fetch(searchUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${bearerToken}`,
          'Content-Type': 'application/json',
        }
      });
  
      if (!searchResponse.ok) {
        return new Response(`Error: ${searchResponse.statusText}`, { status: searchResponse.status });
      }
  
      const searchData = await searchResponse.json();
      if (searchData.results.length === 0) {
        return new Response('No movies found for this query.', { status: 404 });
      }
  
      const movie = searchData.results[0];
      const movieId = movie.id;
  
      const movieDetailsUrl = `https://api.themoviedb.org/3/movie/${movieId}?append_to_response=credits`;
      const movieDetailsResponse = await fetch(movieDetailsUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${bearerToken}`,
          'Content-Type': 'application/json',
        }
      });
  
      if (!movieDetailsResponse.ok) {
        return new Response(`Error: ${movieDetailsResponse.statusText}`, { status: movieDetailsResponse.status });
      }
  
      const movieDetails = await movieDetailsResponse.json();
      const leadActors = movieDetails.credits.cast.slice(0, 3).map(actor => actor.name).join(', ');
      const producers = movieDetails.credits.crew.filter(crew => crew.job === 'Producer').map(producer => producer.name).join(', ');
      const productionCompanies = movieDetails.production_companies.map(company => company.name).join(', ');
      const genres = movieDetails.genres.map(genre => genre.name).join(', ');
  
      return new Response(getMovieHTML(movieDetails, leadActors, producers, productionCompanies, genres), {
        headers: { "Content-Type": "text/html" },
      });
  
    } catch (error) {
      return new Response('Error occurred while fetching data.', { status: 500 });
    }
  }
  
  function getFormHTML() {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Ifty</title>
      <style>
        body {
          font-family: 'Courier New', monospace;
          background-color: #141414;
          color: #e5e5e5;
          margin: 0;
          padding: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
        }
        .container {
          background: rgba(0, 0, 0, 0.8);
          padding: 40px;
          border-radius: 10px;
          text-align: center;
          width: 100%;
          max-width: 600px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.7);
        }
        h1 {
          font-size: 2.5rem;
          color: #e50914;
          margin-bottom: 20px;
        }
        .search-box {
          position: relative;
        }
        input[type="text"] {
          padding: 15px;
          width: 80%;
          border: none;
          border-radius: 5px;
          margin-bottom: 10px;
          font-size: 1.2rem;
          background-color: #333;
          color: #fff;
        }
        .suggestions {
          list-style-type: none;
          padding: 0;
          margin: 0;
          background-color: #333;
          color: #fff;
          text-align: left;
          width: 80%;
          border-radius: 5px;
          margin: 0 auto;
        }
        .suggestions li {
          padding: 10px;
          cursor: pointer;
        }
        .suggestions li:hover {
          background-color: #555;
        }
        button {
          background-color: #e50914;
          color: white;
          padding: 15px 25px;
          font-size: 1.2rem;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          transition: background 0.3s ease;
        }
        button:hover {
          background-color: #f40612;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Search Movies</h1>
        <div class="search-box">
          <input type="text" id="search-input" placeholder="Enter movie title..." autocomplete="off" />
          <ul class="suggestions" id="suggestions"></ul>
        </div>
        <form method="GET" action="/">
          <input type="hidden" id="query-hidden" name="query" />
          <button type="submit">Search</button>
        </form>
      </div>
  
      <script>
        const searchInput = document.getElementById('search-input');
        const suggestionsList = document.getElementById('suggestions');
        const hiddenInput = document.getElementById('query-hidden');
  
        searchInput.addEventListener('input', async function() {
          const query = searchInput.value;
          if (query.length < 2) {
            suggestionsList.innerHTML = '';
            return;
          }
  
          const response = await fetch(\`/autocomplete?query=\${encodeURIComponent(query)}\`);
          const suggestions = await response.json();
  
          suggestionsList.innerHTML = suggestions.map(movie => \`<li onclick="selectMovie('\${movie}')">\${movie}</li>\`).join('');
        });
  
        function selectMovie(movie) {
          searchInput.value = movie;
          hiddenInput.value = movie;
          suggestionsList.innerHTML = '';
        }
      </script>
    </body>
    </html>
    `;
  }
  
  function getMovieHTML(movie, leadActors, producers, productionCompanies, genres) {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${movie.title}</title>
      <style>
        body {
          font-family: 'Courier New', monospace;
          background-color: #141414;
          color: #e5e5e5;
          margin: 0;
          padding: 20px;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
        }
        .movie-container {
          background-color: #000;
          padding: 20px;
          border-radius: 10px;
          max-width: 900px;
          text-align: left;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.8);
        }
        h2 {
          font-size: 2.5rem;
          margin-bottom: 10px;
          color: #fff;
          text-align: left;
        }
        img {
          display: block;
          margin: 0 auto 20px;
          max-width: 50%;
          border-radius: 10px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.8);
        }
        .release-date, p {
          font-size: 1.2rem;
          color: #b3b3b3;
          margin-top: 10px;
        }
        .release-date b, p b {
          color: #fff;
        }
        .btn-back {
          background-color: #e50914;
          color: white;
          padding: 10px 20px;
          font-size: 1.2rem;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          transition: background 0.3s ease;
          display: inline-block;
          margin-top: 20px;
        }
        .btn-back:hover {
          background-color: #f40612;
        }
      </style>
    </head>
    <body>
      <div class="movie-container">
        <h2>${movie.title}</h2>
        <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title} Poster" />
        <p class="release-date"><b>Release Date:</b> ${movie.release_date}</p>
        <p><b>Overview:</b> ${movie.overview}</p>
        <p><b>Lead Actors:</b> ${leadActors}</p>
        <p><b>Producers:</b> ${producers}</p>
        <p><b>Production Companies:</b> ${productionCompanies}</p>
        <p><b>Genres:</b> ${genres}</p> <!-- Genre added here -->
        <p><b>Rating:</b> ${movie.vote_average}/10</p>
        <a href="/"><button class="btn-back">Search Again</button></a>
      </div>
    </body>
    </html>
    `;
  }
  