import { collection, getDocs, orderBy, query, doc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, updateProfile, signOut } from 'firebase/auth';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, firebaseConfig, getFirebaseApp } from './firebaseConfig';

export const listAdmins = async () => {
  const q = query(collection(db, 'admins'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data()
  }));
};

export const createAdmin = async (payload) => {
  const currentUser = getAuth(getFirebaseApp()).currentUser;
  if (!currentUser) {
    throw new Error('Not authenticated');
  }

  const {
    email,
    password,
    username,
    profileName,
    mobile,
    photoURL,
    photoFile,
    role,
    status
  } = payload;

  if (!email || !password || !username || !profileName) {
    throw new Error('Missing required fields');
  }

  const existing = getApps().find((appInstance) => appInstance.name === 'admin-creator');
  const secondaryApp = existing || initializeApp(firebaseConfig, 'admin-creator');
  const secondaryAuth = getAuth(secondaryApp);
  const storage = getStorage(secondaryApp);

  const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
  let finalPhotoUrl = photoURL || '';
  if (photoFile) {
    const fileRef = storageRef(storage, `admin-avatars/${userCredential.user.uid}/${Date.now()}_${photoFile.name}`);
    await uploadBytes(fileRef, photoFile);
    finalPhotoUrl = await getDownloadURL(fileRef);
  }

  await updateProfile(userCredential.user, {
    displayName: profileName,
    photoURL: finalPhotoUrl
  });

  await setDoc(doc(db, 'admins', userCredential.user.uid), {
    uid: userCredential.user.uid,
    email,
    username,
    profileName,
    mobile: mobile || '',
    photoURL: finalPhotoUrl,
    role: role || 'admin',
    status: status || 'active',
    createdBy: currentUser.uid,
    createdAt: serverTimestamp(),
    passwordSet: true
  });

  await signOut(secondaryAuth);
  return { success: true, uid: userCredential.user.uid };
};

export const updateAdmin = async (adminId, updates) => {
  if (!adminId) {
    throw new Error('Missing admin id');
  }
  const safeUpdates = { ...updates };
  delete safeUpdates.email;
  delete safeUpdates.password;
  delete safeUpdates.uid;
  const { photoFile } = safeUpdates;
  delete safeUpdates.photoFile;

  if (photoFile) {
    const storage = getStorage(getFirebaseApp());
    const fileRef = storageRef(storage, `admin-avatars/${adminId}/${Date.now()}_${photoFile.name}`);
    await uploadBytes(fileRef, photoFile);
    safeUpdates.photoURL = await getDownloadURL(fileRef);
  }
  await updateDoc(doc(db, 'admins', adminId), {
    ...safeUpdates,
    updatedAt: serverTimestamp()
  });
  return { success: true };
};

export default {
  listAdmins,
  createAdmin,
  updateAdmin
};
