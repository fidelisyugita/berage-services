import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import * as place from "./place";
import * as highlight from "./highlight";
import * as user from "./user";

if (!admin.apps.length) admin.initializeApp(functions.config().firebase);

exports.place = place;
exports.highlight = highlight;
exports.user = user;
