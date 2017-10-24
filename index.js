const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();
app.use(bodyParser.urlencoded({extended: true}), express.static('images/actors'));

let FILMS = JSON.parse(fs.readFileSync('top250.json'));
let ACTORS = JSON.parse(fs.readFileSync('actors.json'));

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

app.get('/api/actors/readall', (req, res) =>
{
    res.contentType('application/json');
    ACTORS.sort((a, b) => a.liked < b.liked ? 1 : -1);
    res.send(JSON.stringify(ACTORS));
});

app.get('/api/actors/read', (req, res) =>
{
    res.contentType('application/json');
    let actor = ACTORS.filter((actor) => Number(req.query.id) === actor.id);
    res.send(actor ? JSON.stringify(actor[0]) : 'not correct params');
});

app.post('/api/films/create', (req, res) =>
{
    try
    {
        res.contentType('application/json');

        if (!req.body.name || !req.body.birth || !req.body.films || !req.body.liked || !req.body.photo)
        {
            res.send('{"status":"Non correct params"');
            return;
        }

        let idMax = 0;
        for (let iter of ACTORS)
        {
            idMax = Math.max(iter.id, idMax);
        }
        let newActor =
            ({
                id: idMax + 1,
                name: req.body.name,
                birth:req.body.birth,
                films: req.body.films,
                liked: req.body.liked,
                photo: req.body.photo
            });

        ACTORS.push(newActor);
        fs.writeFile('actors.json', JSON.stringify(ACTORS));
        res.send(JSON.stringify(newActor));
    }
    catch (err)
    {
        console.log(err);
        res.send('{"status":"Non correct params"');
    }
});

app.post('/api/actors/update', (req, res) =>
{
    try
    {
        res.contentType('application/json');
        let actor = ACTORS.filter((actor) => Number(req.body.id) === actor.id)[0];

        if (actor)
        {
            actor.title = req.body.title ? req.body.title : film.title;
            actor.rating = req.body.rating ? req.body.rating : film.rating;
            actor.year = Number(req.body.year) ? req.body.year : film.year;
            actor.budget = Number(req.body.budget) ? req.body.budget : film.budget;
            actor.gross = Number(req.body.gross) ? req.body.gross : film.gross;
            actor.poster = req.body.poster ? req.body.poster : film.poster;
            actor.position = Number(req.body.position) ? req.body.position : film.position;
        }
        else
        {
            res.send('{"status":"Non correct params"');
            return;
        }

        fs.writeFile('actors.json', JSON.stringify(ACTORS));
        res.send('{"status":"OK"}');
    }
    catch (err)
    {
        res.send('{"status":"error"}');
    }
});

app.post('/api/actors/delete', (req, res) =>
{
    try
    {
        res.contentType('application/json');

        if(!ACTORS.filter((actor) => Number(req.query.id) === acotr.id).length)
        {
            res.send('{"status":"NOT CORRECT ID"}');
            return;
        }
        else
        {
            for (let iter = 0; iter < ACTORS.length; iter++)
            {
                if (ACTORS[iter].id === Number(req.body.id))
                {
                    ACTORS.splice(iter, 1);
                    break;
                }
            }

            fs.writeFile('actors.json', JSON.stringify(ACTORS));
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
