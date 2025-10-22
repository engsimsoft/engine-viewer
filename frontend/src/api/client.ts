/**
 * API клиент для взаимодействия с backend
 * Base URL: /api (проксируется через Vite на http://localhost:3000)
 */

import axios, { AxiosError } from 'axios';
import type {
  ProjectInfo,
  EngineProject,
  ProjectMetadata,
  ProjectsListResponse,
  ProjectDetailsResponse,
} from '@/types';

// Создаём axios instance с базовой конфигурацией
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 секунд таймаут
});

// ====================================================================
// Error Handling
// ====================================================================

/**
 * Обработка ошибок API
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public originalError?: AxiosError
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Вспомогательная функция для обработки ошибок
 */
function handleApiError(error: unknown): never {
  if (axios.isAxiosError(error)) {
    const statusCode = error.response?.status;
    const message = error.response?.data?.error || error.message;
    throw new ApiError(message, statusCode, error);
  }
  throw new ApiError('Неизвестная ошибка при запросе к API');
}

// ====================================================================
// Projects API
// ====================================================================

/**
 * Получить список всех проектов
 */
export async function getProjects(): Promise<ProjectInfo[]> {
  try {
    const { data } = await api.get<ProjectsListResponse>('/projects');
    return data.projects;
  } catch (error) {
    handleApiError(error);
  }
}

/**
 * Получить детальные данные проекта
 */
export async function getProject(id: string): Promise<EngineProject> {
  try {
    const { data } = await api.get<ProjectDetailsResponse>(`/project/${id}`);
    return data.project;
  } catch (error) {
    handleApiError(error);
  }
}

// ====================================================================
// Metadata API
// ====================================================================

/**
 * Получить метаданные проекта
 * Возвращает null если метаданные не созданы
 */
export async function getMetadata(
  projectId: string
): Promise<ProjectMetadata | null> {
  try {
    const { data } = await api.get<ProjectMetadata>(
      `/projects/${projectId}/metadata`
    );
    return data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null; // Метаданные не найдены - это нормально
    }
    handleApiError(error);
  }
}

/**
 * Сохранить метаданные проекта
 */
export async function saveMetadata(
  projectId: string,
  metadata: Omit<ProjectMetadata, 'projectId' | 'createdAt' | 'updatedAt'>
): Promise<ProjectMetadata> {
  try {
    const { data } = await api.post<ProjectMetadata>(
      `/projects/${projectId}/metadata`,
      metadata
    );
    return data;
  } catch (error) {
    handleApiError(error);
  }
}

/**
 * Удалить метаданные проекта
 */
export async function deleteMetadata(projectId: string): Promise<void> {
  try {
    await api.delete(`/projects/${projectId}/metadata`);
  } catch (error) {
    handleApiError(error);
  }
}

// ====================================================================
// Health Check
// ====================================================================

/**
 * Проверка здоровья API (для тестирования соединения)
 */
export async function healthCheck(): Promise<boolean> {
  try {
    const { data } = await api.get('/health');
    return data.status === 'ok';
  } catch (error) {
    return false;
  }
}

// ====================================================================
// Export default API object
// ====================================================================

export const projectsApi = {
  getProjects,
  getProject,
  getMetadata,
  saveMetadata,
  deleteMetadata,
  healthCheck,
};

export default projectsApi;
