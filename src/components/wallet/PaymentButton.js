import React, { useState, useEffect } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  CircularProgress,
  Alert,
  Box
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import walletService from '../../services/walletService';

const PaymentButton = ({ course, onSuccess, disabled }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [walletBalance, setWalletBalance] = useState(null);
  const [walletLoading, setWalletLoading] = useState(false);

  const handleOpenDialog = async () => {
    setOpenDialog(true);
    try {
      setWalletLoading(true);
      const response = await walletService.getWalletBalance();
      setWalletBalance(response.data?.balance || 0);
      setError(null);
    } catch (err) {
      console.error('Error fetching wallet balance:', err);
      setError('Unable to retrieve your wallet balance. Please try again.');
    } finally {
      setWalletLoading(false);
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setError(null);
  };

  const handlePurchase = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Call the API to purchase the course
      await walletService.purchaseCourse(course.id);
      
      handleCloseDialog();
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error('Error purchasing course:', err);
      setError(err.response?.data?.error || 'Failed to purchase course. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const hasInsufficientFunds = walletBalance !== null && course.price > walletBalance;

  return (
    <>
      <Button
        variant="contained"
        color="primary"
        startIcon={<ShoppingCartIcon />}
        onClick={handleOpenDialog}
        disabled={disabled || !course.price}
        sx={{ mt: 2 }}
      >
        {course.isFree ? 'Enroll for Free' : `Purchase • $${course.price?.toFixed(2)}`}
      </Button>

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        aria-labelledby="purchase-dialog-title"
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle id="purchase-dialog-title">Confirm Purchase</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Typography variant="h6" gutterBottom>
            {course.title}
          </Typography>
          
          <Typography variant="body1" color="text.secondary" paragraph>
            You are about to purchase this course for ${course.price?.toFixed(2)}.
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <AccountBalanceWalletIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="body1">
              Your Wallet Balance: 
              {walletLoading ? (
                <CircularProgress size={16} sx={{ ml: 1 }} />
              ) : (
                <Typography component="span" fontWeight="bold" color={hasInsufficientFunds ? "error" : "primary"} sx={{ ml: 1 }}>
                  ${walletBalance?.toFixed(2)}
                </Typography>
              )}
            </Typography>
          </Box>

          {hasInsufficientFunds && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              Insufficient funds in your wallet. Please add more funds before making this purchase.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handlePurchase}
            disabled={loading || hasInsufficientFunds || walletLoading}
            startIcon={loading && <CircularProgress size={24} color="inherit" />}
          >
            {loading ? 'Processing...' : 'Confirm Purchase'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default PaymentButton;
