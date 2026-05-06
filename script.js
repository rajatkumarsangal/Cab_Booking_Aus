const state = {
  step: 2,
  tripMode: "now",
  fareMode: "fixed",
  vehicle: "next",
  payment: "",
  otpCode: "",
  otpPhone: "",
  otpVerified: false
};

const siteAdminConfig = window.WizzCabsConfig ? window.WizzCabsConfig.load() : null;
const fareSettings = siteAdminConfig ? siteAdminConfig.fare : {
  fixedFareAdjustment: 6,
  estimateFareAdjustment: -3,
  scheduledSurcharge: 4,
  minimumFare: 0
};
const configuredVehicles = siteAdminConfig ? siteAdminConfig.vehicles : [];
const activeVehicles = configuredVehicles.filter((vehicle) => vehicle.active !== false);
if (!activeVehicles.length && configuredVehicles.length) {
  activeVehicles.push(configuredVehicles[0]);
}
const vehicleData = activeVehicles.reduce((vehicles, vehicle) => {
  vehicles[vehicle.id] = vehicle;
  return vehicles;
}, {});
const defaultVehicleId = activeVehicles[0] ? activeVehicles[0].id : "next";
state.vehicle = defaultVehicleId;

const quickPickup = document.getElementById("quick-pickup");
const quickDestination = document.getElementById("quick-destination");
const quickDate = document.getElementById("quick-date");
const quickTime = document.getElementById("quick-time");
const heroSearch = document.getElementById("hero-search");
const heroError = document.getElementById("hero-error");
const detailPickup = document.getElementById("detail-pickup");
const detailDestination = document.getElementById("detail-destination");
const detailDate = document.getElementById("detail-date");
const detailTime = document.getElementById("detail-time");
const passengerName = document.getElementById("passenger-name");
const passengerPhone = document.getElementById("passenger-phone");
const otpCode = document.getElementById("otp-code");
const sendOtp = document.getElementById("send-otp");
const verifyOtp = document.getElementById("verify-otp");
const otpStatus = document.getElementById("otp-status");
const pickupNotes = document.getElementById("pickup-notes");
const schedulePanel = document.getElementById("schedule-panel");
const detailScheduleRow = document.getElementById("detail-schedule-row");
const fareModeBadge = document.getElementById("fare-mode-badge");
const quickError = document.getElementById("quick-error");
const detailError = document.getElementById("detail-error");
const summaryRouteTitle = document.getElementById("summary-route-title");
const summaryRouteCopy = document.getElementById("summary-route-copy");
const summaryDistance = document.getElementById("summary-distance");
const summaryDuration = document.getElementById("summary-duration");
const summaryFare = document.getElementById("summary-fare");
const summaryFareLabel = document.getElementById("summary-fare-label");
const summaryVehicle = document.getElementById("summary-vehicle");
const summaryTripTime = document.getElementById("summary-trip-time");
const summaryPayment = document.getElementById("summary-payment");
const confirmationReference = document.getElementById("confirmation-reference");
const confirmationPassenger = document.getElementById("confirmation-passenger");
const confirmationRoute = document.getElementById("confirmation-route");
const confirmationFare = document.getElementById("confirmation-fare");
const stepRoutePickup = document.getElementById("step-route-pickup");
const stepRouteDestination = document.getElementById("step-route-destination");
const bookingResults = document.getElementById("booking-results");
const bookingPopupClose = document.getElementById("booking-popup-close");
const sketchFormShell = document.querySelector(".sketch-form-shell");
const requestBooking = document.getElementById("request-booking");
const paymentMethod = document.getElementById("payment-method");
const driverNotesCount = document.getElementById("driver-notes-count");
const bookingConfirmation = document.getElementById("booking-confirmation");
const carsListToggle = document.getElementById("cars-list-toggle");
const carsList = document.getElementById("cars-list");

const progressPills = document.querySelectorAll("[data-progress-step]");
const stepPanels = document.querySelectorAll("[data-step-panel]");
const tripModeButtons = document.querySelectorAll("[data-trip-mode]");
const fareModeButtons = document.querySelectorAll("[data-fare-mode]");
let vehicleInputs = document.querySelectorAll('input[name="vehicle"]');
const paymentInputs = document.querySelectorAll('input[name="payment"]');
const googleMapFrame = document.getElementById("google-map-frame");
const googleMapStage = document.getElementById("google-map-stage");
const routeMapStatus = document.getElementById("route-map-status");
const placesStatus = document.getElementById("places-status");

