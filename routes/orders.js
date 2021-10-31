const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync.js");
const { isLoggedIn } = require("../middleware");
const tsp = require("../build/release/testaddon.node");
const fs = require("fs");
const { Graph } = require("../utils/graph");
const { GeneticAlgorithm } = require("../utils/tsp");

const Order = require("../models/orders");

global.finalMapData = new Array();

function Corddistance(lat1, lat2, lon1, lon2) {
  // The math module contains a function
  // named toRadians which converts from
  // degrees to radians.
  lon1 = (lon1 * Math.PI) / 180;
  lon2 = (lon2 * Math.PI) / 180;
  lat1 = (lat1 * Math.PI) / 180;
  lat2 = (lat2 * Math.PI) / 180;

  // Haversine formula
  let dlon = lon2 - lon1;
  let dlat = lat2 - lat1;
  let a =
    Math.pow(Math.sin(dlat / 2), 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin(dlon / 2), 2);

  let c = 2 * Math.asin(Math.sqrt(a));

  // Radius of earth in kilometers. Use 3956
  // for miles
  let r = 6371;

  // calculate the result
  return c * r;
}

async function outputDict(orders, answer) {
  const finalOrder = answer;
  finalMapData.length = 0;
  for (let routeOrder of finalOrder) {
    if (routeOrder === 100) {
      finalMapData.push({
        latLng: { lat: 19.076, lng: 72.8777 },
      });
    } else {
      finalMapData.push({
        latLng: {
          lat: orders[routeOrder].lat,
          lng: orders[routeOrder].long,
        },
      });
    }
  }
  finalMapData.push({ latLng: { lat: 19.076, lng: 72.8777 } });
  console.log(finalMapData);
}

async function intoArray() {
  const orders = await Order.find({ stage: "pickedup" })
    .populate("userId")
    .populate({
      path: "cart",
      populate: {
        path: "product",
      },
    });

  if (orders.length === 6) {
    let ga_tsp = new GeneticAlgorithm(100, 20, 4, 0.2, 0.1);
    let graph = new Graph();
    let charToIntDict = {
      0: "a",
      1: "b",
      2: "c",
      3: "d",
      4: "e",
      5: "f",
      6: "g",
      7: "h",
      8: "i",
      9: "j",
      100: "z",
    };
    for (let orderIndex = 0; orderIndex < 6; orderIndex++) {
      const distance = Corddistance(
        19.076,
        orders[orderIndex].lat,
        72.8777,
        orders[orderIndex].long
      );
      graph.setAdjacent("z", charToIntDict[orderIndex], distance);
    }
    for (let orderInd = 0; orderInd < 6; orderInd++) {
      for (let orderInd2 = orderInd + 1; orderInd2 < 6; orderInd2++) {
        let distance = Corddistance(
          orders[orderInd].lat,
          orders[orderInd2].lat,
          orders[orderInd].long,
          orders[orderInd2].long
        );
        graph.setAdjacent(
          charToIntDict[orderInd],
          charToIntDict[orderInd2],
          distance
        );
      }
    }
    let pathCost = ga_tsp.optimise(graph);
    console.log(Array.from(pathCost));
    const arrayPath = Array.from(pathCost);
    const answer = new Array();
    for (let ct of arrayPath) {
      answer.push(
        parseInt(
          Object.keys(charToIntDict).find((key) => {
            return charToIntDict[key] === ct;
          })
        )
      );
    }
    console.log(answer);
    await outputDict(orders, answer);
  }
}

router.get(
  "/status",
  isLoggedIn,
  catchAsync(async (req, res) => {
    const orders = await Order.find({})
      .populate("userId")
      .populate({
        path: "cart",
        populate: {
          path: "product",
        },
      });
    //console.log(Object.keys(orders).length)
    res.render("orders/status2", { orders });
  })
);

router.get(
  "/dashboard",
  isLoggedIn,
  catchAsync(async (req, res) => {
    const orders = await Order.find({}).populate("userId");

    const pickedOrders = await Order.find({ stage: "pickedup" });
    const len = pickedOrders.length;
    intoArray();
    res.render("orders/dashboard", { orders, len });
  })
);

router.get(
  "/history",
  isLoggedIn,
  catchAsync(async (req, res) => {
    const orders = await Order.find({ stage: "history" })
      .populate("userId")
      .populate({
        path: "cart",
        populate: {
          path: "product",
        },
      });

    res.render("orders/history", { orders });
  })
);

router.post(
  "/insert",
  catchAsync(async (req, res) => {
    const order = new Order(req.body.orders);
    await order.save();
    res.send(order);
  })
);

router.post(
  "/topreparing/:id",
  isLoggedIn,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const order = await Order.findById(id);
    const orderStatus = req.body.order.status;
    order.status = orderStatus;
    if (orderStatus === "accept") {
      order.stage = "preparing";
    } else {
      order.stage = "history";
    }
    // console.log(order)
    await order.save();
    res.redirect("/orders/status");
  })
);

router.post(
  "/dashboard/toprepared/:id",
  isLoggedIn,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const order = await Order.findById(id);
    order.stage = "prepared";
    await order.save();
    res.redirect("/orders/dashboard");
  })
);

router.post(
  "/dashboard/topickedup/:id",
  isLoggedIn,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const order = await Order.findById(id);
    order.stage = "pickedup";
    await order.save();

    res.redirect("/orders/dashboard");
  })
);

router.post(
  "/dashboard/toorderhistory/:id",
  isLoggedIn,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const order = await Order.findById(id);
    order.stage = "history";
    await order.save();
    res.redirect("/orders/dashboard");
  })
);

router.get("/map", isLoggedIn, (req, res) => {
  res.render("map/index2", { finalMapData });
});

module.exports = router;
