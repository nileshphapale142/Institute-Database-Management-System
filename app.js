const express = require('express')

const app = express()

app.get('/', (req, res) => {
    res.status(200).send('<p>Hello World</p>')
})
app.listen(3000, () => {
    console.log('App running on port 3000')
})