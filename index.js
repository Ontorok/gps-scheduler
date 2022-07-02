require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const schedule = require("node-schedule");
const axios = require("axios");
const _ = require("lodash");

const app = express();

app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3600;
schedule.scheduleJob("*/1 * * * *", async () => {
  try {
    console.log("knack_api call");
    const res = await axios.post(
      "http://54.203.84.201/knack_api/getdata.php?date=2022-01-13",
      null,
      {
        headers: {
          Authorization: "Bearer 05cd2aae5110da03fee3b47ecc2c41bc",
        },
      }
    );
    const data = res.data;
    const { status, ...rest } = data;

    const isEmptyObject = Object.entries(rest).length === 0;
    if (!isEmptyObject) {
      const gpsData = Object.keys(rest)
        .map((key) => rest[key])
        .map((entry, index) => ({
          comparatorKey: `${entry.deviceID}_${entry.date}_${
            JSON.parse(entry.County)[0]["id"]
          }_${entry["Funded/non-funded"]}`,
          deviceId: entry.deviceID,
          date: entry.date,
          clubId: JSON.parse(entry.County)[0]["id"],
          clubName: JSON.parse(entry.County)[0]["identifier"],
          trailId: JSON.parse(entry.Trail)["id"],
          trailName: JSON.parse(entry.Trail)["identifier"],
          fundingStatus: entry["Funded/non-funded"],
          eligibleTime: entry["Eligible Time"],
        }));

      const uniqueGpsData = _.uniqBy(gpsData, "comparatorKey");

      try {
        console.log("gps api call");
        const res = await axios.post(
          "http://192.168.0.21:3500/api/entries/save-entries",
          uniqueGpsData
        );
      } catch (err) {
        console.log(err);
      }
    }
  } catch (err) {
    console.log(err);
  }
});

app.listen(PORT, () => console.log(`Server running on port: ${PORT}`));
