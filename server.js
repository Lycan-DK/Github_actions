
const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const port = 3000


app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
)

// route 
const people = require("./routes/people")
app.use("/people", people)


app.listen(port, () => {
    console.log(`App running on port ${port}.`)
  })
  