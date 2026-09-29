// Authentication service
// Currently uses mock data. Will be replaced with Firebase later.

const MOCK_USERS = {
  'patient@example.com': {
    id: 'patient-1',
    email: 'patient@example.com',
    password: 'password123',
    role: 'patient',
    name: 'Nomsa Dlamini',
  },
  'clinician@example.com': {
    id: 'clinician-1',
    email: 'clinician@example.com',
    password: 'password123',
    role: 'clinician',
    name: 'Dr. Mokoena',
  },
};

// Simulate async API calls
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const authService = {
  // Login with email and password
  login: async (email, password) => {
    await delay(500); // Simulate network delay
    
    const user = MOCK_USERS[email];
    
    if (!user || user.password !== password) {
      throw new Error('Invalid email or password');
    }

    // Store in localStorage (mock session)
    const userData = { id: user.id, email: user.email, role: user.role, name: user.name };
    localStorage.setItem('medilink_user', JSON.stringify(userData));
    
    return userData;
  },

  // Register new user
  register: async (email, password, name, role) => {
    await delay(500);
    
    if (MOCK_USERS[email]) {
      throw new Error('Email already registered');
    }

    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    // Create new mock user
    const newUser = {
      id: `user-${Date.now()}`,
      email,
      password,
      role,
      name,
    };

    MOCK_USERS[email] = newUser;

    // Store in localStorage
    const userData = { id: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name };
    localStorage.setItem('medilink_user', JSON.stringify(userData));
    
    return userData;
  },

  // Get current user from localStorage
  getCurrentUser: () => {
    const stored = localStorage.getItem('medilink_user');
    return stored ? JSON.parse(stored) : null;
  },

  // Logout
  logout: () => {
    localStorage.removeItem('medilink_user');
  },

  // Check if user is logged in
  isAuthenticated: () => {
    return localStorage.getItem('medilink_user') !== null;
  },
};