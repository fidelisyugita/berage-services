import { https, inboxesCollection, serverTimestamp } from "./utils";
import { ERROR_401, DATA_PER_PAGE } from "./consts";

exports.get = https.onCall(async (input, context) => {
  console.log("input: ");
  console.log(input);
  console.log("context auth: ");
  console.log(context.auth);

  // const userId = (context.auth && context.auth.uid) || null;

  // if (!userId) {
  //   return {
  //     ok: false,
  //     error: ERROR_401,
  //   };
  // }

  const limit = (input && input.limit) || DATA_PER_PAGE;
  const offset = input && input.page ? limit * input.page : 0;

  try {
    const querySnapshot = await inboxesCollection
      .orderBy("updatedAt", "desc")
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
    updatedBy: input.updatedBy || currentUser,
    updatedAt: serverTimestamp(),
    createdBy: input.createdBy || currentUser,
    createdAt: serverTimestamp(),
  };

  try {
    const docRef = await inboxesCollection.add(data);
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
