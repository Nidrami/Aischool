import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Alert,
  Divider,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  MonetizationOn,
  TrendingUp,
  TrendingDown,
  School,
  CollectionsBookmark
} from '@mui/icons-material';
import walletService from '../../services/walletService';
import { format } from 'date-fns';

const RevenueDashboard = () => {
  const [revenue, setRevenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRevenueData = async () => {
      try {
        setLoading(true);
        const response = await walletService.getRevenueStatistics();
        setRevenue(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching revenue data:', err);
        setError('Failed to load revenue information. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchRevenueData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ py: 4, px: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ py: 4, px: 2 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ py: 4, px: 2 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        <MonetizationOn sx={{ mr: 1, verticalAlign: 'middle' }} />
        Revenue Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* Total Revenue Card */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3, height: '100%', backgroundColor: '#f9f9ff' }}>
            <Box display="flex" flexDirection="column" alignItems="center" textAlign="center">
              <TrendingUp color="primary" style={{ fontSize: 48, marginBottom: 8 }} />
              <Typography variant="h6" gutterBottom>Total Revenue</Typography>
              <Typography variant="h3" color="primary">
                ${revenue?.totalRevenue?.toFixed(2) || '0.00'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Lifetime earnings
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Total Payouts Card */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3, height: '100%', backgroundColor: '#fff9f9' }}>
            <Box display="flex" flexDirection="column" alignItems="center" textAlign="center">
              <TrendingDown color="error" style={{ fontSize: 48, marginBottom: 8 }} />
              <Typography variant="h6" gutterBottom>Total Payouts</Typography>
              <Typography variant="h3" color="error">
                ${revenue?.totalPayouts?.toFixed(2) || '0.00'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                All teacher payments
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Net Revenue Card */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3, height: '100%', backgroundColor: '#f7fff7' }}>
            <Box display="flex" flexDirection="column" alignItems="center" textAlign="center">
              <MonetizationOn color="success" style={{ fontSize: 48, marginBottom: 8 }} />
              <Typography variant="h6" gutterBottom>Net Profit</Typography>
              <Typography variant="h3" color="success">
                ${revenue?.netProfit?.toFixed(2) || '0.00'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Revenue after payouts
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Course Sales Statistics */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              <School sx={{ mr: 1, verticalAlign: 'middle' }} />
              Course Sales Statistics
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography color="text.secondary" gutterBottom>
                      Total Courses Sold
                    </Typography>
                    <Typography variant="h4">
                      {revenue?.totalCoursesSold || 0}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography color="text.secondary" gutterBottom>
                      Average Sale Price
                    </Typography>
                    <Typography variant="h4">
                      ${revenue?.averageSalePrice?.toFixed(2) || '0.00'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Box mt={3}>
              <Typography variant="subtitle2" gutterBottom>
                Recent Course Sales
              </Typography>
              {revenue?.recentSales && revenue.recentSales.length > 0 ? (
                <List dense>
                  {revenue.recentSales.map((sale, index) => (
                    <ListItem key={index} divider={index < revenue.recentSales.length - 1}>
                      <ListItemIcon>
                        <CollectionsBookmark color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary={sale.courseName || 'Unknown Course'}
                        secondary={`${format(new Date(sale.date), 'MMM d, yyyy')} - $${sale.amount?.toFixed(2)}`}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No recent sales data available.
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Monthly Revenue */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              <TrendingUp sx={{ mr: 1, verticalAlign: 'middle' }} />
              Monthly Revenue
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Typography variant="h6" gutterBottom>Recent Payouts to Teachers</Typography>
            {revenue?.recentPayouts && revenue.recentPayouts.length > 0 ? (
              <List>
                {revenue.recentPayouts.map((payout, index) => (
                  <ListItem key={index} divider={index < revenue.recentPayouts.length - 1}>
                    <ListItemIcon>
                      <TrendingDown color="error" />
                    </ListItemIcon>
                    <ListItemText
                      primary={payout.teacherName}
                      secondary={`${format(new Date(payout.date), 'MMM d, yyyy')} - ${payout.teacherEmail}`}
                    />
                    <Typography variant="h6" color="error">
                      ${payout.amount?.toFixed(2)}
                    </Typography>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No recent payout data available.
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default RevenueDashboard;
