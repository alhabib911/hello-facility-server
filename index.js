const { MongoClient, ServerApiVersion, ObjectId, } = require('mongodb');
const jwt = require('jsonwebtoken');
const express = require('express')
const cors = require('cors');
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000

app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.9cgs0.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri);

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader) {
    return res.status(401).send({ message: 'UnAuthorozed access' })
  }
  const token = authHeader.split(' ')[1]
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: 'Forbidden access' })
    }
    req.decoded = decoded
    next()
  });
}

async function run() {
  try {
    await client.connect();
    const AddGalleryImageCollection = client.db('HelloFacility').collection('Gallery')
    const AddBlogCollection = client.db('HelloFacility').collection('Blog')
    const userCollection = client.db('HelloFacility').collection('User')
    const EmployeeCollection = client.db('HelloFacility').collection('Employee')

    // Add new gallery image
    app.post('/gallery', async (req, res) => {
      const newImage = req.body
      console.log('add', newImage)
      const result = await AddGalleryImageCollection.insertOne(newImage)
      res.send(result)
    })

    // Get new gallery image
    app.get('/gallery', async (req, res) => {
      const query = {}
      const cursor = AddGalleryImageCollection.find(query)
      const image = await cursor.toArray()
      res.send(image)
    })

    // Add new blog 
    app.post('/blog', async (req, res) => {
      const newBlog = req.body
      console.log('add', newBlog)
      const result = await AddBlogCollection.insertOne(newBlog)
      res.send(result)
    })

    // Get new blog
    app.get('/blog', async (req, res) => {
      const query = {}
      const cursor = AddBlogCollection.find(query)
      const blogs = await cursor.toArray()
      res.send(blogs)
    })


    // GET ALL USER
    app.get('/user', async (req, res) => {
      const users = await userCollection.find().toArray()
      res.send(users)
    })

    // GET CREATE USER EMAIL
    app.put('/user/:email', async (req, res) => {
      const email = req.params.email
      const user = req.body
      const filter = { email: email }
      const options = { upsert: true };
      const updateDoc = {
        $set: user,
      };
      const result = await userCollection.updateOne(filter, updateDoc, options)
      const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15d' })
      console.log(token, process.env.ACCESS_TOKEN_SECRET);
      res.send({ result, token })
    })

    // GET UPDATE INFO SEND FOR UI  
    app.get('/user/:email', async (req, res) => {
      const email = req.params.email;
      const user = await userCollection.findOne({ email: email })
      // const users = await userCollection.find().toArray()
      res.send(user)
    })



    // MAKE AN ADMIN
    app.put('/user/admin/:email', async (req, res) => {
      const email = req.params.email
      const filter = { email: email }
      const updateDoc = {
        $set: { role: 'admin' },
      };
      const result = await userCollection.updateOne(filter, updateDoc)
      res.send(result)
    })

    // ADMIN CHECK FOR REQUIRE ADMIN
    app.get('/admin/:email', async (req, res) => {
      const email = req.params.email;
      const user = await userCollection.findOne({ email: email });
      const isAdmin = user.role === 'admin';
      res.send({ admin: isAdmin })
    })

    // CUSTOMER CHECK FOR REQUIRE CUSTOMER
    app.get('/customer/:email', async (req, res) => {
      const email = req.params.email;
      const user = await userCollection.findOne({ email: email });
      const isCustomer = user.role !== 'admin';
      res.send({ customer: isCustomer })
    })

    // Delete user
    app.delete('/user/:email', async (req, res) => {
      const email = req.params.email;
      const user = await userCollection.deleteOne({ email: email })
      // const users = await userCollection.find().toArray()
      res.send(user)
    })



  }
  finally {

  }
}

run().catch(console.dir)

app.get('/', (req, res) => {
  res.send('Hello Facility Server')
})

app.listen(port, () => {
  console.log(`Hello Facility listening on port ${port}`)
})