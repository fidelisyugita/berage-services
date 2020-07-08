import {
  https,
  postsCollection,
  commentsCollection,
  serverTimestamp,
  arrayUnion,
} from "./utils";
import {
  ERROR_401,
  ERROR_NO_DATA,
  ERROR_NO_INPUT,
  DATA_PER_PAGE,
} from "./consts";

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

  const limit = (input && input.limit) || DATA_PER_PAGE;
  const offset = input && input.page ? limit * input.page : 0;

  try {
    const querySnapshot = await postsCollection
      .where("placeId", "==", placeId)
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
  const { updatedBy } = input;
  const currentUser = {
    photoURL: updatedBy ? updatedBy.photoURL : token.picture,
    displayName: updatedBy ? updatedBy.displayName : token.name,
    email: updatedBy ? updatedBy.email : token.email,
    uid: updatedBy ? updatedBy.uid : context.auth.uid,
  };

  if (
    currentUser.email &&
    currentUser.email.endsWith("cloudtestlabaccounts.com")
  ) {
    return {
      ok: false,
      error: ERROR_401,
    };
  }

  const data = {
    ...input,
    updatedBy: currentUser,
    updatedAt: serverTimestamp(),
    createdBy: currentUser,
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
      payload: { ...input, userId: userId },
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
      payload: { ...input, userId: userId },
    };
  } catch (error) {
    console.error(error);
    return {
      ok: false,
      error: error,
    };
  }
});

exports.comment = https.onCall(async (input = {}, context) => {
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
  const { updatedBy } = input;
  const currentUser = {
    photoURL: updatedBy ? updatedBy.photoURL : token.picture,
    displayName: updatedBy ? updatedBy.displayName : token.name,
    email: updatedBy ? updatedBy.email : token.email,
    uid: updatedBy ? updatedBy.uid : context.auth.uid,
  };

  if (
    currentUser.email &&
    currentUser.email.endsWith("cloudtestlabaccounts.com")
  ) {
    return {
      ok: false,
      error: ERROR_401,
    };
  }

  const { postId, text } = input;

  if (!postId) {
    return {
      ok: false,
      error: ERROR_NO_DATA,
    };
  }

  if (!text) {
    return {
      ok: false,
      error: ERROR_NO_INPUT,
    };
  }

  const data = {
    ...input,
    updatedBy: currentUser,
    updatedAt: serverTimestamp(),
  };

  try {
    if (input.id) {
      // update
      await commentsCollection.doc(input.id).set(data, { merge: true });

      return {
        ok: true,
        payload: data,
      };
    }

    const docRef = await commentsCollection.add({
      ...data,
      createdBy: currentUser,
      createdAt: serverTimestamp(),
    });
    const response = { ...data, id: docRef.id };

    const postDoc = postsCollection.doc(postId);
    await postDoc.update({
      comments: arrayUnion(response.id),
    });

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

exports.getComments = https.onCall(async (input = {}, context) => {
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

  if (!input.postId) {
    return {
      ok: false,
      error: ERROR_NO_DATA,
    };
  }

  const limit = (input && input.limit) || DATA_PER_PAGE;
  const offset = input && input.page ? limit * input.page : 0;

  try {
    const querySnapshot = await commentsCollection
      .where("postId", "==", input.postId)
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
