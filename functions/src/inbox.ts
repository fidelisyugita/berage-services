import {
  https,
  firestore,
  cm,
  inboxesCollection,
  usersCollection,
  serverTimestamp,
} from "./utils";
import { ERROR_401 } from "./consts";

exports.sendNotif = firestore
  .document("inboxes/{id}")
  .onCreate(async (snap, context) => {
    console.log("context: ");
    console.log(context);

    const data = snap.data();
    console.log("data: ");
    console.log(data);

    const querySnapshot = await usersCollection.get();
    const users = querySnapshot.docs.map((doc) => doc.data());

    console.log("users: ");
    console.log(users);

    const tokens = users
      .filter((user) => user.fcmToken && user.fcmToken.length > 0)
      .map((user) => user.fcmToken);

    console.log("tokens: ");
    console.log(tokens);

    const message = {
      notification: {
        title: (data && data.title) || "Title",
        body: (data && data.description) || "Body",
        sound: "default",
        badge: "1",
      },
      data: { score: "850", time: "2:45" },
      tokens: tokens,
    };

    const response = await cm.sendMulticast(message); //dunno why it isn't work
    console.log("response: ");
    console.log(response);
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
    const querySnapshot = await inboxesCollection.get();
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
