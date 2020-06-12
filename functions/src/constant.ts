import { https, constantsCollection, serverTimestamp } from "./utils";
import { ERROR_401, ERROR_NO_DATA } from "./consts";

exports.get = https.onCall(async (input = {}, context) => {
  console.log("input: ");
  console.log(input);
  console.log("context auth: ");
  console.log(context.auth);

  try {
    const documentSnapshot = await constantsCollection
      .doc("VSFrjJeFIVwF2I40JMq7")
      .get();
    const response = documentSnapshot.data();
    console.log("response: ");
    console.log(response);

    if (response) {
      return {
        ok: true,
        payload: response,
      };
    }
    return {
      ok: false,
      error: ERROR_NO_DATA,
    };
  } catch (error) {
    console.error(error);
    return {
      ok: false,
      error: error,
    };
  }
});

exports.save = https.onCall(async (input = {}, context) => {
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

  if (!input.id) {
    return {
      ok: false,
      error: ERROR_NO_DATA,
    };
  }

  const { token } = context.auth;
  const currentUser = {
    photoURL: token.picture,
    displayName: token.name,
    email: token.email,
    uid: context.auth.uid,
  };

  const data = {
    ...input,
    updatedBy: input.updatedBy || currentUser,
    updatedAt: serverTimestamp(),
  };

  try {
    await constantsCollection.doc(input.id).set(data, { merge: true });
    const response = { ...data };

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
