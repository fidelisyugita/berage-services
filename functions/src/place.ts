import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as dummy from "./dummy";

const region = "asia-east2";
const { https } = functions.region(region);

if (!admin.apps.length) admin.initializeApp();

exports.popular = https.onCall((input, context) => {
  console.log("input: ");
  console.log(input);
  console.log("context auth: ");
  console.log(context.auth);

  return {
    ok: true,
    payload: dummy.places,
  };
});

exports.recommended = https.onCall((input, context) => {
  console.log("input: ");
  console.log(input);
  console.log("context auth: ");
  console.log(context.auth);

  return {
    ok: true,
    payload: dummy.places,
  };
});

exports.getPopular = https.onRequest(async (request, response) => {
  console.log("request.query: ");
  console.log(request.query);

  const token = request.get("Token");
  console.log("token");
  console.log(token);

  // decodedToken = await admin.auth().verifyIdToken(token);
  // console.log('decodedToken');
  // console.log(decodedToken);

  response.send(dummy.places);
});
