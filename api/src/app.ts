import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { setupSwagger } from './config/swagger';

// Import routers
import authRoutes from './modules/auth/auth.routes';
import clientsRoutes from './modules/clients/clients.routes';
import sessionsRoutes from './modules/sessions/session.routes';
import bookingsRoutes from './modules/bookings/booking.routes';
import attendanceRoutes from './modules/attendance/attendance.routes';
import messageRoutes from './modules/messages/message.routes';
import adminRoutes from './modules/admin/admin.routes';
import trainerRoutes from './modules/trainers/trainer.routes';
import { errorHandler } from './middleware/error.middleware';

const app = express();

app.use(helmet());
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));

// Setup Swagger
setupSwagger(app);

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/clients', clientsRoutes);
app.use('/api/v1/sessions', sessionsRoutes);
app.use('/api/v1/bookings', bookingsRoutes);
app.use('/api/v1/attendance', attendanceRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/trainer', trainerRoutes);
app.use('/api/v1', messageRoutes);






// Basic health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// Error handling must be last
app.use(errorHandler);

export default app;
