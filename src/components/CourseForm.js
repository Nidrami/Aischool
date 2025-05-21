import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';

const subjects = [
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'Computer Science',
  'Literature',
  'History',
  'Geography',
  'Art',
  'Music',
  'Physical Education',
  'Languages',
];

const levels = [
  'BEGINNER',
  'INTERMEDIATE',
  'ADVANCED',
];

const categories = [
  'REGULAR',
  'PREMIUM',
];

const CourseForm = ({ open, onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    thumbnailUrl: '',
    duration: '',
    level: 'BEGINNER',
    price: '',
    isActive: true,
    category: 'REGULAR'
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Convert numeric fields
    const submissionData = {
      ...formData,
      duration: parseInt(formData.duration),
      price: parseFloat(formData.price),
    };
    onSubmit(submissionData);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      subject: '',
      thumbnailUrl: '',
      duration: '',
      level: 'BEGINNER',
      price: '',
      isActive: true,
      category: 'REGULAR'
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {initialData ? 'Edit Course' : 'Create New Course'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                name="title"
                label="Course Title"
                required
                fullWidth
                value={formData.title}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="description"
                label="Description"
                required
                fullWidth
                multiline
                rows={4}
                value={formData.description}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Subject</InputLabel>
                <Select
                  name="subject"
                  value={formData.subject}
                  label="Subject"
                  onChange={handleChange}
                >
                  {subjects.map((subject) => (
                    <MenuItem key={subject} value={subject}>
                      {subject}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="thumbnailUrl"
                label="Thumbnail URL"
                fullWidth
                value={formData.thumbnailUrl}
                onChange={handleChange}
                helperText="Leave empty to use default thumbnail"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="duration"
                label="Duration (in hours)"
                required
                fullWidth
                type="number"
                value={formData.duration}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Level</InputLabel>
                <Select
                  name="level"
                  value={formData.level}
                  label="Level"
                  onChange={handleChange}
                >
                  {levels.map((level) => (
                    <MenuItem key={level} value={level}>
                      {level}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="price"
                label="Price"
                required
                fullWidth
                type="number"
                value={formData.price}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Category</InputLabel>
                <Select
                  name="category"
                  value={formData.category}
                  label="Category"
                  onChange={handleChange}
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Active</InputLabel>
                <Select
                  name="isActive"
                  value={formData.isActive}
                  label="Active"
                  onChange={handleChange}
                >
                  <MenuItem value={true}>Yes</MenuItem>
                  <MenuItem value={false}>No</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit" variant="contained" color="primary">
            {initialData ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CourseForm;
