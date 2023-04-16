const express = require('express')
const path = require('path')
const mysql = require('mysql')
const routers = express.Router()

const app = express()

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Adam@1063',
    database: 'cs262_proj'
})

app.set('views', path.join(__dirname, 'views'))
app.set('view engine','ejs')


// connection.query('select * from course', (err, rows, fields) => {
//     if(err) throw err
//     console.log('The solution is : ', rows)
// })

// connection.end()

app.use(express.static(path.join(__dirname, 'public')))
// app.use('/see', express.static(path.join(__dirname, 'public')))

// app.use(express.static(path.join(__dirname, 'public')))

app.get('/', (req, res) => {
    res.status(200).sendFile(path.resolve(__dirname, './public/index.html'))
})
app.get('/see', (req, res) => {

    let data = []
    let column = []

    // res.status(200).render('see', {
    //     someData: '', columns: '', name: ''
    // })

    // connection.query('select * from ')

    connection.query('select * from student', (err, rows, fields) => {
        if (err) throw err
        res.status(200).render('see', {
            name: 'STUDENT',
            someData: rows,
            columns: fields
        })
    })
})

app.get('/see/query', (req, res) => {
    const table = req.query.tablelist

    // console.log(table.tablelist)

    // if (table === 'Course') {
        connection.query('select * from ' + table, (err, rows, fields) => {
            if (err) throw err
            res.status(200).render('see', {
                name: table.toString().toLocaleUpperCase(),
                someData: rows,
                columns: fields
            })
        })
    // } else
    //     res.send('Hello')

})
app.get('/about', (req, res) => {
    res.status(200).send('<p>You want to know about me?</p>')
})

app.listen(4000, () => {
    console.log('App running on port 4000')
})