require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const schedule = require("node-schedule");
const axios = require("axios");
const { restart } = require("nodemon");

const app = express();

app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3600;
// schedule.scheduleJob("*/1 * * * *", async () => {
//   try {
//     console.log("call knack_api");
//     const res = await axios.post(
//       "http://54.203.84.201/knack_api/getdata.php?date=2022-01-13",
//       null,
//       {
//         headers: {
//           Authorization: "Bearer 05cd2aae5110da03fee3b47ecc2c41bc",
//         },
//       }
//     );
//     const data = res.data;
//     const { status, ...rest } = data;
//     const isEmptyObject = Object.entries(rest).length === 0;
//     if (!isEmptyObject) {
//       const array = Object.keys(rest)
//         .map((key) => rest[key])
//         .map((entry, index) => ({
//           deviceID: entry.deviceID,
//           date: entry.date,
//           County: JSON.parse(entry.County),
//           Trail: JSON.parse(entry.Trail),
//         }))
//         .splice(0, 5);
//       console.log(JSON.stringify(array, null, 2));

//       try {
//         console.log("gps");
//         const res = await axios.post(
//           "http://192.168.0.21:3500/api/entries/save-entries",
//           array
//         );
//       } catch (err) {
//         console.log(err);
//       }
//     }
//   } catch (err) {
//     console.log(err);
//   }
// });

app.listen(PORT, () => console.log(`Server running on port: ${PORT}`));
