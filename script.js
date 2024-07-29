//Firebase Configurations:-------------------------

const firebaseConfig = {
  apiKey: "AIzaSyC_7ka7wfPdBYLB-RST-uYwTZZkfgLe7aQ",
  authDomain: "qrauth-5b0ac.firebaseapp.com",
  projectId: "qrauth-5b0ac",
  storageBucket: "qrauth-5b0ac.appspot.com",
  messagingSenderId: "849558497273",
  appId: "1:849558497273:web:124a6988dffd82d2063f28",
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const div_profile = document.querySelector(".div_profile");
const div_details = document.querySelector(".div_details");
const loading = document.querySelector(".loading");

//Sending Data:------------------------------------

async function clickbtn() {
  const subCollectionRef = db.collection().doc("Details");

  subCollectionRef
    .set({
      profile:
        "https://drive.google.com/file/d/1OnNuldwCZpT5RcFue5IOWRjVLKCffFNl/view?usp=drive_link",
      aadharcard: "abc",
      pancard: "qws",
    })
    .then(() => {
      console.log("Success");
    })
    .catch((error) => {
      console.log("Error", error);
    });
}

//Testing--------------------------------------------

function addField() {
  const container = document.getElementById("fieldsContainer");
  const fieldCount = container.children.length;

  const fieldDiv = document.createElement("div");
  fieldDiv.innerHTML = `
        <input type="text" placeholder="Document Type" id="docType${fieldCount}" />
        <input type="file" id="file${fieldCount}" />
    `;
  container.appendChild(fieldDiv);
}

//Getting Data:---------------------------------------
async function getting_data() {
  const clockNumber = document.querySelector(
    ".clocknumber_text_get_class"
  ).value;
  loading.innerHTML = "Loading.....";
  loading.style.display = "block";
  div_details.innerHTML = "";
  div_profile.innerHTML = "";
  const profile_card = document.querySelector(".profile-card");
  
  try {
    const result = await db.collection(clockNumber).doc("Details").get();
    
    if (result.exists) {
      const data = result.data();
      const entries = Object.entries(data).sort(); // Get an array of [key, value] pairs
      let userprofile = "";

      // Clear previous profile card content
      profile_card.innerHTML = "";

      for (let i = 0; i < entries.length; i++) {
        const [key, value] = entries[i];

        if (key === "profile") {
          userprofile = extractFileId(value);
        } else {
          profile_card.innerHTML += `
              <div class="profile-field">
                <p><b class="Feild_value_class">${key}:</b> <a href="${value}" target="_blank">Download</a></p>
                <button class="btn btn-delete" onclick="deleteField('${key}')">Delete</button>
              </div>`;
        }
      }

      if (userprofile) {
        profile_card.innerHTML = `
          <img src="https://drive.google.com/thumbnail?id=${userprofile}" alt="Profile Image" id="profile-pic">
          <h2 id="name">${clockNumber}</h2>
            ${profile_card.innerHTML}`; // Insert the image at the top of the profile card
      }

      // Display the profile card
      profile_card.style.display = "block";
      updateDataBtn.style.display = "block";
      updateDataBtnf.style.display = "block";
    } else {
      console.log("Document does not exist");
      alert("This clock number user not exist");
      updateDataBtn.style.display = "none";
      updateDataBtnf.style.display = "none";
    }
  } catch (error) {
    console.log("Error", error);
    alert("Error", error);
    updateDataBtn.style.display = "none";
    updateDataBtnf.style.display = "none";
  } finally {
    loading.style.display = "none";
  }
}

// Deleting a feild:--------------------------------

async function deleteField(fieldName) {
  const clockNumber = document.querySelector(
    ".clocknumber_text_get_class"
  ).value;
  const docRef = db.collection(clockNumber).doc("Details");

  try {
    await docRef.update({
      [fieldName]: firebase.firestore.FieldValue.delete(),
    });
    console.log(`${fieldName} successfully deleted!`);
    alert(`${fieldName} successfully deleted!`);
    // Refresh data after deletion
    getting_data();
  } catch (error) {
    console.error("Error deleting field: ", error);
    alert("Error deleting field: ", error);
  }
}

function extractFileId(url) {
  const regex = /[-\w]{25,}/;
  const match = url.match(regex);
  return match ? match[0] : null;
}

// Function to add dynamic fields
function addUpdateField() {
  const container = document.getElementById("fieldsContainer");
  const fieldCount = container.children.length;

  const fieldDiv = document.createElement("div");
  fieldDiv.innerHTML = ` <div class="d-flex align-items-center">
                   


                    

  <select name="Feild Name" id="docType${fieldCount}">
  <option value="Choose ">Choose</option>
  <option value="Aadhar Card">Aadhar Card</option>
  <option value="Pan Card">Pan Card</option>
  <option value="Bio Data">Bio Data</option>
  <option value="Id Card">Id Card</option>
  <option value="License">License</option>
</select>

                    <input type="file" id="file${fieldCount}" class="form-control me-2" />
                    <button class="remove-btn" onclick="removeField(this)">Remove</button>
                </div>`;
  container.appendChild(fieldDiv);
}
function removeField(button) {
  const fieldDiv = button.parentElement.parentElement;
  fieldDiv.remove();
}

let tokenClient;
let accessToken;

// Function to initialize Google Drive API client
function initClient() {
  return new Promise((resolve, reject) => {
    tokenClient = google.accounts.oauth2.initTokenClient({
      client_id:
        "389074169622-1flijncf2phnpcf7somgmjejt272eubo.apps.googleusercontent.com", // Replace with your actual client ID
      scope: "https://www.googleapis.com/auth/drive.file",
      callback: (tokenResponse) => {
        accessToken = tokenResponse.access_token;
        resolve();
      },
      error_callback: (error) => {
        console.error("Error during token request:", error);
        reject(error);
      },
    });
    tokenClient.requestAccessToken();
  });
}

// Function to upload a file to Google Drive
async function uploadFileToDrive(file) {
  return new Promise((resolve, reject) => {
    const metadata = {
      name: file.name,
      mimeType: file.type,
      parents: ['1m5L7WQVE5CotM_W0GzWZBnDL8vpPr02R']

    };

    const form = new FormData();
    form.append(
      "metadata",
      new Blob([JSON.stringify(metadata)], { type: "application/json" })
    );
    form.append("file", file);

    const xhr = new XMLHttpRequest();
    xhr.open(
      "POST",
      "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart"
    );
    xhr.setRequestHeader("Authorization", "Bearer " + accessToken);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentComplete = (event.loaded / event.total) * 100;
        console.log(`Upload progress: ${percentComplete.toFixed(2)}%`);
        let btn_custom_u = document.querySelector(".btn-custom-u")
        btn_custom_u.innerHTML=(`Upload progress: ${percentComplete.toFixed(2)}%`);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const data = JSON.parse(xhr.responseText);
        const fileUrl = `https://drive.google.com/uc?id=${data.id}`;
        resolve(fileUrl);
      } else {
        reject(new Error(`Failed to upload file: ${xhr.statusText}`));
      }
    };

    xhr.onerror = () => reject(new Error("Network error during file upload"));

    xhr.send(form);
  });
}

