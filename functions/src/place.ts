import { https, placesCollection } from "./utils";
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

exports.recommended = https.onCall(async (input, context) => {
  console.log("input: ");
  console.log(input);
  console.log("context auth: ");
  console.log(context.auth);

  try {
    const querySnapshot = await placesCollection.get();
    const places = querySnapshot.docs.map((doc) => doc.data());

    console.log("places: ");
    console.log(places);

    return {
      ok: true,
      payload: places,
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
      // update
      await placesCollection.doc(input.id).set(input, { merge: true });
      response = { id: input.id };
    } else {
      /**
       * TODO
       * make it return data in mobile, at least the id
       */
      const docRef = await placesCollection.add(input);
      response = { id: docRef.id };
    }

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
