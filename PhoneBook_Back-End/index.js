require('dotenv').config()
const express = require('express')
const Person = require('./models/phone')
const app = express()

app.use(express.static('dist'))

const cors = require('cors')
app.use(cors())

app.use(express.static('dist'))
app.use(express.json())

app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person)
      { response.json(person) }
      else {
        response.status(404).end()
      } 
    })
    .catch((error) => next(error))
})


app.post('/api/persons', (request, response, next) => {
  const body = request.body
  const person = new Person({
    name : body.name,
    phonnum : body.number
  })

  person.save()
    .then(() => {
      console.log('new person saved!')
      response.json(person)
    })
    .catch((error) => next(error))

})

app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body

  Person.findById(request.params.id)
    .then((person) => {
      if (!person) {
        return response.status(404).end()
      }

      person.name    = name
      person.phonnum = number

      return person.save().then((updt) => {
        response.json(updt)
      })
    })
    .catch((error) => next(error))

})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(() => {
      response.status(204).end()
    })
    .catch((error) => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

// handler of requests with unknown endpoint
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  }

  else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)

  //  .catch((error) => next(error))
}

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
