import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

/**
 * XTTS-v2-JS - Клиент для взаимодействия с локальным сервером XTTS-v2
 */
class XTTSv2JS {
    /**
     * @param {string} serverUrl - URL сервера (по умолчанию http://localhost:5000)
     */
    constructor(serverUrl = 'http://localhost:5000') {
        this.serverUrl = serverUrl;
    }

    /**
     * Проверяет, запущен ли сервер
     * @returns {Promise<boolean>}
     */
    async checkServer() {
        try {
            const response = await axios.get(`${this.serverUrl}/health`, { timeout: 2000 });
            return response.data.status === 'ok';
        } catch (error) {
            return false;
        }
    }

    /**
     * Генерирует речь с клонированием голоса
     * @param {string} text - Текст для синтеза
     * @param {string|null} referenceAudioPath - Путь к референсному аудиофайлу для клонирования голоса (опционально)
     * @param {string|null} language - Код языка (ru, en, es, fr, de, и т.д.) (опционально, по умолчанию определяется автоматически)
     * @returns {Promise<Buffer>} - Аудио в формате WAV
     */
    async generateSpeech(text, referenceAudioPath = null, language = null) {
        // Проверяем, запущен ли сервер
        if (!(await this.checkServer())) {
            throw new Error(
                'Сервер XTTS-v2-JS не запущен. Запустите его с помощью "npx xtts-v2-js serve" в отдельном терминале.'
            );
        }

        // Создаем форму для отправки данных
        const form = new FormData();
        form.append('text', text);
        
        if (referenceAudioPath) {
            // Проверяем существование файла
            if (!fs.existsSync(referenceAudioPath)) {
                throw new Error(`Референсный аудиофайл не найден: ${referenceAudioPath}`);
            }
            form.append('reference_audio_path', referenceAudioPath);
        }
        
        if (language) {
            form.append('language', language);
        }

        try {
            const response = await axios.post(`${this.serverUrl}/tts`, form, {
                headers: form.getHeaders(),
                responseType: 'arraybuffer',
                timeout: 300000 // 5 минут таймаут для генерации
            });
            return Buffer.from(response.data);
        } catch (error) {
            if (error.response) {
                throw new Error(`Ошибка генерации речи: ${error.response.status} - ${error.response.statusText}`);
            } else if (error.request) {
                throw new Error('Ошибка генерации речи: Нет ответа от сервера');
            } else {
                throw new Error(`Ошибка генерации речи: ${error.message}`);
            }
        }
    }

    /**
     * Получает список доступных языков
     * @returns {Promise<Array<string>>}
     */
    async getAvailableLanguages() {
        if (!(await this.checkServer())) {
            throw new Error('Сервер XTTS-v2-JS не запущен.');
        }

        try {
            const response = await axios.get(`${this.serverUrl}/languages`);
            return response.data.languages;
        } catch (error) {
            throw new Error(`Ошибка получения списка языков: ${error.message}`);
        }
    }

    /**
     * Получает информацию о модели
     * @returns {Promise<Object>}
     */
    async getModelInfo() {
        if (!(await this.checkServer())) {
            throw new Error('Сервер XTTS-v2-JS не запущен.');
        }

        try {
            const response = await axios.get(`${this.serverUrl}/info`);
            return response.data;
        } catch (error) {
            throw new Error(`Ошибка получения информации о модели: ${error.message}`);
        }
    }
}

export default XTTSv2JS;

