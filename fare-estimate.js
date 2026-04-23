const estimatePickup = document.getElementById("estimate-pickup");
const estimateDestination = document.getElementById("estimate-destination");
const estimateVehicle = document.getElementById("estimate-vehicle");
const estimateMode = document.getElementById("estimate-mode");
const estimateButton = document.getElementById("estimate-button");
const estimateError = document.getElementById("estimate-error");
const estimateFare = document.getElementById("estimate-fare");
const estimateRoute = document.getElementById("estimate-route");
const estimateDistance = document.getElementById("estimate-distance");
const estimateDuration = document.getElementById("estimate-duration");
const estimateNote = document.getElementById("estimate-note");

const estimateVehicleData = {
  metro: { base: 16, rate: 2.6, durationBias: 2, label: "Metro" },
  executive: { base: 28, rate: 3.8, durationBias: 4, label: "Executive" },
  maxi: { base: 34, rate: 4.4, durationBias: 6, label: "Maxi" }
};

function setEstimateMessage(message) {
  estimateError.hidden = !message;
  estimateError.textContent = message || "";
}

function formatEstimateCurrency(amount) {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    maximumFractionDigits: 0
  }).format(amount);
}

function calculateEstimate() {
  const pickup = estimatePickup.value.trim();
  const destination = estimateDestination.value.trim();

  if (!pickup || !destination) {
    setEstimateMessage("Please enter both pickup and destination to calculate the fare.");
    return;
  }

  setEstimateMessage("");

  const vehicle = estimateVehicleData[estimateVehicle.value];
  let distance = Math.round((pickup.length * 0.48) + (destination.length * 0.52));
  distance = Math.max(5, Math.min(distance, 46));

  if (/airport/i.test(`${pickup} ${destination}`)) {
    distance += 5;
  }

  let duration = Math.round(distance * 3.5 + vehicle.durationBias);
  let fare = vehicle.base + (distance * vehicle.rate);

  if (estimateMode.value === "later") {
    fare += 4;
    duration += 4;
  }

  fare = Math.round(fare);

  estimateFare.textContent = formatEstimateCurrency(fare);
  estimateRoute.textContent = `${pickup.split(",")[0]} to ${destination.split(",")[0]}`;
  estimateDistance.textContent = `${distance} km`;
  estimateDuration.textContent = `${duration} min`;
  estimateNote.textContent = `${vehicle.label} ${estimateMode.value === "later" ? "scheduled" : "instant"} ride estimate.`;
}

estimateButton.addEventListener("click", calculateEstimate);
