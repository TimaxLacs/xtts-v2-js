#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
XTTS-v2-JS Server
FastAPI сервер для синтеза речи с клонированием голоса на базе XTTS-v2
"""

import io
import logging
import os
import tempfile
from typing import Optional
from pathlib import Path

import torch
from TTS.api import TTS
from fastapi import FastAPI, Form, HTTPException
from fastapi.responses import Response
from functools import lru_cache

# Настройка логирования
log_file = os.environ.get('XTTS_V2_JS_LOG')
if log_file:
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(levelname)s - %(message)s',
        handlers=[
            logging.FileHandler(log_file, encoding='utf-8'),
            logging.StreamHandler()
        ]
    )
else:
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(levelname)s - %(message)s'
    )

logger = logging.getLogger(__name__)

# Создаем FastAPI приложение
app = FastAPI(
    title="XTTS-v2-JS API",
    description="API для синтеза речи с клонированием голоса на базе XTTS-v2",
    version="1.0.0"
)

# Глобальная переменная для модели
MODEL = None
DEVICE = "cpu"  # Используем CPU по умолчанию

# Поддерживаемые языки
SUPPORTED_LANGUAGES = [
    "en", "es", "fr", "de", "it", "pt", "pl", "tr", 
    "ru", "nl", "cs", "ar", "zh-cn", "ja", "hu", "ko"
]

def load_model():
    """Загрузка модели XTTS-v2"""
    global MODEL
    
    if MODEL is not None:
        logger.info("Модель уже загружена")
        return MODEL
    
    try:
        logger.info("Загрузка модели XTTS-v2...")
        logger.info(f"Используется устройство: {DEVICE}")
        
        # Загружаем модель XTTS-v2
        MODEL = TTS(model_name="tts_models/multilingual/multi-dataset/xtts_v2", progress_bar=False)
        
        logger.info("✅ Модель XTTS-v2 успешно загружена")
        return MODEL
    except Exception as e:
        logger.error(f"❌ Ошибка загрузки модели: {e}")
        raise


def generate_speech(text: str, language: str, speaker_wav: Optional[str] = None) -> bytes:
    """
    Генерация речи с использованием XTTS-v2
    
    Args:
        text: Текст для синтеза
        language: Код языка (ru, en, es и т.д.)
        speaker_wav: Путь к референсному аудиофайлу для клонирования голоса
    
    Returns:
        bytes: Аудио в формате WAV
    """
    logger.info(f"Генерация речи: текст='{text[:50]}...', язык='{language}', референс={speaker_wav is not None}")
    
    try:
        # Загружаем модель если еще не загружена
        model = load_model()
        
        # Создаем временный файл для результата
        with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as tmp_file:
            temp_path = tmp_file.name
        
        try:
            # XTTS-v2 требует обязательного указания speaker_wav
            if not speaker_wav or not os.path.exists(speaker_wav):
                raise ValueError("XTTS-v2 требует референсный аудиофайл для клонирования голоса. Укажите параметр reference_audio_path.")
            
            logger.info(f"Использование референсного аудио: {speaker_wav}")
            model.tts_to_file(
                text=text,
                speaker_wav=speaker_wav,
                language=language,
                file_path=temp_path
            )
            
            # Читаем сгенерированный аудиофайл
            with open(temp_path, 'rb') as f:
                audio_data = f.read()
            
            logger.info(f"✅ Речь успешно сгенерирована, размер: {len(audio_data)} байт")
            return audio_data
            
        finally:
            # Удаляем временный файл
            if os.path.exists(temp_path):
                os.unlink(temp_path)
                
    except Exception as e:
        logger.error(f"❌ Ошибка генерации речи: {e}")
        raise


@app.get("/")
@app.get("/health")
async def health_check():
    """Проверка здоровья сервера"""
    return {
        "status": "ok",
        "model": "XTTS-v2",
        "device": DEVICE
    }


@app.get("/info")
async def model_info():
    """Получение информации о модели"""
    return {
        "model_name": "XTTS-v2",
        "model_type": "Text-to-Speech with Voice Cloning",
        "provider": "Coqui TTS",
        "device": DEVICE,
        "supported_languages": SUPPORTED_LANGUAGES,
        "features": [
            "Voice cloning from 6-second audio sample",
            "Multi-language support (17 languages)",
            "High-quality 24kHz audio output",
            "Emotion and style transfer"
        ]
    }


@app.get("/languages")
async def get_languages():
    """Получение списка поддерживаемых языков"""
    return {
        "languages": SUPPORTED_LANGUAGES,
        "count": len(SUPPORTED_LANGUAGES)
    }


@app.post("/tts")
async def tts_endpoint(
    text: str = Form(..., description="Текст для синтеза речи"),
    reference_audio_path: Optional[str] = Form(None, description="Путь к референсному аудиофайлу для клонирования голоса"),
    language: Optional[str] = Form("ru", description="Код языка (ru, en, es, fr, de и т.д.)")
):
    """
    Эндпоинт для генерации речи
    
    Args:
        text: Текст для синтеза
        reference_audio_path: Путь к WAV файлу для клонирования голоса (опционально)
        language: Код языка (по умолчанию 'ru')
    
    Returns:
        WAV аудиофайл
    """
    logger.info(f"📥 Получен запрос: текст='{text[:50]}...', язык='{language}', референс='{reference_audio_path}'")
    
    # Валидация входных данных
    if not text or len(text.strip()) == 0:
        raise HTTPException(status_code=400, detail="Текст не может быть пустым")
    
    if len(text) > 5000:
        raise HTTPException(status_code=400, detail="Текст слишком длинный (максимум 5000 символов)")
    
    # Проверяем язык
    if language not in SUPPORTED_LANGUAGES:
        logger.warning(f"⚠️  Неподдерживаемый язык: {language}, используем 'ru'")
        language = "ru"
    
    # Проверяем референсный аудиофайл если указан
    if reference_audio_path:
        if not os.path.exists(reference_audio_path):
            raise HTTPException(
                status_code=400, 
                detail=f"Референсный аудиофайл не найден: {reference_audio_path}"
            )
        
        # Проверяем расширение файла
        if not reference_audio_path.lower().endswith('.wav'):
            raise HTTPException(
                status_code=400,
                detail="Референсный аудиофайл должен быть в формате WAV"
            )
    
    try:
        # Генерируем речь
        audio_data = generate_speech(text, language, reference_audio_path)
        
        # Возвращаем аудиофайл
        return Response(
            content=audio_data,
            media_type="audio/wav",
            headers={
                "Content-Disposition": "attachment; filename=output.wav",
                "X-Generated-By": "XTTS-v2-JS"
            }
        )
    
    except Exception as e:
        logger.error(f"❌ Ошибка обработки запроса: {e}")
        raise HTTPException(status_code=500, detail=f"Ошибка генерации речи: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    
    # Получаем порт из переменной окружения или используем 5000 по умолчанию
    port = int(os.environ.get("PORT", "5000"))
    
    logger.info("=" * 60)
    logger.info("🎤 XTTS-v2-JS Server")
    logger.info("=" * 60)
    logger.info(f"📡 Запуск сервера на http://0.0.0.0:{port}")
    logger.info(f"🖥️  Устройство: {DEVICE}")
    logger.info(f"🌍 Поддерживаемые языки: {', '.join(SUPPORTED_LANGUAGES)}")
    logger.info("=" * 60)
    
    # Запускаем сервер
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=port,
        log_level="info"
    )

