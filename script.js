let weather = {
  apiKey: "29bd84e33289f196e453fde9559b7bbd",
  fetchWeather: function (cityOrCoords) {
    let query = typeof cityOrCoords === "string"
      ? "q=" + cityOrCoords
      : "lat=" + cityOrCoords.lat + "&lon=" + cityOrCoords.lon;

    fetch(
      "https://api.openweathermap.org/data/2.5/forecast?" +
      query +
      "&units=metric&appid=" + this.apiKey
    )
      .then((response) => {
        if (!response.ok) {
          alert("No weather found.");
          throw new Error("No weather found.");
        }
        return response.json();
      })
      .then((data) => this.displayWeather(data));
  },
  displayWeather: function (data) {
    const { name } = data.city;
    const { icon, description } = data.list[0].weather[0];
    const { temp, feels_like, humidity, temp_min, temp_max } = data.list[0].main;
    const { speed } = data.list[0].wind;
    const datetime = data.list[0].dt_txt;

    const selectedUnit = ttt;

    const convertTemp = (temp, unit) => {
      if (unit === "F") {
        return ((temp * 9) / 5 + 32).toFixed(2);
      } else if (unit === "K") {
        return (temp + 273.15).toFixed(2);
      } else {
        return temp.toFixed(2);
      }
    };

    document.querySelector(".city").innerText = "Weather in " + name;
    document.querySelector(".icon").src =
      "https://openweathermap.org/img/wn/" + icon + ".png";
    document.querySelector(".description").innerText = description;
    document.querySelector(".dt").innerText = "Last updated: " + datetime;
    document.querySelector(".temp").innerText =
      convertTemp(temp, selectedUnit) + " °" + selectedUnit;
    document.querySelector(".temp-feels-like").innerText =
      "Feels like: " + convertTemp(feels_like, selectedUnit) + " °" + selectedUnit;
    document.querySelector(".temp-avg").innerText =
      "Avg Temp: " + convertTemp((temp_min + temp_max) / 2, selectedUnit) + " °" + selectedUnit;
    document.querySelector(".temp-min").innerText =
      "Min Temp: " + convertTemp(temp_min, selectedUnit) + " °" + selectedUnit;
    document.querySelector(".temp-max").innerText =
      "Max Temp: " + convertTemp(temp_max, selectedUnit) + " °" + selectedUnit;
    document.querySelector(".humidity").innerText = "Humidity: " + humidity + "%";
    document.querySelector(".wind").innerText = "Wind speed: " + speed + " km/h";
    document.querySelector(".weather").classList.remove("loading");

    for (let i = 1; i <= 5; i++) {
      const iconElem = document.querySelector(`.icon${i}`);
      const tempElem = document.querySelector(`.temp${i}`);
      const dtElem = document.querySelector(`.dt${i}`);
      iconElem.src =
        "https://openweathermap.org/img/wn/" + data.list[i * 6].weather[0].icon + ".png";
      tempElem.innerText =
        convertTemp(data.list[i * 6].main.temp, selectedUnit) + " °" + selectedUnit;
      dtElem.innerText = data.list[i * 6].dt_txt;
    }

    this.checkAlertThreshold(temp);
    this.update24HourSummary(data);
  },
  update24HourSummary: function (data) {
    let totalTemp = 0;
    let totalHumidity = 0;
    const intervals = 8;

    for (let i = 0; i < intervals; i++) {
      totalTemp += data.list[i].main.temp;
      totalHumidity += data.list[i].main.humidity;
    }

    const avgTemp = (totalTemp / intervals).toFixed(2);
    const avgHumidity = (totalHumidity / intervals).toFixed(2);

    const selectedUnit = ttt;

    document.querySelector(".forecast-avg-temp").innerText =
      "Avg Temp (next 24 hours): " + avgTemp + " °" + selectedUnit;
    document.querySelector(".forecast-avg-humidity").innerText =
      "Avg Humidity (next 24 hours): " + avgHumidity + "%";
  },
  checkAlertThreshold: function (currentTemp) {
    const threshold = parseFloat(document.querySelector(".threshold-input").value);
    const alertMessage = document.querySelector(".alert-message");

    if (currentTemp > threshold) {
      alertMessage.innerText = `Alert! The temperature is above your threshold of ${threshold}°C. Current temp: ${currentTemp}°C.`;
      console.log(`Alert triggered: Temperature of ${currentTemp}°C exceeds ${threshold}°C.`);
    } else {
      alertMessage.innerText = "";
    }
  },
  search: function () {
    this.fetchWeather(document.querySelector(".search-bar").value);
  },
  fetchCurrentLocationWeather: function () {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          this.fetchWeather({ lat: latitude, lon: longitude });
        },
        () => {
          this.fetchWeather("Bangalore");
        }
      );
    } else {
      this.fetchWeather("Bangalore");
    }
  },
};

document.querySelector(".search button").addEventListener("click", function () {
  weather.search();
});

document.querySelector(".search-bar").addEventListener("keyup", function (event) {
  if (event.key == "Enter") {
    weather.search();
  }
});

var ttt = "C";
document.querySelector("select").addEventListener("change", function (evt) {
  ttt = evt.target.value;
  weather.fetchWeather(document.querySelector(".city").innerText.split("Weather in ")[1] || "Bangalore");
});

document.getElementById("threshold").addEventListener("input", checkThreshold);

function checkThreshold() {
  const thresholdInput = document.getElementById("threshold");
  const alertMessage = document.querySelector(".alert-message");

  const currentTemp = parseFloat(document.querySelector(".temp").innerText.split(" ")[0]);

  if (currentTemp > parseFloat(thresholdInput.value)) {
    alertMessage.textContent = `Warning: Current temperature (${currentTemp}°C) exceeds the threshold of ${thresholdInput.value}°C!`;
  } else {
    alertMessage.textContent = "";
  }
}

// Fetch the weather for the user's current location initially
weather.fetchCurrentLocationWeather();
