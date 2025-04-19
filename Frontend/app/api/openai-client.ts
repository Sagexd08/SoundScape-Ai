import { OpenAI } from 'openai';

   // Function to get OpenAI client with proper error handling
   export function getOpenAIClient() {
     const apiKey = process.env.OPENAI_API_KEY;
     
     if (!apiKey) {
       // During build/SSR, throw a more friendly error
       if (typeof window === 'undefined') {
         console.warn('OpenAI API key is missing. Some AI features will be disabled.');
         // Return a mock client for build to succeed
         return {
           chat: {
             completions: {
               create: async () => {
                 return { 
                   choices: [{ message: { content: 'API key not configured' } }] 
                 };
               }
             }
           }
         } as unknown as OpenAI;
       }
       
       // In browser, throw error as normal
       throw new Error('OpenAI API key is missing');
     }
     
     return new OpenAI({ apiKey });
   }