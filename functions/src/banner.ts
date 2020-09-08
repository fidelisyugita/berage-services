import { https, bannesrCollection, serverTimestamp } from "./utils";
import { ERROR_401, ERROR_NO_DATA, DATA_PER_PAGE } from "./consts";
// import * as logger from "firebase-functions/lib/logger";

exports.get = https.onCall(async (input = {}, context) => {
  console.log("input: ");
  console.log(input);
  console.log("context auth: ");
  console.log(context.auth);
  // logger.log({ input });
  // logger.log({ "context auth": context.auth });

  const limit = (input && input.limit) || DATA_PER_PAGE;
  const offset = input && input.page ? limit * input.page : 0;

  try {
    const querySnapshot = await bannesrCollection
      .where("isDeleted", "==", false)
      .limit(limit)
      .offset(offset)
      .get();
    const response = querySnapshot.docs.map((doc) => {
      const data = {
        ...doc.data(),
        id: doc.id,
      };
      return data;
    });

    console.log("response: ");
    console.log({ response });
    // logger.log({ response });

    return {
      ok: true,
      payload: response,
    };
  } catch (error) {
    console.error(error);
    // logger.error({ error });
    return {
      ok: false,
      error: error,
    };
  }
});

exports.add = https.onCall(async (input = {}, context) => {
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
    photoURL: token.picture || null,
    displayName: token.name || null,
    email: token.email || null,
    uid: context.auth.uid,
  };

  if (
    currentUser.email !== "fb46us@gmail.com" &&
    currentUser.email !== "fidelisyugita@gmail.com"
  ) {
    return {
      ok: false,
      error: ERROR_401,
    };
  }

  const data = {
    ...input,
    isDeleted: false,
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

exports.delete = https.onCall(async (input = {}, context) => {
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
    photoURL: token.picture || null,
    displayName: token.name || null,
    email: token.email || null,
    uid: context.auth.uid,
  };

  if (
    currentUser.email !== "fb46us@gmail.com" &&
    currentUser.email !== "fidelisyugita@gmail.com"
  ) {
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
    // await bannesrCollection.doc(input.id).delete();
    await bannesrCollection
      .doc(input.id)
      .set({ isDeleted: true }, { merge: true });

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
