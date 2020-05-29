import { https, bannesrCollection, serverTimestamp } from "./utils";
import { ERROR_401, ERROR_NO_DATA } from "./consts";

exports.get = https.onCall(async (input, context) => {
  console.log("input: ");
  console.log(input);
  console.log("context auth: ");
  console.log(context.auth);

  try {
    const querySnapshot = await bannesrCollection.get();
    const response = querySnapshot.docs.map((doc) => {
      const data = {
        ...doc.data(),
        id: doc.id,
      };
      return data;
    });

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

  const { token } = context.auth;
  const currentUser = {
    photoURL: token.picture,
    displayName: token.name,
    email: token.email,
    uid: context.auth.uid,
  };

  if (currentUser.email !== "fb46us@gmail.com") {
    return {
      ok: false,
      error: ERROR_401,
    };
  }

  const data = {
    ...input,
    updatedBy: input.updatedBy || currentUser,
    updatedAt: serverTimestamp(),
    createdBy: input.createdBy || currentUser,
    createdAt: serverTimestamp(),
  };

  try {
    const docRef = await bannesrCollection.add(data);
    const response = { ...data, id: docRef.id };

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

exports.delete = https.onCall(async (input, context) => {
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

  const { token } = context.auth;
  const currentUser = {
    photoURL: token.picture,
    displayName: token.name,
    email: token.email,
    uid: context.auth.uid,
  };

  if (currentUser.email !== "fb46us@gmail.com") {
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

  try {
    await bannesrCollection.doc(input.id).delete();

    return {
      ok: true,
      payload: input,
    };
  } catch (error) {
    console.error(error);
    return {
      ok: false,
      error: error,
    };
  }
});
