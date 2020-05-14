import { https } from "./utils";
import * as dummy from "./dummy";

exports.get = https.onCall((input, context) => {
  console.log("input: ");
  console.log(input);
  console.log("context auth: ");
  console.log(context.auth);

  return {
    ok: true,
    payload: dummy.images,
  };
});
