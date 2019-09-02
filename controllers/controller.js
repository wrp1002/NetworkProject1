var data = [];
var updateCount = 0;

const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'project1',
    password: 'raspberry!!!',
    port: 5432,
  });


module.exports = function(app) {  
    app.get('/', async (req, res) => {
        //res.send('Hello World!');
       // res.render('fullList', {todos: data});
        try {
            const client = await pool.connect();
            var result = await client.query('SELECT * FROM todo');

            res.render('fullList', {'todos': result.rows});

            client.release();

        } catch (err) {
            console.error(err);
            res.send("Error " + err);
        }
    });
    
    app.post('/add', async (req, res) => {
         console.log(req.body);
        //data.push(req.body);

        const client = await pool.connect();
        let done = req.body.done ? 1 : 0;
        client.query('INSERT INTO todo (task, username, done) values ($1, $2, $3)', [req.body.task, req.body.username, done], (error, results) => {
            if (error) throw error;    
        });

        var result = await client.query('SELECT * FROM todo');

        res.render('todoList', {'todos': result.rows});

        client.release();

        updateCount++;

    });

    app.post('/edit', async (req, res) => {
        console.log(req.body);
        let editData = req.body;
        let id = req.body.id;
        let done = req.body.done ? 1 : 0;
        
        const client = await pool.connect();
        client.query('UPDATE todo SET task=$1, username=$2, done=$3 WHERE id=$4', [editData.task, editData.username, done, id], (error, results) => {
            if (error) throw error;    
        });

        var result = await client.query('SELECT * FROM todo');
        client.release();

        res.json(result.rows);

        updateCount++;
    });


    app.post('/delete', async (req, res) => {
        console.log(req.body);
        let editData = req.body;
        let id = req.body.id;

        const client = await pool.connect();
        let done = req.body.done ? 1 : 0;
        client.query('DELETE FROM todo WHERE ID=$1', [id], (error, results) => {
            if (error) throw error;    
        });

        var result = await client.query('SELECT * FROM todo');
        client.release();
        
        res.json(result.rows);

        updateCount++;
    });
    

    app.post('/request', async (req, res) => {
        console.log("UPDATE");
        let request = req.body.request;
        
        const client = await pool.connect();
        var result = await client.query('SELECT * FROM todo');
        client.release();

        res.json(result.rows);
    });

    app.post('/updateCount', function(req, res) {
        //res.send(toString(updateCount));
        //res.render('doneList', {todos: data});
        res.json({count: updateCount});
    });
    
}