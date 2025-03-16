addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
    const url = new URL(request.url);
    const type = url.searchParams.get('type') || 'movie'; // Default to movie

    if (url.pathname === "/autocomplete") {
        const query = url.searchParams.get('query');
        if (!query) {
            return new Response(JSON.stringify([]), { headers: { "Content-Type": "application/json" } });
        }

        const searchUrl = `https://api.themoviedb.org/3/search/${type}?query=${encodeURIComponent(query)}`;
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
            const suggestions = data.results.slice(0, 5).map(item => item.title || item.name);
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
        return new Response('Please provide a title to search.', { status: 400 });
    }

    const searchUrl = `https://api.themoviedb.org/3/search/${type}?query=${encodeURIComponent(query)}`;
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
            return new Response('No results found for this query.', { status: 404 });
        }

        const item = searchData.results[0];
        const itemId = item.id;
        const endpoint = type === 'movie' ? 'movie' : 'tv';
        
        const detailsUrl = `https://api.themoviedb.org/3/${endpoint}/${itemId}?append_to_response=credits`;
        const detailsResponse = await fetch(detailsUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${bearerToken}`,
                'Content-Type': 'application/json',
            }
        });

        if (!detailsResponse.ok) {
            return new Response(`Error: ${detailsResponse.statusText}`, { status: detailsResponse.status });
        }

        const details = await detailsResponse.json();
        const leadActors = details.credits.cast.slice(0, 3).map(actor => actor.name).join(', ');
        const producers = details.credits.crew.filter(crew => crew.job === 'Producer').map(producer => producer.name).join(', ');
        const productionCompanies = details.production_companies.map(company => company.name).join(', ');
        const genres = details.genres.map(genre => genre.name).join(', ');

        return new Response(getItemHTML(details, leadActors, producers, productionCompanies, genres, type), {
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
        <title>Entertainment Search</title>
        <link href="https://fonts.googleapis.com/css2?family=Merriweather+Sans:wght@400;700&display=swap" rel="stylesheet">
        <style>
            body {
                font-family: 'Merriweather Sans', sans-serif;
                background: linear-gradient(135deg, #1a1a1a, #2d2d2d);
                color: #e5e5e5;
                margin: 0;
                padding: 0;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
            }
            .container {
                background: rgba(0, 0, 0, 0.85);
                padding: 40px;
                border-radius: 15px;
                text-align: center;
                width: 90%;
                max-width: 700px;
                box-shadow: 0 15px 40px rgba(0, 0, 0, 0.5);
            }
            h1 {
                font-size: 2.8rem;
                color: #e50914;
                margin-bottom: 30px;
                text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
            }
            .search-box {
                position: relative;
                margin-bottom: 20px;
            }
            select, input[type="text"] {
                padding: 15px;
                width: 80%;
                border: none;
                border-radius: 8px;
                margin: 10px auto;
                font-size: 1.1rem;
                background-color: #2a2a2a;
                color: #fff;
                display: block;
            }
            select {
                width: 50%;
                cursor: pointer;
            }
            .suggestions {
                list-style-type: none;
                padding: 0;
                margin: 0;
                background-color: #2a2a2a;
                color: #fff;
                text-align: left;
                width: 80%;
                border-radius: 8px;
                margin: 0 auto;
                position: absolute;
                left: 50%;
                transform: translateX(-50%);
                z-index: 10;
            }
            .suggestions li {
                padding: 12px;
                cursor: pointer;
                transition: background 0.2s ease;
            }
            .suggestions li:hover {
                background-color: #444;
            }
            button {
                background-color: #e50914;
                color: white;
                padding: 15px 30px;
                font-size: 1.2rem;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.3s ease;
                box-shadow: 0 4px 15px rgba(229, 9, 20, 0.3);
            }
            button:hover {
                background-color: #f40612;
                transform: translateY(-2px);
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Search Movies & TV Shows</h1>
            <div class="search-box">
                <select id="search-type" name="type">
                    <option value="movie">Movies</option>
                    <option value="tv">TV Shows</option>
                </select>
                <input type="text" id="search-input" placeholder="Enter title..." autocomplete="off" />
                <ul class="suggestions" id="suggestions"></ul>
            </div>
            <form method="GET" action="/">
                <input type="hidden" id="query-hidden" name="query" />
                <input type="hidden" id="type-hidden" name="type" />
                <button type="submit">Search</button>
            </form>
        </div>

        <script>
            const searchInput = document.getElementById('search-input');
            const suggestionsList = document.getElementById('suggestions');
            const hiddenInput = document.getElementById('query-hidden');
            const typeSelect = document.getElementById('search-type');
            const typeHidden = document.getElementById('type-hidden');

            searchInput.addEventListener('input', async function() {
                const query = searchInput.value;
                const type = typeSelect.value;
                if (query.length < 2) {
                    suggestionsList.innerHTML = '';
                    return;
                }

                const response = await fetch(\`/autocomplete?query=\${encodeURIComponent(query)}&type=\${type}\`);
                const suggestions = await response.json();

                suggestionsList.innerHTML = suggestions.map(item => \`<li onclick="selectItem('\${item}')">\${item}</li>\`).join('');
            });

            function selectItem(item) {
                searchInput.value = item;
                hiddenInput.value = item;
                typeHidden.value = typeSelect.value;
                suggestionsList.innerHTML = '';
            }

            typeSelect.addEventListener('change', () => {
                searchInput.value = '';
                suggestionsList.innerHTML = '';
                typeHidden.value = typeSelect.value;
            });
        </script>
    </body>
    </html>
    `;
}

