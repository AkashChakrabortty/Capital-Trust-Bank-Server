const express = require("express");
const SSLCommerzPayment = require("sslcommerz-lts");
const cors = require("cors");
const useragent = require("express-useragent");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const mg = require("nodemailer-mailgun-transport");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const http = require("http");
// const { Server } = require("socket.io");
const port = process.env.PORT || 5000;

// const socketServer = http.createServer(app);

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

// SSL commerz   CODEd
const store_id = process.env.STORE_ID;
const store_passwd = process.env.STORE_PASSWORD;

const is_live = false; //true for live, false for sandbox

//for cors policy
// const io = new Server(socketServer, {
//   cors: {
//     origin: "*",
//     methods: ["GET", "POST", "DELETE", "PATCH", "PUT"],
//   },
// });

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
    // All new bank account collection
    const allAccountsCollection = client
      .db("capital-trust-bank")
      .collection("bankAccounts");
    // Donates collection
    const donateCollection = client
      .db("capital-trust-bank")
      .collection("donate");
    // pay bills collection
    const payBillsCollection = client
      .db("capital-trust-bank")
      .collection("payBills");
    //  emergency Services data in slider
    const emergencyServiceCollection = client
      .db("capital-trust-bank")
      .collection("emergencyServices");
    //  give Cheque Book Services data in slider
    const giveChequeBookCollection = client
      .db("capital-trust-bank")
      .collection("giveChequeBook");
    //  emergency Services data in slider
    const ServiceReceiverCollection = client
      .db("capital-trust-bank")
      .collection("emgyServiceReceiver");

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
    const insuranceDataCollection = client
      .db("capital-trust-bank")
      .collection("insuranceData");
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
    const giveCardCollection = client
      .db("capital-trust-bank")
      .collection("giveCard");
    const chatNotificationCollection = client
      .db("capital-trust-bank")
      .collection("chatNotification");
    const verifyNotificationCollection = client
      .db("capital-trust-bank")
      .collection("verifyNotification");
    const blogsNewsCollection = client
      .db("capital-trust-bank")
      .collection("blogsNews");
    const exchangesCollection = client
      .db("capital-trust-bank")
      .collection("exchange");

    /* ------- Rakib Khan Code Start ------ */
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

    app.post("/exchange", async (req, res) => {
      const exchange = req.body;
      const result = await exchangesCollection.insertOne(exchange);
      res.send(result);
      console.log(result);
    });
    /* ------- Rakib Khan Code End ------ */

    /*==============Start Emon Backend Code  ============*/
    // const giveChequeBookCollection = client
    //   .db("capital-trust-bank")
    //   .collection("giveChequeBook");

    // applier for credit card
    app.post("/emgyServiceReceiver", async (req, res) => {
      const serviceReceiver = req.body;
      console.log(serviceReceiver);
      const result = await ServiceReceiverCollection.insertOne(serviceReceiver);
      res.send(result);
    });
    // applier for Cheque book
    app.get("/emgyServiceReceiver", async (req, res) => {
      const query = {};
      const result = await ServiceReceiverCollection.find(query).toArray();
      res.send(result);
    });
    //accept for Cheque book
    app.post("/acceptEmgyServiceReq", async (req, res) => {
      const id = req.body.accountId;
      console.log(id);
      const info = req.body;
      const filter = { accountId: id };
      const chequeId = new ObjectId().toString().substring(0, 6);
      const routingNo = new ObjectId().toString().substring(0, 10);
      const randomId = new ObjectId().toString().substring(0, 16);
      const giveCard = await giveChequeBookCollection.insertOne({
        ...info,
        chequeId,
        routingNo,
        randomId,
      });
      console.log(giveCard);
      const result = await ServiceReceiverCollection.deleteOne(filter);
      res.send(result);
    });

    //Delete Cheque book
    app.delete("/deleteEmgyServiceReq", async (req, res) => {
      const id = req.body.id;
      console.log(id);
      const filter = { accountId: id };
      const result = await ServiceReceiverCollection.deleteOne(filter);
      res.send(result);
    });

    //get single Cheque book
    app.get("/getEmgyServiceReq/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await giveChequeBookCollection.findOne(query);
      res.send(result);
    });

    // donate All method Start
    app.post("/donate", async (req, res) => {
      const donate = req.body;
      const { donarName, donarEmail, amount } = donate;
      if (!donarName || !donarEmail || !amount) {
        return res.send({ error: "Please provide all the information" });
      }
      // const result = await donateCollection.insertOne(donate);
      // res.send(result);
      const transactionId = new ObjectId().toString().substring(0, 6);
      const data = {
        total_amount: donate.amount,
        currency: donate.currency,
        tran_id: transactionId, // use unique tran_id for each api call
        success_url: `${process.env.SERVER_URL}/donate/success?transactionId=${transactionId}`,
        fail_url: `${process.env.SERVER_URL}/donate/fail?transactionId=${transactionId}`,
        cancel_url: `${process.env.SERVER_URL}/donate/cancel`,
        ipn_url: `${process.env.SERVER_URL}/donate/ipn`,
        shipping_method: "Courier",
        product_name: "Computer.",
        product_category: "Electronic",
        product_profile: "general",
        cus_name: donate.donarName,
        cus_email: donate.donarEmail,
        cus_add1: "Dhaka",
        cus_add2: "Dhaka",
        cus_city: "Dhaka",
        cus_state: "Dhaka",
        cus_postcode: "1000",
        cus_country: "Bangladesh",
        cus_phone: donate.donarPhnNumber,
        cus_fax: "01711111111",
        ship_name: "Customer Name",
        ship_add1: "Dhaka",
        ship_add2: "Dhaka",
        ship_city: "Dhaka",
        ship_state: "Dhaka",
        ship_postcode: 1000,
        ship_country: "Bangladesh",
      };

      const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);

      sslcz.init(data).then((apiResponse) => {
        // Redirect the user to payment gateway
        let GatewayPageURL = apiResponse.GatewayPageURL;

        donateCollection.insertOne({
          ...donate,
          transactionId,
          paid: "false",
        });
        console.log(GatewayPageURL);
        res.send({ url: GatewayPageURL });
        // try {
        //   const result = donateCollection.insertOne(donate);
        //   res.send({ url: GatewayPageURL });
        // } catch (e) {
        //   print(e);
        // }
      });
    });
    //  donate success post method
    app.post("/donate/success", async (req, res) => {
      const { transactionId } = req.query;

      const result = await donateCollection.updateOne(
        { transactionId },
        { $set: { paid: "true", paidAt: new Date() } }
      );

      if (result.modifiedCount > 0) {
        res.redirect(
          `${process.env.CLIENT_URL}/donate/success?transactionId=${transactionId}`
        );
      }
    });
    //  donate fail post method
    app.post("/donate/fail", async (req, res) => {
      const { transactionId } = req.query;
      if (transactionId) {
        return res.redirect(
          "https://capital-trust-bank-ee791.web.app/donate/fail"
        );
      }
      const result = await donateCollection.deleteOne({ transactionId });
      if (result.deletedCount) {
        res.redirect("https://capital-trust-bank-ee791.web.app/donate/fail");
      }
    });
    // show api when users success his donate
    app.get("/donate/by-transaction-id/:id", async (req, res) => {
      const { id } = req.params;
      const result = await donateCollection.findOne({ transactionId: id });
      res.send(result);
    });

    // all donate api call in dashboard
    app.get("/donate", async (req, res) => {
      const query = {};
      const result = await donateCollection.find(query).toArray();
      res.send(result);
    });

    //post applier info in database applierCollection
    // applier for credit card
    app.post("/cardAppliers", async (req, res) => {
      const applier = req.body;
      const result = await applierCollection.insertOne(applier);
      res.send(result);
    });
    app.post("/bankAccounts", async (req, res) => {
      const account = req.body;
      const accountId = new ObjectId().toString().substring(0, 16);
      const result = await allAccountsCollection.insertOne({
        ...account,
        accountId,
      });
      //Akash's modify
      const email = account.email;
      const filter = { email: email };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          isApply: true,
        },
      };
      const apply = await usersCollection.updateOne(filter, updateDoc, options);
      const verifyNotification = await verifyNotificationCollection.insertOne(
        account
      );
      res.send(result);
    });
    //read data for emergency service req slider
    app.get("/bankAccounts", async (req, res) => {
      const query = {};
      const result = await allAccountsCollection.find(query).toArray();
      res.send(result);
    });
    app.get("/bankAccounts/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await allAccountsCollection.findOne(query);
      res.send(result);
    });
    app.get("/approved", async (req, res) => {
      const query = { approve: true };
      const result = await allAccountsCollection.find(query).toArray();
      res.send(result);
    });
    app.get("/approved/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await allAccountsCollection.findOne(query);
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
    // -blog& news
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
      const query = req.body;
      const applicant = await depositWithdrawCollection.find(query).toArray();
      res.send(applicant);
    });
    app.get("/depositWithdraw/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const result = await depositWithdrawCollection
        .find(query)
        .sort({ _id: -1 })
        .toArray();
      res.send(result);
    });

    app.post("/depositWithdraw", async (req, res) => {
      const applicant = req.body;
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

    app.get("/insuranceData", async (req, res) => {
      const query = {};
      const result = await insuranceDataCollection.find(query).toArray();
      res.send(result);
    });
    app.get("/insur/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await insuranceDataCollection.findOne(query);
      res.send(result);
    });
    app.get("/insuranceApplicants", async (req, res) => {
      const query = {};
      const applicants = await insuranceCollection.find(query).toArray();
      res.send(applicants);
    });

    app.post("/insuranceApplicants", async (req, res) => {
      const applicant = req.body;
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

    app.get("/loanSec/:id", async (req, res) => {
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

    //get single customer card info
    app.get("/takeCard/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const info = await allAccountsCollection.findOne(query);
      const result = await giveCardCollection.findOne({
        accountId: info.accountId,
      });
      res.send(result);
    });

    //accept verification req
    app.post("/verifyCustomer", async (req, res) => {
      const email = req.body.email;
      const info = req.body;
      const filter = { email: email };
      const updateDoc = {
        $set: {
          approve: true,
        },
      };
      const apply = await allAccountsCollection.updateOne(filter, updateDoc);
      res.send(apply);
    });

    //accept card req
    app.post("/acceptCardReq", async (req, res) => {
      const id = req.body.accountId;
      const info = req.body;
      const filter = { accountId: id };
      const giveCard = await giveCardCollection.insertOne(info);
      const result = await applierCollection.deleteOne(filter);
      res.send(result);
    });

    //Delete verification req
    app.delete("/verifyCancel", async (req, res) => {
      const email = req.body.email;
      const filter = { email: email };
      const apply = await allAccountsCollection.deleteOne(filter);

      const filter1 = { email: email };
      const updateDoc = {
        $set: {
          isApply: false,
        },
      };
      const apply1 = await usersCollection.updateOne(filter, updateDoc);
      res.send(apply);
    });

    //Delete card req
    app.delete("/deleteCardReq", async (req, res) => {
      const id = req.body.id;
      const filter = { accountId: id };
      const result = await applierCollection.deleteOne(filter);
      res.send(result);
    });

    //Delete verification req notification
    app.delete("/verificationNotificationDelete", async (req, res) => {
      const email = req.body.email;
      const filter = { email: email };
      const result = await verifyNotificationCollection.deleteOne(filter);
      res.send(result);
    });

    //get single customer info
    app.get("/customer/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const info = await usersCollection.findOne(query);
      res.send(info);
    });

    //get all verification info
    app.get("/getVerifyNotificationInfo", async (req, res) => {
      const info = await verifyNotificationCollection.find({}).toArray();
      res.send(info);
    });

    //get all customer info
    app.get("/allCustomers", async (req, res) => {
      const query = { approve: true };
      const info = await allAccountsCollection.find(query).toArray();
      const user = await usersCollection.find({}).toArray();

      let result = [];
      info.map((singleInfo) => {
        user.map((singleUser) => {
          if (singleInfo.email === singleUser.email) {
            singleInfo["img"] = singleUser.image;
            result.push(singleInfo);
          }
        });
      });
      res.send(result);
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

    //Delete single customer device info
    app.delete("/notificationDelete", async (req, res) => {
      const senderEmail = req.body.senderEmail;
      const receiverEmail = req.body.receiverEmail;
      const query = {
        $or: [
          { senderEmail: senderEmail, receiverEmail: receiverEmail },
          { senderEmail: receiverEmail, receiverEmail: senderEmail },
        ],
      };
      const result = await chatNotificationCollection.deleteMany(query);
      res.send(result);
    });

    //get single customer device info
    app.get("/getDeviceInfo/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const result = await deviceInfoCollection.find(query).toArray();
      res.send(result);
    });

    //get single customer device info
    app.get("/getChatNotificationInfo/:email", async (req, res) => {
      const email = req.params.email;
      const query = { receiverEmail: email };
      const result = await chatNotificationCollection.find(query).toArray();
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

    app.post("/post-message", async (req, res) => {
      const data = req.body;
      if (data.senderEmail != "admin@gmail.com") {
        const receiverInfo = await usersCollection.findOne({
          email: "admin@gmail.com",
        });
        data.receiverEmail = "admin@gmail.com";
        data.receiverImg = receiverInfo.image;
        data.receiverName = receiverInfo.name;
      }
      //store chat into the database
      const storeChatInfo = await chatInfoCollection.insertOne(data);
      //store chat into the database
      const storeChatNotificationInfo =
        await chatNotificationCollection.insertOne(data);
      res.send(storeChatInfo);
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
    // io.on("connection", (socket) => {
    //   socket.on("disconnect", () => { });
    //   socket.on("send message", async (data) => {
    //     if (data.senderEmail != "admin@gmail.com") {
    //       const receiverInfo = await usersCollection.findOne({
    //         email: "admin@gmail.com",
    //       });
    //       data.receiverEmail = "admin@gmail.com";
    //       data.receiverImg = receiverInfo.image;
    //       data.receiverName = receiverInfo.name;
    //     }
    //     //store chat into the database
    //     const storeChatInfo = await chatInfoCollection.insertOne(data);
    //     //store chat into the database
    //     const storeChatNotificationInfo =
    //       await chatNotificationCollection.insertOne(data);
    //     io.emit("messageTransfer", data);
    //     io.emit("messageNotificationTransfer", data);
    //   });
    //   socket.on("send verification", async (data) => {
    //     io.emit("verificationNotificationTransfer", data);
    //   });
    // });
    //
    //--------Akash Back-End End-------------//

    //--------Niloy Back-End Start-------------//

    // app.post("/pay-bills", async (req, res) => {
    //   const query = req.body;
    //   console.log(query);
    //   const result = await payBillsCollection.insertOne(query);
    //   res.send(result);
    // });
    // all donate api call in dashboard
    app.get("/pay-bills", async (req, res) => {
      const query = {};
      const result = await payBillsCollection.find(query).toArray();
      res.send(result);
    });
    // Start All Pay bil Method
    app.post("/pay-bills", async (req, res) => {
      const payBills = req.body;
      console.log(payBills);
      const { name, phnNumber, amount, billType, billSNumber } = payBills;
      const transactionId = new ObjectId().toString().substring(0, 6);

      const data = {
        total_amount: amount,
        currency: "BDT",
        tran_id: transactionId, // use unique tran_id for each api call
        success_url: `${process.env.SERVER_URL}/pay-bills/success?transactionId=${transactionId}`,
        fail_url: `${process.env.SERVER_URL}/pay-bills/fail?transactionId=${transactionId}`,
        cancel_url: `${process.env.SERVER_URL}/pay-bills/cancel`,
        ipn_url: `${process.env.SERVER_URL}/pay-bills/ipn`,
        shipping_method: "Courier",
        product_name: "Computer.",
        product_category: billType,
        product_profile: "general",
        cus_name: name,
        cus_email: "demon@gmail.com",
        cus_add1: "Dhaka",
        cus_add2: "Dhaka",
        cus_city: "Dhaka",
        cus_state: "Dhaka",
        cus_postcode: "1000",
        cus_country: "Bangladesh",
        cus_phone: phnNumber,
        cus_fax: phnNumber,
        ship_name: name,
        ship_add1: "Dhaka",
        ship_add2: "Dhaka",
        ship_city: "Dhaka",
        ship_state: "Dhaka",
        ship_postcode: 1000,
        ship_country: "Bangladesh",
      };
      console.log(data);
      const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);

      sslcz.init(data).then((apiResponse) => {
        // Redirect the user to payment gateway
        let GatewayPageURL = apiResponse.GatewayPageURL;

        payBillsCollection.insertOne({
          ...payBills,
          transactionId,
          BillType: billType,
          BillNumber: billSNumber,
          paid: "false",
        });
        res.send({ url: GatewayPageURL });
      });
    });

    //  pay-bills success post method
    app.post("/pay-bills/success", async (req, res) => {
      const { transactionId } = req.query;

      const result = await payBillsCollection.updateOne(
        { transactionId },
        { $set: { paid: "true", paidAt: new Date() } }
      );

      if (result.modifiedCount > 0) {
        res.redirect(
          `${process.env.CLIENT_URL}/pay-bills/success?transactionId=${transactionId}`
        );
      }
    });
    //  pay-bills fail post method
    app.post("/pay-bills/fail", async (req, res) => {
      const { transactionId } = req.query;
      if (transactionId) {
        return res.redirect(
          "https://capital-trust-bank-ee791.web.app/pay-bills/fail"
        );
      }
      const result = await payBillsCollection.deleteOne({ transactionId });
      if (result.deletedCount) {
        res.redirect("https://capital-trust-bank-ee791.web.app/pay-bills/fail");
      }
    });
    // show api when users success his pay-bills
    app.get("/pay-bills/by-transaction-id/:id", async (req, res) => {
      const { id } = req.params;
      const result = await payBillsCollection.findOne({ transactionId: id });
      console.log(id, result);
      res.send(result);
    });

    // all pay  api call in dashboard
    app.get("/pay-bills", async (req, res) => {
      const query = {};
      const result = await payBillsCollection.find(query).toArray();
      res.send(result);
    });
    // END All Pay bil Method

    //--------Niloy Back-End End-------------//
  } finally {
  }
}
run().catch((error) => console.log(error));

app.get("/", (req, res) => {
  res.send("Capital Trust Bank server is running v6");
});
app.listen(port, () => {
  console.log(`Capital Trust Bank Server is running on port ${port}`);
});

// socketServer.prependListener("request", (req, res) => {
//   res.setHeader("Access-Control-Allow-Origin", "*");
// });

// socketServer.listen(port, () => {
//   console.log(`Capital Trust Bank Server is running on port ${port}`);
// });
