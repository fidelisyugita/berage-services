import {
  database,
  auth,
  firestore,
  cm,
  usersCollection,
  serverTimestamp,
} from "./utils";

exports.createUser = auth.user().onCreate(async (user) => {
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
      // tokens: tokens,
      tokens: [
        "eRFXVnoG_70:APA91bHEj8o_uRsCbzTLwyjxJV1e4o3URqfNCb0Tda3pH-xn6G080REjBQJVQWHuLYguiJ0S5BpqKJMlK7pjCeMUQHxFslyzP5hoIvSvCzO7JueyslwXUYEnMbFJvh7eyKsLajgFai9m",
      ],
    };

    const response = await cm.sendMulticast(message); //dunno why it isn't work
    console.log("response: ");
    console.log(response);
  });

exports.removeJoinChatUser = database
  .ref("onlineUsers/{placeId}/{userId}")
  .onWrite(async (change, context) => {
    console.log("context: ");
    console.log(context);

    console.log("change: ");
    console.log(change);

    const ref = change.after.ref.parent; // reference to the items
    const now = Date.now();
    const cutoff = now - 60 * 60 * 1000; // 60mins

    if (ref) {
      let oldItemsQuery = ref.orderByChild("timestamp").endAt(cutoff);
      if (oldItemsQuery) {
        return oldItemsQuery.once("value", (snapshot) => {
          // create a map with all children that need to be removed
          // var updates = {};
          let promises: any[] = [];
          snapshot.forEach((child) => {
            // updates[child.key] = null;
            promises.push(child.ref.set(null));
          });

          return Promise.all(promises);
          // execute all updates in one go and return the result to end the function
          // return ref.update(updates);
        });
      }
    }

    return;
  });
