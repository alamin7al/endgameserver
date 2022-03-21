const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');


require('dotenv').config()
const ObjectId = require('mongodb').ObjectId;
const { query } = require('express');
const fileUpload = require('express-fileupload');

const app = express();
const port = process.env.PORT || 5000;

app.use(fileUpload())
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ow5x2.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`
console.log(uri);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
async function run() {
    try {
        await client.connect()
        const database = client.db('doctorcart')
        const doctorcollection = database.collection('cart')
        const ordercollection = database.collection('order')
        const revewcollection = database.collection('revew')
        const admincollection = database.collection('admin')

        app.get('/single/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const user = await doctorcollection.findOne(query)
            res.send(user)
        })

        app.put('/doctor/:id', async (req, res) => {
            const id = req.params.id
            const updateUser = req.body
            const filter = { _id: ObjectId(id) }
            const options = { upsert: true }
            const updateDoc = {
                $set: {
                    name: updateUser.name,
                    desc: updateUser.desc,
                    Price: updateUser.Price,

                }
            }
            const result = await doctorcollection.updateOne(filter, updateDoc, options)
           
            res.send(result)
        })






        app.get('/cart', async (req, res) => {
            const cursor = doctorcollection.find({});

            const page = req.query.page;
            const size = parseInt(req.query.size);
            let payload;
            const count = await cursor.count();

            if (page) {
                payload = await cursor.skip(page * size).limit(size).toArray();
            }
            else {
                payload = await cursor.toArray();
            }

            res.send({
                count,
                payload
            });
        })
        app.post('/doctor', async (req, res) => {
            const service = req.body;
            // console.log('hit the post api', service);

            const result = await doctorcollection.insertOne(service);
         
            res.send(result)
        });

        app.get('/doctor', async (req, res) => {
            const cursor = doctorcollection.find({})
            const user = await cursor.toArray()
            res.send(user)
        })



        app.get('/singleCart/:id', async (req, res) => {
            const id = req.params.id
      
            const query = { _id: ObjectId(id) }
            const user = await doctorcollection.findOne(query)

            res.send(user)
        })


        app.post('/order', async (req, res) => {
            const service = req.body;
            // console.log('hit the post api', service);

            const result = await ordercollection.insertOne(service);
       
            res.send(result)
        });


        app.get('/singleemail', async (req, res) => {
            const email = req.query.email
            // console.log(email);
            const query = { email: email }
            const cursor = ordercollection.find(query)
            const user = await cursor.toArray()
            res.json(user)
        })

        app.delete('/singleemail/:id', async (req, res) => {
            const id = req.params.id
            const quarry = { _id: ObjectId(id) }
            const deleteData = await ordercollection.deleteOne(quarry)
            res.send(deleteData)

        })



        app.get('/revew', async (req, res) => {
            const cursor = revewcollection.find({})
            const user = await cursor.toArray()
            res.send(user)
        })

        app.post('/revew', async (req, res) => {
            const service = req.body;
            // console.log('hit the post api', service);

            const result = await revewcollection.insertOne(service);
            res.send(result)
        });





        app.post('/admin', async (req, res) => {
            const service = req.body;
            // console.log('hit the post api', service);

            const result = await admincollection.insertOne(service);
      
            res.send(result)
        });

        app.put('/admin', async (req, res) => {
            const user = req.body
            const filter = { email: user.email }
            const options = { upsert: true }
            const updateDoc = { $set: user }
            const result = admincollection.updateOne(filter, updateDoc, options)
            res.send(result)
        })
        app.put('/users/admin', async (req, res) => {
            const user = req.body
            const filter = { email: user.email }
            const updateDoc = { $set: { role: 'admin' } }
            const result = await admincollection.updateOne(filter, updateDoc)
            res.send(result)
        })


        app.get('/admin/:email', async (req, res) => {
            const email = req.params.email
            const query = { email: email }
            const user = await admincollection.findOne(query)
            let isAdmin = false
            if (user?.role === 'admin') {
                isAdmin = true
            }
            res.send({ admin: isAdmin })
        })


        app.put("/revew", async (req, res) => {
            const { id } = req.query;
            const result = await revewcollection.updateOne(
                { _id: ObjectId(id) },
                { $set: { statu: "approved" } }
            );
            res.json(result);
        });



        app.delete('/single/:id', async (req, res) => {
            const id = req.params.id
            // console.log(id);
            const query = { _id: ObjectId(id) }
            const result = await doctorcollection.deleteOne(query)
         
            res.send(result)
        })





        console.log('hello');
    }
    finally {
        // await client.close() 
    }
}
run().catch(console.dir)

app.get('/', (req, res) => {
    res.send('Running my CRUD Server');
});

app.listen(port, () => {
    console.log('Running Server on port', port);
})