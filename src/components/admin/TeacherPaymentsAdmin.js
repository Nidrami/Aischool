import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment
} from '@mui/material';
import PaymentsIcon from '@mui/icons-material/Payments';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import walletService from '../../services/walletService';
import { format } from 'date-fns';
import userService from '../../services/userService';

const TeacherPaymentsAdmin = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [amount, setAmount] = useState('');
  const [processing, setProcessing] = useState(false);
  const [payouts, setPayouts] = useState([]);
  const [payoutsLoading, setPayoutsLoading] = useState(true);

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        setLoading(true);
        // Fetch all users with TEACHER role
        const response = await userService.getAllUsers();
        setTeachers(response.filter(user => user.role === 'TEACHER'));
        setError(null);
      } catch (err) {
        console.error('Error fetching teachers:', err);
        setError('Failed to load teacher list. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    const fetchPayouts = async () => {
      try {
        setPayoutsLoading(true);
        const response = await walletService.getTeacherPayouts();
        setPayouts(response.data);
      } catch (err) {
        console.error('Error fetching payouts:', err);
        setError('Failed to load payout history.');
      } finally {
        setPayoutsLoading(false);
      }
    };

    fetchTeachers();
    fetchPayouts();
  }, []);

  const handleOpenPaymentDialog = (teacher) => {
    setSelectedTeacher(teacher);
    setPaymentDialogOpen(true);
  };

  const handleClosePaymentDialog = () => {
    setPaymentDialogOpen(false);
    setSelectedTeacher(null);
    setAmount('');
  };

  const handlePayTeacher = async () => {
    if (!selectedTeacher || !amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      return;
    }

    try {
      setProcessing(true);
      const result = await walletService.payTeacher(selectedTeacher.id, parseFloat(amount));
      
      if (result.data && result.data.success) {
        // Show success message
        setError(null);
        
        // Refresh payout history
        const response = await walletService.getTeacherPayouts();
        setPayouts(response.data);
        
        handleClosePaymentDialog();
      } else {
        setError('Payment processing failed. Please try again.');
      }
    } catch (err) {
      console.error('Error processing payment:', err);
      setError(err.response?.data?.error || 'Failed to process payment. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Box sx={{ py: 4, px: 2 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        <PaymentsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        Teacher Payments
      </Typography>

      {error && <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>}

      <Paper elevation={2} sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>Teachers</Typography>
        
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" sx={{ py: 4 }}>
            <CircularProgress />
          </Box>
        ) : teachers.length > 0 ? (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell align="right">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {teachers.map((teacher) => (
                  <TableRow key={teacher.id}>
                    <TableCell>{teacher.firstName} {teacher.lastName}</TableCell>
                    <TableCell>{teacher.email}</TableCell>
                    <TableCell align="right">
                      <Button 
                        variant="contained" 
                        size="small"
                        startIcon={<CurrencyExchangeIcon />}
                        onClick={() => handleOpenPaymentDialog(teacher)}
                      >
                        Make Payment
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Alert severity="info">No teachers found in the system.</Alert>
        )}
      </Paper>

      <Paper elevation={2} sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>Recent Payouts</Typography>
        
        {payoutsLoading ? (
          <Box display="flex" justifyContent="center" alignItems="center" sx={{ py: 4 }}>
            <CircularProgress />
          </Box>
        ) : payouts.length > 0 ? (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Teacher</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell align="right">Amount</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {payouts.map((payout) => (
                  <TableRow key={payout.id}>
                    <TableCell>
                      {payout.createdAt ? format(new Date(payout.createdAt), 'MMM d, yyyy') : 'Unknown'}
                    </TableCell>
                    <TableCell>
                      {payout.recipient ? 
                        `${payout.recipient.firstName} ${payout.recipient.lastName} (${payout.recipient.email})` : 
                        'Unknown'}
                    </TableCell>
                    <TableCell>{payout.description}</TableCell>
                    <TableCell align="right">${parseFloat(payout.amount).toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Alert severity="info">No payment history found.</Alert>
        )}
      </Paper>

      {/* Payment Dialog */}
      <Dialog open={paymentDialogOpen} onClose={handleClosePaymentDialog}>
        <DialogTitle>Make Payment to Teacher</DialogTitle>
        <DialogContent>
          {selectedTeacher && (
            <>
              <Typography variant="subtitle1" gutterBottom>
                Teacher: {selectedTeacher.firstName} {selectedTeacher.lastName}
              </Typography>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Email: {selectedTeacher.email}
              </Typography>
              
              <TextField
                autoFocus
                margin="dense"
                label="Amount"
                type="number"
                fullWidth
                variant="outlined"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  inputProps: { min: 0, step: '0.01' }
                }}
                sx={{ mt: 2 }}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePaymentDialog} disabled={processing}>
            Cancel
          </Button>
          <Button 
            onClick={handlePayTeacher}
            variant="contained" 
            color="primary"
            disabled={processing || !amount || parseFloat(amount) <= 0}
          >
            {processing ? <CircularProgress size={24} /> : 'Process Payment'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TeacherPaymentsAdmin;
