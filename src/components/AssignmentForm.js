import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { enUS } from 'date-fns/locale';
import { useFormik } from 'formik';
import * as yup from 'yup';

const validationSchema = yup.object({
  title: yup.string().required('Title is required'),
  description: yup.string().required('Description is required'),
  dueDate: yup.date().required('Due date is required'),
  maxScore: yup
    .number()
    .required('Maximum score is required')
    .min(0, 'Score must be positive')
    .integer('Score must be an integer'),
});

const AssignmentForm = ({ open, onClose, onSubmit, initialData }) => {
  const formik = useFormik({
    initialValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      dueDate: initialData?.dueDate ? new Date(initialData.dueDate) : new Date(),
      maxScore: initialData?.maxScore || 100,
    },
    validationSchema,
    onSubmit: (values) => {
      onSubmit(values);
      onClose();
    },
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={formik.handleSubmit}>
        <DialogTitle>
          {initialData ? 'Edit Assignment' : 'Create Assignment'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              id="title"
              name="title"
              label="Title"
              value={formik.values.title}
              onChange={formik.handleChange}
              error={formik.touched.title && Boolean(formik.errors.title)}
              helperText={formik.touched.title && formik.errors.title}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              id="description"
              name="description"
              label="Description"
              multiline
              rows={4}
              value={formik.values.description}
              onChange={formik.handleChange}
              error={formik.touched.description && Boolean(formik.errors.description)}
              helperText={formik.touched.description && formik.errors.description}
              sx={{ mb: 2 }}
            />

            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={enUS}>
              <DateTimePicker
                label="Due Date"
                value={formik.values.dueDate}
                onChange={(value) => formik.setFieldValue('dueDate', value)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: formik.touched.dueDate && Boolean(formik.errors.dueDate),
                    helperText: formik.touched.dueDate && formik.errors.dueDate,
                    sx: { mb: 2 }
                  }
                }}
              />
            </LocalizationProvider>

            <TextField
              fullWidth
              id="maxScore"
              name="maxScore"
              label="Maximum Score"
              type="number"
              value={formik.values.maxScore}
              onChange={formik.handleChange}
              error={formik.touched.maxScore && Boolean(formik.errors.maxScore)}
              helperText={formik.touched.maxScore && formik.errors.maxScore}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" color="primary">
            {initialData ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AssignmentForm;