const continueToDetails = document.getElementById("continue-to-details");
const backToRoute = document.getElementById("back-to-route");
const returnStepOne = document.getElementById("return-step-one");
const confirmBooking = document.getElementById("confirm-booking");
const bookAnother = document.getElementById("book-another");

const defaultMapSource = "https://maps.google.com/maps?q=Brisbane%20Australia&z=12&output=embed";
let googleMapsLoadPromise;
let googleMapsAuthFailed = false;
let rejectGoogleMapsLoad = null;
let latestTripMetrics = null;

window.gm_authFailure = () => {
  googleMapsAuthFailed = true;
  if (rejectGoogleMapsLoad) {
    rejectGoogleMapsLoad(new Error("Google Maps authentication failed. Check API key restrictions, billing, and enabled APIs."));
  }
};

function mountBookingResultsInline() {
  if (!bookingResults || !sketchFormShell || bookingResults.parentElement === sketchFormShell) {
    return;
  }

  bookingResults.removeAttribute("role");
  bookingResults.removeAttribute("aria-modal");
  sketchFormShell.appendChild(bookingResults);
}

function escapeHTML(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function renderVehicleOptions() {
  if (!carsList || !activeVehicles.length) {
    return;
  }

  carsList.innerHTML = activeVehicles.map((vehicle, index) => {
    const checked = vehicle.id === state.vehicle || (!state.vehicle && index === 0) ? " checked" : "";
    const thumb = vehicle.image
      ? `<span class="vehicle-thumb vehicle-thumb-image" aria-hidden="true"><img src="${escapeHTML(vehicle.image)}" alt=""></span>`
      : `<span class="vehicle-thumb ${escapeHTML(vehicle.thumbClass || "taxi-thumb")}" aria-hidden="true"><span></span></span>`;

    return `
      <label class="car-list-row">
        <input type="radio" name="vehicle" value="${escapeHTML(vehicle.id)}"${checked}>
        <span class="car-selected-bar" aria-hidden="true"></span>
        ${thumb}
        <span class="car-copy">
          <strong>${escapeHTML(vehicle.label)}</strong>
          <span>${escapeHTML(vehicle.capacity)}</span>
        </span>
        <span class="info-dot" aria-hidden="true">i</span>
        <span class="car-fare-copy">
          <strong>Fare Estimate</strong>
          <span>Dest required</span>
        </span>
      </label>
    `;
  }).join("");

  vehicleInputs = document.querySelectorAll('input[name="vehicle"]');
}

function getGoogleMapsConfig() {
  const baseConfig = window.ROUTEWAVE_GOOGLE_MAPS_CONFIG || {};
  return {
    apiKey: baseConfig.apiKey || "",
    libraries: Array.isArray(baseConfig.libraries) && baseConfig.libraries.length ? baseConfig.libraries : ["places"],
    region: baseConfig.region || "AU",
    country: baseConfig.country || "au",
    mapMode: baseConfig.mapMode || "driving",
    mapId: baseConfig.mapId || "",
    autoUseGoogleRouteSummary: baseConfig.autoUseGoogleRouteSummary !== false
  };
}

function getSelectedPlaceMeta(input) {
  return {
    lat: input ? input.dataset.placeLat || "" : "",
    lng: input ? input.dataset.placeLng || "" : "",
    placeId: input ? input.dataset.placeId || "" : ""
  };
}

function clearSelectedPlaceMeta(input) {
  if (!input) {
    return;
  }

  delete input.dataset.placeLat;
  delete input.dataset.placeLng;
  delete input.dataset.placeLabel;
  delete input.dataset.placeId;
}

function copySelectedPlaceMeta(source, target) {
  if (!source || !target) {
    return;
  }

  if (!source.dataset.placeLat || !source.dataset.placeLng) {
    clearSelectedPlaceMeta(target);
    return;
  }

  target.dataset.placeLat = source.dataset.placeLat;
  target.dataset.placeLng = source.dataset.placeLng;
  target.dataset.placeLabel = source.dataset.placeLabel || source.value.trim();
  target.dataset.placeId = source.dataset.placeId || "";
}

function storeSelectedPlaceMeta(input, place) {
  if (!input || !place || !place.geometry || !place.geometry.location) {
    clearSelectedPlaceMeta(input);
    return;
  }

  const lat = typeof place.geometry.location.lat === "function"
    ? place.geometry.location.lat()
    : place.geometry.location.lat;
  const lng = typeof place.geometry.location.lng === "function"
    ? place.geometry.location.lng()
    : place.geometry.location.lng;

  input.dataset.placeLat = String(lat);
  input.dataset.placeLng = String(lng);
  input.dataset.placeLabel = place.formatted_address || place.name || input.value.trim();
  input.dataset.placeId = place.place_id || "";
}

function getMapsEmbedLocation(meta, fallbackLabel) {
  if (meta && meta.placeId) {
    return `place_id:${meta.placeId}`;
  }

  if (meta && meta.lat && meta.lng) {
    return `${meta.lat},${meta.lng}`;
  }

  return fallbackLabel;
}

function loadGoogleMapsApi() {
  const config = getGoogleMapsConfig();

  if (window.google && window.google.maps && window.google.maps.places) {
    return Promise.resolve(window.google.maps);
  }

  if (!config.apiKey) {
    return Promise.reject(new Error("Missing Google Maps API key."));
  }

  if (googleMapsLoadPromise) {
    return googleMapsLoadPromise;
  }

  googleMapsLoadPromise = new Promise((resolve, reject) => {
    rejectGoogleMapsLoad = reject;

    const existingScript = document.querySelector('script[data-google-maps-loader="true"]');
    if (existingScript) {
      existingScript.addEventListener("load", () => {
        if (window.google && window.google.maps && window.google.maps.places) {
          resolve(window.google.maps);
          return;
        }

        reject(new Error("Google Maps Places library not available."));
      }, { once: true });
      existingScript.addEventListener("error", () => reject(new Error("Google Maps failed to load.")), { once: true });
      return;
    }

    const script = document.createElement("script");
    const callbackName = "__wizzCabsGoogleMapsReady";
    const timeoutId = window.setTimeout(() => {
      reject(new Error("Google Maps took too long to load. Check network, API key restrictions, and enabled APIs."));
    }, 12000);

    window[callbackName] = () => {
      window.clearTimeout(timeoutId);
      if (googleMapsAuthFailed) {
        reject(new Error("Google Maps authentication failed. Check API key restrictions, billing, and enabled APIs."));
        return;
      }

      if (window.google && window.google.maps && window.google.maps.places) {
        resolve(window.google.maps);
        return;
      }

      reject(new Error("Google Maps Places library not available."));
    };

    const params = new URLSearchParams({
      key: config.apiKey,
      libraries: config.libraries.join(","),
      region: config.region,
      v: "weekly",
      callback: callbackName,
      loading: "async"
    });

    script.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`;
    script.async = true;
    script.defer = true;
    script.dataset.googleMapsLoader = "true";
    script.onerror = () => {
      window.clearTimeout(timeoutId);
      reject(new Error("Google Maps failed to load."));
    };
    document.head.appendChild(script);
  });

  return googleMapsLoadPromise;
}

function attachPlacesAutocomplete(input, onPlaceSelect) {
  if (!input || !window.google || !window.google.maps || !window.google.maps.places) {
    return;
  }

  if (input.dataset.googlePlacesReady === "true") {
    return;
  }

  const config = getGoogleMapsConfig();
  const autocomplete = new window.google.maps.places.Autocomplete(input, {
    fields: ["formatted_address", "geometry", "name", "place_id"],
    componentRestrictions: config.country ? { country: config.country } : undefined
  });

  input.dataset.googlePlacesReady = "true";

  autocomplete.addListener("place_changed", () => {
    const place = autocomplete.getPlace();

    if (!place) {
      return;
    }

    input.value = place.formatted_address || place.name || input.value;
    storeSelectedPlaceMeta(input, place);
    if (typeof onPlaceSelect === "function") {
      onPlaceSelect(input, place);
    }
    showMessage(heroError, "");
    showMessage(quickError, "");
    calculateTrip();
    updateGoogleMapRoute();
  });

  input.addEventListener("input", () => {
    clearSelectedPlaceMeta(input);
  });
}

function initializeGoogleMapsAutocomplete() {
  showMessage(placesStatus, "");
  loadGoogleMapsApi()
    .then(() => {
      attachPlacesAutocomplete(quickPickup, () => {
        if (detailPickup) {
          detailPickup.value = quickPickup.value.trim();
          copySelectedPlaceMeta(quickPickup, detailPickup);
        }
      });
      attachPlacesAutocomplete(quickDestination, () => {
        if (detailDestination) {
          detailDestination.value = quickDestination.value.trim();
          copySelectedPlaceMeta(quickDestination, detailDestination);
        }
      });
      attachPlacesAutocomplete(detailPickup, () => {
        if (quickPickup) {
          quickPickup.value = detailPickup.value.trim();
          copySelectedPlaceMeta(detailPickup, quickPickup);
        }
      });
      attachPlacesAutocomplete(detailDestination, () => {
        if (quickDestination) {
          quickDestination.value = detailDestination.value.trim();
          copySelectedPlaceMeta(detailDestination, quickDestination);
        }
      });
      setText(routeMapStatus, "Google Places dropdown ready");
      showMessage(placesStatus, "");
    })
    .catch((error) => {
      const message = error && error.message ? error.message : "Google Places not configured yet.";
      setText(routeMapStatus, message);
      showMessage(placesStatus, message);
      if (window.console) {
        console.warn(message);
      }
    });
}

function buildFallbackTripMetrics(pickup, destination, vehicle) {
  let distance = Math.round((pickup.length * 0.55) + (destination.length * 0.45));
  distance = Math.max(6, Math.min(distance, 42));

  if (/airport/i.test(`${pickup} ${destination}`)) {
    distance += 5;
  }

  if (/maxi/i.test(state.vehicle)) {
    distance += 3;
  }

  let duration = Math.round(distance * 3.6 + vehicle.etaOffset);
  if (state.tripMode === "later") {
    duration += 4;
  }

  return {
    source: "fallback",
    distanceKm: distance,
    durationMin: duration
  };
}

function calculateFareFromMetrics(vehicle, metrics) {
  let fare = vehicle.base + (metrics.distanceKm * vehicle.rate);

  if (state.fareMode === "fixed") {
    fare += Number(fareSettings.fixedFareAdjustment) || 0;
  } else {
    fare += Number(fareSettings.estimateFareAdjustment) || 0;
  }

  if (state.tripMode === "later") {
    fare += Number(fareSettings.scheduledSurcharge) || 0;
  }

  return Math.round(Math.max(Number(fareSettings.minimumFare) || 0, fare));
}

function getRouteMetricsSource(pickup, destination, vehicle) {
  const pickupMeta = getSelectedPlaceMeta(quickPickup);
  const destinationMeta = getSelectedPlaceMeta(quickDestination);
  const config = getGoogleMapsConfig();

  if (
    config.autoUseGoogleRouteSummary &&
    config.apiKey &&
    pickupMeta.lat &&
    pickupMeta.lng &&
    destinationMeta.lat &&
    destinationMeta.lng
  ) {
    const directDistanceKm = getDistanceBetweenPoints(
      Number(pickupMeta.lat),
      Number(pickupMeta.lng),
      Number(destinationMeta.lat),
      Number(destinationMeta.lng)
    );
    const adjustedDistanceKm = Math.max(2, Math.round(directDistanceKm * 1.28));
    const adjustedDurationMin = Math.max(5, Math.round((adjustedDistanceKm / 28) * 60) + vehicle.etaOffset);

    return {
      source: "google-selected-place",
      distanceKm: adjustedDistanceKm,
      durationMin: adjustedDurationMin
    };
  }

  return buildFallbackTripMetrics(pickup, destination, vehicle);
}

function getDistanceBetweenPoints(lat1, lng1, lat2, lng2) {
  const toRadians = (degrees) => degrees * (Math.PI / 180);
  const earthRadiusKm = 6371;
  const deltaLat = toRadians(lat2 - lat1);
  const deltaLng = toRadians(lng2 - lng1);
  const startLat = toRadians(lat1);
  const endLat = toRadians(lat2);
  const haversine =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2) * Math.cos(startLat) * Math.cos(endLat);
  const arc = 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
  return earthRadiusKm * arc;
}

function renderTripSummary(pickup, destination, vehicle, metrics) {
  const fare = calculateFareFromMetrics(vehicle, metrics);

  setText(summaryRouteTitle, `${pickup.split(",")[0]} to ${destination.split(",")[0]}`);
  setText(summaryRouteCopy, `${pickup} to ${destination}`);
  setText(summaryDistance, `${metrics.distanceKm} km`);
  setText(summaryDuration, `${metrics.durationMin} min`);
  setText(summaryFare, formatCurrency(fare));
  setText(summaryVehicle, vehicle.label);
  setText(summaryTripTime, state.tripMode === "later" && detailDate && detailTime && detailDate.value && detailTime.value
    ? `${detailDate.value} at ${detailTime.value}`
    : "Book now");

  latestTripMetrics = {
    source: metrics.source,
    distance: metrics.distanceKm,
    duration: metrics.durationMin,
    fare
  };

  return latestTripMetrics;
}

function setDefaultSchedule() {
  const future = new Date(Date.now() + 90 * 60 * 1000);
  future.setMinutes(Math.ceil(future.getMinutes() / 15) * 15, 0, 0);
  const defaultDate = future.toISOString().slice(0, 10);

  if (detailDate) {
    detailDate.min = defaultDate;
    detailDate.value = defaultDate;
  }

  populateTimeOptions();

  const hours = String(future.getHours()).padStart(2, "0");
  const minutes = String(future.getMinutes()).padStart(2, "0");
  const defaultTime = `${hours}:${minutes}`;

  if (detailTime) {
    detailTime.value = defaultTime;
  }
}

function populateTimeOptions() {
  if (!detailTime) {
    return;
  }

  detailTime.innerHTML = '<option value="">Select time</option>';

  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const timeValue = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
      const timeLabel = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
      const option = document.createElement("option");
      option.value = timeValue;
      option.textContent = timeLabel;
      detailTime.appendChild(option);
    }
  }

  // Set default time to next 15-minute interval
  const now = new Date();
  now.setMinutes(Math.ceil(now.getMinutes() / 15) * 15, 0, 0);
  const defaultHours = String(now.getHours()).padStart(2, "0");
  const defaultMinutes = String(now.getMinutes()).padStart(2, "0");
  const defaultTime = `${defaultHours}:${defaultMinutes}`;
  detailTime.value = defaultTime;
}

function setStep(nextStep) {
  state.step = nextStep;

  stepPanels.forEach((panel) => {
    panel.classList.toggle("is-active", Number(panel.dataset.stepPanel) === nextStep);
  });

  progressPills.forEach((pill) => {
    const pillStep = Number(pill.dataset.progressStep);
    pill.classList.toggle("is-active", pillStep === nextStep);
    pill.classList.toggle("is-complete", pillStep < nextStep);
  });
}

function showMessage(element, message) {
  if (!element) {
    return;
  }

  element.hidden = !message;
  element.textContent = message || "";
}

function setText(element, value) {
  if (!element) {
    return;
  }

  element.textContent = value;
}

function setOtpStatus(message, type) {
  if (!otpStatus) {
    return;
  }

  otpStatus.textContent = message;
  otpStatus.dataset.status = type || "default";
}

function resetOtpVerification(message) {
  state.otpCode = "";
  state.otpPhone = "";
  state.otpVerified = false;

  if (otpCode) {
    otpCode.value = "";
  }

  setOtpStatus(message || "Verify the contact number before requesting the booking.", "default");
}

function getCleanPhone() {
  return passengerPhone ? passengerPhone.value.replace(/\D/g, "") : "";
}

function generateOtpCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function sendOtpCode() {
  const phoneDigits = getCleanPhone();

  if (!phoneDigits) {
    setOtpStatus("Enter a contact number before sending OTP.", "error");
    showMessage(detailError, "Please enter contact number.");
    return;
  }

  if (phoneDigits.length < 8) {
    setOtpStatus("Enter a valid contact number before sending OTP.", "error");
    showMessage(detailError, "Please enter a valid contact number.");
    return;
  }

  state.otpCode = generateOtpCode();
  state.otpPhone = phoneDigits;
  state.otpVerified = false;

  if (otpCode) {
    otpCode.value = "";
    otpCode.focus();
  }

  showMessage(detailError, "");
  setOtpStatus(`Demo OTP sent: ${state.otpCode}`, "sent");
}

function verifyOtpCode() {
  const enteredCode = otpCode ? otpCode.value.trim() : "";

  if (!state.otpCode) {
    setOtpStatus("Send OTP first.", "error");
    return false;
  }

  if (getCleanPhone() !== state.otpPhone) {
    resetOtpVerification("Contact number changed. Send OTP again.");
    return false;
  }

  if (enteredCode !== state.otpCode) {
    state.otpVerified = false;
    setOtpStatus("Incorrect OTP. Please check and try again.", "error");
    return false;
  }

  state.otpVerified = true;
  setOtpStatus("Contact number verified.", "verified");
  showMessage(detailError, "");
  return true;
}

function syncRouteToDetails() {
  if (detailPickup) {
    detailPickup.value = quickPickup.value.trim();
    copySelectedPlaceMeta(quickPickup, detailPickup);
  }

  if (detailDestination) {
    detailDestination.value = quickDestination.value.trim();
    copySelectedPlaceMeta(quickDestination, detailDestination);
  }

  if (quickDate && detailDate && quickDate.value) {
    detailDate.value = quickDate.value;
  }

  if (quickTime && detailTime && quickTime.value) {
    detailTime.value = quickTime.value;
  }
}

function syncRouteBackToQuick() {
  if (quickPickup && detailPickup) {
    quickPickup.value = detailPickup.value.trim();
    copySelectedPlaceMeta(detailPickup, quickPickup);
  }

  if (quickDestination && detailDestination) {
    quickDestination.value = detailDestination.value.trim();
    copySelectedPlaceMeta(detailDestination, quickDestination);
  }

  if (quickDate && detailDate) {
    quickDate.value = detailDate.value;
  }

  if (quickTime && detailTime) {
    quickTime.value = detailTime.value;
  }
}

function updateTripModeUI() {
  const isLater = state.tripMode === "later";

  tripModeButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.tripMode === state.tripMode);
  });

  if (schedulePanel) {
    schedulePanel.classList.toggle("is-hidden", !isLater);
  }

  if (detailScheduleRow) {
    detailScheduleRow.classList.toggle("is-hidden", !isLater);
  }

  setText(summaryTripTime, isLater && detailDate && detailTime && detailDate.value && detailTime.value
    ? `${detailDate.value} at ${detailTime.value}`
    : "Book now");
}

function updateFareModeUI() {
  fareModeButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.fareMode === state.fareMode);
  });

  const label = state.fareMode === "fixed" ? "Fixed Fare" : "Estimated Fare";

  setText(fareModeBadge, label);
  setText(summaryFareLabel, label);
}

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    maximumFractionDigits: 0
  }).format(amount);
}

function getRouteValues() {
  const pickup = (detailPickup ? detailPickup.value.trim() : "") || quickPickup.value.trim();
  const destination = (detailDestination ? detailDestination.value.trim() : "") || quickDestination.value.trim();
  return { pickup, destination };
}

function updateRouteBrief(pickup, destination) {
  if (stepRoutePickup) {
    stepRoutePickup.textContent = pickup || "Waiting for pickup";
  }

  if (stepRouteDestination) {
    stepRouteDestination.textContent = destination || "Waiting for destination";
  }
}

function calculateTrip() {
  const { pickup, destination } = getRouteValues();
  const vehicle = vehicleData[state.vehicle] || vehicleData[defaultVehicleId];
  updateRouteBrief(pickup, destination);

  if (!pickup || !destination) {
    setText(summaryRouteTitle, "Waiting for route");
    setText(summaryRouteCopy, "Add pickup and destination to calculate the preview.");
    setText(summaryDistance, "-- km");
    setText(summaryDuration, "-- min");
    setText(summaryFare, "$ --");
    setText(summaryVehicle, vehicle.label);
    latestTripMetrics = null;
    return {
      distance: 0,
      duration: 0,
      fare: 0
    };
  }

  const metrics = getRouteMetricsSource(pickup, destination, vehicle);
  return renderTripSummary(pickup, destination, vehicle, metrics);
}

function updatePaymentSummary() {
  const checked = document.querySelector('input[name="payment"]:checked');
  state.payment = paymentMethod ? paymentMethod.value : (checked ? checked.value : "");

  const labels = {
    "": "Not selected",
    card: "Card",
    cash: "Cash",
    account: "Business Account"
  };

  setText(summaryPayment, labels[state.payment] || "Not selected");
}

function updateVehicleSummary() {
  const selected = document.querySelector('input[name="vehicle"]:checked');
  state.vehicle = selected ? selected.value : defaultVehicleId;
  setText(summaryVehicle, (vehicleData[state.vehicle] || vehicleData[defaultVehicleId]).label);
}

function validateRouteFields(errorElement) {
  const pickup = quickPickup.value.trim();
  const destination = quickDestination.value.trim();

  if (!pickup || !destination) {
    showMessage(errorElement, "Please add both pickup and destination to continue.");
    return false;
  }

  showMessage(errorElement, "");
  return true;
}

function validateStepOne() {
  if (!validateRouteFields(quickError || heroError)) {
    return false;
  }

  if (state.tripMode === "later" && quickDate && quickTime && (!quickDate.value || !quickTime.value)) {
    showMessage(quickError || heroError, "Please choose a scheduled date and time for this ride.");
    return false;
  }

  showMessage(quickError || heroError, "");
  return true;
}

function validateStepTwo() {
  const { pickup, destination } = getRouteValues();

  if (!pickup || !destination) {
    showMessage(detailError, "Route details are incomplete. Please confirm pickup and destination.");
    return false;
  }

  if (state.tripMode === "later" && detailDate && detailTime && (!detailDate.value || !detailTime.value)) {
    showMessage(detailError, "Scheduled rides need both date and time before confirmation.");
    return false;
  }

  if (passengerName && !passengerName.value.trim()) {
    showMessage(detailError, "Please enter passenger name.");
    return false;
  }

  if (passengerPhone && !passengerPhone.value.trim()) {
    showMessage(detailError, "Please enter contact number.");
    return false;
  }

  if (passengerPhone && !state.otpVerified) {
    showMessage(detailError, "Please verify the contact number with OTP.");
    setOtpStatus(state.otpCode ? "Enter and verify the OTP before requesting the booking." : "Send OTP to verify the contact number.", "error");
    return false;
  }

  if (passengerPhone && state.otpVerified && getCleanPhone() !== state.otpPhone) {
    resetOtpVerification("Contact number changed. Send OTP again.");
    showMessage(detailError, "Please verify the updated contact number.");
    return false;
  }

  if (!state.payment) {
    showMessage(detailError, "Please select a payment method.");
    return false;
  }

  showMessage(detailError, "");
  return true;
}

function generateReference() {
  const stamp = Date.now().toString().slice(-6);
  return `RW-${stamp}`;
}

function updateGoogleMapRoute() {
  if (!googleMapFrame || !quickPickup || !quickDestination) {
    return;
  }

  const config = getGoogleMapsConfig();
  const pickup = quickPickup.value.trim();
  const destination = quickDestination.value.trim();
  const pickupMeta = getSelectedPlaceMeta(quickPickup);
  const destinationMeta = getSelectedPlaceMeta(quickDestination);

  if (!pickup || !destination) {
    googleMapFrame.src = defaultMapSource;
    if (googleMapStage) {
      googleMapStage.classList.remove("has-route");
    }
    setText(routeMapStatus, "Search to load Google map route");
    return;
  }

  if (config.apiKey) {
    const hasSelectedPlaces = Boolean(
      (pickupMeta.placeId || (pickupMeta.lat && pickupMeta.lng)) &&
      (destinationMeta.placeId || (destinationMeta.lat && destinationMeta.lng))
    );
    const params = new URLSearchParams({
      key: config.apiKey,
      origin: getMapsEmbedLocation(pickupMeta, pickup),
      destination: getMapsEmbedLocation(destinationMeta, destination),
      mode: config.mapMode,
      units: "metric",
      region: config.region
    });

    googleMapFrame.src = `https://www.google.com/maps/embed/v1/directions?${params.toString()}`;
    if (googleMapStage) {
      googleMapStage.classList.add("has-route");
    }
    setText(routeMapStatus, hasSelectedPlaces ? "Google route loaded from selected pickup and drop" : "Google route loaded");
    return;
  }

  const pickupQuery = encodeURIComponent(pickup);
  const destinationQuery = encodeURIComponent(destination);

  googleMapFrame.src = `https://maps.google.com/maps?saddr=${pickupQuery}&daddr=${destinationQuery}&output=embed`;
  if (googleMapStage) {
    googleMapStage.classList.add("has-route");
  }
  setText(routeMapStatus, "Google map route loaded");
}

function updateConfirmation() {
  const trip = calculateTrip();
  const { pickup, destination } = getRouteValues();

  setText(confirmationReference, generateReference());
  setText(confirmationPassenger, passengerName ? (passengerName.value.trim() || "Guest") : "Guest");
  setText(confirmationRoute, `${pickup.split(",")[0]} to ${destination.split(",")[0]}`);
  setText(confirmationFare, formatCurrency(trip.fare));
}

function revealBookingResults() {
  if (!bookingResults) {
    return;
  }

  bookingResults.hidden = false;
  bookingResults.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function closeBookingResults() {
  if (!bookingResults) {
    return;
  }

  bookingResults.hidden = true;
}

function updateDriverNotesCount() {
  if (!pickupNotes || !driverNotesCount) {
    return;
  }

  driverNotesCount.textContent = String(320 - pickupNotes.value.length);
}

function resetFlow() {
  state.step = 2;
  state.tripMode = "now";
  state.fareMode = "fixed";
  state.vehicle = defaultVehicleId;
  state.payment = "";
  state.otpCode = "";
  state.otpPhone = "";
  state.otpVerified = false;

  const bookingForm = document.getElementById("booking-form");
  if (bookingForm) {
    bookingForm.reset();
  }

  if (paymentMethod) {
    paymentMethod.value = "";
  }

  if (bookingConfirmation) {
    bookingConfirmation.hidden = true;
  }

  if (vehicleInputs[0]) {
    vehicleInputs[0].checked = true;
  }

  if (paymentInputs[0]) {
    paymentInputs[0].checked = true;
  }

  setDefaultSchedule();
  updateTripModeUI();
  updateFareModeUI();
  updateVehicleSummary();
  updatePaymentSummary();
  resetOtpVerification();
  showMessage(heroError, "");
  showMessage(quickError, "");
  showMessage(detailError, "");
  calculateTrip();
  updateDriverNotesCount();
  setStep(2);
}

mountBookingResultsInline();
renderVehicleOptions();

tripModeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    state.tripMode = button.dataset.tripMode;
    updateTripModeUI();
    calculateTrip();
  });
});

fareModeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    state.fareMode = button.dataset.fareMode;
    updateFareModeUI();
    calculateTrip();
  });
});

vehicleInputs.forEach((input) => {
  input.addEventListener("change", () => {
    updateVehicleSummary();
    calculateTrip();
  });
});

paymentInputs.forEach((input) => {
  input.addEventListener("change", updatePaymentSummary);
});

if (paymentMethod) {
  paymentMethod.addEventListener("change", updatePaymentSummary);
}

if (pickupNotes) {
  pickupNotes.addEventListener("input", updateDriverNotesCount);
}

if (sendOtp) {
  sendOtp.addEventListener("click", sendOtpCode);
}

if (verifyOtp) {
  verifyOtp.addEventListener("click", verifyOtpCode);
}

if (detailDate) {
  detailDate.addEventListener("change", () => {
    updateTripModeUI();
    calculateTrip();
  });
}

if (detailTime) {
  detailTime.addEventListener("change", () => {
    updateTripModeUI();
    calculateTrip();
  });
}

if (otpCode) {
  otpCode.addEventListener("input", () => {
    otpCode.value = otpCode.value.replace(/\D/g, "").slice(0, 6);
    if (!state.otpVerified && state.otpCode) {
      setOtpStatus("OTP sent. Enter the 6-digit code to verify.", "sent");
    }
  });
}

