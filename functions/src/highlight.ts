import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as dummy from "./dummy";

const region = "asia-east2";
const { https } = functions.region(region);

if (!admin.apps.length) admin.initializeApp();

exports.get = https.onCall((input, context) => {
  console.log("input: ");
  console.log(input);
  console.log("context auth: ");
  console.log(context.auth);

  return {
    ok: true,
    payload: dummy.images,
  };
});