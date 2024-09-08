import fs from 'fs/promises';
import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables from .env
dotenv.config();

const apiKey = process.env.OPENAI_API_KEY;

export async function formatSourceCode(languageName: string, sourceCode: string): Promise<string> {
    const systemMessage = `
    You are a helpful assistant that can format the source code of many different programming languages.
    Your reponse will be an object with a key of 'formattedCode' and the value being a string containing
    nothing but the formatted source code. Your response will not include any additional markup.
    `;

    const prompt = `
    Please format this ${languageName} source code:
    ${sourceCode}
    `;

    try {
        return JSON.parse(await callOpenAI('gpt-4o-mini', systemMessage, prompt)).formattedCode;
    } catch (error: any) {
        console.error('Error formatting source code:', error);
        throw new Error('Failed to format source code');
    }
}

async function callOpenAI(model: string, systemMessage: string, prompt: string, temperature: number = 0.0): Promise<string> {
    try {
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: model,
                messages: [
                    {
                        role: 'system',
                        content: systemMessage
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: 16000,
                temperature
            },
            {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        return response.data.choices[0].message.content;
    } catch (error: any) {
        if (error.response) {
            console.error('Error response from OpenAI API:', error.response.data);
            console.error('Status code:', error.response.status);
            console.error('Headers:', error.response.headers);
        } else if (error.request) {
            console.error('No response received from OpenAI API:', error.request);
        } else {
            console.error('Error in setting up request:', error.message);
        }

        throw new Error('Failed when calling OpenAI API.');
    }
}