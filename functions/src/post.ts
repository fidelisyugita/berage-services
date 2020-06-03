import { https, postsCollection, serverTimestamp, arrayUnion } from "./utils";
import { ERROR_401, ERROR_NO_DATA, DATA_PER_PAGE } from "./consts";

exports.get = https.onCall(async (input = {}, context) => {
  console.log("input: ");
  console.log(input);
  console.log("context auth: ");
  console.log(context.auth);

  const placeId = input.placeId || input.id;

  if (!placeId) {
    return {
      ok: false,
      error: ERROR_NO_DATA,
    };
  }

  try {
    const querySnapshot = await postsCollection
      .where("placeId", "==", placeId)
      .orderBy("updatedAt", "desc")
      .limit((input && input.limit) || DATA_PER_PAGE)
      .offset((input && input.offset) || 0)
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

  const placeId = input.placeId;

  if (!placeId) {
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
    createdBy: input.createdBy || currentUser,
    createdAt: serverTimestamp(),
  };

  try {
    const docRef = await postsCollection.add(data);
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

exports.like = https.onCall(async (input = {}, context) => {
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

  const postId = input.postId || input.id;

  if (!postId) {
    return {
      ok: false,
      error: ERROR_NO_DATA,
    };
  }

  try {
    const postDoc = postsCollection.doc(postId);
    await postDoc.update({
      likedBy: arrayUnion(userId),
    });

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

exports.dislike = https.onCall(async (input = {}, context) => {
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

  const postId = input.postId || input.id;

  if (!postId) {
    return {
      ok: false,
      error: ERROR_NO_DATA,
    };
  }

  try {
    const postDoc = postsCollection.doc(postId);
    await postDoc.update({
      dislikedBy: arrayUnion(userId),
    });

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