if (passengerPhone) {
  passengerPhone.addEventListener("input", () => {
    if (state.otpPhone && getCleanPhone() !== state.otpPhone) {
      resetOtpVerification("Contact number changed. Send OTP again.");
    }
  });
}

if (carsListToggle) {
  carsListToggle.addEventListener("click", () => {
    const carsListSection = carsListToggle.closest(".cars-list-section");
    const isCollapsed = carsListSection ? carsListSection.classList.toggle("is-collapsed") : false;
    carsListToggle.setAttribute("aria-expanded", String(!isCollapsed));
  });
}

if (bookingPopupClose) {
  bookingPopupClose.addEventListener("click", closeBookingResults);
}

[quickPickup, quickDestination, detailPickup, detailDestination, detailDate, detailTime].filter(Boolean).forEach((field) => {
  field.addEventListener("input", () => {
    if (field === quickPickup || field === quickDestination) {
      showMessage(heroError, "");
      showMessage(quickError, "");
    }

    calculateTrip();
  });

  field.addEventListener("change", calculateTrip);
});

heroSearch.addEventListener("click", () => {
  if (!validateRouteFields(heroError)) {
    updateGoogleMapRoute();
    return;
  }

  syncRouteToDetails();
  calculateTrip();
  updateGoogleMapRoute();
  setStep(2);
  revealBookingResults();
});

