import { Configuration, OpenAIApi } from 'openai';

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY
});

const openai = new OpenAIApi(configuration);

export default async function handler(req, res) {
    const conversationHistory = req.body.conversationHistory;
    const newMessage = req.body.newMessage;

    if (!newMessage || newMessage === '') {
        return res.status(400).json({ error: "Please send your message" });
    }

    const formattedPrompt = conversationHistory
        ? `${conversationHistory}\n${newMessage}`
        : newMessage;

    const aiResult = await openai.createCompletion({
        model: 'text-davinci-003',
        prompt: `${formattedPrompt}`,
        temperature: 0.9, // Higer values means the model will take more risks.
        max_tokens: 120,
        frequency_penalty: 0.5, // Number between -2.0 and 2.0.
        presence_penalty: 0 // Number between -2.0 and 2.0.
    });

    const response = aiResult.data.choices[0].text?.trim() || 'Sorry, there was a problem';
    res.status(200).json({ text: response });
}