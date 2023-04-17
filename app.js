const express = require('express')
const path = require('path')
const mysql = require('mysql')
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const bodyParser = require('body-parser');
const flash = require('express-flash');
const session = require('express-session');

const routers = express.Router()

const app = express()



const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Adam@1063',
    database: 'cs262_proj'
})

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: '123456catr',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000 }
}))

app.use(flash());

app.set('views', path.join(__dirname, 'views'))
app.set('view engine','ejs')

app.use(express.static(path.join(__dirname, 'public')))

// let attrTypeArray

// let setOutput = (rows) => {
//     attrTypeArray = rows
//     console.log(attrTypeArray)
// }


app.get('/', (req, res) => {
    res.status(200).sendFile(path.resolve(__dirname, './public/index.html'))
})

app.get('/insert', (req, res) => {
    res.status(200).render('insert', {
        temp: ''
    })
})

app.post('/insert', (req, res) => {
    console.log(req.body)
    const table = req.body.tableList
    connection.query('select * from ' + table, (err, rows, fields) => {
        if (err) throw err

        res.status(200).render('insert', {
            temp: table,
            columns: fields
        })
    })
})

app.post('/insert/table', async (req, res) => {
    console.log(req.query)
    console.log(req.body)
    const table = req.query.name
    const tuple = req.body

    let query = 'insert into ' + table + '('
    for (let attr in tuple) {
        query += attr.toString() + ','
    }
    query = query.slice(0, query.length - 1)
    query += ') values('
    for (let attr in tuple) {
        query += ' ?,'
    }
    query = query.slice(0, query.length - 1)
    query += ');'

    console.log('query is : ', query)

    connection.query('desc ' + table, (err, rows, fields) => {
        if (err) console.log('some error')

        let insertArray = []

        for (let i = 0; i < rows.length; i ++) {
            if (rows[i].Type.toString().slice(0, 3) === 'int')
                insertArray.push(parseInt(tuple[rows[i].Field]))
            else insertArray.push(tuple[rows[i].Field])
        }

        console.log(insertArray)

        connection.query(query, insertArray, (e, r, f) => {
            if (e) console.log('some error in insertion : ', e)
            // req.flash('success', 'Unic')
            res.status(200).send('Successful')
        })
    })
})


// app.get('/insert/query', (req, res) => {
//     const table = req.query.tableList
//     connection.query('select * from ' + table, (err, rows, fields) => {
//         if (err) throw err
//
//         res.status(200).render('insert', {
//             temp: 'Enter the ' + table + ' information below',
//             columns: fields
//         })
//     })
//     // res.send('hello universe')
// })

// app.post('/insert/query/info', (req, res) => {
//     console.log(req.body)
//     res.send('Hello')
// })

app.post('/insert/query/some', function(req, res, next) {
    // var f_name = req.body.f_name;
    // var l_name = req.body.l_name;
    // var email = req.body.email;
    // var message = req.body.message;

    console.log(req.body)
    // console.log(f_name + ' ' + l_name + ' ' + email + ' ' + message)
    res.redirect('/')
    // var sql = `INSERT INTO contacts (f_name, l_name, email, message, created_at) VALUES ("${f_name}", "${l_name}", "${email}", "${message}", NOW())`;
    // db.query(sql, function(err, result) {
    //     if (err) throw err;
    //     console.log('record inserted');
    //     req.flash('success', 'Data added successfully!');
    //     res.redirect('/');
    // });
});
app.get('/see', (req, res) => {

    res.status(200).render('see', {
        name: '',
        someData: '',
        columns: ''
    })
})

app.get('/see/query', (req, res) => {
    const table = req.query.tablelist

        connection.query('select * from ' + table, (err, rows, fields) => {
            if (err) throw err
            res.status(200).render('see', {
                name: table.toString().toLocaleUpperCase(),
                someData: rows,
                columns: fields
            })
        })

})
app.get('/about', (req, res) => {
    res.status(200).send('<p>You want to know about me?</p>')
})

app.listen(4000, () => {
    console.log('App running on port 4000')
})