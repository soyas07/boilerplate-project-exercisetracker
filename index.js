const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()

const mongoose = require('mongoose');
const personSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  logs: {
    type: [mongoose.Schema.Types.Mixed]
  }
});

let Person = mongoose.model('Person', personSchema);

app.use(cors())
app.use(express.static('public'))
app.use(express.json());


app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});


app.post('/api/users', async(req, res) => {
  const { username } = req.body;
  const person = new Person({ username });
  await person.save();
  res.send({ username: person.username, _id: person._id })
})

app.get('/api/users', async(req, res) => {
  try {
    // Fetch all users from the database
    let users = await Person.find();

    users = users.map(user => {
      return {
        username: user.username,
        _id: user._id
      };
    })
    // Send the users as a response
    res.send(users);
  } catch (error) {
    // Handle any errors that may occur
    res.status(500).send({ error: 'Internal Server Error' });
  }
})

app.get('/api/users/:_id', async(req, res) => { 
  try {
    const { _id } = req.params;
    const user = await Person.findById(_id);
    
    res.send({ username: user.username, _id: user._id });
  } catch (error) {
    // Handle any errors that may occur
    res.status(500).send({ error: 'Internal Server Error' });
  }
})

app.post('/api/users/:_id/exercises', async(req, res) => {
  const { description, duration } = req.body;
  const { _id } = req.params;

  let date = req.body.date;
  if (!date)
    date = new Date().toDateString();
  
  const user = await Person.findById(_id);
  await Person.findByIdAndUpdate(_id, {
    logs: [...user.logs, { description, duration, date }]
  });

  res.send({ username: user.username, _id: user._id, description, duration, date });
})

app.get('/api/users/:_id/logs', async(req, res) => {
  const { _id } = req.params;
  const user = await Person.findById(_id);
  console.log(user);

  res.send({ username: user.username, _id: user._id, logs: user.logs, count: user.logs.length });
})


const listener = app.listen(process.env.PORT || 3000, () => {
  mongoose.connect(process.env.MONGO_URI);
  console.log('Your app is listening on port ' + listener.address().port)
})
