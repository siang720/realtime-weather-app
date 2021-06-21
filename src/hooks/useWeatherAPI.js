import { useState, useEffect, useCallback } from 'react';

const fetchCurrentWeather = ({locationName, authorization_key}) => {
  return fetch(
    `https://opendata.cwb.gov.tw/api/v1/rest/datastore/O-A0003-001?Authorization=${authorization_key}&locationName=${locationName}`
  )
    .then((response) => response.json())
    .then((data) => {
      const locationData = data.records.location[0];
      const weatherElements = locationData.weatherElement.reduce(
        (neededElements, item) => {
          if (['WDSD', 'TEMP'].includes(item.elementName)) {
            neededElements[item.elementName] = item.elementValue
          }
          return neededElements
        }, {}
      )
      return {
        observationTime: locationData.time.obsTime,
        locationName: locationData.locationName,
        temperature: weatherElements.TEMP,
        windSpeed: weatherElements.WDSD
      };
    });
};
  
const fetchWeatherForecast = ({cityName, authorization_key}) => {
  return fetch(
    `https://opendata.cwb.gov.tw/api/v1/rest/datastore/F-C0032-001?Authorization=${authorization_key}&locationName=${cityName}`
  )
    .then((response) => response.json())
    .then((data) => {
      const locationData = data.records.location[0];
      const weatherElements = locationData.weatherElement.reduce(
        (neededElements, item) => {
          if (['Wx', 'PoP', 'CI'].includes(item.elementName)) {
            neededElements[item.elementName] = item.time[0].parameter;
          }
          return neededElements;
        },
        {}
      );
      return {
        description: weatherElements.Wx.parameterName,
        weatherCode: weatherElements.Wx.parameterValue,
        rainPossibility: weatherElements.PoP.parameterName,
        comfortability: weatherElements.CI.parameterName,
      };
    });
};

const useWeatherAPI = ({locationName, cityName, authorization_key}) => {
    const [weatherElement, setWeatherElement] = useState({
        observationTime: new Date(),
        locationName: '',
        temperature: 0,
        windSpeed: 0,
        description: '',
        weatherCode: 0,
        rainPossibility: 0,    
        comfortability: '',
        isLoading: true,
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const fetchData = useCallback(async () => {
        setWeatherElement((prevState) => ({
            ...prevState,
            isLoading: true
        }));

        const [currentWeather, weatherForecast] = await Promise.all([fetchCurrentWeather({locationName, authorization_key}),fetchWeatherForecast({cityName, authorization_key})]);
        
        setWeatherElement({
            ...currentWeather,
            ...weatherForecast,
            isLoading: false,
        });
    }, [authorization_key, cityName, locationName]);
    
    useEffect(() => { fetchData() }, [fetchData]);

    return [ weatherElement, fetchData ];
};

export default useWeatherAPI;