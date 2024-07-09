import express, { json } from 'express';
import getShoppingResults from './vertex.mjs';
import {VertexAI} from '@google-cloud/vertexai';
import { getJson } from "serpapi";
import cors from "cors";


// import { urlencoded } from 'body-parser';

const app = express()
app.use(cors());
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb'}));


// app.use(urlencoded({ extended: false }));
//why is this not working:()
const port = 3000

app.post('/', (req, res) => {
  res.send('Hello world!')
})


app.post('/upload', async (req, res) => {
  console.log('working')
  const photo = req.body.photo
  try {
    const results = await getShoppingResults(photo)
    res.json({
      data: results
    })
  }

  catch (e){
    console.log('error', e.stack, e.name, e.message)
    res.status(500).json({
      message: "something went wrong"
    })
  }
  
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})