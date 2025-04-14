# BOTDISCORD

Este proyecto es un bot avanzado para Discord que incluye funcionalidades como reproducción de música, moderación, autenticación, integración con APIs externas y procesamiento de lenguaje natural (IA). Está diseñado para ser modular, escalable y fácil de configurar.

## Tecnologías utilizadas

- **Node.js**: Entorno de ejecución para JavaScript.
- **Discord.js**: Librería para interactuar con la API de Discord.
- **Discord Player**: Manejo avanzado de reproducción de música.
- **dotenv**: Gestión de variables de entorno.
- **Google Generative AI**: Procesamiento de lenguaje natural.
- **discord-tts**: Generación de texto a voz.
- **ytdl-core** y **play-dl**: Descarga y manejo de contenido de YouTube.
- **ffmpeg-static**: Procesamiento de audio.
- **@discord-player/extractor**: Soporte para múltiples plataformas de música (YouTube, Spotify, Deezer, etc.).

## Estructura del proyecto

```
BOTDISCORD
├── src/
│   ├── commands/                  # Comandos de administración y música
│   │   ├── music/                 # Comandos para música (YouTube, Spotify, Deezer)
│   │   │   ├── play.js           # Comando para reproducir música
│   │   │   └── skip.js           # Comando para saltar canción
│   │   ├── moderation/           # Comandos de moderación
│   │   │   ├── ban.js            # Comando para banear usuarios
│   │   │   └── warn.js           # Comando para advertir usuarios
│   │   ├── setup/                # Comandos de configuración (como crear canales)
│   │   │   └── createChannel.js  # Comando para crear canales automáticamente
│   │   └── auth/                 # Comandos de autenticación
│   │       └── verify.js         # Comando de verificación
│   ├── events/                   # Eventos como cuando un miembro se une
│   │   ├── guildMemberAdd.js     # Evento para manejar nuevos miembros
│   │   └── messageCreate.js      # Evento para detección de links maliciosos
│   ├── utils/                    # Funciones utilitarias
│   │   ├── youtube.js            # Funciones para manejar YouTube
│   │   ├── spotify.js            # Funciones para manejar Spotify
│   │   ├── deezer.js             # Funciones para manejar Deezer
│   │   └── linkDetection.js      # Funciones para detección de links maliciosos
│   ├── ai/                       # Implementación de AI para lenguaje natural
│   │   └── nlp.js                # Funciones para manejar IA con lenguaje natural
│   └── config/                   # Archivos de configuración
│       ├── config.json           # Información sensible como token y roles
│       └── configAI.json         # Configuración para AI (si usas APIs)
│
├── package.json                  # Dependencias del proyecto
└── README.md                     # Documentación del proyecto

```

## Funcionalidades principales

### Música

- Reproducción de música desde YouTube, Spotify y Deezer.
- Comandos como `play`, `skip`, `stop`, `queue`, `volume`, `resume`.
- Manejo de listas de reproducción y búsqueda avanzada.
- Historial de canciones reproducidas.

### Moderación

- Comandos para banear (`ban`) y advertir (`warn`) usuarios.
- Detección y eliminación de enlaces maliciosos en mensajes.

### Configuración

- Creación automática de canales de voz.
- Eliminación de canales vacíos creados por el bot.

### Autenticación

- Verificación de usuarios mediante códigos únicos.

### Inteligencia Artificial

- Procesamiento de lenguaje natural con Google Generative AI.
- Comando `chat` para interactuar con la IA.

### Eventos

- Respuesta a eventos como nuevos miembros (`guildMemberAdd`) y mensajes (`messageCreate`).

## Dependencias

- **@discordjs/voice**: Manejo de canales de voz.
- **@discord-player/extractor**: Soporte para múltiples plataformas de música.
- **discord-tts**: Generación de texto a voz.
- **ytdl-core** y **play-dl**: Descarga y manejo de contenido multimedia.
- **dotenv**: Gestión de variables de entorno.
- **@google/generative-ai**: Procesamiento de lenguaje natural.

## Configuración

1. Clona este repositorio:

   ```bash
   git clone https://github.com/DARKTOTEM2703/BOTDISCORD
   cd BOTDISCORD
   ```

2. Instala las dependencias:

   ```bash
   npm install
   ```

3. Configura las variables de entorno en un archivo `.env`:

   ```
   DISCORD_TOKEN=tu_token_de_discord
   CLIENT_ID=tu_id_de_cliente
   GUILD_ID=tu_id_del_servidor
   GOOGLE_AI_API_KEY=tu_api_key_de_google
   ```

4. Inicia el bot:
   ```bash
   npm start
   ```

## Scripts disponibles

- `npm start`: Inicia el bot.
- `npm run deploy`: Registra los comandos slash en Discord.
- `npm run dev`: Ejecuta el bot y registra comandos simultáneamente.

## Contribución

Si deseas contribuir, por favor abre un issue o envía un pull request con tus cambios.

## Licencia

Este proyecto está bajo la licencia MIT.
