import * as functions from "firebase-functions";

const REGION = "asia-east2";
export const { https } = functions.region(REGION);
// export const { https } = functions
