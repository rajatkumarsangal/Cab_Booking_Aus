const state = {
  step: 2,
  tripMode: "now",
  fareMode: "fixed",
  vehicle: "metro",
  payment: "card"
};

const vehicleData = {
  metro: {
    label: "Metro",
    base: 18,
    rate: 2.8,
    etaOffset: 2
  },
  executive: {
    label: "Executive",
    base: 30,
    rate: 3.9,
    etaOffset: 4
  },
  maxi: {
    label: "Maxi",
    base: 34,
    rate: 4.6,
    etaOffset: 6
  }
};

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

const progressPills = document.querySelectorAll("[data-progress-step]");
const stepPanels = document.querySelectorAll("[data-step-panel]");
const tripModeButtons = document.querySelectorAll("[data-trip-mode]");
const fareModeButtons = document.querySelectorAll("[data-fare-mode]");
const vehicleInputs = document.querySelectorAll('input[name="vehicle"]');
const paymentInputs = document.querySelectorAll('input[name="payment"]');
const tagButtons = document.querySelectorAll("[data-preset]");
const mockMapStage = document.getElementById("mock-map-stage");
const pickupMarker = document.getElementById("pickup-marker");
const dropMarker = document.getElementById("drop-marker");
const pickupMapCard = document.getElementById("pickup-map-card");
const dropMapCard = document.getElementById("drop-map-card");
const pickupMapLabel = document.getElementById("pickup-map-label");
const dropMapLabel = document.getElementById("drop-map-label");
const routeMapStatus = document.getElementById("route-map-status");

const continueToDetails = document.getElementById("continue-to-details");
const backToRoute = document.getElementById("back-to-route");
const returnStepOne = document.getElementById("return-step-one");
const confirmBooking = document.getElementById("confirm-booking");
const bookAnother = document.getElementById("book-another");

const mockLocations = {
  "brisbane airport terminal": { x: 72, y: 26 },
  "riverside towers, brisbane": { x: 55, y: 52 },
  "harbour view hotel": { x: 37, y: 36 },
  "convention centre": { x: 44, y: 68 },
  "central business district": { x: 51, y: 42 },
  "north wharf offices": { x: 64, y: 61 },
  "city arena entrance": { x: 33, y: 54 },
  "parkside apartments": { x: 79, y: 70 },
  "south bank station": { x: 46, y: 58 },
  "queen street mall": { x: 58, y: 39 },
  "fortitude valley": { x: 69, y: 45 }
};

