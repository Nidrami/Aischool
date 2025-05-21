import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  Divider,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert
} from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AddIcon from '@mui/icons-material/Add';
import HistoryIcon from '@mui/icons-material/History';
import walletService from '../../services/walletService';
import AddFundsDialog from './AddFundsDialog';
import TransactionList from './TransactionList';

const WalletDashboard = () => {
  const navigate = useNavigate();
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openAddFunds, setOpenAddFunds] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [transactionsLoading, setTransactionsLoading] = useState(true);

  useEffect(() => {
    const fetchWalletData = async () => {
      try {
        setLoading(true);
        const response = await walletService.getWalletBalance();
        if (response && response.data) {
          setWallet(response.data);
          setError(null);
        }
      } catch (err) {
        console.error('Error fetching wallet data:', err);
        // Check if we're getting a new wallet notification
        if (err.response && err.response.status === 404) {
          setWallet({ balance: 0, currency: 'USD' });
        } else {
          setError('Failed to load wallet information. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    const fetchTransactions = async () => {
      try {
        setTransactionsLoading(true);
        const response = await walletService.getTransactionHistory();
        if (response && response.data) {
          // Just get the last 5 transactions for the dashboard
          setTransactions(Array.isArray(response.data) ? response.data.slice(0, 5) : []);
          setError(null);
        }
      } catch (err) {
        console.error('Error fetching transactions:', err);
        setError('Failed to load transaction history.');
      } finally {
        setTransactionsLoading(false);
      }
    };

    fetchWalletData();
    fetchTransactions();
  }, []);

  const handleAddFundsOpen = () => {
    setOpenAddFunds(true);
  };

  const handleAddFundsClose = () => {
    setOpenAddFunds(false);
  };

  const handleAddFundsSuccess = () => {
    // Refresh wallet data after adding funds
    walletService.getWalletBalance()
      .then(response => {
        setWallet(response.data);
      })
      .catch(err => {
        console.error('Error refreshing wallet data:', err);
      });

    // Refresh transactions
    walletService.getTransactionHistory()
      .then(response => {
        setTransactions(response.data.slice(0, 5));
      })
      .catch(err => {
        console.error('Error refreshing transactions:', err);
      });

    setOpenAddFunds(false);
  };

  return (
    <Box sx={{ py: 4, px: 2 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        <AccountBalanceWalletIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        My Wallet
      </Typography>

      {error && <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>}

      <Grid container spacing={3}>
        {/* Wallet Balance Card */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
            {loading ? (
              <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                <CircularProgress />
              </Box>
            ) : wallet ? (
              <>
                <Typography variant="h6" gutterBottom>Current Balance</Typography>
                <Typography variant="h3" component="div" color="primary" gutterBottom>
                  ${wallet.balance?.toFixed(2)}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Currency: {wallet.currency || 'USD'}
                </Typography>
                
                <Button 
                  variant="contained" 
                  color="primary" 
                  startIcon={<AddIcon />}
                  onClick={handleAddFundsOpen}
                  sx={{ mt: 2 }}
                >
                  Add Funds
                </Button>
              </>
            ) : (
              <Alert severity="info">
                You don't have a wallet yet. Add funds to create one.
                <Button 
                  variant="outlined" 
                  size="small" 
                  onClick={handleAddFundsOpen}
                  sx={{ ml: 2 }}
                >
                  Add Funds
                </Button>
              </Alert>
            )}
          </Paper>
        </Grid>

        {/* Recent Transactions Card */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Recent Transactions</Typography>
              <Button 
                variant="outlined" 
                size="small"
                startIcon={<HistoryIcon />}
                onClick={() => navigate('/transactions')}
              >
                View All
              </Button>
            </Box>
            
            {transactionsLoading ? (
              <Box display="flex" justifyContent="center" alignItems="center" height="200px">
                <CircularProgress />
              </Box>
            ) : transactions.length > 0 ? (
              <TransactionList transactions={transactions} limit={5} />
            ) : (
              <Box py={3}>
                <Typography variant="body1" color="text.secondary" align="center">
                  No transaction history yet.
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Add Funds Dialog */}
      <AddFundsDialog 
        open={openAddFunds} 
        onClose={handleAddFundsClose} 
        onSuccess={handleAddFundsSuccess}
      />
    </Box>
  );
};

export default WalletDashboard;
