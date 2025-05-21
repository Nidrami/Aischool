import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Alert,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import PaymentsIcon from '@mui/icons-material/Payments';
import SchoolIcon from '@mui/icons-material/School';
import walletService from '../../services/walletService';
import { format } from 'date-fns';

const TeacherWalletDashboard = () => {
  const [wallet, setWallet] = useState(null);
  const [earnings, setEarnings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get wallet balance
        const walletResponse = await walletService.getWalletBalance();
        setWallet(walletResponse.data);
        
        // Get teacher payments using the specialized endpoint
        const paymentsResponse = await walletService.getTeacherPayments();
        console.log('Teacher payments:', paymentsResponse.data);
        setEarnings(paymentsResponse.data);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching teacher wallet data:', err);
        setError('Failed to load wallet information. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ py: 4, px: 2 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        <AccountBalanceWalletIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        Teacher Earnings
      </Typography>

      {error && <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>}

      <Grid container spacing={3}>
        {/* Total Earnings Card (formerly Wallet Balance) */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3, height: '100%', backgroundColor: '#f7fff7' }}>
            <Box display="flex" alignItems="center" mb={1}>
              <PaymentsIcon color="success" sx={{ mr: 1 }} />
              <Typography variant="h6">Total Earnings</Typography>
            </Box>
            <Typography variant="h3" component="div" color="success.main" gutterBottom>
              ${wallet?.balance?.toFixed(2) || '0.00'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Your current wallet balance
            </Typography>
          </Paper>
        </Grid>

        {/* Course Sales Card */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" mb={2}>
              <SchoolIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">Payment History</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            {earnings.length > 0 ? (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {earnings.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>{format(new Date(payment.createdAt), 'MMM d, yyyy')}</TableCell>
                        <TableCell>{payment.description || 'Teacher Payment'}</TableCell>
                        <TableCell>
                          <Box
                            component="span"
                            sx={{
                              px: 1,
                              py: 0.5,
                              borderRadius: 1,
                              fontSize: '0.75rem',
                              fontWeight: 'bold',
                              textTransform: 'uppercase',
                              backgroundColor: payment.status === 'COMPLETED' ? '#e6f7ec' : '#fff4e5',
                              color: payment.status === 'COMPLETED' ? '#2e7d32' : '#ed6c02'
                            }}
                          >
                            {payment.status}
                          </Box>
                        </TableCell>
                        <TableCell align="right">${payment.amount.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Alert severity="info">
                You haven't received any payments yet. Payments are processed by administrators.
              </Alert>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TeacherWalletDashboard;
