const express = require("express");
const cors = require("cors");
const useragent = require("express-useragent");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const mg = require("nodemailer-mailgun-transport");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const port = process.env.PORT || 5000;

const socketServer = http.createServer(app);

//middleware
app.use(cors());
app.use(express.json());
app.use(useragent.express());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.z9k78im.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

//for cors policy
const io = new Server(socketServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "DELETE", "PATCH"],
  },
});

function sendNewAccountEmail(account) {
  const {
    firstName,
    lastName,
    phone,
    date,
    monthlySalary,
    initialDeposit,
    email,
    accountType,
  } = account;
  console.log(account);
  // This is your API key that you retrieve from www.mailgun.com/cp (free up to 10K monthly emails)
  const auth = {
    auth: {
      api_key: process.env.EMAIL_SEND_KEY,
      domain: process.env.EMAIL_SEND_DOMAIN,
    },
  };

  console.log(process.env.EMAIL_SEND_KEY, process.env.EMAIL_SEND_DOMAIN);

  const transporter = nodemailer.createTransport(mg(auth));
  transporter.sendMail(
    {
      from: "wdevc6@gmail.com", // verified sender email
      to: email || "wdevc6@gmail.com", // recipient email
      subject: "Your Bank Account Opening Form Submitted", // Subject line
      text: `
      <h3 style="">${firstName} ${" "} ${lastName} Your New Account Opening From Submit Confirm </h3>
      <div>
        <p>Account From submit on  ${date} </p>
        <p>Your Phone Number  ${phone} </p>
        <p>Your Account Type ${accountType} </p>
        <p>Your Monthly Salary ${monthlySalary} </p>
        <p>Your initial Deposit ${initialDeposit} </p>
        <p>Your form has been submitted please wait for approval</p>
      </div>
      `, // plain text body
      html: "<b>Hello world!</b>", // html body
    },
    function (error, info) {
      if (error) {
        console.log("Email send error", error);
      } else {
        console.log("Email sent: " + info);
      }
    }
  );
}

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
    const allAccountsCollection = client
      .db("capital-trust-bank")
      .collection("bankAccounts");
    const donateCollection = client
      .db("capital-trust-bank")
      .collection("donate");
    const emergencyServiceCollection = client
      .db("capital-trust-bank")
      .collection("emergencyServices");
    const teamsCollection = client.db("capital-trust-bank").collection("teams");
    const loanServiceDataCollection = client
      .db("capital-trust-bank")
      .collection("loanService");
    const applicantsCollection = client
      .db("capital-trust-bank")
      .collection("applicants");
    const insuranceCollection = client
      .db("capital-trust-bank")
      .collection("insuranceApplicants");
    const deviceInfoCollection = client
      .db("capital-trust-bank")
      .collection("deviceInfo");
    const chatInfoCollection = client
      .db("capital-trust-bank")
      .collection("chatInfo");
    const exchangeCollection = client
      .db("capital-trust-bank")
      .collection("exchangeCollection");
    const depositWithdrawCollection = client
      .db("capital-trust-bank")
      .collection("depositWithdraw");
    const blogsNewsCollection = client
      .db("capital-trust-bank")
      .collection("blogsNews");

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
        expiresIn: "10d",
      });
      res.send({ result, Token: token });
    });

    // get teams data from database
    app.get("/team", async (req, res) => {
      const query = {};
      const result = await teamsCollection.find(query).toArray();
      res.send(result);
    });

    // get team member details
    app.get("/team-details/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await teamsCollection.findOne(query);
      res.send(result);
    });

    // ------Start of Rakib Khan Backend -------

    /*Start Emon Backend Code  */

    /*==============Start Emon Backend Code  ============*/
    app.post("/donate", async (req, res) => {
      const donate = req.body;
      console.log(donate);
      const result = await donateCollection.insertOne(donate);
      res.send(result);
    });
    //post applier info in database applierCollection
    // applier for credit card
    app.post("/cardAppliers", async (req, res) => {
      const applier = req.body;
      console.log(applier);
      const result = await applierCollection.insertOne(applier);
      res.send(result);
    });
    app.post("/bankAccounts", async (req, res) => {
      const account = req.body;
      const accountId = new ObjectId().toString().substring(0, 16);
      console.log(account, accountId);
      const result = await allAccountsCollection.insertOne({
        ...account,
        accountId,
      });
      // send email about open account from confirmation
      // sendNewAccountEmail(account);
      res.send(result);
    });
    // read data for emergency service req slider
    app.get("/bankAccounts", async (req, res) => {
      const query = {};
      const result = await allAccountsCollection.find(query).toArray();
      res.send(result);
    });
    app.get("/bankAccounts/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const result = await allAccountsCollection.find(query).toArray();
      res.send(result);
    });
    app.get("/cardReq", async (req, res) => {
      const query = {};
      const result = await applierCollection.find(query).toArray();
      res.send(result);
    });

    app.get("/cardAppliers", async (req, res) => {
      const query = {};
      const result = await emergencyServiceCollection.find(query).toArray();
      res.send(result);
      console.log("card apply", result);
    });

    app.get("/users", async (req, res) => {
      let query = {};
      const email = req.query.email;
      query = {
        email: req.query.email,
      };
      const result = await usersCollection.find(query).toArray();
      res.send(result);
    });

    /*========End Emon Backend Code ============= */

    //------------Mouri----------------//

    //-------------Deposit& Withdraw----------------//
    // app.get("/deposit", async (req, res) => {
    //   const query = { type: "deposit" };
    //   const applicants = await depositWithdrawCollection.find(query).toArray();
    //   res.send(applicants);
    // });
    app.get("/blogsNews", async (req, res) => {
      const query = {};
      const news = await blogsNewsCollection.find(query).toArray();
      res.send(news);
    });
    app.get("/blogsNews/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const news = await blogsNewsCollection.findOne(query);
      res.send(news);
    });

    app.get("/depositWithdraw", async (req, res) => {
      const query = { id: ObjectId() };
      const applicant = await depositWithdrawCollection.find(query).toArray();
      res.send(applicant);
    });
    app.get("/depositWithdraw/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const result = await depositWithdrawCollection.find(query).toArray();
      res.send(result);
    });

    app.post("/depositWithdraw", async (req, res) => {
      const applicant = req.body;
      console.log(applicant);
      const result = await depositWithdrawCollection.insertOne(applicant);
      res.send(result);
    });
    app.get("/loans", async (req, res) => {
      const query = {};
      const cursor = loanServiceDataCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });
    //--------------Insurance--------------
    app.get("/insuranceApplicants", async (req, res) => {
      const query = {};
      const applicants = await insuranceCollection.find(query).toArray();
      res.send(applicants);
    });

    app.post("/insuranceApplicants", async (req, res) => {
      const applicant = req.body;
      console.log(applicant);
      const result = await insuranceCollection.insertOne(applicant);
      res.send(result);
    });

    //--------Loans-------------//
    app.get("/loanService", async (req, res) => {
      const query = {};
      const cursor = loanServiceDataCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/loanService/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const service = await loanServiceDataCollection.findOne(query);
      res.send(service);
    });

    app.get("/applicants", async (req, res) => {
      const query = {};
      const applicants = await applicantsCollection.find(query).toArray();
      res.send(applicants);
    });

    app.post("/applicants", async (req, res) => {
      const applicant = req.body;
      console.log(applicant);
      const result = await applicantsCollection.insertOne(applicant);
      res.send(result);
    });

    //--------------Mouri-------------------//
    //------------------End------------------//

    //--------Akash Back-End Start-------------//

    //get single customer info
    app.get("/customer/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const info = await usersCollection.findOne(query);
      res.send(info);
    });

    //get all customer info
    app.get("/allCustomers", async (req, res) => {
      const query = { role: "customer" };
      const info = await usersCollection.find(query).toArray();
      res.send(info);
    });

    //store customers exchange info
    app.post("/storeExchangeInfo", async (req, res) => {
      const info = req.body;
      const result = await exchangeCollection.insertOne(info);
      res.send(result);
    });

    //store all customer device info
    app.post("/storeDeviceInfo/:email", async (req, res) => {
      const email = req.params.email;
      const query = {
        email,
      };
      const numberOfDevice = (await deviceInfoCollection.find(query).toArray())
        .length;
      if (numberOfDevice <= 2) {
        const ua = req.useragent;
        const datetime = new Date();
        const deviceInfo = {
          email: email,
          browser: ua.browser,
          os: ua.os,
          date: datetime.toISOString().slice(0, 10),
        };
        const result = deviceInfoCollection.insertOne(deviceInfo);
        res.send(result);
      } else {
        res.send(false);
      }
    });

    //Delete single customer device info
    app.delete("/deleteDeviceInfo/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const result = await deviceInfoCollection.deleteOne(query);
      res.send(result);
    });

    //get single customer device info
    app.get("/getDeviceInfo/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const result = await deviceInfoCollection.find(query).toArray();
      res.send(result);
    });

    //get single chat info
    app.get("/getChatInfo/:email", async (req, res) => {
      const email = req.params.email;
      const arrayEmail = email.split(" ");

      const result = await chatInfoCollection
        .find({
          $or: [
            { senderEmail: arrayEmail[0], receiverEmail: arrayEmail[1] },
            { senderEmail: arrayEmail[1], receiverEmail: arrayEmail[0] },
          ],
        })
        .toArray();
      res.send(result);
    });

    //get admin info
    app.get("/getAdminInfo", async (req, res) => {
      const query = { email: "admin@gmail.com" };
      const result = await usersCollection.findOne(query);
      res.send(result);
    });

    //get customers chat info
    app.get("/getAllCustomersChat", async (req, res) => {
      let allChatInfo = await chatInfoCollection.find({}).toArray();
      let emailMap = {};
      allChatInfo = allChatInfo.filter((obj) => {
        if (!emailMap[obj.senderEmail]) {
          emailMap[obj.senderEmail] = true;
          return true;
        }
        return false;
      });
      res.send(allChatInfo);
    });

    //socket for chat
    io.on("connection", (socket) => {
      console.log("User connected");

      socket.on("disconnect", () => {
        console.log("User disconnected");
      });

      socket.on("send message", async (data) => {
        console.log(data);
        if (data.senderEmail != "admin@gmail.com") {
          const receiverInfo = await usersCollection.findOne({
            email: "admin@gmail.com",
          });
          data.receiverEmail = "admin@gmail.com";
          data.receiverImg = receiverInfo.image;
          data.receiverName = receiverInfo.name;
        }
        //store chat into the database
        const storeChatInfo = chatInfoCollection.insertOne(data);
        io.emit("messageTransfer", data);
      });
    });
    //
    //--------Akash Back-End End-------------//
  } finally {
  }
}
run().catch((error) => console.log(error));

