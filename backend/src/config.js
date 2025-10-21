/**
 * Configuration Module
 *
 * Загружает и парсит config.yaml из корня проекта
 */

import fs from 'fs/promises';
import path from 'path';
import yaml from 'js-yaml';
import { fileURLToPath } from 'url';

// ES Module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * @typedef {Object} AppConfig
 * @property {Object} server
 * @property {number} server.port
 * @property {string} server.host
 * @property {Object} files
 * @property {string} files.path
 * @property {string[]} files.extensions
 * @property {boolean} files.scan_on_startup
 * @property {number} files.watch_interval
 * @property {Object} charts
 * @property {string} charts.theme
 * @property {boolean} charts.animation
 * @property {Object} ui
 * @property {number} ui.max_calculations_compare
 * @property {string} ui.default_preset
 * @property {Object} colors
 * @property {Object} table
 * @property {Object} advanced
 */

/**
 * Загрузить конфигурацию из config.yaml
 *
 * @returns {Promise<AppConfig>} Конфигурация приложения
 * @throws {Error} Если файл не найден или невалидный YAML
 */
export async function loadConfig() {
  try {
    // Путь к config.yaml (в корне проекта, на уровень выше backend/)
    const configPath = path.join(__dirname, '..', '..', 'config.yaml');

    // Читаем файл
    const fileContents = await fs.readFile(configPath, 'utf8');

    // Парсим YAML
    const config = yaml.load(fileContents);

    if (!config) {
      throw new Error('Config file is empty');
    }

    console.log('✅ Configuration loaded successfully');
    console.log(`   Data folder: ${config.files.path}`);
    console.log(`   Server: ${config.server.host}:${config.server.port}`);

    return config;
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new Error(`Config file not found: ${error.message}`);
    }
    throw new Error(`Failed to load config: ${error.message}`);
  }
}

/**
 * Получить абсолютный путь к папке с данными
 *
 * @param {AppConfig} config - Конфигурация приложения
 * @returns {string} Абсолютный путь к папке с .det файлами
 */
export function getDataFolderPath(config) {
  // Путь относительно корня проекта
  const projectRoot = path.join(__dirname, '..', '..');
  return path.join(projectRoot, config.files.path);
}

/**
 * Валидация конфигурации
 *
 * @param {AppConfig} config - Конфигурация для проверки
 * @throws {Error} Если конфигурация невалидна
 */
export function validateConfig(config) {
  const required = [
    'server.port',
    'server.host',
    'files.path',
    'files.extensions'
  ];

  for (const field of required) {
    const value = field.split('.').reduce((obj, key) => obj?.[key], config);
    if (value === undefined || value === null) {
      throw new Error(`Missing required config field: ${field}`);
    }
  }

  // Проверка типов
  if (typeof config.server.port !== 'number') {
    throw new Error('server.port must be a number');
  }

  if (!Array.isArray(config.files.extensions)) {
    throw new Error('files.extensions must be an array');
  }

  console.log('✅ Configuration validation passed');
}

// Default export
export default {
  loadConfig,
  getDataFolderPath,
  validateConfig
};