// Function to update data in Firestore
// Function to send data to Firestore
async function updateData() {
  try {
    // Initialize Google Drive API client and request token
    await initClient();

    const clockNumber = document.querySelector(
      ".clocknumber_text_get_class"
    ).value;
    const subCollectionRef = db.collection(clockNumber).doc("Details");

    const fields = {};

    // Upload other documents
    const container = document.getElementById("fieldsContainer");
    const promises = Array.from(container.children).map(
      async (fieldDiv, index) => {
        const docTypeInput = fieldDiv.querySelector(`#docType${index}`);
        const fileInput = fieldDiv.querySelector(`#file${index}`);
        if (docTypeInput && fileInput.files[0]) {
          const docType = docTypeInput.value;
          const file = fileInput.files[0];
          const fileUrl = await uploadFileToDrive(file);
          fields[docType] = fileUrl;
        }
      }
    );

    await Promise.all(promises);

    // Get existing data from Firestore
    const docSnapshot = await subCollectionRef.get();
    let existingData = docSnapshot.exists ? docSnapshot.data() : {};

    // Merge new fields with existing data
    const updatedData = { ...existingData, ...fields };

    // Save to Firestore
    await subCollectionRef.set(updatedData);
    console.log("Data updated successfully");
    alert("Data updated successfully");
    let btn_custom_u = document.querySelector(".btn-custom-u")
    btn_custom_u.innerHTML = "ADD UPDATE FIELD"
    getting_data();

  } catch (error) {
    console.error("Error updating data", error);
    alert("Error updating data", error);
    let btn_custom_u = document.querySelector(".btn-custom-u")
    btn_custom_u.innerHTML = "ADD UPDATE FIELD"
  }
}
