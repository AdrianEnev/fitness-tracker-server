import { HfInference } from "@huggingface/inference";
import dotenv from 'dotenv'
import InternalError from "@custom_errors/InternalError";
dotenv.config();

const apiToken = process.env.BACKEND_HUGGINGFACE_API_TOKEN;
const model = 'Falconsai/nsfw_image_detection';

const inference = new HfInference(apiToken);

const scanImage = async (uri: any) => {

    const blob = await uriToBlob(uri);

    try {
        const result = await inference.imageClassification({
            model: model,
            data: blob
        });
        
        return result
    }catch (err) {
        throw new InternalError('Image classification failed (Could not scan image for NSFW)')
    }  
    
}

const uriToBlob = async (uri: string): Promise<Blob> => {
    
    try {
        const response = await fetch(uri);
        const blob = await response.blob();
        return blob;
    }catch (err) {
        throw new InternalError('Error while converting uri to blob (checkImageNSFW)');
    }
    
};

export default scanImage;