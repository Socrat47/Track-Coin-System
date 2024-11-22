import React, { useState } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import axios from 'axios';
import { TextField, Button, Container, CircularProgress, Box, Typography, Paper, Select, MenuItem } from '@mui/material';
import { Chart, registerables } from 'chart.js';
import './App.css'

Chart.register(...registerables);

const App = () => {
  const [coin, setCoin] = useState('bitcoin');
  const [chartData, setChartData] = useState({});
  const [loading, setLoading] = useState(false);
  const [chartType, setChartType] = useState('line');
  const [coinDetails, setCoinDetails] = useState(null);
  const [riskAnalysis, setRiskAnalysis] = useState('');
  const [timeframe, setTimeframe] = useState('7');

  const fetchCoinData = async () => {
    setLoading(true);
    setCoinDetails(null);
    setRiskAnalysis('');
    try {
      const marketData = await axios.get(`https://api.coingecko.com/api/v3/coins/${coin}/market_chart?vs_currency=usd&days=${timeframe}`);
      const prices = marketData.data.prices.map(price => price[1]);
      const timestamps = marketData.data.prices.map(price => new Date(price[0]).toLocaleDateString());

      // Coin detaylarını al
      const details = await axios.get(`https://api.coingecko.com/api/v3/coins/${coin}`);
      setCoinDetails(details.data);

      analyzeRisk(prices);

      const color = prices[prices.length - 1] > prices[0] ? 'rgba(0, 255, 0, 0.2)' : 'rgba(255, 0, 0, 0.2)';


      setChartData({
        labels: timestamps,
        datasets: [
          {
            label: `${coin.charAt(0).toUpperCase() + coin.slice(1)} Price (USD)`,
            data: prices,
            borderColor: 'rgba(0, 123, 255, 1)',
            backgroundColor: color,
            fill: true,
            tension: 0.3,
          },
        ],
      });
    } catch (error) {
      console.error("Error fetching data:", error);
      setCoinDetails(null);
    } finally {
      setLoading(false);
    }
  };


  const analyzeRisk = (prices) => {
    const priceChanges = prices[prices.length - 1] - prices[0];
    const threshold = 100;
    setRiskAnalysis(priceChanges > threshold ? 'Bu coin riskli!' : 'Bu coin güvenli.');
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '', height: '100vh' }}>
      <Paper
        elevation={3}
        sx={{
          padding: 4,
          borderRadius: 2,
          width: '800px',
          textAlign: 'center',
          backgroundColor: '#ffffff',
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom sx={{ color: '#333333' }}>
          Coin Tracker
        </Typography>
        <TextField
          label="Coin Name"
          variant="outlined"
          value={coin}
          onChange={(e) => setCoin(e.target.value)}
          fullWidth
          sx={{
            marginBottom: 2,
            input: { color: '#333333' },
            label: { color: '#333333' },
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: '#333333',
              },
              '&:hover fieldset': {
                borderColor: '#00bcd4',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#00bcd4',
              },
            },
          }}
        />
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '5px'
        }}>
          <div style={{ display: 'flex', gap: '5px' }}>
            <Select
              value={chartType}
              onChange={(e) => setChartType(e.target.value)}
              sx={{ marginBottom: 2 }}
            >
              <MenuItem value="line">Çizgi Grafiği</MenuItem>
              <MenuItem value="bar">Çubuk Grafiği</MenuItem>
            </Select>
            <Select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              sx={{ marginBottom: 2 }}
            >
              <MenuItem value="1">1 Saat</MenuItem>
              <MenuItem value="7">7 Gün</MenuItem>
              <MenuItem value="30">30 Gün</MenuItem>
              <MenuItem value="365">1 Yıl</MenuItem>
            </Select>
          </div>

          <div>
            <Button
              variant="contained"
              onClick={fetchCoinData}
              sx={{
                marginBottom: 2,
                backgroundColor: '#007bff',
                '&:hover': {
                  backgroundColor: '#0056b3',
                },
              }}
            >
              Get Data
            </Button>
          </div>

        </div>
        {loading ? (
          <CircularProgress sx={{ color: '#007bff' }} />
        ) : (
          <Box sx={{ height: '400px', width: '100%' }}>
            {chartData.labels && chartData.datasets && (
              chartType === 'line' ? (
                <Line data={chartData} options={{
                  maintainAspectRatio: false,
                  scales: {
                    x: {
                      title: {
                        display: true,
                        text: 'Date',
                        color: '#333333',
                      },
                    },
                    y: {
                      title: {
                        display: true,
                        text: 'Price (USD)',
                        color: '#333333',
                      },
                      grid: {
                        color: 'rgba(255, 255, 255, 0.1)',
                      },
                    },
                  },
                  plugins: {
                    legend: {
                      labels: {
                        color: '#333333',
                      },
                    },
                  },
                }} />
              ) : (
                <Bar data={chartData} options={{
                  maintainAspectRatio: false,
                  scales: {
                    x: {
                      title: {
                        display: true,
                        text: 'Date',
                        color: '#333333',
                      },
                    },
                    y: {
                      title: {
                        display: true,
                        text: 'Price (USD)',
                        color: '#333333',
                      },
                      grid: {
                        color: 'rgba(255, 255, 255, 0.1)',
                      },
                    },
                  },
                  plugins: {
                    legend: {
                      labels: {
                        color: '#333333',
                      },
                    },
                  },
                }} />
              ))}
          </Box>
        )}

        <Box sx={{ marginTop: 2, display: 'flex', justifyContent: 'space-between' }}>
          {coinDetails && (
            <Box sx={{ flex: 1, marginRight: 1 }}>
              <Typography variant="h6">Detaylı Bilgi</Typography>
              <Typography>İsim: {coinDetails.name}</Typography>
              <Typography>Piyasa Değeri: ${coinDetails.market_data.market_cap.usd}</Typography>
              <Typography>24 Saatlik İşlem Hacmi: ${coinDetails.market_data.total_volume.usd}</Typography>
              <Typography>Mevcut Arz: {coinDetails.market_data.circulating_supply}</Typography>
            </Box>
          )}
          <Box sx={{ flex: 1, marginLeft: 1 }}>
            <Typography variant="h6">Risk Analizi</Typography>
            <Typography>{riskAnalysis}</Typography>
          </Box>
        </Box>
      </Paper>
    </div>
  );
};

export default App;
