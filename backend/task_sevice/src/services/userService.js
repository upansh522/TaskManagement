import axios from "axios";

const USER_SERVICE_URL = process.env.USER_SERVICE_URL || "http://localhost:8001/api/v1";

class UserService {
  static async validateUser(userId, token) {
    try {
      const response = await axios.get(`${USER_SERVICE_URL}/user/${userId}`, {
        timeout: 5000,
        headers: {
          'Cookie': `token=${token}`
        }
      });
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        throw new Error("User not found");
      }
      throw new Error("User service unavailable");
    }
  }

  static async getUserById(userId) {
    try {
      const response = await axios.get(`${USER_SERVICE_URL}/user/${userId}`, {
        timeout: 5000
      });
      return response.data;
    } catch (error) {
      throw new Error("Failed to fetch user details");
    }
  }

  static async checkUserExists(userId) {
    try {
      await this.getUserById(userId);
      return true;
    } catch (error) {
      return false;
    }
  }
}

export default UserService;