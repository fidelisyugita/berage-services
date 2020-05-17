import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

if (!admin.apps.length) admin.initializeApp(functions.config().firebase);

const REGION = "asia-east2";
export const https = functions.region(REGION).https;

const db = admin.firestore();
export const placesCollection = db.collection("places");
