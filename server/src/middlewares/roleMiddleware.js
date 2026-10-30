import { ApiError } from '../utils/apiError.js';
import { ROLES } from '../constants/roles.js';

export const restrictTo = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return next(
        ApiError.forbidden('You do not have permission to perform this action.')
      );
    }
    next();
  };
};

export const requireAdmin = restrictTo(ROLES.ADMIN);
