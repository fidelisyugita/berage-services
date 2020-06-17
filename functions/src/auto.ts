import { database } from "./utils";

exports.removeJoinedUser = database
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
      var oldItemsQuery = ref.orderByChild("timestamp").endAt(cutoff);
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
