/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {setGlobalOptions} = require("firebase-functions");
const {onCall, HttpsError} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({ maxInstances: 10 });

admin.initializeApp();
const db = admin.firestore();

const DEFAULT_SUPER_ADMIN = {
  email: "admin.freshdeals@gmail.com",
  password: "Temp$8282",
  username: "admin",
  profileName: "Super Admin",
  role: "super_admin",
  status: "active"
};

const getRequesterAdminDoc = async (uid) => {
  const doc = await db.doc(`admins/${uid}`).get();
  if (!doc.exists) return null;
  return doc.data();
};

exports.bootstrapSuperAdmin = onCall({ cors: true }, async (request) => {
  try {
    const adminsSnap = await db.collection("admins").limit(1).get();
    if (!adminsSnap.empty) {
      return { created: false, reason: "admins_exist" };
    }

    let userRecord;
    try {
      userRecord = await admin.auth().getUserByEmail(DEFAULT_SUPER_ADMIN.email);
      await admin.auth().updateUser(userRecord.uid, {
        password: DEFAULT_SUPER_ADMIN.password,
        displayName: DEFAULT_SUPER_ADMIN.profileName
      });
    } catch (error) {
      if (error.code === "auth/user-not-found") {
        userRecord = await admin.auth().createUser({
          email: DEFAULT_SUPER_ADMIN.email,
          password: DEFAULT_SUPER_ADMIN.password,
          displayName: DEFAULT_SUPER_ADMIN.profileName
        });
      } else {
        throw error;
      }
    }

    await db.doc(`admins/${userRecord.uid}`).set({
      uid: userRecord.uid,
      email: DEFAULT_SUPER_ADMIN.email,
      username: DEFAULT_SUPER_ADMIN.username,
      profileName: DEFAULT_SUPER_ADMIN.profileName,
      mobile: "",
      photoURL: userRecord.photoURL || "",
      role: DEFAULT_SUPER_ADMIN.role,
      status: DEFAULT_SUPER_ADMIN.status,
      createdBy: "system",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      passwordSet: true
    });

    return { created: true, uid: userRecord.uid, email: DEFAULT_SUPER_ADMIN.email };
  } catch (error) {
    logger.error("Bootstrap super admin failed", error);
    throw new HttpsError("internal", error.message);
  }
});

exports.createAdmin = onCall({ cors: true }, async (request) => {
  try {
    if (!request.auth || !request.auth.uid) {
      throw new HttpsError("unauthenticated", "Not authenticated");
    }

    const requester = await getRequesterAdminDoc(request.auth.uid);
    if (!requester || requester.role !== "super_admin") {
      throw new HttpsError("permission-denied", "Only super admins can create admin accounts");
    }

    const {
      email,
      password,
      username,
      profileName,
      mobile,
      photoURL,
      role,
      status
    } = request.data || {};

    if (!email || !password || !username || !profileName) {
      throw new HttpsError("invalid-argument", "Missing required fields");
    }

    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: profileName,
      photoURL: photoURL || ""
    });

    await db.doc(`admins/${userRecord.uid}`).set({
      uid: userRecord.uid,
      email,
      username,
      profileName,
      mobile: mobile || "",
      photoURL: photoURL || "",
      role: role || "admin",
      status: status || "active",
      createdBy: request.auth.uid,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      passwordSet: true
    });

    return { success: true, uid: userRecord.uid };
  } catch (error) {
    logger.error("Create admin failed", error);
    if (error instanceof HttpsError) {
      throw error;
    }
    throw new HttpsError("internal", error.message);
  }
});
