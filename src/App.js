import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { enUS } from 'date-fns/locale';

// Components
import PrivateRoute from './components/PrivateRoute';
import TeacherApplicationRoute from './components/TeacherApplicationRoute';
import TeacherApplicationsAdmin from './components/admin/TeacherApplicationsAdmin';
import Layout from './components/Layout';
import TeacherWaiting from './components/TeacherWaiting';
import TeacherApply from './components/TeacherApply';

// Wallet Components
import WalletDashboard from './components/wallet/WalletDashboard';
import TransactionsPage from './components/wallet/TransactionsPage';
import TeacherWalletDashboard from './components/wallet/TeacherWalletDashboard';
import TeacherPaymentsAdmin from './components/admin/TeacherPaymentsAdmin';
import RevenueDashboard from './components/admin/RevenueDashboard';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import Courses from './pages/Courses';
import MyCourses from './pages/MyCourses';
import Profile from './pages/Profile';
import CourseDetails from './components/CourseDetails';
import CourseContentView from './components/CourseContentView';
import CourseContentPlayer from './components/CourseContentPlayer';
// Assignment-related imports removed
import Exercises from './pages/Exercises';
import ExamsPage from './pages/ExamsPage';
import ExamDetailPage from './pages/ExamDetailPage';
import ExamEditPage from './pages/ExamEditPage';
import ExamSubmissionPage from './pages/ExamSubmissionPage';
import ExamSubmissionViewPage from './pages/ExamSubmissionViewPage';
import ExamSubmissionDetailPage from './pages/ExamSubmissionDetailPage';
import ExamSubmissionStudentView from './pages/ExamSubmissionStudentView';
import Users from './pages/Users';
// SimpleAssignmentsPage removed
import NotFound from './pages/NotFound';

// Context
import { AuthProvider } from './contexts/AuthContext';

const theme = createTheme({
  palette: {
    primary: {
      main: '#00843D', // Moroccan green - main branding color
      light: '#4CAF50',
      dark: '#005025',
      contrastText: '#fff',
    },
    secondary: {
      main: '#C8102E', // Moroccan red - from flag
      light: '#ff5252',
      dark: '#8e0000',
      contrastText: '#fff',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
    success: {
      main: '#4caf50',
    },
    error: {
      main: '#e53e3e',
    },
    warning: {
      main: '#ff9800',
    },
    info: {
      main: '#00843D', // Using Moroccan green for info as well
    },
    text: {
      primary: '#333333',
      secondary: '#666666',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 500,
    },
    h5: {
      fontWeight: 500,
    },
    h6: {
      fontWeight: 500,
    },
    button: {
      fontWeight: 500,
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 4,
  },
  components: {
    MuiAppBar: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          backgroundColor: '#00843D', // Moroccan green
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 16px',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 6px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.08)',
          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 10px 15px rgba(0,0,0,0.05), 0 4px 6px rgba(0,0,0,0.08)',
          },
        },
      },
    },
  },
});

function App() {
  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={enUS}>
          <CssBaseline />
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<Layout />}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route
                  path="dashboard"
                  element={
                    <PrivateRoute>
                      <Dashboard />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="profile"
                  element={
                    <PrivateRoute>
                      <Profile />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="admin"
                  element={
                    <PrivateRoute roles={['ADMIN']}>
                      <AdminDashboard />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="teacher"
                  element={
                    <PrivateRoute roles={['TEACHER']}>
                      <TeacherDashboard />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="teacher/apply"
                  element={
                    <PrivateRoute roles={['TEACHER_PENDING']}>
                      <TeacherApply />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="teacher/waiting"
                  element={
                    <PrivateRoute roles={['TEACHER_PENDING']}>
                      <TeacherApplicationRoute>
                        <TeacherWaiting />
                      </TeacherApplicationRoute>
                    </PrivateRoute>
                  }
                />
                {/* Wallet Routes */}
                <Route
                  path="wallet"
                  element={
                    <PrivateRoute roles={['STUDENT', 'ADMIN']}>
                      <WalletDashboard />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="teacher/wallet"
                  element={
                    <PrivateRoute roles={['TEACHER']}>
                      <TeacherWalletDashboard />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="transactions"
                  element={
                    <PrivateRoute roles={['STUDENT', 'ADMIN']}>
                      <TransactionsPage />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="admin/payments"
                  element={
                    <PrivateRoute roles={['ADMIN']}>
                      <TeacherPaymentsAdmin />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="admin/revenue"
                  element={
                    <PrivateRoute roles={['ADMIN']}>
                      <RevenueDashboard />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="courses"
                  element={
                    <PrivateRoute>
                      <Courses />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="my-courses"
                  element={
                    <PrivateRoute roles={['STUDENT']}>
                      <MyCourses />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="courses/:id"
                  element={
                    <PrivateRoute>
                      <CourseDetails />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="course/:id"
                  element={
                    <PrivateRoute>
                      <CourseContentView />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="course/:courseId/chapter/:chapterId/content/:contentId"
                  element={
                    <PrivateRoute>
                      <CourseContentPlayer />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="exercises"
                  element={
                    <PrivateRoute>
                      <Exercises />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="exams"
                  element={
                    <PrivateRoute>
                      <ExamsPage />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="exams/edit/:examId"
                  element={
                    <PrivateRoute roles={['TEACHER', 'ADMIN']}>
                      <ExamEditPage />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="exams/:examId"
                  element={
                    <PrivateRoute>
                      <ExamDetailPage />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="exams/:examId/submit"
                  element={
                    <PrivateRoute roles={['STUDENT']}>
                      <ExamSubmissionPage />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="submissions/:submissionId/view"
                  element={
                    <PrivateRoute roles={['TEACHER', 'ADMIN']}>
                      <ExamSubmissionViewPage />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="submissions/:submissionId/detail"
                  element={
                    <PrivateRoute roles={['TEACHER', 'ADMIN']}>
                      <ExamSubmissionDetailPage />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="submissions/:submissionId/result"
                  element={
                    <PrivateRoute roles={['STUDENT']}>
                      <ExamSubmissionStudentView />
                    </PrivateRoute>
                  }
                />

                <Route
                  path="teacher-applications"
                  element={
                    <PrivateRoute roles={['ADMIN']}>
                      <TeacherApplicationsAdmin />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="users"
                  element={
                    <PrivateRoute roles={['ADMIN']}>
                      <Users />
                    </PrivateRoute>
                  }
                />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </Router>
        </LocalizationProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
