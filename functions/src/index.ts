import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import * as place from "./place";
import * as banner from "./banner";
import * as user from "./user";
import * as favorite from "./favorite";
import * as inbox from "./inbox";
import * as post from "./post";
import * as constant from "./constant";
import * as auto from "./auto";

if (!admin.apps.length) admin.initializeApp(functions.config().firebase);

exports.place = place;
exports.banner = banner;
exports.user = user;
exports.favorite = favorite;
exports.inbox = inbox;
exports.post = post;
exports.constant = constant;
exports.auto = auto;
