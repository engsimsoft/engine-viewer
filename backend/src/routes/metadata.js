/**
 * Metadata Routes
 *
 * GET /api/projects/:id/metadata - Получить метаданные проекта
 * POST /api/projects/:id/metadata - Сохранить метаданные проекта
 * DELETE /api/projects/:id/metadata - Удалить метаданные проекта
 */

import express from 'express';
import { getMetadata, hasMetadata, saveMetadata, deleteMetadata } from '../services/metadataService.js';

const router = express.Router();

/**
 * GET /api/projects/:id/metadata
 * Получить метаданные для конкретного проекта
 *
 * Response:
 * - 200: { metadata: ProjectMetadata } - метаданные найдены
 * - 404: { error: 'Metadata not found' } - метаданные не существуют
 * - 500: { error: 'Server error' } - ошибка сервера
 */
router.get('/:id/metadata', async (req, res) => {
  try {
    const { id } = req.params;

    // Получаем метаданные
    const metadata = await getMetadata(id);

    if (!metadata) {
      return res.status(404).json({
        error: 'Metadata not found',
        message: `No metadata exists for project: ${id}`
      });
    }

    res.json({ metadata });
  } catch (error) {
    console.error('Error fetching metadata:', error);
    res.status(500).json({
      error: 'Failed to fetch metadata',
      message: error.message
    });
  }
});

/**
 * POST /api/projects/:id/metadata
 * Сохранить/обновить метаданные проекта
 *
 * Request Body: ProjectMetadata (без projectId, createdAt, updatedAt)
 * {
 *   description: string,
 *   client: string,
 *   tags: string[],
 *   notes: string,
 *   status: 'active' | 'completed' | 'archived',
 *   color: string
 * }
 *
 * Response:
 * - 200: { metadata: ProjectMetadata, created: boolean } - метаданные сохранены
 * - 400: { error: 'Invalid metadata' } - невалидные данные
 * - 500: { error: 'Server error' } - ошибка сервера
 */
router.post('/:id/metadata', async (req, res) => {
  try {
    const { id } = req.params;
    const metadataInput = req.body;

    // Проверить что переданы обязательные поля
    const requiredFields = ['description', 'client', 'tags', 'notes', 'status', 'color'];
    const missingFields = requiredFields.filter(field => !(field in metadataInput));

    if (missingFields.length > 0) {
      return res.status(400).json({
        error: 'Invalid metadata',
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    // Валидация status
    const validStatuses = ['active', 'completed', 'archived'];
    if (!validStatuses.includes(metadataInput.status)) {
      return res.status(400).json({
        error: 'Invalid metadata',
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    // Валидация tags (должен быть массив)
    if (!Array.isArray(metadataInput.tags)) {
      return res.status(400).json({
        error: 'Invalid metadata',
        message: 'Tags must be an array'
      });
    }

    // Проверить существовало ли уже
    const existed = await hasMetadata(id);

    // Сохранить метаданные
    const savedMetadata = await saveMetadata(id, metadataInput);

    res.json({
      metadata: savedMetadata,
      created: !existed // true если создано впервые, false если обновлено
    });
  } catch (error) {
    console.error('Error saving metadata:', error);
    res.status(500).json({
      error: 'Failed to save metadata',
      message: error.message
    });
  }
});

/**
 * DELETE /api/projects/:id/metadata
 * Удалить метаданные проекта
 *
 * Response:
 * - 204: No Content - метаданные успешно удалены
 * - 404: { error: 'Metadata not found' } - метаданные не существовали
 * - 500: { error: 'Server error' } - ошибка сервера
 */
router.delete('/:id/metadata', async (req, res) => {
  try {
    const { id } = req.params;

    // Удалить метаданные
    const deleted = await deleteMetadata(id);

    if (!deleted) {
      return res.status(404).json({
        error: 'Metadata not found',
        message: `No metadata exists for project: ${id}`
      });
    }

    // 204 No Content - успешное удаление без тела ответа
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting metadata:', error);
    res.status(500).json({
      error: 'Failed to delete metadata',
      message: error.message
    });
  }
});

export default router;