if (continueToDetails) {
  continueToDetails.addEventListener("click", () => {
    if (!validateStepOne()) {
      return;
    }

    syncRouteToDetails();
    updateTripModeUI();
    calculateTrip();
    setStep(2);
  });
}

if (backToRoute) {
  backToRoute.addEventListener("click", () => {
    syncRouteBackToQuick();
    document.getElementById("home").scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

if (returnStepOne) {
  returnStepOne.addEventListener("click", () => {
    syncRouteBackToQuick();
    document.getElementById("home").scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

if (confirmBooking) {
  confirmBooking.addEventListener("click", () => {
    if (!validateStepTwo()) {
      return;
    }

    syncRouteBackToQuick();
    updateConfirmation();
    setStep(3);
  });
}

if (requestBooking) {
  requestBooking.addEventListener("click", () => {
    updatePaymentSummary();

    if (!validateStepTwo()) {
      return;
    }

    updateConfirmation();

    if (bookingConfirmation) {
      bookingConfirmation.hidden = false;
    }
  });
}

progressPills.forEach((pill) => {
  pill.addEventListener("click", () => {
    const targetStep = Number(pill.dataset.progressStep);

    if (targetStep === 1) {
      syncRouteBackToQuick();
      setStep(1);
      return;
    }

    if (targetStep === 2 && validateStepOne()) {
      syncRouteToDetails();
      setStep(2);
      calculateTrip();
      return;
    }

    if (targetStep === 3 && state.step === 3) {
      setStep(3);
    }
  });
});

if (bookAnother) {
  bookAnother.addEventListener("click", resetFlow);
}

setDefaultSchedule();
updateTripModeUI();
updateFareModeUI();
updateVehicleSummary();
updatePaymentSummary();
calculateTrip();
updateDriverNotesCount();
updateGoogleMapRoute();
initializeGoogleMapsAutocomplete();
setStep(2);
