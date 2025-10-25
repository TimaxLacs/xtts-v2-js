import XTTSv2JS from './index.js';
import fs from 'fs';

const client = new XTTSv2JS();

async function main() {
    try {
        console.log('🔍 Проверяем статус сервера...');
        const isRunning = await client.checkServer();
        
        if (!isRunning) {
            console.log('❌ Сервер не запущен!');
            console.log('📌 Запустите сервер в другом терминале:');
            console.log('   npx xtts-v2-js serve');
            process.exit(1);
        }
        
        console.log('✅ Сервер работает!\n');
        
        // Получаем информацию о модели
        console.log('📊 Получаем информацию о модели...');
        const info = await client.getModelInfo();
        console.log(`   Модель: ${info.model_name}`);
        console.log(`   Устройство: ${info.device}`);
        console.log(`   Языков: ${info.supported_languages.length}\n`);
        
        // Генерируем речь без клонирования голоса
        console.log('🎤 Генерируем речь (без клонирования)...');
        const audioBuffer1 = await client.generateSpeech(
            'Привет! Это тест синтеза речи с использованием модели XTTS-v2.',
            null,
            'ru'
        );
        
        fs.writeFileSync('example_output1.wav', audioBuffer1);
        console.log('✅ Аудио сохранено в example_output1.wav\n');
        
        // Генерируем речь с клонированием голоса
        const referenceAudio = '/home/timax/projects/XTTS-v2-js/reference.wav';
        
        if (fs.existsSync(referenceAudio)) {
            console.log('🎤 Генерируем речь (с клонированием голоса)...');
            const audioBuffer2 = await client.generateSpeech(
                'Это клонированный голос. Звучит реалистично, не правда ли?',
                referenceAudio,
                'ru'
            );
            
            fs.writeFileSync('example_output2.wav', audioBuffer2);
            console.log('✅ Аудио с клонированным голосом сохранено в example_output2.wav\n');
        } else {
            console.log('⚠️  Референсный аудиофайл не найден, пропускаем клонирование\n');
        }
        
        // Генерируем на английском
        console.log('🎤 Генерируем речь на английском...');
        const audioBuffer3 = await client.generateSpeech(
            'Hello! This is a test of XTTS-v2 voice synthesis.',
            null,
            'en'
        );
        
        fs.writeFileSync('example_output3.wav', audioBuffer3);
        console.log('✅ Английское аудио сохранено в example_output3.wav\n');
        
        console.log('🎉 Все тесты пройдены успешно!');
        console.log('🔊 Воспроизведите файлы для проверки качества');
        
    } catch (error) {
        console.error('❌ Ошибка:', error.message);
        process.exit(1);
    }
}

main();

