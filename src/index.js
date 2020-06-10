var app = new Vue({
  el: "#app",
  data: {
    nowcast: {},
    todayForecast: [],
    nextDaysForecast: [],
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
      console.log(this.nowcast.to);
    },
    setWeather: function (weatherData) {
      this.setNowCast(weatherData);
      this.setRestOfTodayForecast(weatherData);
    },
    setNowCast: function (weatherData) {
      var nowcastId = 0;
      weatherData.timeseries.forEach((forecast) => {
        var forcastHourWithDate = forecast.time.substring(0, 13);
        var forecastFrom = Number(forecast.time.substring(11, 13));
        var forecastTo = 0;
        if (forcastHourWithDate === this.getCurrentHour()) {
          if (forecastFrom == 23) {
            forecastTo = "00";
          } else {
            forecastTo = forecastFrom + 1;
          }
          this.nowcast = {
            id: nowcastId,
            from: forecastFrom,
            to: forecastTo,
            weatherType: forecast.data.next_1_hours.summary.symbol_code,
            weatherImg: this.getWeatherImage(
              forecast.data.next_1_hours.summary.symbol_code
            ),
            temperature: forecast.data.instant.details.air_temperature,
            rain: forecast.data.next_1_hours.details.precipitation_amount,
            wind: forecast.data.instant.details.wind_speed,
          };
        }
        nowcastId++;
      });
    },
    setRestOfTodayForecast: function (weatherData) {},
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
