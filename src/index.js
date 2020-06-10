var app = new Vue({
  el: "#app",
  data: {
    current_date: "",
    current_temperature: "",
    current_wind: "",
    current_rainMin: "",
    current_rainMax: "",
    current_rain: "",
    current_weatherType: "",
    current_weatherImg: "",
    nowcast: [],
    nextThreeHours: [],
    forecastNextDays: [],
  },
  methods: {
    getWeatherData: async function (url) {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

      return response.json();
    },
    getWeather: async function (lat, lon) {
      const tenMin = 1000 * 60 * 10;
      if (
        localStorage.getItem("localData") == null ||
        Date.now() - localStorage.getItem("time") > tenMin
      ) {
        console.log("Getting new weather data...");
        const localData = await this.getWeatherData(
          "https://api.met.no/weatherapi/locationforecast/2.0/.json?lat=" +
            lat +
            "&lon=" +
            lon +
            ""
        );
        localStorage.setItem("localData", JSON.stringify(localData));
        localStorage.setItem("time", Date.now());
      }
      var retrivedData = localStorage.getItem("localData");

      this.setWeather(JSON.parse(retrivedData).properties);
    },
    setWeather: function (weatherData) {
      weatherData.timeseries.forEach((forecast) => {
        var forcastHour = forecast.time.substring(0, 13);
        if (forcastHour === this.getCurrentHour()) {
          this.current_weatherType =
            forecast.data.next_1_hours.summary.symbol_code;
          this.current_temperature =
            forecast.data.instant.details.air_temperature;
          this.current_rain =
            forecast.data.next_1_hours.details.precipitation_amount;
          this.current_wind = forecast.data.instant.details.wind_speed;
          this.current_weatherImg = this.getWeatherImage(
            this.current_weatherType
          );

          console.log(forecast.data.next_1_hours.summary.symbol_code);
        }
      });
    },
    getWeatherImage: function (weatherType) {
      return "img/weathericons/" + weatherType + ".svg";
    },
    getCurrentHour: function () {
      // Returns hour in correct ISO ex. 2020-06-10T22
      var date = new Date();
      date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
      return date.toISOString().substring(0, 13);
    },
  },
  beforeMount() {
    this.getWeather("59.355091", "5.323378"); // Vormedal
    Array.prototype.insert = function (index, item) {
      this.splice(index, 0, item);
    };
  },
});
