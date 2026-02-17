// Mock function to simulate waitlist submission
export const mockWaitlistSubmit = async (email) => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Store in localStorage for demo purposes
  const existingEmails = JSON.parse(localStorage.getItem('waitlist') || '[]');
  
  if (existingEmails.includes(email)) {
    throw new Error('Email already registered');
  }

  existingEmails.push(email);
  localStorage.setItem('waitlist', JSON.stringify(existingEmails));

  return {
    success: true,
    message: 'Successfully joined waitlist',
    email: email,
  };
};

// Mock function to get waitlist count
export const mockGetWaitlistCount = () => {
  const existingEmails = JSON.parse(localStorage.getItem('waitlist') || '[]');
  return existingEmails.length;
};
