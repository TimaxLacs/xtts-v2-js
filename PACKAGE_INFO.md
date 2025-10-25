# 📦 XTTS-v2-JS - Информация о пакете

## 🎯 Что это?

**XTTS-v2-JS** - это NPM-пакет, который делает синтез речи с клонированием голоса таким же простым, как установка любого другого npm-пакета!

Аналогично тому, как **zonosjs** работает для модели Zonos, **xtts-v2-js** работает для модели XTTS-v2 от Coqui TTS.

## 🏗️ Архитектура

```
┌─────────────────────────────────────────┐
│         JavaScript/Node.js              │
│  ┌───────────────────────────────────┐  │
│  │   XTTSv2JS Client (index.js)     │  │
│  │   - generateSpeech()              │  │
│  │   - checkServer()                 │  │
│  │   - getModelInfo()                │  │
│  └───────────────┬───────────────────┘  │
└──────────────────┼──────────────────────┘
                   │ HTTP/REST API
                   │
┌──────────────────▼──────────────────────┐
│       Python FastAPI Server             │
│  ┌───────────────────────────────────┐  │
│  │   server.py                       │  │
│  │   - /tts (генерация речи)        │  │
│  │   - /health (проверка)           │  │
│  │   - /info (информация)           │  │
│  └───────────────┬───────────────────┘  │
│                  │                       │
│  ┌───────────────▼───────────────────┐  │
│  │   Coqui TTS XTTS-v2 Model        │  │
│  │   (PyTorch + transformers)       │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

## 📁 Структура пакета

```
xtts-v2-js/
├── 📄 package.json        # NPM пакет конфигурация
├── 📄 index.js            # JavaScript клиент
├── 📄 server.js           # Установщик + launcher сервера
├── 📄 server.py           # FastAPI сервер (Python)
├── 📄 example.js          # Пример использования
├── 📖 README.md           # Полная документация
├── 📖 QUICKSTART.md       # Быстрый старт
├── 📖 LICENSE             # MIT лицензия
└── 📖 .gitignore          # Git ignore файл
```

## 🔄 Как это работает

### 1️⃣ Установка (server.js)
```bash
npx xtts-v2-js serve
```
- ✅ Создает Python venv
- ✅ Устанавливает PyTorch (CPU)
- ✅ Устанавливает Coqui TTS
- ✅ Устанавливает FastAPI + uvicorn
- ✅ Запускает сервер на порту 5000

### 2️⃣ Сервер (server.py)
```python
# FastAPI эндпоинты:
GET  /health       # Проверка статуса
GET  /info         # Информация о модели
GET  /languages    # Список языков
POST /tts          # Генерация речи
```

### 3️⃣ Клиент (index.js)
```javascript
const client = new XTTSv2JS();

// Генерация речи
const audio = await client.generateSpeech(
    'Привет, мир!',
    './reference.wav',  // Опционально
    'ru'
);
```

## 🎨 API Эндпоинты

### POST /tts
**Генерация речи с опциональным клонированием голоса**

**Параметры:**
- `text` (string, обязательно) - Текст для синтеза
- `reference_audio_path` (string, опционально) - Путь к WAV для клонирования
- `language` (string, опционально) - Код языка (по умолчанию: ru)

**Ответ:** WAV аудиофайл

**Пример:**
```bash
curl -X POST http://localhost:5000/tts \
  -F "text=Привет, мир!" \
  -F "language=ru" \
  --output output.wav
```

### GET /health
**Проверка статуса сервера**

**Ответ:**
```json
{
  "status": "ok",
  "model": "XTTS-v2",
  "device": "cpu"
}
```

### GET /info
**Информация о модели**

**Ответ:**
```json
{
  "model_name": "XTTS-v2",
  "model_type": "Text-to-Speech with Voice Cloning",
  "provider": "Coqui TTS",
  "device": "cpu",
  "supported_languages": ["ru", "en", "es", ...],
  "features": [...]
}
```

### GET /languages
**Список поддерживаемых языков**

**Ответ:**
```json
{
  "languages": ["ru", "en", "es", "fr", ...],
  "count": 17
}
```

## 🌟 Особенности

### ✅ Что умеет
- 🎤 Клонирование голоса из 6-секундного образца
- 🌍 17 языков (включая русский)
- 🎵 24kHz качество аудио
- 🔥 Передача эмоций и стиля
- 🚀 Простая установка и использование
- 💻 Работает локально (не требует интернета после установки)

### 📊 Производительность
- **CPU**: 8-11x Real-time factor (~40-80 секунд на предложение)
- **GPU (RTX 3080+)**: 50-100x Real-time factor (~1-5 секунд)

### 💾 Требования
- **Место на диске**: ~3-4 ГБ
- **Python**: 3.9-3.11
- **Node.js**: >=14.0.0
- **RAM**: 4+ ГБ рекомендуется

## 🆚 Сравнение с zonosjs

| Аспект | zonosjs | xtts-v2-js |
|--------|---------|------------|
| Модель | Zonos | XTTS-v2 |
| Языков | ? | 17 |
| Качество | ? | 24kHz |
| Клонирование | ✅ | ✅ |
| Установка | Auto | Auto |
| API | FastAPI | FastAPI |
| Клиент | JS | JS |
| Лицензия | ? | MIT |

## 🚀 Примеры использования

### Базовая генерация
```javascript
const audio = await client.generateSpeech(
    'Привет!',
    null,
    'ru'
);
```

### С клонированием голоса
```javascript
const audio = await client.generateSpeech(
    'Это мой голос!',
    './my_voice.wav',
    'ru'
);
```

### Мультиязычность
```javascript
const texts = {
    ru: 'Привет, мир!',
    en: 'Hello, world!',
    es: '¡Hola, mundo!'
};

for (const [lang, text] of Object.entries(texts)) {
    const audio = await client.generateSpeech(text, null, lang);
    fs.writeFileSync(`output_${lang}.wav`, audio);
}
```

## 📝 Лицензия

MIT License - свободное использование в коммерческих и некоммерческих проектах.

## 🔗 Ссылки

- 📦 NPM: (будет опубликовано)
- 🐙 GitHub: (будет опубликовано)
- 📖 Документация: См. README.md
- 🎤 Coqui TTS: https://github.com/coqui-ai/TTS

---

**Версия:** 1.0.0  
**Дата:** 2025  
**Автор:** Ваше имя  
**Статус:** ✅ Готов к использованию

