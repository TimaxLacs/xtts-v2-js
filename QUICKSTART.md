# 🚀 Быстрый старт XTTS-v2-JS

## За 3 шага к синтезу речи с клонированием голоса!

### Шаг 1: Установка

```bash
npm install -g xtts-v2-js
# или локально в проект
npm install xtts-v2-js
```

### Шаг 2: Запуск сервера

Откройте терминал и запустите:

```bash
npx xtts-v2-js serve
```

**Первый запуск займет 5-10 минут** - устанавливаются PyTorch, Coqui TTS и другие зависимости.

✅ Готово! Сервер запущен на `http://localhost:5000`

### Шаг 3: Генерация речи

Создайте файл `test.js`:

```javascript
import XTTSv2JS from 'xtts-v2-js';
import fs from 'fs';

const client = new XTTSv2JS();

// Простая генерация
const audio = await client.generateSpeech(
    'Привет! Это синтез речи с XTTS-v2.',
    null,  // Без клонирования
    'ru'   // Русский язык
);

fs.writeFileSync('output.wav', audio);
console.log('✅ Готово! Файл output.wav создан');
```

Запустите:

```bash
node test.js
```

## 🎤 С клонированием голоса

```javascript
const audio = await client.generateSpeech(
    'Это клонированный голос!',
    './my_voice.wav',  // Ваш голос (6+ секунд)
    'ru'
);

fs.writeFileSync('cloned.wav', audio);
```

## 🌍 Поддерживаемые языки

`ru`, `en`, `es`, `fr`, `de`, `it`, `pt`, `pl`, `tr`, `nl`, `cs`, `ar`, `zh-cn`, `ja`, `hu`, `ko`

## ⚠️ Важно!

- Сервер должен быть **запущен в отдельном терминале**
- Первый запуск займет время - модель загружается (~1.7 ГБ)
- Для клонирования нужен **WAV файл 6+ секунд** чистой речи

## 📖 Подробная документация

См. [README.md](README.md) для полной документации и примеров.

---

Сделано с ❤️ | MIT License

