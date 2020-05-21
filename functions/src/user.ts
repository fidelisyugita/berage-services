import { https, auth, usersCollection } from "./utils";
import { ERROR_401, ERROR_NO_DATA } from "./consts";

exports.create = auth.user().onCreate(async (user) => {
  console.log("user: ");
  console.log(user);

  const data = {
    createdAt: new Date(),
    updatedAt: new Date(),
    phoneNumber: user.phoneNumber,
    photoURL: user.photoURL,
    displayName: user.displayName,
    email: user.email,
    emailVerified: user.emailVerified,
    id: user.uid,
  };

  await usersCollection.doc(data.id).set(data, { merge: true });
});

exports.get = https.onCall(async (input, context) => {
  console.log("input: ");
  console.log(input);
  console.log("context auth: ");
  console.log(context.auth);

  const userId = (context.auth && context.auth.uid) || null;

  if (!userId) {
    return {
      ok: false,
      error: ERROR_401,
    };
  }

  try {
    const documentSnapshot = await usersCollection.doc(userId).get();
    const userData = documentSnapshot.data();

    if (userData) {
      const response = { ...userData, id: userId };
      console.log("response: ");
      console.log(response);

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

exports.save = https.onCall(async (input, context) => {
  console.log("input: ");
  console.log(input);
  console.log("context auth: ");
  console.log(context.auth);

  const userId = (context.auth && context.auth.uid) || null;

  if (!userId) {
    return {
      ok: false,
      error: ERROR_401,
    };
  }

  try {
    await usersCollection
      .doc(userId)
      .set({ ...input, updatedAt: new Date() }, { merge: true });
    const response = { id: userId };

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
