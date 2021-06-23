import React, {useState, useEffect, useMemo } from 'react';
import styled from '@emotion/styled';
import { ThemeProvider } from '@emotion/react';
import { getMoment, findLocation } from './utils/helpers';
import WeatherCard from './views/WeatherCard';
import useWeatherAPI from './hooks/useWeatherAPI';
import WeatherSetting from './views/WeatherSetting';

const theme = {
  light: {
    backgroundColor: '#ededed',
    foregroundColor: '#f9f9f9',
    boxShadow: '0 1px 3px 0 #999999',
    titleColor: '#212121',
    temperatureColor: '#757575',
    textColor: '#828282',
  },
  dark: {
    backgroundColor: '#1F2022',
    foregroundColor: '#121416',
    boxShadow:
      '0 1px 4px 0 rgba(12, 12, 13, 0.2), 0 0 0 1px rgba(0, 0, 0, 0.15)',
    titleColor: '#f9f9fa',
    temperatureColor: '#dddddd',
    textColor: '#cccccc',
  },
};

const Container = styled.div`
  background-color: ${({ theme }) => theme.backgroundColor};
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const AUTHORIZATION_KEY = 'CWB-FB1A339B-AF21-4817-9158-84F54CB39FCF';

function App() {
  const storageCity = localStorage.getItem('cityName') || '臺北市';
  const [ currentCity, setCurrentCity ] = useState(storageCity);
  const currentLocation = useMemo(() => findLocation(currentCity), [currentCity]);
  const { cityName, locationName, sunriseCityName } = currentLocation;
  const handleCurrentCityChange = (currentCity) => {
    setCurrentCity(currentCity);
  };

  const [ currentPage, setCurrentPage ] = useState('WeatherCard');
  const handleCurrentPage = (currentPage) => {
    setCurrentPage(currentPage);
  };

  const [weatherElement, fetchData ] = useWeatherAPI({
    locationName,
    cityName,
    authorization_key: AUTHORIZATION_KEY,
  });

  // define theme state
  const [currentTheme, setCurrentTheme] = useState('light');
  const moment = useMemo(() => getMoment(sunriseCityName), [sunriseCityName]);
  
  useEffect(() => {
    setCurrentTheme(moment === 'day' ? 'light' : 'dark');
  }, [moment]);

  return (
    <ThemeProvider theme={theme[currentTheme]}>
      <Container>
        {currentPage === 'WeatherCard' && (<WeatherCard 
          cityName={cityName}
          weatherElement={weatherElement}
          moment={moment}
          fetchData={fetchData}
          handleCurrentPage={handleCurrentPage}
        />
        )}
        {currentPage === 
          'WeatherSetting' && 
          <WeatherSetting 
            cityName={cityName}
            handleCurrentPage={handleCurrentPage}
            handleCurrentCityChange={handleCurrentCityChange}
          /> 
        }
      </Container>
    </ThemeProvider>
  )
}

export default App;