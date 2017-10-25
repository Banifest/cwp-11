const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const api = require('./routers/api');

const app = express();

app.use('/api', api);
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));

function normalizePosition(arr)
{
    arr.sort((a, b) => a.position > b.position ? 1 : -1);
    let lastPos = arr[0].position;
    arr.forEach(iter => iter.position=lastPos++);
}

app.get('/', (req, res) =>
{
    res.send('Hello world');
});

app.get('/images/actors/:name', (req,res)=>
{
    fs.stat(`public/images/actors/${req.params.name}`, (err, status) =>
    {
        !status ? res.redirect('../actors/NO.png') : res.sendFile(`images/actors/${req.params.name}`)
    });
});


app.listen(3000, () =>
{
    console.log('Example app listening on port 3000!');
});
