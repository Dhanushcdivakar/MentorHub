import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import mentorshipRoutes from './mentorship.routes.js';
import bookRoutes from './book.routes.js';

export const setupRoutes = (app) => {
  app.use('/api/auth', authRoutes);

  app.use('/api/users', userRoutes);

  app.use('/api/mentorship', mentorshipRoutes);

  app.use('/api/books', bookRoutes);
};
