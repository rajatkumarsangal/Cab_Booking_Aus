const ADMIN_SESSION_KEY = "wizzCabsAdminLoggedIn";
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "admin123";
const page = document.body.dataset.adminPage || "dashboard";
const config = window.WizzCabsConfig.load();
let vehicleFolderHandle = null;

function isLoggedIn() {
  return window.sessionStorage.getItem(ADMIN_SESSION_KEY) === "true";
}

function requireLogin() {
  if (page !== "login" && !isLoggedIn()) {
    window.location.href = "login.html";
    return false;
  }

  return true;
}

function bindLogout() {
  document.querySelectorAll("[data-logout]").forEach((button) => {
    button.addEventListener("click", () => {
      window.sessionStorage.removeItem(ADMIN_SESSION_KEY);
      window.location.href = "login.html";
    });
  });
}

function adminAssetPath(path) {
  if (!path) {
    return "";
  }

  if (/^(https?:|data:|blob:)/i.test(path)) {
    return path;
  }

  return path.startsWith("../") ? path : `../${path}`;
}

function slugify(value) {
  return String(value || "vehicle")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "vehicle";
}

function getFileExtension(file) {
  const match = file.name.match(/\.[a-z0-9]+$/i);
  return match ? match[0].toLowerCase() : ".png";
}

function showStatus(message) {
  const saveStatus = document.getElementById("save-status");
  if (saveStatus) {
    saveStatus.textContent = message;
  }
}

function bindLoginPage() {
  const form = document.getElementById("admin-login-form");
  const username = document.getElementById("admin-username");
  const password = document.getElementById("admin-password");
  const message = document.getElementById("login-message");

  if (isLoggedIn()) {
    window.location.href = "index.html";
    return;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (username.value.trim() === ADMIN_USERNAME && password.value === ADMIN_PASSWORD) {
      window.sessionStorage.setItem(ADMIN_SESSION_KEY, "true");
      window.location.href = "index.html";
      return;
    }

    message.hidden = false;
    message.textContent = "Invalid username or password.";
  });
}

function bindBrandPage() {
  const siteName = document.getElementById("site-name");
  const logoPath = document.getElementById("logo-path");
  const footerDescription = document.getElementById("footer-description");
  const footerBottom = document.getElementById("footer-bottom");
  const logoPreview = document.getElementById("logo-preview");

  function readBrand() {
    config.brand.siteName = siteName.value.trim() || "Wizz Cabs";
    config.brand.logo = logoPath.value.trim() || "assets/logo.png";
    config.brand.footerDescription = footerDescription.value.trim();
    config.brand.footerBottom = footerBottom.value.trim();
    logoPreview.src = adminAssetPath(config.brand.logo);
  }

  siteName.value = config.brand.siteName;
  logoPath.value = config.brand.logo;
  footerDescription.value = config.brand.footerDescription;
  footerBottom.value = config.brand.footerBottom;
  readBrand();

  [siteName, logoPath, footerDescription, footerBottom].forEach((field) => {
    field.addEventListener("input", readBrand);
  });

  document.getElementById("save-brand").addEventListener("click", () => {
    readBrand();
    window.WizzCabsConfig.save(config);
    showStatus("Saved brand settings. Refresh the website to see the update.");
  });
}

function bindFarePage() {
  const fixedAdjustment = document.getElementById("fixed-adjustment");
  const estimateAdjustment = document.getElementById("estimate-adjustment");
  const scheduledSurcharge = document.getElementById("scheduled-surcharge");
  const minimumFare = document.getElementById("minimum-fare");
  const farePreview = document.getElementById("fare-preview");

  function readFare() {
    config.fare.fixedFareAdjustment = Number(fixedAdjustment.value) || 0;
    config.fare.estimateFareAdjustment = Number(estimateAdjustment.value) || 0;
    config.fare.scheduledSurcharge = Number(scheduledSurcharge.value) || 0;
    config.fare.minimumFare = Number(minimumFare.value) || 0;

    const vehicle = config.vehicles.find((item) => item.active) || config.vehicles[0];
    const rawFare = vehicle ? vehicle.base + (12 * vehicle.rate) + config.fare.fixedFareAdjustment : 0;
    const fare = Math.max(config.fare.minimumFare, rawFare);
    farePreview.textContent = new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
      maximumFractionDigits: 0
    }).format(fare);
  }

  fixedAdjustment.value = config.fare.fixedFareAdjustment;
  estimateAdjustment.value = config.fare.estimateFareAdjustment;
  scheduledSurcharge.value = config.fare.scheduledSurcharge;
  minimumFare.value = config.fare.minimumFare;
  readFare();

  [fixedAdjustment, estimateAdjustment, scheduledSurcharge, minimumFare].forEach((field) => {
    field.addEventListener("input", readFare);
  });

  document.getElementById("save-fare").addEventListener("click", () => {
    readFare();
    window.WizzCabsConfig.save(config);
    showStatus("Saved fare settings. Refresh the website to see the update.");
  });
}

