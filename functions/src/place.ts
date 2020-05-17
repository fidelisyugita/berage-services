import { https, placesCollection } from "./utils";
import * as dummy from "./dummy";

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

exports.recommended = https.onCall(async (input, context) => {
  console.log("input: ");
  console.log(input);
  console.log("context auth: ");
  console.log(context.auth);

  try {
    /**
     * TODO
     * transform data to readable in mobile
     */
    const response = await placesCollection.get();
    console.log("response: ");
    console.log(response);

    return {
      ok: true,
      payload: dummy.places,
    };
  } catch (error) {
    return {
      ok: false,
      error,
    };
  }
});

exports.save = https.onCall(async (input, context) => {
  console.log("input: ");
  console.log(input);
  console.log("context auth: ");
  console.log(context.auth);

  try {
    let response;
    if (input.id) {
      //update
      response = await placesCollection
        .doc(input.id)
        .set(input, { merge: true });
    } else {
      /**
       * TODO
       * make it return data in mobile, at least the id
       */
      response = await placesCollection.add(input);}

    console.log("response: ");
    console.log(response);

    return {
      ok: true,
      payload: response,
    };
  } catch (error) {
    return {
      ok: false,
      error,
    };
  }
});
