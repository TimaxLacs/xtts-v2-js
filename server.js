#!/usr/bin/env node
import { spawn, execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import minimist from 'minimist';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Установка Python зависимостей для XTTS-v2
 */
async function installPythonDependencies() {
    try {
        const projectRoot = process.cwd(); // Корень проекта
        const venvPath = path.join(projectRoot, '.venv'); // Путь к виртуальному окружению
        const venvPython = path.join(venvPath, 'bin', 'python'); // Путь к Python в venv
        const pipEnv = { ...process.env, PIP_NO_CACHE_DIR: '1' };

        console.log('🚀 Начинаем установку зависимостей для XTTS-v2-JS...\n');

        // Проверяем наличие Python
        try {
            execSync('python3 --version', { stdio: 'pipe' });
        } catch (error) {
            throw new Error('Python 3 не найден. Установите Python 3.9-3.11');
        }

        // Создаём виртуальное окружение, если его нет
        if (!fs.existsSync(venvPath)) {
            console.log('📦 Создаём виртуальное окружение...');
            execSync(`python3 -m venv ${venvPath}`, { stdio: 'inherit' });
            console.log('✅ Виртуальное окружение создано\n');
        } else {
            console.log('✅ Виртуальное окружение уже существует\n');
        }

        // Обновляем pip
        console.log('⬆️  Обновляем pip...');
        execSync(`${venvPython} -m pip install --upgrade pip --no-cache-dir`, { 
            stdio: 'inherit', 
            env: pipEnv 
        });
        console.log('✅ pip обновлен\n');

        // Устанавливаем PyTorch CPU версию (легче и быстрее для установки)
        console.log('🔥 Устанавливаем PyTorch (CPU версия)...');
        console.log('   Это может занять несколько минут...');
        execSync(
            `${venvPython} -m pip install --no-cache-dir torch==2.1.2 torchaudio==2.1.2 --index-url https://download.pytorch.org/whl/cpu`,
            { stdio: 'inherit', env: pipEnv }
        );
        console.log('✅ PyTorch установлен\n');

        // Устанавливаем TTS (Coqui TTS)
        console.log('🎤 Устанавливаем Coqui TTS...');
        console.log('   Это может занять несколько минут...');
        execSync(`${venvPython} -m pip install --no-cache-dir TTS`, { 
            stdio: 'inherit', 
            env: pipEnv 
        });
        console.log('✅ Coqui TTS установлен\n');

        // Понижаем версию transformers для совместимости
        console.log('🔧 Настраиваем совместимость библиотек...');
        execSync(`${venvPython} -m pip install --no-cache-dir transformers==4.44.0`, { 
            stdio: 'inherit', 
            env: pipEnv 
        });
        console.log('✅ Библиотеки настроены\n');

        // Устанавливаем FastAPI и uvicorn для сервера
        console.log('🌐 Устанавливаем веб-сервер...');
        execSync(
            `${venvPython} -m pip install --no-cache-dir fastapi uvicorn python-multipart`,
            { stdio: 'inherit', env: pipEnv }
        );
        console.log('✅ Веб-сервер установлен\n');

        console.log('🎉 Все зависимости успешно установлены!\n');
    } catch (error) {
        console.error('❌ Ошибка установки зависимостей:', error.message);
        throw error;
    }
}

/**
 * Запуск сервера XTTS-v2
 */
async function serve() {
    try {
        const projectRoot = process.cwd(); // Корень проекта
        const venvPython = path.join(projectRoot, '.venv', 'bin', 'python'); // Путь к Python в venv
        
        // Определяем путь к server.py
        const localServerPy = path.join(projectRoot, 'server.py');
        const nodeModulesServerPy = path.join(projectRoot, 'node_modules', 'xtts-v2-js', 'server.py');
        const serverPath = fs.existsSync(localServerPy) ? localServerPy : nodeModulesServerPy;

        // Парсим аргументы командной строки
        const args = minimist(process.argv.slice(2));
        const port = Number(args.port || args.p || process.env.PORT || 5000);

        // Устанавливаем зависимости
        await installPythonDependencies();

        // Запускаем сервер
        console.log('🚀 Запускаем XTTS-v2 сервер...');
        console.log(`📡 Сервер будет доступен на http://localhost:${port}\n`);
        
        const env = { 
            ...process.env, 
            PORT: String(port),
            COQUI_TOS_AGREED: '1' // Автоматически принимаем лицензию
        };
        
        // Настраиваем логирование
        if (process.env.XTTS_V2_JS_LOG == null) {
            env.XTTS_V2_JS_LOG = path.join(projectRoot, 'server.log');
        }

        const serverProcess = spawn(venvPython, [serverPath], { 
            stdio: 'inherit', 
            env 
        });

        serverProcess.on('error', (err) => {
            console.error('❌ Ошибка запуска сервера:', err);
        });

        serverProcess.on('close', (code) => {
            if (code === 0) {
                console.log('✅ Сервер завершил работу');
            } else {
                console.log(`❌ Сервер завершился с кодом ${code}`);
            }
        });

        // Обработка сигналов для корректного завершения
        process.on('SIGINT', () => {
            console.log('\n👋 Останавливаем сервер...');
            serverProcess.kill('SIGINT');
        });

        process.on('SIGTERM', () => {
            console.log('\n👋 Останавливаем сервер...');
            serverProcess.kill('SIGTERM');
        });

    } catch (error) {
        console.error('❌ Ошибка:', error.message);
        process.exit(1);
    }
}

// Запускаем сервер
serve();

