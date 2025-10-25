# XTTS-v2-JS

**XTTS-v2-JS** is an NPM package for running and interacting with a local XTTS-v2 server that implements text-to-speech (TTS) with voice cloning based on Coqui TTS XTTS-v2 model. The package automatically checks and installs necessary dependencies, providing a client for speech generation.

## 🌟 Features

- 🎤 **Voice Cloning** from a 6-second audio sample
- 🌍 **17 Languages** including Russian, English, Spanish, French, and more
- 🚀 **Simple Installation** - automatic installation of all dependencies
- 🔧 **Easy Integration** - works like a regular NPM package
- ⚡ **Local Execution** - no internet required after installation
- 🎵 **High Quality** - 24kHz audio with emotion transfer

## 📋 Requirements

- **Node.js** >= 14.0.0
- **Python** 3.9, 3.10, or 3.11
- **Disk Space**: ~3-4 GB

## 📦 Installation

### Global Installation (recommended)

```bash
npm install -g xtts-v2-js
```

### Local Installation

```bash
npm install xtts-v2-js
```

## 🚀 Quick Start

### 1. Start the Server

Open a terminal and start the server:

```bash
npx xtts-v2-js serve
```

The server will automatically:
- ✅ Create a Python virtual environment
- ✅ Install all necessary dependencies (PyTorch, Coqui TTS, etc.)
- ✅ Download the XTTS-v2 model
- ✅ Start on `http://localhost:5000`

**Note:** First run may take 5-10 minutes due to dependency installation.

### 2. Use in Your Code

Create a file `example.js`:

```javascript
import XTTSv2JS from 'xtts-v2-js';
import fs from 'fs';

const client = new XTTSv2JS();

// Generate speech with voice cloning
const audio = await client.generateSpeech(
    'Hello! This is a test of XTTS-v2 voice synthesis.',
    './reference.wav',  // Path to reference audio (required)
    'en'                // Language code
);

fs.writeFileSync('output.wav', audio);
console.log('✓ Audio saved to output.wav');
```

Run it:

```bash
node example.js
```

## 🎯 Usage Examples

### Basic Speech Generation

```javascript
import XTTSv2JS from 'xtts-v2-js';
import fs from 'fs';

const client = new XTTSv2JS();

const audio = await client.generateSpeech(
    'Hello, world!',
    './my_voice.wav',
    'en'
);

fs.writeFileSync('output.wav', audio);
```

### Multi-language Generation

```javascript
const languages = [
    { code: 'en', text: 'Hello, world!' },
    { code: 'es', text: '¡Hola, mundo!' },
    { code: 'fr', text: 'Bonjour, le monde!' },
    { code: 'de', text: 'Hallo, Welt!' },
    { code: 'ru', text: 'Привет, мир!' }
];

for (const lang of languages) {
    const audio = await client.generateSpeech(
        lang.text,
        './reference.wav',
        lang.code
    );
    
    fs.writeFileSync(`output_${lang.code}.wav`, audio);
    console.log(`✓ ${lang.code}: ${lang.text}`);
}
```

### Check Server Status

```javascript
const isRunning = await client.checkServer();

if (isRunning) {
    console.log('✓ Server is running');
} else {
    console.log('✗ Server is not running');
    console.log('Start it with: npx xtts-v2-js serve');
}
```

### Get Model Information

```javascript
const info = await client.getModelInfo();
console.log('Model:', info.model_name);
console.log('Languages:', info.supported_languages);
console.log('Features:', info.features);
```

### Get Available Languages

```javascript
const languages = await client.getAvailableLanguages();
console.log('Supported languages:', languages);
```

## 🎨 API

### Class `XTTSv2JS`

#### `constructor(serverUrl = 'http://localhost:5000')`

Creates a new client instance.

**Parameters:**
- `serverUrl` (string, optional) - Server URL (default: `http://localhost:5000`)

**Example:**
```javascript
const client = new XTTSv2JS();
// or with custom URL
const client = new XTTSv2JS('http://192.168.1.100:5000');
```

#### `async checkServer()`

Checks if the server is running.

**Returns:** `Promise<boolean>`

#### `async generateSpeech(text, referenceAudioPath, language)`

