import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import * as place from "./place";
import * as highlight from "./highlight";

if (!admin.apps.length) admin.initializeApp(functions.config().firebase);

exports.place = place;
exports.highlight = highlight;
