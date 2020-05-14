import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import * as place from "./place";
import * as highlight from "./highlight";

// if (!admin.apps.length)
// admin.initializeApp({
//   credential: admin.credential.applicationDefault(),
//   databaseURL: "https://berage.firebaseio.com",
// });
admin.initializeApp(functions.config().firebase);

exports.place = place;
exports.highlight = highlight;
