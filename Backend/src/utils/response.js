// @ts-nocheck

/**
 * Consistent response format across all endpoints
 */
const sendSuccess = (res, data, meta = {}, status = 200) => {
  res.status(status).json({
    success: true,
    data,
    ...(Object.keys(meta).length > 0 && { meta }),
  });
};

const sendError = (res, message, status = 400) => {
  res.status(status).json({
    success: false,
    error: message,
  });
};

module.exports = { sendSuccess, sendError };
