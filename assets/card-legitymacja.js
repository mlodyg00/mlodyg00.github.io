var confirmElement = document.querySelector(".confirm");

var time = document.getElementById("time");

if (localStorage.getItem("updateLegiit") == null) {
  localStorage.setItem("updateLegiit", "09.01.2026");
}

var date = new Date();

var updateText = document.querySelector(".bottom_update_value");
updateText.innerHTML = localStorage.getItem("updateLegiit");

var update = document.querySelector(".update");
update.addEventListener("click", () => {
  var newDate = date.toLocaleDateString("pl-PL", options);
  localStorage.setItem("updateLegiit", newDate);
  updateText.innerHTML = newDate;

  scroll(0, 0);
});

setClock();
function setClock() {
  date = new Date();
  time.innerHTML =
    "Czas: " +
    date.toLocaleTimeString("pl-PL", optionsTime) +
    " " +
    date.toLocaleDateString("pl-PL", options);
  delay(1000).then(() => {
    setClock();
  });
}

var unfold = document.querySelector(".info_holder");
if (unfold) {
  unfold.addEventListener("click", () => {
    if (unfold.classList.contains("unfolded")) {
      unfold.classList.remove("unfolded");
    } else {
      unfold.classList.add("unfolded");
    }
  });
}

var params = new URLSearchParams(window.location.search);

function loadReadyData(result) {
  Object.keys(result).forEach((key) => {
    result[key] = htmlEncode(result[key]);
  });

  const birthdayDate = new Date();

  birthdayDate.setFullYear(result["year"], result["month"] - 1, result["day"]);

  var sex = result["sex"];

  let day = birthdayDate.getDay();
  let month = birthdayDate.getMonth();
  let year = birthdayDate.getFullYear();

  setData("name", result["name"] ? result["name"].toUpperCase() : "");
  setData("surname", result["surname"] ? result["surname"].toUpperCase() : "");
  
  // Format date of birth
  day =
    birthdayDate.getDate() > 9
      ? birthdayDate.getDate()
      : "0" + birthdayDate.getDate();
  month =
    birthdayDate.getMonth() + 1 > 9
      ? birthdayDate.getMonth() + 1
      : "0" + (birthdayDate.getMonth() + 1);

  setData("birthday", day + "." + month + "." + birthdayDate.getFullYear());

  // Generate PESEL
  if (parseInt(year) >= 2000) {
    month = 20 + parseInt(month);
  }

  var later;

  if (sex === "m") {
    later = "0295";
  } else {
    later = "0382";
  }

  if (day < 10) {
    day = "0" + day;
  }

  if (month < 10) {
    month = "0" + month;
  }

  var pesel = year.toString().substring(2) + month + day + later + "7";
  setData("pesel", pesel);

  setData("legitymacjaNumber", result["legitymacjaNumber"] ? result["legitymacjaNumber"] : "");
  setData("legitymacjaNumberBox", result["legitymacjaNumber"] ? result["legitymacjaNumber"] : "");
  
  // Obsługuj daty wydania i wygaśnięcia
  setData("givenDate", result["legitymacjaGivenDate"] ? result["legitymacjaGivenDate"] : "");
  setData("givenDateBox", result["legitymacjaGivenDate"] ? result["legitymacjaGivenDate"] : "");
  
  setData("expiryDate", result["legitymacjaExpiryDate"] ? result["legitymacjaExpiryDate"] : "");
  setData("expiryDateBox", result["legitymacjaExpiryDate"] ? result["legitymacjaExpiryDate"] : "");
}

loadData();
async function loadData() {
  var db = await getDb();
  var data = await getData(db, "dataLegiit");

  if (data) {
    loadReadyData(data);
  }

  let result = Object.fromEntries(params);

  result["data"] = "dataLegiit";
  if (result !== data) {
    loadReadyData(result);
    saveData(db, result);
  }
}

loadImage();
async function loadImage() {
  var db = await getDb();
  var image = await getData(db, "imageLegiit");

  if (image) {
    setImage(image.image);
  }

  console.log(params.get("image"));
  if (params.get("image")) {
    // Bezpośrednio ustaw URL jako background, bez fetch (unika CORS)
    setImage(params.get("image"));

    // Zapisz w DB dla przyszłego użycia
    saveData(db, { image: params.get("image") });
  }
}

function setImage(imageLink) {
  document.querySelector(".id_own_image").style.backgroundImage =
    "url('" + imageLink + "')";
}

function setData(id, data) {
  try {
    document.getElementById(id).innerHTML = data;
  } catch (e) {
    console.error("Error setting data for id: " + id, e);
  }
}

async function getDb() {
  return new Promise((resolve, reject) => {
    let request = indexedDB.open("legitymacja", 1);

    request.onerror = () => {
      reject(request.error);
    };

    request.onsuccess = () => {
      let db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      let db = event.target.result;
      if (!db.objectStoreNames.contains("legitymacja")) {
        db.createObjectStore("legitymacja");
      }
    };
  });
}

async function getData(db, key) {
  return new Promise((resolve, reject) => {
    let transaction = db.transaction(["legitymacja"], "readonly");
    let store = transaction.objectStore("legitymacja");
    let request = store.get(key);

    request.onerror = () => {
      reject(request.error);
    };

    request.onsuccess = () => {
      resolve(request.result);
    };
  });
}

async function saveData(db, data) {
  return new Promise((resolve, reject) => {
    let transaction = db.transaction(["legitymacja"], "readwrite");
    let store = transaction.objectStore("legitymacja");
    let request = store.put(data, "dataLegiit");

    request.onerror = () => {
      reject(request.error);
    };

    request.onsuccess = () => {
      resolve(request.result);
    };
  });
}
