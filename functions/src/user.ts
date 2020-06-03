import { https, auth, usersCollection, serverTimestamp } from "./utils";
import { ERROR_401, ERROR_NO_DATA } from "./consts";
// import { DocumentSnapshot } from "firebase-functions/lib/providers/firestore";

exports.create = auth.user().onCreate(async (user) => {
  console.log("user: ");
  console.log(user);

  const data = {
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    phoneNumber: user.phoneNumber,
    photoURL: user.photoURL,
    displayName: user.displayName,
    email: user.email,
    emailVerified: user.emailVerified,
    id: user.uid,
    availableHostLeft: 1,
  };

  await usersCollection.doc(data.id).set(data, { merge: true });
});

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

exports.save = https.onCall(async (input = {}, context) => {
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
      .set({ ...input, updatedAt: serverTimestamp() }, { merge: true });

    const documentSnapshot = await usersCollection.doc(userId).get();
    const userData = documentSnapshot.data();

    let response;

    if (userData) response = { ...userData, id: userId };
    else response = { ...input, id: userId };

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

// exports.getByPlace = https.onCall(async (input = {}, context) => {
//   console.log("input: ");
//   console.log(input);
//   console.log("context auth: ");
//   console.log(context.auth);

//   const userId = (context.auth && context.auth.uid) || null;

//   if (!userId) {
//     return {
//       ok: false,
//       error: ERROR_401,
//     };
//   }

//   const placeId = input.placeId || input.id;

//   if (!placeId) {
//     return {
//       ok: false,
//       error: ERROR_NO_DATA,
//     };
//   }

//   try {
//     const documentSnapshot = await placesCollection.doc(placeId).get();
//     const placeData = documentSnapshot.data();

//     let response: any[] = [];

//     if (placeData && placeData.onlineUsers) {
//       const promises: Promise<DocumentSnapshot>[] = [];

//       placeData.onlineUsers.forEach((userId: string) => {
//         console.log("fetching user " + userId);
//         const promise = usersCollection.doc(userId).get();
//         promises.push(promise);
//       });

//       const documentSnapshots = await Promise.all(promises);
//       response = documentSnapshots.map((doc) => {
//         const data = {
//           ...doc.data(),
//           id: doc.id,
//         };
//         return data;
//       });
//     }

//     console.log("response: ");
//     console.log(response);

//     return {
//       ok: true,
//       payload: response,
//     };
//   } catch (error) {
//     console.error(error);
//     return {
//       ok: false,
//       error: error,
//     };
//   }
// });
