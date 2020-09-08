import {
  database,
  auth,
  firestore,
  cm,
  usersCollection,
  serverTimestamp,
} from "./utils";
import { INCOMING_CHAT } from "./consts";

exports.createUser = auth.user().onCreate(async (user) => {
  console.log("user: ");
  console.log(user);

  const data = {
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    phoneNumber: user.phoneNumber,
    photoURL: user.photoURL || null,
    displayName: user.displayName || null,
    email: user.email || null,
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

    const notification = {
      title: (data && data.title) || "Title",
      body: (data && data.description) || "Body",
    };

    let promises: any[] = [];
    users.forEach((user) => {
      if (user.fcmToken && user.fcmToken.length > 0) {
        promises.push(
          cm.send({
            notification: notification,
            token: user.fcmToken,
          })
        );
      }
    });

    await Promise.all(promises);

    // await cm.send({
    //   notification: notification,
    //   token:
    //     "euPNym7SA8M:APA91bEtGh9HW0tgwKNGYBKjVrA_sXc8emrUgKYbhYRm2rJrq5jMcXgix02vs2yN5urplfTQ5PU6htjz1mAovhVsNFMgHewTZyrsGetDXUNjKVVQDdAlaajI-KyaTsWb-oBm1f2uImaR",
    // });
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
    const cutoff = now - 120 * 60 * 1000; // 120mins

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

exports.sendChatNotif = database
  .ref("rooms/{senderId}/{receiverId}")
  .onWrite(async (change, context) => {
    // console.log("context: ");
    // console.log(JSON.stringify(context, null, 2));
    // console.log("change: ");
    // console.log(JSON.stringify(change, null, 2));

    const after = change.after.val();
    const { user } = after;
    console.log("user: ");
    console.log(JSON.stringify(user, null, 2));

    if (user.receiver && user.fcmToken) {
      const message = {
        notification: {
          title: INCOMING_CHAT,
          body: after.text,
        },
        token: user.fcmToken,
      };
      await cm.send(message);
    }
  });
