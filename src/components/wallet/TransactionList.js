import React from 'react';
import {
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Typography,
  Chip,
  Divider,
  Box,
  Paper
} from '@mui/material';
import { 
  TrendingUp, 
  TrendingDown, 
  School, 
  Payment, 
  CurrencyExchange,
  ArrowDropUp,
  ArrowDropDown
} from '@mui/icons-material';
import { format } from 'date-fns';

// Helper to get icon based on transaction type
const getTransactionIcon = (type) => {
  switch (type) {
    case 'DEPOSIT':
      return <TrendingUp color="success" />;
    case 'WITHDRAWAL':
      return <TrendingDown color="error" />;
    case 'COURSE_PURCHASE':
      return <School color="primary" />;
    case 'TEACHER_PAYMENT':
      return <Payment color="secondary" />;
    case 'REFUND':
      return <CurrencyExchange color="warning" />;
    default:
      return <Payment />;
  }
};

// Helper to get status chip based on transaction status
const getStatusChip = (status) => {
  switch (status) {
    case 'COMPLETED':
      return <Chip size="small" label="Completed" color="success" />;
    case 'PENDING':
      return <Chip size="small" label="Pending" color="warning" />;
    case 'FAILED':
      return <Chip size="small" label="Failed" color="error" />;
    case 'REFUNDED':
      return <Chip size="small" label="Refunded" color="secondary" />;
    default:
      return <Chip size="small" label={status} />;
  }
};

const TransactionList = ({ transactions, limit }) => {
  // If limit is provided, slice the transactions array
  const displayedTransactions = limit ? transactions.slice(0, limit) : transactions;

  if (!displayedTransactions || displayedTransactions.length === 0) {
    return (
      <Box py={3}>
        <Typography variant="body1" color="text.secondary" align="center">
          No transactions found.
        </Typography>
      </Box>
    );
  }

  return (
    <List sx={{ width: '100%', bgcolor: 'background.paper', p: 0 }}>
      {displayedTransactions.map((transaction, index) => (
        <React.Fragment key={transaction.id || index}>
          <ListItem alignItems="flex-start" sx={{ py: 1.5 }}>
            <ListItemIcon>
              {getTransactionIcon(transaction.type)}
            </ListItemIcon>
            <ListItemText
              primary={
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="subtitle1" component="span">
                    {transaction.description || transaction.type.replace('_', ' ')}
                  </Typography>
                  <Typography 
                    variant="subtitle1" 
                    color={['DEPOSIT', 'REFUND'].includes(transaction.type) ? 'success.main' : 'error.main'}
                  >
                    {['DEPOSIT', 'REFUND'].includes(transaction.type) ? (
                      <Box component="span" display="flex" alignItems="center">
                        <ArrowDropUp color="success" />
                        +${transaction.amount}
                      </Box>
                    ) : (
                      <Box component="span" display="flex" alignItems="center">
                        <ArrowDropDown color="error" />
                        -${transaction.amount}
                      </Box>
                    )}
                  </Typography>
                </Box>
              }
              secondary={
                <Box display="flex" justifyContent="space-between" alignItems="center" mt={0.5}>
                  <Typography
                    component="span"
                    variant="body2"
                    color="text.secondary"
                  >
                    {transaction.createdAt ? format(new Date(transaction.createdAt), 'MMM d, yyyy h:mm a') : 'Unknown date'}
                  </Typography>
                  {getStatusChip(transaction.status)}
                </Box>
              }
            />
          </ListItem>
          {index < displayedTransactions.length - 1 && <Divider variant="inset" component="li" />}
        </React.Fragment>
      ))}
    </List>
  );
};

export default TransactionList;
