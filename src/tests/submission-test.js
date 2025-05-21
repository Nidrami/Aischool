// Test script for assignment submission flow
// Run this in the browser console when on the AssignmentSubmissionPage

// Mock assignment data for testing
const mockAssignment = {
  id: 1,
  title: "Test Assignment",
  description: "This is a test assignment",
  maxScore: 100,
  questions: [
    {
      id: 1,
      text: "What is 2+2?",
      score: 25,
      options: [
        { id: 1, text: "3", correct: false },
        { id: 2, text: "4", correct: true },
        { id: 3, text: "5", correct: false }
      ]
    },
    {
      id: 2,
      text: "What is the capital of France?",
      score: 25,
      options: [
        { id: 4, text: "London", correct: false },
        { id: 5, text: "Paris", correct: true },
        { id: 6, text: "Berlin", correct: false }
      ]
    },
    {
      id: 3,
      text: "Which planet is closest to the sun?",
      score: 25,
      options: [
        { id: 7, text: "Venus", correct: false },
        { id: 8, text: "Mercury", correct: true },
        { id: 9, text: "Earth", correct: false }
      ]
    },
    {
      id: 4,
      text: "What is the largest mammal?",
      score: 25,
      options: [
        { id: 10, text: "Elephant", correct: false },
        { id: 11, text: "Blue Whale", correct: true },
        { id: 12, text: "Giraffe", correct: false }
      ]
    }
  ]
};

// Mock submission data
const mockSubmission = {
  assignmentId: 1,
  studentId: 1,
  selectedOptionIds: [2, 5, 8, 11] // All correct answers
};

// Test function to simulate submission
async function testSubmission() {
  console.log("Testing assignment submission...");
  
  try {
    // Get the current user token from localStorage
    const token = localStorage.getItem('token');
    if (!token) {
      console.error("No authentication token found. Please log in first.");
      return;
    }
    
    // Make the API call
    const response = await fetch('/api/submissions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(mockSubmission)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    console.log("Submission result:", result);
    
    // Check if score is present
    if (result.score !== undefined) {
      console.log(`Score: ${result.score} out of ${mockAssignment.maxScore}`);
      console.log(`Percentage: ${(result.score / mockAssignment.maxScore * 100).toFixed(1)}%`);
    } else {
      console.error("No score returned in the submission result!");
    }
    
    // Check if feedback is present
    if (result.feedback) {
      console.log(`Feedback: ${result.feedback}`);
    } else {
      console.warn("No feedback returned in the submission result.");
    }
    
    return result;
  } catch (error) {
    console.error("Error testing submission:", error);
    throw error;
  }
}

// Test function for partial correct answers
async function testPartialSubmission() {
  console.log("Testing partial correct submission...");
  
  const partialSubmission = {
    ...mockSubmission,
    selectedOptionIds: [2, 4, 8, 11] // 3 correct, 1 wrong
  };
  
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error("No authentication token found. Please log in first.");
      return;
    }
    
    const response = await fetch('/api/submissions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(partialSubmission)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    console.log("Partial submission result:", result);
    
    return result;
  } catch (error) {
    console.error("Error testing partial submission:", error);
    throw error;
  }
}

// Instructions for use
console.log(`
=== Assignment Submission Test ===
To test a perfect submission (all answers correct):
  testSubmission()

To test a partial submission (3/4 answers correct):
  testPartialSubmission()

Run these functions in the browser console when logged in as a student.
`);
