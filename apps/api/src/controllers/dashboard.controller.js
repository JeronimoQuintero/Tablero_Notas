import { metrics } from '../services/dashboard.service.js'; export const getMetrics = async (req, res, next) => { try { res.json(await metrics()); } catch (error) { next(error); } };
