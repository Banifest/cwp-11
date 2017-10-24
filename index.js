const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();
app.use(bodyParser.urlencoded({extended: true}), express.static('public'));

let FILMS = JSON.parse(fs.readFileSync('top250.json'));

function normalizePosition(arr)
{
    let lastPos = arr[0].position;
    arr.sort((a, b) => a.position > b.position ? 1 : -1);
    arr.forEach(iter=>
                  {
                      iter.position=lastPos++;
                  });
}

app.get('/', (req, res) =>
{
    res.send('Hello world');
});

app.get('/api/films/readall', (req, res) =>
{
    res.contentType('application/json');
    FILMS.sort((a, b) => a.position > b.position ? 1 : -1);
    res.send(JSON.stringify(FILMS));
});

app.get('/api/films/read', (req, res) =>
{
    res.contentType('application/json');
    let film = FILMS.filter((film) => Number(req.query.id) === film.id);
    res.send(film ? JSON.stringify(film[0]) : 'not correct params');
});

app.post('/api/films/create', (req, res) =>
{
    try
    {
        res.contentType('application/json');

        if(req.body.year < 1895 || req.body.budget < 0 || req.body.gross < 0 ||
            req.body.poster === '' || Number(req.body.rating) > 10 || Number(req.body.rating) <= 0)
        {
            res.send('{"status":"NOT CORRECT PARAMS"}');
            return;
        }

        let idMax = 0;
        for (let iter of FILMS)
        {
            idMax = Math.max(iter.id, idMax);
        }
        let newFilm =
            ({
                id: idMax + 1,
                title: req.body.title,
                rating: req.body.rating,
                year: Number(req.body.year),
                budget: Number(req.body.budget),
                gross: Number(req.body.gross),
                poster: req.body.poster,
                position: Number(req.body.position)
            });

        if (FILMS.filter((film) => Number(req.body.position) === film.position).length)
        {
            FILMS = FILMS.filter((film) => Number(req.body.position) > film.position)
                .concat([newFilm], FILMS.filter((film) =>
                                                {
                                                    if (film.position >= req.body.position)
                                                    {
                                                        film.position++;
                                                        return true;
                                                    }
                                                }));
        }
        normalizePosition(FILMS);

        FILMS.sort((a, b) => a.position > b.position ? 1 : -1);
        fs.writeFile('top250.json', JSON.stringify(FILMS));
        res.send(JSON.stringify(newFilm));
    }
    catch (err)
    {
        console.log(err);
        res.send('{"status":"Non correct params"');
    }
});

app.post('/api/films/update', (req, res) =>
{
    try
    {
        if(req.body.year < 1895 || req.body.budget < 0 || req.body.gross < 0 ||
            req.body.poster === '' || Number(req.body.rating) > 10 || Number(req.body.rating) <= 0)
        {
            res.send('{"status":"NOT CORRECT PARAMS"}');
            return;
        }


        res.contentType('application/json');
        let film = FILMS.filter((film) => Number(req.body.id) === film.id)[0];

        if (req.body.position && Number(req.body.position) !== film.position &&
            FILMS.filter((film) => Number(req.body.position) === film.position).length)
        {
            FILMS = FILMS.filter((film) => Number(req.body.position) > film.position)
                .concat(FILMS.filter((film) =>
                                     {
                                         if (film.position >= req.body.position)
                                         {
                                             film.position++;
                                             return true;
                                         }
                                     }));
        }

        if (film)
        {
            film.title = req.body.title ? req.body.title : film.title;
            film.rating = req.body.rating ? req.body.rating : film.rating;
            film.year = Number(req.body.year) ? req.body.year : film.year;
            film.budget = Number(req.body.budget) ? req.body.budget : film.budget;
            film.gross = Number(req.body.gross) ? req.body.gross : film.gross;
            film.poster = req.body.poster ? req.body.poster : film.poster;
            film.position = Number(req.body.position) ? req.body.position : film.position;
        }
        else
        {
            throw 'bad id';
        }

        normalizePosition(FILMS);
        fs.writeFile('top250.json', JSON.stringify(FILMS));
        res.send('{"status":"OK"}');
    }
    catch (err)
    {
        res.send('{"status":"error"}');
    }
});

app.post('/api/films/delete', (req, res) =>
{
    try
    {
        res.contentType('application/json');


        if(!FILMS.filter((film) => Number(req.query.id) === film.id).length)
        {
            console.log("aa");
            res.send('{"status":"NOT CORRECT ID"}');
        }
        else
        {
            for (let iter = 0; iter < FILMS.length; iter++)
            {
                if (FILMS[iter].id === Number(req.body.id))
                {
                    FILMS.splice(iter, 1);
                    break;
                }
            }

            normalizePosition(FILMS);
            fs.writeFile('top250.json', JSON.stringify(FILMS));
            res.send('{"status":"OK"}');
        }

    }
    catch (err)
    {
        res.send('{"status":"error"');
    }
});


app.listen(3000, () =>
{
    console.log('Example app listening on port 3000!');
});