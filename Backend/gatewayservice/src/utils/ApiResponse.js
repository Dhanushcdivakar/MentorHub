export class ApiResponse {
  constructor(statusCode, message, data = null) {
    this.statusCode = statusCode;

    this.status = `${statusCode}`.startsWith('2') ? 'success' : 'fail';

    this.message = message;

    if (data !== null) {
      this.data = data;
    }
  }
}
