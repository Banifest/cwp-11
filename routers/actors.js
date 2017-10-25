const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express.Router();

let ACTORS = JSON.parse(fs.readFileSync('actors.json'));

function normalizePosition(arr)
{
    arr.sort((a, b) => a.position > b.position ? 1 : -1);
    let lastPos = arr[0].position;
    arr.forEach(iter => iter.position=lastPos++);
}

app.get('/readall', (req, res) =>
{
    res.contentType('application/json');
    ACTORS.sort((a, b) => a.liked < b.liked ? 1 : -1);
    res.send(JSON.stringify(ACTORS));
});

app.get('/read', (req, res) =>
{
    res.contentType('application/json');
    let actor = ACTORS.filter((actor) => Number(req.query.id) === actor.id);
    res.send(actor ? JSON.stringify(actor[0]) : 'not correct params');
});

app.post('/create', (req, res) =>
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

app.post('/update', (req, res) =>
{
    try
    {
        res.contentType('application/json');
        let actor = ACTORS.filter((actor) => Number(req.body.id) === actor.id)[0];

        if (actor)
        {
            actor.name = req.body.name ? req.body.name : actor.name;
            actor.birth = req.body.birth ? req.body.birth : actor.birth;
            actor.films = Number(req.body.films) ? req.body.films : actor.films;
            actor.liked = Number(req.body.liked) ? req.body.liked : actor.liked;
            actor.photo = req.body.photo ? req.body.photo : actor.photo;
        }
        else
        {
            res.send('{"status":"Non correct id"');
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

app.post('/delete', (req, res) =>
{
    try
    {
        res.contentType('application/json');

        if(!ACTORS.filter((actor) => Number(req.body.id) === actor.id).length)
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
                    console.log(ACTORS);
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


module.exports = app;