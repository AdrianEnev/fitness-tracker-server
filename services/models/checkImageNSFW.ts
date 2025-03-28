import { HfInference } from "@huggingface/inference";
import dotenv from 'dotenv'
dotenv.config();

const apiToken = process.env.BACKEND_HUGGINGFACE_API_TOKEN;
const model = 'Falconsai/nsfw_image_detection';

const inference = new HfInference(apiToken);

const scanImage = async (uri: any) => {

    const blob = await uriToBlob(uri);

    const result = await inference.imageClassification({
        model: model,
        data: blob
    });
    
    return result
}

const uriToBlob = async (uri: string): Promise<Blob> => {
    const response = await fetch(uri);
    const blob = await response.blob();
    return blob;
};

export default scanImage;