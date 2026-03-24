export const sendSuccess = (res, status = 200, data = null) => {
    return res.status(status).json({
        success: true,
        data
    });
};

export const sendError = (res, status = 500, message = 'Server error') => {
    return res.status(status).json({
        success: false,
        error: message
    });
};