app.get("/", (req, res) => {
  res.send("Capital Trust Bank server is running");
});
// app.listen(port, (req, res) => {
//   console.log(`Capital Trust Bank server is running on port ${port}`);
// });

socketServer.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// //--------Akash Back-End Start-------------//

// //get single customer info
// app.get("/customer/:email", async (req, res) => {
//   const email = req.params.email;
//   const query = { email: email };
//   const info = await usersCollection.findOne(query);
//   res.send(info);
// });

// //get all customer info
// app.get("/allCustomers", async (req, res) => {
//   const query = { role: "customer" };
//   const info = await usersCollection.find(query).toArray();
//   res.send(info);
// });
// //store all customer device info
// app.post("/storeDeviceInfo/:email", async (req, res) => {
//   const email = req.params.email;
//   const query = {
//     email,
//   };
//   const numberOfDevice = (await deviceInfoCollection.find(query).toArray())
//     .length;
//   if (numberOfDevice <= 1) {
//     const ua = req.useragent;
//     const datetime = new Date();
//     const deviceInfo = {
//       email: email,
//       browser: ua.browser,
//       os: ua.os,
//       date: datetime.toISOString().slice(0, 10),
//     };
//     const result = deviceInfoCollection.insertOne(deviceInfo);
//     res.send(result);
//   } else {
//     res.send(false);
//   }
// });

// //Delete single customer device info
// app.delete("/deleteDeviceInfo/:email", async (req, res) => {
//   const email = req.params.email;
//   const query = { email };
//   const result = await deviceInfoCollection.deleteOne(query);
//   res.send(result);
// });

// //get single customer device info
// app.get("/getDeviceInfo/:email", async (req, res) => {
//   const email = req.params.email;
//   const query = { email };
//   const result = await deviceInfoCollection.find(query).toArray();
//   res.send(result);
// });
// //--------Akash Back-End End-------------//
