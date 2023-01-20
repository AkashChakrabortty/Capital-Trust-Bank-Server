const express = require("express");
const cors = require("cors");
require("dotenv").config();
var jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.z9k78im.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: "unauthorized access" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.JWT_SECRET_KEY, function (error, decoded) {
    if (error) {
      return res.status(403).send({ message: "forbidden access" });
    }
    req.decoded = decoded;
    next();
  });
}

async function run() {
  try {
    const usersCollection = client.db("capital-trust-bank").collection("users");
    const applierCollection = client
      .db("capital-trust-bank")
      .collection("cardAppliers");
<<<<<<< HEAD
=======
    const loansCollection = client.db("capital-trust-bank").collection("loans");
    const applicantsCollection = client.db("capital-trust-bank").collection("applicants");
>>>>>>> c18c1962b30f28fef42199b7057dbd87b216fd87

    // save users to database
    app.put("/user/:email", async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      const query = { email: email };
      const option = { upsert: true };
      const updateDoc = {
        $set: user,
      };
      const result = await usersCollection.updateOne(query, updateDoc, option);
      const token = jwt.sign(user, process.env.JWT_SECRET_KEY, {
        expiresIn: "7d",
      });
      res.send({ result, Token: token });
    });

    //post applier info in database applierCollection
    app.post("/cardAppliers", async (req, res) => {
      const applier = req.body;
      console.log(applier);
      const result = await applierCollection.insertOne(applier);
      res.send(result);
    });
<<<<<<< HEAD
=======
    //--------Loans-------------//
    app.get('/loans',async(req,res)=>{
      const query = {};
      const cursor = loansCollection.find(query);
      const result = await cursor.toArray();
      
      res.send(result);
    });

    app.get("/loans/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const service = await loansCollection.findOne(query);
      res.send(service);
    });

    app.get('/applicants',async(req,res)=>{
      const query ={};
      const applicants = await applicantsCollection.find(query).toArray();
      res.send(applicants);
     })

   app.post('/applicants', async(req,res)=>{
      const applicant = req.body;
      console.log(applicant);
      const result = await applicantsCollection.insertOne(applicant);
      res.send(result);
   })

>>>>>>> c18c1962b30f28fef42199b7057dbd87b216fd87
  } finally {
  }
}
run().catch((error) => console.log(error));

app.get("/", (req, res) => {
  res.send("Central Trust Bank server is running");
});

app.listen(port, (req, res) => {
<<<<<<< HEAD
  console.log(`Central Trust Bank server is running on port ${port}`);
=======
  console.log(`server is running on port ${port}`);
>>>>>>> c18c1962b30f28fef42199b7057dbd87b216fd87
});
