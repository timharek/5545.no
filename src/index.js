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
      this.current_weatherType =
        weatherData.timeseries[0].data.next_1_hours.summary.symbol_code;
      this.current_temperature =
        weatherData.timeseries[0].data.instant.details.air_temperature;
      this.current_rain =
        weatherData.timeseries[0].data.next_1_hours.details.precipitation_amount;
      this.current_wind =
        weatherData.timeseries[0].data.instant.details.wind_speed;
      this.current_weatherImg = this.getWeatherImage(this.current_weatherType);
    },
    getWeatherImage: function (weatherType) {
      return "img/weathericons/" + weatherType + ".svg";
    },
  },
  beforeMount() {
    this.getWeather("59.355091", "5.323378"); // Vormedal
    Array.prototype.insert = function (index, item) {
      this.splice(index, 0, item);
    };
  },
});
