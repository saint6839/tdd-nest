export class ApiResponseDto<T = any> {
  success: boolean;
  data?: T;
  message: string;

  constructor(success: boolean, message: string, data?: T) {
    this.success = success;
    this.message = message;
    this.data = data;
  }
}
