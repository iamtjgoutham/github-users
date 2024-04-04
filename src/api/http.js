import axios from 'axios';

const baseURL = 'https://api.github.com'; // Base URL for GitHub API
const accessToken = process.env.REACT_APP_GITHUB_ACCESS_TOKEN;

const http = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${accessToken}`,
  },
});

export const get = async (url, params = {}) => {
  try {
    const response = await http.get(url, { params });
    return response.data;
  } catch (error) {
    throw new Error('Error making GET request: ' + error.message);
  }
};

export default http;
