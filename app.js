const express = require('express')
const path = require('path')
const mysql = require('mysql')
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const session = require('express-session');
const {NULL} = require("mysql/lib/protocol/constants/types");
const Errors = require("mysql/lib/protocol/constants/errors");

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
    //TODO: Check for invalid data

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
        let primaryKey = []

        for (let i = 0; i < rows.length; i ++) {

            const type = rows[i].Type.toString().slice(0, 3).toString()
            if (type === 'int') {
                if (isNaN(parseInt(tuple[rows[i].Field]))) {
                    insertArray.push(null)
                }
                else
                    insertArray.push(parseInt(tuple[rows[i].Field]))
            }
            else if (type === 'dec') {
                if (isNaN(parseFloat(tuple[rows[i].Field])))
                    insertArray.push(null)
                else
                    insertArray.push(parseFloat(tuple[rows[i].Field]))
            } else if (type === 'dat') {
                if (tuple[rows[i].Field] === '')
                    insertArray.push(null)
                else
                    insertArray.push(tuple[rows[i].Field])
            }
            else insertArray.push(tuple[rows[i].Field])
        }


        console.log(insertArray)

        connection.query(query, insertArray, (e, r, f) => {
            if (e) {
                console.log('some error in insertion : ', e)
                const errorMsg = e.message.toString().split(' ')

                if (errorMsg[0] === 'ER_DUP_ENTRY:') {
                    let msg = errorMsg[1] + ' ' + errorMsg[2] + ' ' + errorMsg[3]
                    for (let i = 4; i < errorMsg.length; i ++) {
                        if(errorMsg[i] === 'for') break;
                        msg += ' ' + errorMsg[i]
                    }
                    res.status(200).send(msg)
                }
                else res.status(200).send('Error 404: Problem while inserting data!')
            } else
                res.status(200).send('Successful')
        })
    })
})

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

app.get('/advance', (req, res) => {
    res.status(200).send('Want advance option?')
})

app.get('/about', (req, res) => {
    connection.query('desc student', (err, rows, fields) => {
        if (err) console.log("Some error")
        else console.log(rows)
    })
    res.status(200).send('<p>You want to know about me?</p>')
})

app.listen(4000, () => {
    console.log('App running on port 4000')
})