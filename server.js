const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// API endpoints for different providers
const API_ENDPOINTS = {
    gemini: (model) => `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    openai: 'https://api.openai.com/v1/chat/completions',
    anthropic: 'https://api.anthropic.com/v1/messages',
};

// Format messages for different providers
function formatMessagesForProvider(provider, messages) {
    switch (provider) {
        case 'gemini':
            // Gemini wants a "contents" array with role and parts
            return {
                contents: messages.map(msg => ({
                    role: msg.role === 'assistant' ? 'model' : 'user',
                    parts: [{ text: msg.content }]
                }))
            };
        
        case 'openai':
            // OpenAI uses the standard format
            return {
                messages: messages,
                temperature: 0.7,
                max_tokens: 2000
            };
        
        case 'anthropic':
            // Claude needs system message separate and user/assistant alternating
            const systemMsg = messages.find(m => m.role === 'system');
            const conversationMsgs = messages.filter(m => m.role !== 'system');
            
            return {
                messages: conversationMsgs,
                max_tokens: 2000,
                ...(systemMsg && { system: systemMsg.content })
            };
        
        default:
            return { messages };
    }
}

// Extract response text from different provider formats
function extractResponseText(provider, data) {
    try {
        switch (provider) {
            case 'gemini':
                return data.candidates?.[0]?.content?.parts?.[0]?.text || 
                       'No response generated';
            
            case 'openai':
                return data.choices?.[0]?.message?.content || 
                       'No response generated';
            
            case 'anthropic':
                return data.content?.[0]?.text || 
                       'No response generated';
            
            case 'custom':
                // Try common response formats
                return data.response || 
                       data.message || 
                       data.text || 
                       data.choices?.[0]?.message?.content ||
                       data.content?.[0]?.text ||
                       JSON.stringify(data);
            
            default:
                return 'Unknown response format';
        }
    } catch (error) {
        console.error('Error extracting response:', error);
        return 'Error parsing response';
    }
}

// Main chat endpoint
app.post('/api/chat', async (req, res) => {
    try {
        const { provider, apiKey, model, messages, customEndpoint } = req.body;

        // Validation
        if (!provider || !apiKey || !messages) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: provider, apiKey, or messages'
            });
        }

        if (!Array.isArray(messages) || messages.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Messages must be a non-empty array'
            });
        }

        // Determine endpoint
        let endpoint;
        let headers = {
            'Content-Type': 'application/json'
        };
        let body;

        switch (provider) {
            case 'gemini':
                endpoint = API_ENDPOINTS.gemini(model || 'gemini-2.0-flash-exp');
                endpoint += `?key=${apiKey}`;
                body = formatMessagesForProvider('gemini', messages);
                break;

            case 'openai':
                endpoint = API_ENDPOINTS.openai;
                headers['Authorization'] = `Bearer ${apiKey}`;
                body = {
                    model: model || 'gpt-4o-mini',
                    ...formatMessagesForProvider('openai', messages)
                };
                break;

            case 'anthropic':
                endpoint = API_ENDPOINTS.anthropic;
                headers['x-api-key'] = apiKey;
                headers['anthropic-version'] = '2023-06-01';
                body = {
                    model: model || 'claude-3-5-sonnet-20241022',
                    ...formatMessagesForProvider('anthropic', messages)
                };
                break;

            case 'custom':
                if (!customEndpoint) {
                    return res.status(400).json({
                        success: false,
                        error: 'Custom endpoint required for custom provider'
                    });
                }
                endpoint = customEndpoint;
                headers['Authorization'] = `Bearer ${apiKey}`;
                body = formatMessagesForProvider('custom', messages);
                break;

            default:
                return res.status(400).json({
                    success: false,
                    error: `Unsupported provider: ${provider}`
                });
        }

        // Make API call
        console.log(`Making request to ${provider} API...`);
        const apiResponse = await fetch(endpoint, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(body)
        });

        const responseData = await apiResponse.json();

        if (!apiResponse.ok) {
            console.error(`API Error (${apiResponse.status}):`, responseData);
            
            // Format error message based on provider
            let errorMessage = 'API request failed';
            if (responseData.error) {
                errorMessage = typeof responseData.error === 'string' 
                    ? responseData.error 
                    : responseData.error.message || JSON.stringify(responseData.error);
            }
            
            return res.status(apiResponse.status).json({
                success: false,
                error: errorMessage
            });
        }

        // Extract and return response
        const responseText = extractResponseText(provider, responseData);
        
        console.log(`Successfully got response from ${provider}`);
        res.json({
            success: true,
            response: responseText
        });

    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Internal server error'
        });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        message: 'Goldphin AI Backend is running!',
        timestamp: new Date().toISOString()
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: '🐬 Goldphin AI Backend Server',
        version: '1.0.0',
        endpoints: {
            chat: 'POST /api/chat',
            health: 'GET /health'
        }
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════╗
║   🐬 Goldphin AI Backend Server      ║
║   Running on http://localhost:${PORT}  ║
╚═══════════════════════════════════════╝
    `);
    console.log('✓ Server is ready to handle requests');
    console.log('✓ CORS enabled for all origins');
    console.log('✓ Supported providers: Gemini, OpenAI, Claude, Custom\n');
});

// Error handling
process.on('unhandledRejection', (error) => {
    console.error('Unhandled Rejection:', error);
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});
