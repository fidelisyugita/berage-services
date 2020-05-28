import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

import { REGION } from "./consts";

if (!admin.apps.length) admin.initializeApp(functions.config().firebase);

const myFunctions = functions.region(REGION);

export const { https, auth, firestore } = myFunctions;

export const db = admin.firestore();
export const cm = admin.messaging();

export const placesCollection = db.collection("places");
export const usersCollection = db.collection("users");
export const inboxesCollection = db.collection("inboxes");

export const { arrayUnion, arrayRemove } = admin.firestore.FieldValue;
