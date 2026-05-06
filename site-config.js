(function () {
  const STORAGE_KEY = "wizzCabsAdminConfig";

  const defaultConfig = {
    brand: {
      siteName: "Wizz Cabs",
      logo: "assets/logo-clean.svg",
      footerDescription: "Modern taxi booking interface concept with a premium city-travel feel.",
      footerBottom: "City journeys feel better when the booking experience stays simple, calm, and easy to trust."
    },
    fare: {
      fixedFareAdjustment: 6,
      estimateFareAdjustment: -3,
      scheduledSurcharge: 4,
      minimumFare: 0
    },
    vehicles: [
      {
        id: "next",
        label: "Next Available",
        capacity: "1 - 4 passengers",
        base: 18,
        rate: 2.8,
        etaOffset: 2,
        image: "",
        thumbClass: "taxi-thumb",
        active: true
      },
      {
        id: "silver",
        label: "Silver Service",
        capacity: "1 - 4 passengers",
        base: 26,
        rate: 3.4,
        etaOffset: 4,
        image: "",
        thumbClass: "silver-thumb",
        active: true
      },
      {
        id: "sedan",
        label: "Sedan",
        capacity: "1 - 4 passengers",
        base: 20,
        rate: 2.9,
        etaOffset: 3,
        image: "",
        thumbClass: "taxi-thumb",
        active: true
      },
      {
        id: "wheelchair",
        label: "Wheelchair",
        capacity: "Accessible Taxi",
        base: 24,
        rate: 3.2,
        etaOffset: 5,
        image: "",
        thumbClass: "access-thumb",
        active: true
      },
      {
        id: "maxi",
        label: "MAXI TAXI",
        capacity: "1 - 11 passengers",
        base: 34,
        rate: 4.6,
        etaOffset: 6,
        image: "",
        thumbClass: "maxi-thumb",
        active: true
      }
    ]
  };

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function mergeConfig(saved) {
    const config = clone(defaultConfig);

    if (!saved || typeof saved !== "object") {
      return config;
    }

    config.brand = { ...config.brand, ...(saved.brand || {}) };
    if (["assets/logo.jpeg", "assets/logo.jpg", "assets/logo.png", "assets/logo-crisp.svg"].includes(config.brand.logo)) {
      config.brand.logo = defaultConfig.brand.logo;
    }
    config.fare = { ...config.fare, ...(saved.fare || {}) };

    if (Array.isArray(saved.vehicles) && saved.vehicles.length) {
      config.vehicles = saved.vehicles.map((vehicle, index) => ({
        id: vehicle.id || `vehicle-${index + 1}`,
        label: vehicle.label || "Vehicle",
        capacity: vehicle.capacity || "",
        base: Number(vehicle.base) || 0,
        rate: Number(vehicle.rate) || 0,
        etaOffset: Number(vehicle.etaOffset) || 0,
        image: vehicle.image || "",
        thumbClass: vehicle.thumbClass || "taxi-thumb",
        active: vehicle.active !== false
      }));
    }

    return config;
  }

  function load() {
    try {
      return mergeConfig(JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "null"));
    } catch (error) {
      return clone(defaultConfig);
    }
  }

  function save(config) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(mergeConfig(config)));
  }

  function reset() {
    window.localStorage.removeItem(STORAGE_KEY);
  }

  window.WizzCabsConfig = {
    STORAGE_KEY,
    defaults: clone(defaultConfig),
    load,
    save,
    reset
  };
})();