Generates speech with voice cloning.

**Parameters:**
- `text` (string) - Text to synthesize (required, max 5000 characters)
- `referenceAudioPath` (string) - Path to WAV file for voice cloning (required)
- `language` (string | null) - Language code: `ru`, `en`, `es`, `fr`, `de`, etc. (optional, default `ru`)

**Returns:** `Promise<Buffer>` - Audio in WAV format

**Note:** XTTS-v2 requires a reference audio file for voice cloning.

#### `async getAvailableLanguages()`

Gets the list of supported languages.

**Returns:** `Promise<Array<string>>`

#### `async getModelInfo()`

Gets information about the model.

**Returns:** `Promise<Object>`

## 🌍 Supported Languages

| Code | Language |
|------|----------|
| `ru` | Russian |
| `en` | English |
| `es` | Spanish |
| `fr` | French |
| `de` | German |
| `it` | Italian |
| `pt` | Portuguese |
| `pl` | Polish |
| `tr` | Turkish |
| `nl` | Dutch |
| `cs` | Czech |
| `ar` | Arabic |
| `zh-cn` | Chinese |
| `ja` | Japanese |
| `hu` | Hungarian |
| `ko` | Korean |

## ⚙️ Configuration

### Change Server Port

```bash
# Via argument
npx xtts-v2-js serve --port 8000

# Via environment variable
PORT=8000 npx xtts-v2-js serve
```

### Logging

Server logs are automatically saved to `server.log` in the project root. You can change the path:

```bash
XTTS_V2_JS_LOG=/path/to/custom.log npx xtts-v2-js serve
```

## 🎤 Voice Cloning Recommendations

For best voice cloning results:

1. **Audio Length**: 6-10 seconds (minimum 4 seconds)
2. **Quality**: Clean recording without background noise
3. **Format**: WAV, 16-bit or 24-bit, mono or stereo
4. **Content**: Natural speech with intonation
5. **Sample Rate**: 22050 Hz or higher

**Bad Examples:**
- ❌ Noisy recording
- ❌ Music in background
- ❌ Echo or reverb
- ❌ Too quiet
- ❌ Heavily compressed MP3

**Good Examples:**
- ✅ Studio recording
- ✅ Recording with good microphone
- ✅ Clean voice without background
- ✅ Normal volume

## 🚨 Troubleshooting

### Server Won't Start

```bash
# Check Python version
python3 --version  # Should be 3.9-3.11

# Check free space
df -h  # Need ~4 GB

# Remove virtual environment and try again
rm -rf .venv
npx xtts-v2-js serve
```

### Error "Server Not Running"

Make sure the server is running in a separate terminal:

```bash
# Terminal 1 - start server
npx xtts-v2-js serve

# Terminal 2 - run your script
node example.js
```

### Slow Generation

Generation on CPU can be slow. To speed up:
- Use shorter texts
- Consider using GPU version (requires NVIDIA GPU)

### Dependency Installation Errors

```bash
# Update pip
python3 -m pip install --upgrade pip

# Install system dependencies (Ubuntu/Debian)
sudo apt-get install python3-dev build-essential

# Install system dependencies (macOS)
brew install python@3.11
```

## 📄 License

MIT License - see [LICENSE](LICENSE) file

## 🙏 Acknowledgments

- [Coqui TTS](https://github.com/coqui-ai/TTS) - for the amazing XTTS-v2 model
- [FastAPI](https://fastapi.tiangolo.com/) - for excellent Python web framework

## 📞 Support

- 🐛 Report a bug: [GitHub Issues](https://github.com/TimaxLacs/xtts-v2-js/issues)
- 💡 Suggest improvement: [GitHub Discussions](https://github.com/TimaxLacs/xtts-v2-js/discussions)

## 🔗 Links

- [NPM Package](https://www.npmjs.com/package/xtts-v2-js)
- [GitHub Repository](https://github.com/TimaxLacs/xtts-v2-js)
- [Coqui TTS Documentation](https://tts.readthedocs.io/)
- [XTTS-v2 on Hugging Face](https://huggingface.co/coqui/XTTS-v2)

---

**Made with ❤️ for the developer community**
