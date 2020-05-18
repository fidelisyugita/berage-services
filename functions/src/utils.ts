import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

import { REGION } from "./consts";

if (!admin.apps.length) admin.initializeApp(functions.config().firebase);

const myFunctions = functions.region(REGION);

export const https = myFunctions.https
export const auth = myFunctions.auth;

export const db = admin.firestore();

export const placesCollection = db.collection("places");
export const usersCollection = db.collection("users");
