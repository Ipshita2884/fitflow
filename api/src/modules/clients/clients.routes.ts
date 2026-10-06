import { Router } from 'express';
import { ClientsController } from './clients.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { createClientSchema, updateClientSchema, listClientsSchema, createAssessmentSchema, createMeasurementSchema, associateClientSchema, findClientSchema } from './clients.validators';

const router = Router();

router.use(authenticate);

router.post('/associate', validate(associateClientSchema), ClientsController.associate);
router.get('/find', validate(findClientSchema), ClientsController.find);
router.get('/:id/summary', ClientsController.getSummary);
router.get('/:id/activity', ClientsController.getActivity);
router.get('/:id/progress', ClientsController.getProgress);
router.get('/:id/progress/analytics', ClientsController.getProgressAnalytics);
router.post('/:id/assessments', validate(createAssessmentSchema), ClientsController.addAssessment);
router.post('/:id/measurements', validate(createMeasurementSchema), ClientsController.addMeasurement);


/**
 * @swagger
 * tags:
 *   name: Clients
 *   description: Client management
 */

/**
 * @swagger
 * /clients:
 *   get:
 *     summary: List clients for a trainer
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of clients
 */
router.get('/', validate(listClientsSchema), ClientsController.list);

/**
 * @swagger
 * /clients:
 *   post:
 *     summary: Create or associate a client
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - fullName
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               fullName:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       201:
 *         description: Client created
 */
router.post('/', validate(createClientSchema), ClientsController.create);

/**
 * @swagger
 * /clients/{id}:
 *   get:
 *     summary: Get client details
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Client details
 */
router.get('/:id', ClientsController.getOne);

/**
 * @swagger
 * /clients/{id}:
 *   patch:
 *     summary: Update client details
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *               phone:
 *                 type: string
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Client updated
 */
router.patch('/:id', validate(updateClientSchema), ClientsController.update);

/**
 * @swagger
 * /clients/{id}/archive:
 *   patch:
 *     summary: Archive a client
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Client archived
+ */
router.patch('/:id/archive', ClientsController.archive);
router.post('/:id/archive', ClientsController.archive);

/**
 * @swagger
 * /clients/{id}/restore:
 *   post:
 *     summary: Restore an archived client
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Client restored
 */
router.post('/:id/restore', ClientsController.restore);

export default router;
