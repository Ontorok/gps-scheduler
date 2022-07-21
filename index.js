require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const schedule = require("node-schedule");
const axios = require("axios");
const _ = require("lodash");
const moment = require("moment");

const convertSecondToHour = (sec) =>
  sec === 0 ? 0 : Number((sec / 3600).toFixed(2));

const app = express();

app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3600;
schedule.scheduleJob("*/10 * * * * *", async () => {
  try {
    console.log("knack_api call");

    const date = moment(new Date()).subtract(1, "day").format("yyyy-MM-DD");
    const url = `http://54.203.84.201/knack_api/getdata.php?date=${date}`;

    const res = await axios.post(url, null, {
      headers: {
        Authorization: "Bearer 05cd2aae5110da03fee3b47ecc2c41bc",
      },
    });
    const data = res.data;
    const { status, ...rest } = data;

    const hasNoData = rest.Data && rest.Data === "No Record Found";
    if (!hasNoData) {
      const gpsData = Object.keys(rest)
        .map((key) => rest[key])
        .map((entry, index) => ({
          comparatorKey: `${entry.deviceID}_${entry.date}_${
            JSON.parse(entry.County)[0]["id"]
          }_${entry["Funded/non-funded"]}`,
          deviceId: entry.deviceID,
          date: entry.date,
          countyId: JSON.parse(entry.County)[0]["id"],
          countyName: JSON.parse(entry.County)[0]["identifier"],
          trailId: JSON.parse(entry.Trail)["id"],
          trailName: JSON.parse(entry.Trail)["identifier"],
          fundingStatus: entry["Funded/non-funded"],
          eligibleTime: Number(entry["Eligible Time"]),
          eligibleTimeInHour: convertSecondToHour(
            Number(entry["Eligible Time"])
          ),
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
      console.log(rest.Data);
    }
  } catch (err) {
    console.log(err.message);
  }
});

app.listen(PORT, () => console.log(`Server running on port: ${PORT}`));
