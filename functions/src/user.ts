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
    uid: user.uid,
  };

  await usersCollection.add(data);
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

  if (!input.id) {
    return {
      ok: false,
      error: ERROR_NO_DATA,
    };
  }

  try {
    await usersCollection
      .doc(input.id)
      .set({ ...input, updatedAt: new Date() }, { merge: true });
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
