import { https, favoritesCollection } from "./utils";
import { ERROR_401, ERROR_NO_DATA } from "./consts";

exports.get = https.onCall(async (input, context) => {
  console.log("input: ");
  console.log(input);
  console.log("context auth: ");
  console.log(context.auth);

  try {
    const querySnapshot = await favoritesCollection.get();
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

exports.getById = https.onCall(async (input, context) => {
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

  try {
    const documentSnapshot = await favoritesCollection.doc(input.id).get();
    const data = documentSnapshot.data();

    if (!data) {
      return {
        ok: false,
        error: ERROR_NO_DATA,
      };
    }

    const response = {
      ...data,
      id: input.id,
    };

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

exports.add = https.onCall(async (input, context) => {
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
  const data = {
    ...input,
    createdBy: input.createdBy || currentUser,
    updatedBy: input.updatedBy || currentUser,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  try {
    const docRef = await favoritesCollection.add(data);
    const response = { id: docRef.id };

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

exports.remove = https.onCall(async (input, context) => {
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

  try {
    await favoritesCollection.doc(input.id).delete();
    const response = { id: input.id };

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