function setDefaultSchedule() {
  const future = new Date(Date.now() + 90 * 60 * 1000);
  future.setMinutes(Math.ceil(future.getMinutes() / 5) * 5, 0, 0);
  const defaultDate = future.toISOString().slice(0, 10);

  if (quickDate) {
    quickDate.value = defaultDate;
  }

  if (detailDate) {
    detailDate.value = defaultDate;
  }

  const hours = String(future.getHours()).padStart(2, "0");
  const minutes = String(future.getMinutes()).padStart(2, "0");
  const defaultTime = `${hours}:${minutes}`;

  if (quickTime) {
    quickTime.value = defaultTime;
  }

  if (detailTime) {
    detailTime.value = defaultTime;
  }
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

function syncRouteToDetails() {
  if (detailPickup) {
    detailPickup.value = quickPickup.value.trim();
  }

  if (detailDestination) {
    detailDestination.value = quickDestination.value.trim();
  }

  if (quickDate && detailDate && quickDate.value) {
    detailDate.value = quickDate.value;
  }

  if (quickTime && detailTime && quickTime.value) {
    detailTime.value = quickTime.value;
  }
}

function syncRouteBackToQuick() {
  if (quickPickup) {
    quickPickup.value = detailPickup.value.trim();
  }

  if (quickDestination) {
    quickDestination.value = detailDestination.value.trim();
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
  const vehicle = vehicleData[state.vehicle];
  updateRouteBrief(pickup, destination);

  if (!pickup || !destination) {
    setText(summaryRouteTitle, "Waiting for route");
    setText(summaryRouteCopy, "Add pickup and destination to calculate the preview.");
    setText(summaryDistance, "-- km");
    setText(summaryDuration, "-- min");
    setText(summaryFare, "$ --");
    setText(summaryVehicle, vehicle.label);
    return {
      distance: 0,
      duration: 0,
      fare: 0
    };
  }

  let distance = Math.round((pickup.length * 0.55) + (destination.length * 0.45));
  distance = Math.max(6, Math.min(distance, 42));

  if (/airport/i.test(`${pickup} ${destination}`)) {
    distance += 5;
  }

  if (state.vehicle === "maxi") {
    distance += 3;
  }

  let duration = Math.round(distance * 3.6 + vehicle.etaOffset);
  if (state.tripMode === "later") {
    duration += 4;
  }

  let fare = vehicle.base + (distance * vehicle.rate);
  if (state.fareMode === "fixed") {
    fare += 6;
  } else {
    fare -= 3;
  }

  if (state.tripMode === "later") {
    fare += 4;
  }

  fare = Math.round(fare);

  setText(summaryRouteTitle, `${pickup.split(",")[0]} to ${destination.split(",")[0]}`);
  setText(summaryRouteCopy, `${pickup} to ${destination}`);
  setText(summaryDistance, `${distance} km`);
  setText(summaryDuration, `${duration} min`);
  setText(summaryFare, formatCurrency(fare));
  setText(summaryVehicle, vehicle.label);
  setText(summaryTripTime, state.tripMode === "later" && detailDate && detailTime && detailDate.value && detailTime.value
    ? `${detailDate.value} at ${detailTime.value}`
    : "Book now");

  return { distance, duration, fare };
}

function updatePaymentSummary() {
  const checked = document.querySelector('input[name="payment"]:checked');
  state.payment = checked ? checked.value : "card";

  const labels = {
    card: "Card",
    cash: "Cash",
    account: "Business Account"
  };

  setText(summaryPayment, labels[state.payment]);
}

function updateVehicleSummary() {
  const selected = document.querySelector('input[name="vehicle"]:checked');
  state.vehicle = selected ? selected.value : "metro";
  setText(summaryVehicle, vehicleData[state.vehicle].label);
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

  showMessage(detailError, "");
  return true;
}

function generateReference() {
  const stamp = Date.now().toString().slice(-6);
  return `RW-${stamp}`;
}

function getMockLocationPoint(value, fallbackIndex) {
  const key = value.trim().toLowerCase();
  if (mockLocations[key]) {
    return mockLocations[key];
  }

  const seed = key.split("").reduce((total, char) => total + char.charCodeAt(0), 0);
  return {
    x: 26 + ((seed + fallbackIndex * 17) % 58),
    y: 24 + ((seed + fallbackIndex * 23) % 54)
  };
}

function positionMapElement(element, point) {
  if (!element) {
    return;
  }

  element.style.left = `${point.x}%`;
  element.style.top = `${point.y}%`;
}

function highlightMockRoute() {
  if (!mockMapStage || !quickPickup || !quickDestination) {
    return;
  }

  const pickup = quickPickup.value.trim();
  const destination = quickDestination.value.trim();

  if (!pickup || !destination) {
    mockMapStage.classList.remove("has-route");
    setText(pickupMapLabel, "Choose pickup");
    setText(dropMapLabel, "Choose drop");
    setText(routeMapStatus, "Search to highlight route");
    return;
  }

  const pickupPoint = getMockLocationPoint(pickup, 1);
  const dropPoint = getMockLocationPoint(destination, 2);

  positionMapElement(pickupMarker, pickupPoint);
  positionMapElement(dropMarker, dropPoint);
  positionMapElement(pickupMapCard, pickupPoint);
  positionMapElement(dropMapCard, dropPoint);

  setText(pickupMapLabel, pickup.split(",")[0]);
  setText(dropMapLabel, destination.split(",")[0]);
  setText(routeMapStatus, "Pickup and drop highlighted");
  mockMapStage.classList.add("has-route");
}

function updateConfirmation() {
  const trip = calculateTrip();
  const { pickup, destination } = getRouteValues();

  confirmationReference.textContent = generateReference();
  confirmationPassenger.textContent = passengerName ? (passengerName.value.trim() || "Guest") : "Guest";
  confirmationRoute.textContent = `${pickup.split(",")[0]} to ${destination.split(",")[0]}`;
  confirmationFare.textContent = formatCurrency(trip.fare);
}

function resetFlow() {
  state.step = 2;
  state.tripMode = "now";
  state.fareMode = "fixed";
  state.vehicle = "metro";
  state.payment = "card";

  document.getElementById("booking-form").reset();
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
  showMessage(heroError, "");
  showMessage(quickError, "");
  showMessage(detailError, "");
  calculateTrip();
  setStep(2);
}

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

tagButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const preset = button.dataset.preset;

    if (preset === "Airport") {
      quickPickup.value = "Brisbane Airport Terminal";
      quickDestination.value = "Riverside Towers, Brisbane";
    } else if (preset === "Hotel") {
      quickPickup.value = "Harbour View Hotel";
      quickDestination.value = "Convention Centre";
    } else if (preset === "Corporate") {
      quickPickup.value = "Central Business District";
      quickDestination.value = "North Wharf Offices";
    } else {
      quickPickup.value = "City Arena Entrance";
      quickDestination.value = "Parkside Apartments";
    }

    showMessage(heroError, "");
    showMessage(quickError, "");
    calculateTrip();
  });
});

heroSearch.addEventListener("click", () => {
  if (!validateRouteFields(heroError)) {
    highlightMockRoute();
    return;
  }

  syncRouteToDetails();
  calculateTrip();
  highlightMockRoute();
  setStep(2);

  const bookingStudio = document.getElementById("booking-studio");
  if (bookingStudio) {
    bookingStudio.scrollIntoView({ behavior: "smooth", block: "start" });
  }
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
highlightMockRoute();
setStep(2);
