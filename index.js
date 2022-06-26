const { MongoClient, ServerApiVersion } = require('mongodb');
const express = require('express')
const cors = require('cors');
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000

app.use(cors())
app.use(express.json())


const uri =`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.9cgs0.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri);

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
  try {
    await client.connect();
    const AddGalleryImageCollection = client.db('HelloFacility').collection('Gallery')
    const AddBlogCollection = client.db('HelloFacility').collection('Blog')

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
  app.get('/blog', async(req, res) =>{
    const query = {}
    const cursor = AddBlogCollection.find(query)
    const blogs = await cursor.toArray()
    res.send(blogs)
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