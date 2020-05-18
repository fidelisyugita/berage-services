import { https, placesCollection } from "./utils";
import { ERROR_401 } from "./consts";
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
    console.error(error);
    return {
      ok: false,
      error: error,
    };
  }
});

exports.save = https.onCall(async (input, context) => {
  console.log("input: ");
  console.log(input);
  console.log("context auth: ");
  console.log(context.auth);

  if (!context.auth) {
    return {
      ok: false,
      error: ERROR_401,
    };
  }

  try {
    let response;
    if (input.id) {
      // update
      await placesCollection
        .doc(input.id)
        .set({ ...input, updatedAt: new Date() }, { merge: true });
      response = { id: input.id };
    } else {
      const { token } = context.auth;
      const currentUser = {
        photoURL: token.picture,
        displayName: token.name,
        email: token.email,
        uid: context.auth.uid,
      };
      const data = {
        ...input,
        createdBy: input.createdBy || currentUser,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const docRef = await placesCollection.add(data);
      response = { id: docRef.id };
    }

    console.log("response: ");
    console.log(response);

    return {
      ok: true,
      payload: response,
    };
  } catch (error) {
    console.error(error);
    return {
      ok: false,
      error: error,
    };
  }
});
