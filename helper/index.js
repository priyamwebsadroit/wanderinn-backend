let Helper = {};

//send response to client
Helper.response = (code, status, message, data = "", token = "") => {
    // console.log(code, status, message, data, token)
    let response = {};
    if (code) {
        response.code = code;
    }
    if (status) {
        response.status = status;
    }
    if (!status) {
        response.status = status;
    }
    if (message) {
        response.message = message;
    }
    if (data) {
        response.data = data;
    }
    if (token) {
        response.token = token;
    }
    return response;
};
module.exports = Helper;