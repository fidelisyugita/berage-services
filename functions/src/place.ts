import { https, placesCollection, serverTimestamp } from "./utils";
import { ERROR_401, ERROR_NO_DATA } from "./consts";

exports.get = https.onCall(async (input, context) => {
  console.log("input: ");
  console.log(input);
  console.log("context auth: ");
  console.log(context.auth);

  let searchText = input.searchText || "";
  searchText = searchText.charAt(0).toUpperCase() + searchText.slice(1);

  console.log("searchText: ");
  console.log(searchText);

  try {
    const querySnapshot = await placesCollection
      .orderBy("name")
      .where("name", ">=", searchText)
      .where("name", "<=", searchText + "\uf8ff")
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

exports.popular = https.onCall(async (input, context) => {
  console.log("input: ");
  console.log(input);
  console.log("context auth: ");
  console.log(context.auth);

  try {
    const querySnapshot = await placesCollection
      .orderBy("popularAt", "desc")
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

exports.recommended = https.onCall(async (input, context) => {
  console.log("input: ");
  console.log(input);
  console.log("context auth: ");
  console.log(context.auth);

  try {
    const querySnapshot = await placesCollection
      .orderBy("recommendedAt", "desc")
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

  let placeName = input.name || "";
  placeName = placeName.charAt(0).toUpperCase() + placeName.slice(1);

  const data = {
    ...input,
    name: placeName,
    updatedBy: input.updatedBy || currentUser,
    updatedAt: serverTimestamp(),
  };

  try {
    let response;
    if (input.id) {
      // update
      await placesCollection.doc(input.id).set(data, { merge: true });
      response = { ...data, id: input.id };
    } else {
      const docRef = await placesCollection.add({
        ...data,
        createdBy: input.createdBy || currentUser,
        createdAt: serverTimestamp(),
      });
      response = { ...data, id: docRef.id };
    }

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

exports.byUser = https.onCall(async (input, context) => {
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
    const querySnapshot = await placesCollection
      .where("updatedBy.uid", "==", userId)
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

exports.setPopular = https.onCall(async (input, context) => {
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

  const placeId = input.id;

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
    popularBy: currentUser,
    popularAt: serverTimestamp(),
  };

  try {
    await placesCollection.doc(placeId).set(data, { merge: true });
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

exports.setRecommended = https.onCall(async (input, context) => {
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

  const placeId = input.id;

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
    recommendedBy: currentUser,
    recommendedAt: serverTimestamp(),
  };

  try {
    await placesCollection.doc(placeId).set(data, { merge: true });
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

exports.verify = https.onCall(async (input, context) => {
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

  const placeId = input.id;

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
    verifiedBy: currentUser,
    verifiedAt: serverTimestamp(),
  };

  try {
    await placesCollection.doc(placeId).set(data, { merge: true });
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
