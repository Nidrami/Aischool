import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Divider,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Grid
} from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';
import walletService from '../../services/walletService';
import TransactionList from './TransactionList';

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const response = await walletService.getTransactionHistory();
        setTransactions(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching transactions:', err);
        setError('Failed to load transaction history. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const handleFilterChange = (event) => {
    setFilter(event.target.value);
  };

  // Filter transactions based on selected type
  const filteredTransactions = filter === 'ALL' 
    ? transactions 
    : transactions.filter(transaction => transaction.type === filter);

  return (
    <Box sx={{ py: 4, px: 2 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        <HistoryIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        Transaction History
      </Typography>

      {error && <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>}

      <Paper elevation={2} sx={{ p: 3, mt: 3 }}>
        <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Grid item xs={12} sm={9}>
            <Typography variant="h6">Your Transactions</Typography>
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel id="transaction-type-label">Filter By Type</InputLabel>
              <Select
                labelId="transaction-type-label"
                id="transaction-type"
                value={filter}
                label="Filter By Type"
                onChange={handleFilterChange}
              >
                <MenuItem value="ALL">All Transactions</MenuItem>
                <MenuItem value="DEPOSIT">Deposits</MenuItem>
                <MenuItem value="COURSE_PURCHASE">Course Purchases</MenuItem>
                <MenuItem value="TEACHER_PAYMENT">Teacher Payments</MenuItem>
                <MenuItem value="REFUND">Refunds</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Divider sx={{ mb: 2 }} />

        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" sx={{ py: 4 }}>
            <CircularProgress />
          </Box>
        ) : filteredTransactions.length > 0 ? (
          <TransactionList transactions={filteredTransactions} />
        ) : (
          <Box py={3}>
            <Typography variant="body1" color="text.secondary" align="center">
              {filter === 'ALL' 
                ? 'No transactions found.'
                : `No ${filter.toLowerCase().replace('_', ' ')} transactions found.`}
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default TransactionsPage;
