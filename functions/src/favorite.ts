import {
  https,
  usersCollection,
  placesCollection,
  arrayUnion,
  arrayRemove,
} from "./utils";
import { ERROR_401, ERROR_NO_DATA } from "./consts";
import { DocumentSnapshot } from "firebase-functions/lib/providers/firestore";

exports.get = https.onCall(async (input = {}, context) => {
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

    let response: any[] = [];

    if (userData && userData.favorites) {
      const promises: Promise<DocumentSnapshot>[] = [];

      userData.favorites.forEach((placeId: string) => {
        console.log("fetching place " + placeId);
        const promise = placesCollection.doc(placeId).get();
        promises.push(promise);
      });

      const documentSnapshots = await Promise.all(promises);
      response = documentSnapshots.map((doc) => {
        const data = {
          ...doc.data(),
          id: doc.id,
        };
        return data;
      });
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

exports.add = https.onCall(async (input = {}, context) => {
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

  if (!input.placeId) {
    return {
      ok: false,
      error: ERROR_NO_DATA,
    };
  }

  try {
    const userDoc = usersCollection.doc(userId);
    await userDoc.update({
      favorites: arrayUnion(input.placeId),
    });
    console.log("adding " + input.placeId + " to your favorites");
    const response = { placeId: input.placeId };

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

exports.remove = https.onCall(async (input = {}, context) => {
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

  if (!input.placeId) {
    return {
      ok: false,
      error: ERROR_NO_DATA,
    };
  }

  try {
    const userDoc = usersCollection.doc(userId);
    await userDoc.update({
      favorites: arrayRemove(input.placeId),
    });
    console.log("remove " + input.placeId + " from your favorites");
    const response = { placeId: input.placeId };

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
