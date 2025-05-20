const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

console.log(process.env.DB_USER)


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.pebgaij.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;



const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// img 1-> https://i.ibb.co/q3qqvBYP/1.png
//img-2- https://i.ibb.co/0pnkwnCZ/2.png


async function run() {
    try {
        await client.connect();

        const coffeeCollection = client.db('coffeeDB').collection('coffees');
        const userCollection = client.db('coffeeDB').collection('users');

        app.get('/coffees', async (req, res)=> {
            // const cursor = coffeeCollection.find();
            // const result = await cursor.toArray();
            const result = await coffeeCollection.find().toArray();
            res.send(result);
        })

        app.get('/coffees/:id', async (req, res)=>{
            const id = req.params.id;
            const query = {_id: new ObjectId(id)};
            const result = await coffeeCollection.findOne(query);
            res.send(result);
        })


        app.post('/coffees', async (req, res)=> {
            const newCoffee = req.body;
            console.log(newCoffee);
            const result = await coffeeCollection.insertOne(newCoffee);
            res.send(result);
        })

        app.put('/coffees/:id', async (req, res) =>{
            const id = req.params.id;
            const filter = {_id: new ObjectId(id)};
            const option = {upsert: true};
            const updatedCoffee = req.body;
            const updateDoc = {
                $set: updatedCoffee
            }

            const result = await coffeeCollection.updateOne(filter,updateDoc, option);

            res.send(result);
        })

        app.delete('/coffees/:id', async (req, res) => {
            try{
            const id = req.params.id;
            const query = {_id: new ObjectId(id)};
            const result = await coffeeCollection.deleteOne(query);
            res.send(result);
            }catch(error){
                console.error('Delete error: ', error);
                res.status(500).send({error: 'internal server Eerror'})
            }
        })

        // user related APIs
        app.get('/users', async(req,res) => {
            const result = await userCollection.find().toArray();
            res.send(result);
        })

        app.post('/users', async(req, res) => {
            const userProfile = req.body;
            console.log("userProfile is-", userProfile);
            const result = await userCollection.insertOne(userProfile);
            res.send(result);        
        })

        app.patch('/users', async (req, res) => {
            const {email, lastSignInTime} = req.body;
            const filter = {email: email};
            const updateDoc = {
                $set: {
                    lastSignInTime: lastSignInTime
                }
            }

            const result = await userCollection.updateOne(filter, updateDoc);
            res.send(result);
        })

        app.delete('/users/:id', async (req, res) => {
            const id = req.params.id;
            const query = {_id: new ObjectId(id)};
            const result = await userCollection.deleteOne(query);
            res.send(result);
        })




        // This is for optional
        await client.db("admin").command({ ping: 1 });
        console.log(`You successfully connected with database port on ${port}`)
    }
    finally {

    }
}
run().catch(console.dir);





app.get('/', (req, res) => {
    res.send('Coffee server is getting hotter')
});

app.listen(port, () => {
    console.log(`Coffee server is running port on ${port}`)
})