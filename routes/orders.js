const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync.js");
const { isLoggedIn } = require("../middleware");
const tsp = require("../build/release/testaddon.node");
const fs = require("fs");
const { Graph } = require("../utils/graph");
const { GeneticAlgorithm } = require("../utils/tsp");

const Order = require("../models/orders");

//const finalStageOrder = new Array();
global.finalMapData = new Array();

async function outputDict(orders, answer) {
  // const data = fs
  //   .readFileSync("bestSolution.txt")
  //   .toString()
  //   .replace(/\r\n/g, "\n")
  //   .split("\n");
  //console.log(data[data.length - 2]);
  const finalOrder = answer;
  // finalOrder.pop();
  //console.log(finalOrder);
  finalMapData.length = 0;
  // finalMapData.push({ latLng: { lat: 19.076, lng: 72.8777 } });
  for (let routeOrder of finalOrder) {
    // routeOrder = parseInt(routeOrder);
    if(routeOrder === 100){
      finalMapData.push({
        latLng: { lat: 19.076, lng: 72.8777 }
      });
    }else{
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
  //console.log(orders.length);

  if (orders.length === 6) {
    let ga_tsp = new GeneticAlgorithm(20, 20, 4, 0.2, 0.1);
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
      100: "z"
    };
    for(let orderIndex=0; orderIndex < 6; orderIndex++){
      const x_i = 6400 * 72.8777 * Math.cos(19.022375);
      const y_i = 6400 * 19.076;
      const x_j = 6400 * orders[orderIndex].long * Math.cos(19.022375);
      const y_j = 6400 * orders[orderIndex].lat;
      let distance = Math.sqrt(
        Math.pow(x_i - x_j, 2) + Math.pow(x_i - x_j, 2)
      );
      graph.setAdjacent(
        "z",
        charToIntDict[orderIndex],
        distance
      );
    }
    for (let orderInd = 0; orderInd < 6; orderInd++) {
      const x_i = 6400 * orders[orderInd].long * Math.cos(19.022375);
      const y_i = 6400 * orders[orderInd].lat;
      for (let orderInd2 = orderInd + 1; orderInd2 < 6; orderInd2++) {
        const x_j = 6400 * orders[orderInd2].long * Math.cos(19.022375);
        const y_j = 6400 * orders[orderInd2].lat;
        let distance = Math.sqrt(
          Math.pow(x_i - x_j, 2) + Math.pow(x_i - x_j, 2)
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
    for(let ct of arrayPath){
      answer.push(parseInt(Object.keys(charToIntDict).find(key => {
        return charToIntDict[key] === ct;
      })))
    }
    console.log(answer);
    await outputDict(orders, answer);

    // fs.writeFileSync("tsp-project.tsp", "");
    // fs.writeFileSync("bestSolution.txt", "");
    // fs.appendFileSync(
    //   "tsp-project.tsp",
    //   "DIMENSION : 6\nEDGE_WEIGHT_TYPE : EUC_2D\nNODE_COORD_SECTION\n"
    // );
    // let count = 1;

    // console.log(orders);
    // for (let order of orders) {
    //   //{ lat } = order;
    //   //{ long } = order;
    //   const x = 6400 * order.long * Math.cos(19.022375);
    //   const y = 6400 * order.lat;
    //   fs.appendFileSync("tsp-project.tsp", "\n" + count + " " + x + " " + y);
    //   count += 1;
    // }
    // fs.appendFileSync("tsp-project.tsp", "\nEOF\n");
    // await tsp.hello();
    // await outputDict(orders);
    //next();
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
    //console.log(finalStageOrder);
    //console.log(finalStageOrder.length)
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
    // console.log(orders);
    // console.log(String(orders[0].orderNo))
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
  //console.log(finalMapData);
  res.render("map/index2", { finalMapData });
});

module.exports = router;
