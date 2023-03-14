import axios, { AxiosInstance } from 'axios';
import { appConfig } from './config';

export const httpClient: AxiosInstance = axios.create({
  baseURL: appConfig.apiUrl,
  timeout: 10000,
});
