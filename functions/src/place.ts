import { https } from "./utils";
import * as dummy from "./dummy";

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
