// Initialize Firebase
// Import the functions you need from the SDKs you need
import { initializeApp, firebase } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
  doc,
  setDoc,
  collection,
  getFirestore,
  serverTimestamp,
} from "firebase/firestore";

import { ref, uploadBytes, getDownloadURL, getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAT5pZt0ZbbpoZJ-76d3LQo9BH8ERt5rrI",
  authDomain: "radio-ffca1.firebaseapp.com",
  projectId: "radio-ffca1",
  storageBucket: "radio-ffca1.appspot.com",
  messagingSenderId: "659525009749",
  appId: "1:659525009749:web:a2ba24feb2a2e6b6e8efdc",
  measurementId: "G-VEMW9SD8X8",
};

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
console.log(firebase, "firebase here");

const db = getFirestore();

const storage = getStorage();

//const storageRef = ref(storage, "uploads/" + file.name);

//dom elements
const addAnnouncement = document.getElementById("addAnnouncement");
const addPresenter = document.getElementById("addPresenter");
const addShow = document.getElementById("addShow");

//dom elements forms
const announcementForm = document.getElementById("announcementForm");
const presenterForm = document.getElementById("presenterForm");
const showForm = document.getElementById("showForm");
//form submit buttons
const announcementSubmit = document.getElementById("announcementSubmit");
const presenterSubmit = document.getElementById("presenterSubmit");
const showSubmit = document.getElementById("showSubmit");

//loader
const progressLoader = document.getElementById("progress");

//util functions
function show(element) {
  element.removeAttribute("hidden");
  element.scrollTop = element.scrollHeight;
}

function hide(element) {
  element.setAttribute("hidden", "true");
}

//events
addAnnouncement.addEventListener("click", (e) => {
  e.preventDefault();
  show(announcementForm);
  //hide(presenterForm);
  hide(showForm);
});

// addPresenter.addEventListener("click", (e) => {
//   e.preventDefault();
//   show(presenterForm);
//   hide(announcementForm);
//   hide(showForm);
// });

addShow.addEventListener("click", (e) => {
  e.preventDefault();
  show(showForm);
  hide(announcementForm);
  //hide(presenterForm);
});

// For Firebase JS SDK v7.20.0 and later, measurementId is optional

async function sendAnnouncement({ title, body }) {
  const data = { title, body };
  await sendData({ collectionName: "announcements", data });
}

async function sendPresenter({ name, bio, image }) {
  const imageUrl = await uploadFile(progressLoader, image);
  const data = { name, bio, imageUrl };
  await sendData({ collectionName: "presenters", data });
}

async function sendShow({ title, presenter, audioUrl }) {
  // const audioUrl = await uploadFile(progressLoader, audioFile);
  const data = { title, presenter, audioUrl };
  await sendData({ collectionName: "shows", data });
}

async function uploadFile(loaderElement, file) {
  try {
    console.log("inside uploadFile: ", { loaderElement, file });
    // Create a Firebase Storage reference
    const storage = getStorage();
    const storageRef = ref(storage, "uploads/" + file.name);
    console.log(storageRef);
    // Start the upload
    const uploadTask = uploadBytes(storageRef, file, { contentType: null });

    // Update the loader element with the upload progress
    const intervalId = setInterval(async () => {
      const snapshot = await uploadTask;
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      loaderElement.innerHTML = `Uploading: ${Math.round(progress)}%`;

      if (progress === 100) {
        clearInterval(intervalId);
      }
    }, 500);

    // Get the download URL for the uploaded file
    const downloadURL = await getDownloadURL(storageRef);

    // Update the loader element to indicate that the upload is complete
    loaderElement.innerHTML = "Upload complete!";

    // Return the download URL
    return downloadURL;
  } catch (error) {
    console.error(`Error uploading file: ${error}`);
    throw error;
  }
}

//firebase helper fns

async function addDataToDocRef(docRef, data) {
  try {
    await setDoc(doc(docRef), {
      ...data,
      timestamp: serverTimestamp(), // Add a timestamp field with the server time
    });
    console.log(`Data added to Firestore with ID: ${docRef.id}`);
  } catch (error) {
    console.error(`Error adding data to Firestore: ${error}`);
  }
}

// Function to add data to a Firestore collection

async function sendData({ collectionName, documentId = null, data }) {
  try {
    console.log("inside sendData: ", { collectionName, documentId, data });
    // Get a reference to the Firestore collection
    console.log({ firebase });
    const collectionRef = collection(db, collectionName);
    console.log({ collectionRef });
    // If document ID is provided, get a reference to the document
    const docRef = documentId
      ? doc(collectionRef, documentId)
      : doc(collectionRef);

    // Add data to the Firestore document reference
    await setDoc(docRef, {
      ...data,
      timestamp: serverTimestamp(),
    });
    console.log(`Data added to Firestore with ID: ${docRef.id}`);
  } catch (error) {
    console.error(`Error sending data to Firestore: ${error}`);
  }
}

//events
announcementSubmit.addEventListener("click", (e) => {
  if (!announcementForm.checkValidity()) return;

  e.preventDefault();
  const title = document.getElementById("announcementTitle").value;
  const body = document.getElementById("announcementBody").value;
  sendAnnouncement({ title, body });
});

presenterSubmit.addEventListener("click", (e) => {
  console.log(presenterForm);
  if (!presenterForm.querySelector("form").checkValidity()) return;

  e.preventDefault();
  alert("presenter submit");
  const name = document.getElementById("presenterName").value;
  const bio = document.getElementById("presenterBio").value;
  const image = document.getElementById("presenterPicture").files[0];
  sendPresenter({ name, bio, image });
});

showSubmit.addEventListener("click", (e) => {
  //prevent invalid form submission
  if (!showForm.querySelector("form").checkValidity()) return;
  e.preventDefault();
  const title = document.getElementById("showTitle").value;
  const presenter = document.getElementById("showPresenter").value;
  const audioUrl = document.getElementById("showAudio").value;
  // const audioFile = document.getElementById("showAudio").files[0];
  sendShow({ title, presenter, audioUrl });
});