function renderVehicleCard(vehicle) {
  const article = document.createElement("article");
  article.className = "vehicle-card";
  article.innerHTML = `
    <img class="vehicle-image" src="${adminAssetPath(vehicle.image)}" alt="">
    <div class="vehicle-fields">
      <label class="field">
        <span>ID</span>
        <input data-field="id" type="text" value="${vehicle.id || ""}">
      </label>
      <label class="field wide">
        <span>Name</span>
        <input data-field="label" type="text" value="${vehicle.label || ""}">
      </label>
      <label class="field wide">
        <span>Capacity / description</span>
        <input data-field="capacity" type="text" value="${vehicle.capacity || ""}">
      </label>
      <label class="field">
        <span>Base fare</span>
        <input data-field="base" type="number" step="0.1" value="${vehicle.base || 0}">
      </label>
      <label class="field">
        <span>Per km rate</span>
        <input data-field="rate" type="number" step="0.1" value="${vehicle.rate || 0}">
      </label>
      <label class="field">
        <span>ETA offset</span>
        <input data-field="etaOffset" type="number" step="1" value="${vehicle.etaOffset || 0}">
      </label>
      <label class="field wide">
        <span>Image path</span>
        <input data-field="image" type="text" value="${vehicle.image || ""}" placeholder="assets/vehicles/sedan.png">
      </label>
      <label class="field">
        <span>Fallback style</span>
        <input data-field="thumbClass" type="text" value="${vehicle.thumbClass || "taxi-thumb"}">
      </label>
      <label class="toggle-field">
        <input data-field="active" type="checkbox" ${vehicle.active !== false ? "checked" : ""}>
        <span>Active</span>
      </label>
    </div>
    <div class="card-actions">
      <input class="file-input" type="file" accept="image/*">
      <button class="ghost-button upload-button" type="button">Upload Image</button>
      <button class="danger-button remove-button" type="button">Remove</button>
    </div>
  `;

  const image = article.querySelector(".vehicle-image");
  const imageField = article.querySelector("[data-field='image']");
  const fileInput = article.querySelector(".file-input");

  imageField.addEventListener("input", () => {
    image.src = adminAssetPath(imageField.value);
  });

  article.querySelector(".upload-button").addEventListener("click", () => fileInput.click());
  article.querySelector(".remove-button").addEventListener("click", () => article.remove());

  fileInput.addEventListener("change", async () => {
    const file = fileInput.files && fileInput.files[0];
    if (!file) {
      return;
    }

    if (!vehicleFolderHandle) {
      showStatus("Choose assets/vehicles folder before uploading an image.");
      return;
    }

    const vehicleName = article.querySelector("[data-field='label']").value || file.name;
    const fileName = `${slugify(vehicleName)}-${Date.now()}${getFileExtension(file)}`;
    const fileHandle = await vehicleFolderHandle.getFileHandle(fileName, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(file);
    await writable.close();

    imageField.value = `assets/vehicles/${fileName}`;
    image.src = adminAssetPath(imageField.value);
    showStatus(`Saved ${fileName} into selected image folder.`);
  });

  return article;
}

function readVehicles() {
  const vehicleList = document.getElementById("vehicle-list");
  config.vehicles = Array.from(vehicleList.querySelectorAll(".vehicle-card")).map((card) => ({
    id: card.querySelector("[data-field='id']").value.trim() || slugify(card.querySelector("[data-field='label']").value),
    label: card.querySelector("[data-field='label']").value.trim() || "Vehicle",
    capacity: card.querySelector("[data-field='capacity']").value.trim(),
    base: Number(card.querySelector("[data-field='base']").value) || 0,
    rate: Number(card.querySelector("[data-field='rate']").value) || 0,
    etaOffset: Number(card.querySelector("[data-field='etaOffset']").value) || 0,
    image: card.querySelector("[data-field='image']").value.trim(),
    thumbClass: card.querySelector("[data-field='thumbClass']").value.trim() || "taxi-thumb",
    active: card.querySelector("[data-field='active']").checked
  }));
}

function bindVehiclesPage() {
  const vehicleList = document.getElementById("vehicle-list");
  const folderStatus = document.getElementById("folder-status");

  config.vehicles.forEach((vehicle) => {
    vehicleList.appendChild(renderVehicleCard(vehicle));
  });

  document.getElementById("choose-image-folder").addEventListener("click", async () => {
    if (!window.showDirectoryPicker) {
      folderStatus.textContent = "This browser does not support direct folder saving. Use Chrome or Edge on localhost.";
      return;
    }

    vehicleFolderHandle = await window.showDirectoryPicker({ mode: "readwrite" });
    folderStatus.textContent = `Selected folder: ${vehicleFolderHandle.name}`;
  });

  document.getElementById("add-vehicle").addEventListener("click", () => {
    vehicleList.appendChild(renderVehicleCard({
      id: `vehicle-${Date.now()}`,
      label: "New Vehicle",
      capacity: "1 - 4 passengers",
      base: 20,
      rate: 3,
      etaOffset: 3,
      image: "",
      thumbClass: "taxi-thumb",
      active: true
    }));
  });

  document.getElementById("save-vehicles").addEventListener("click", () => {
    readVehicles();
    window.WizzCabsConfig.save(config);
    showStatus("Saved vehicle settings. Refresh the website to see the update.");
  });
}

const canUseAdmin = requireLogin();
bindLogout();

if (page === "login") {
  bindLoginPage();
} else if (canUseAdmin && page === "brand") {
  bindBrandPage();
} else if (canUseAdmin && page === "fare") {
  bindFarePage();
} else if (canUseAdmin && page === "vehicles") {
  bindVehiclesPage();
}
