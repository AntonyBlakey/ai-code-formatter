import axios, { AxiosError } from 'axios';
import dotenv from 'dotenv';

// Load environment variables from .env
dotenv.config();

const apiKey = process.env.OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

export async function formatSourceCode(languageName: string, sourceCode: string): Promise<string> {
    const systemMessage = `
        You are a helpful assistant that can format the source code of many different programming languages.
        Your response will be an object with a key of 'formattedCode' and the value being a string containing
        nothing but the formatted source code. Your response will not include any additional markup.
    `;

    const prompt = `Please format this ${languageName} source code:\n${sourceCode}`;

    try {
        const responseText = await callOpenAI(systemMessage, prompt);
        return JSON.parse(responseText).formattedCode;
    } catch (error) {
        console.error('Error formatting source code:', error);
        throw new Error('Failed to format source code');
    }
}

interface OpenAIResponse {
    choices: { message: { content: string } }[];
}

async function callOpenAI(systemMessage: string, prompt: string): Promise<string> {
    try {
        const response = await axios.post<OpenAIResponse>(
            OPENAI_API_URL,
            {
                model: 'gpt-4o-mini',
                messages: [
                    { role: 'system', content: systemMessage },
                    { role: 'user', content: prompt }
                ],
                max_tokens: 16000,
                temperature: 0.0
            },
            {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        return response.data.choices[0].message.content;
    } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
            handleAxiosError(error);
        } else {
            console.error('Unexpected error:', error);
        }
        throw new Error('Failed when calling OpenAI API.');
    }
}

function handleAxiosError(error: AxiosError): void {
    if (error.response) {
        console.error('Error response from OpenAI API:', error.response.data);
        console.error('Status code:', error.response.status);
        console.error('Headers:', error.response.headers);
    } else if (error.request) {
        console.error('No response received from OpenAI API:', error.request);
    } else {
        console.error('Error in setting up request:', error.message);
    }
}