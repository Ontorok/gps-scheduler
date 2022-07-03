require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const schedule = require("node-schedule");
const axios = require("axios");
const _ = require("lodash");
const moment = require("moment");

const app = express();

app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3600;
schedule.scheduleJob("*/5 * * * * *", async () => {
  try {
    console.log("knack_api call");
    const date = moment(new Date("2022-07-02")).format("yyyy-MM-DD");
    const url = `http://54.203.84.201/knack_api/getdata.php?date=2022-07-02`;
    const res = await axios.post(
      "http://54.203.84.201/knack_api/getdata.php?date=2022-07-02",
      null,
      {
        headers: {
          Authorization: "Bearer 05cd2aae5110da03fee3b47ecc2c41bc",
        },
      }
    );
    const data = res.data;
    const { status, ...rest } = data;

    const hasData = true;
    if (hasData) {
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
          "https://gps-data-api-v3.herokuapp.com/api/entries/save-entries",
          uniqueGpsData
        );
      } catch (err) {
        console.log(err.response.data.message);
      }
    } else {
      console.log("no data");
    }
  } catch (err) {
    console.log(err.message);
  }
});

app.listen(PORT, () => console.log(`Server running on port: ${PORT}`));