function getItemHTML(item, leadActors, producers, productionCompanies, genres, type) {
    const title = item.title || item.name;
    const releaseDate = item.release_date || item.first_air_date;
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <link href="https://fonts.googleapis.com/css2?family=Merriweather+Sans:wght@400;700&display=swap" rel="stylesheet">
        <style>
            body {
                font-family: 'Merriweather Sans', sans-serif;
                background: linear-gradient(135deg, #1a1a1a, #2d2d2d);
                color: #e5e5e5;
                margin: 0;
                padding: 20px;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
            }
            .item-container {
                background: rgba(0, 0, 0, 0.9);
                padding: 30px;
                border-radius: 15px;
                max-width: 1000px;
                text-align: left;
                box-shadow: 0 15px 40px rgba(0, 0, 0, 0.5);
            }
            h2 {
                font-size: 2.8rem;
                margin-bottom: 20px;
                color: #fff;
                text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
            }
            img {
                display: block;
                margin: 0 auto 20px;
                max-width: 60%;
                border-radius: 10px;
                box-shadow: 0 5px 20px rgba(0, 0, 0, 0.6);
            }
            .release-date, p {
                font-size: 1.2rem;
                color: #b3b3b3;
                margin: 15px 0;
                line-height: 1.5;
            }
            .release-date b, p b {
                color: #fff;
                font-weight: 700;
            }
            .btn-back {
                background-color: #e50914;
                color: white;
                padding: 12px 25px;
                font-size: 1.2rem;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.3s ease;
                display: inline-block;
                margin-top: 25px;
                box-shadow: 0 4px 15px rgba(229, 9, 20, 0.3);
            }
            .btn-back:hover {
                background-color: #f40612;
                transform: translateY(-2px);
            }
        </style>
    </head>
    <body>
        <div class="item-container">
            <h2>${title}</h2>
            <img src="https://image.tmdb.org/t/p/w500${item.poster_path}" alt="${title} Poster" />
            <p class="release-date"><b>${type === 'movie' ? 'Release Date' : 'First Air Date'}:</b> ${releaseDate}</p>
            <p><b>Overview:</b> ${item.overview}</p>
            <p><b>Lead Actors:</b> ${leadActors}</p>
            <p><b>Producers:</b> ${producers}</p>
            <p><b>Production Companies:</b> ${productionCompanies}</p>
            <p><b>Genres:</b> ${genres}</p>
            <p><b>Rating:</b> ${item.vote_average}/10</p>
            <a href="/"><button class="btn-back">Search Again</button></a>
        </div>
    </body>
    </html>
    `;
}
