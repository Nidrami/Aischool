import api from './api';

const getWalletBalance = () => {
  return api.get('/api/wallet');
};

const addFundsToWallet = (amount, description) => {
  return api.post('/api/transactions/deposit', { amount, description });
};

const getTransactionHistory = () => {
  return api.get('/api/transactions');
};

const getTeacherPayments = () => {
  return api.get('/api/transactions/teacher-payments');
};

const purchaseCourse = (courseId) => {
  return api.post(`/api/transactions/purchase/${courseId}`);
};

const getRevenueStatistics = () => {
  return api.get('/api/transactions/revenue');
};

const getTeacherPayouts = () => {
  return api.get('/api/transactions/payouts');
};

const payTeacher = (teacherId, amount) => {
  return api.post(`/api/transactions/pay-teacher/${teacherId}?amount=${amount}`);
};

const walletService = {
  getWalletBalance,
  addFundsToWallet,
  getTransactionHistory,
  getTeacherPayments,
  purchaseCourse,
  getRevenueStatistics,
  getTeacherPayouts,
  payTeacher
};

export default walletService;
