import dotenv from 'dotenv';
import InternalError from '@custom_errors/InternalError';
dotenv.config();

const apiToken = process.env.BACKEND_HUGGINGFACE_API_TOKEN;

export const checkUsernameNSFW = async (username: string) => {

    console.log("Checking username for NSFW content", username);

    // FIX: First, check if the username is in the popular names list
    const isInList = await isUsernameInList(username.toLowerCase());
    if (isInList) {
        console.log("Username is not NSFW, returning false");
        return false;
    }

    // If the username is NOT in the list, proceed with NSFW detection
    try {
        const response = await fetch(
            "https://api-inference.huggingface.co/models/facebook/bart-large-mnli",
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${apiToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    inputs: username,
                    parameters: {
                        candidate_labels: ["offensive", "non-offensive"],
                    },
                }),
            }
        );

        const data = await response.json();
        //console.log(data);

        if (!data || !data.labels || data.labels.length === 0) {
            console.error("Unexpected API response format", data);
            return true; // Assume NSFW if API fails
        }

        //console.log(data.labels[0]);

        if (data.labels[0] === "non-offensive") {
            console.log("Username is not NSFW, returning false");
            return false;
        }

        console.log("Username is NSFW, returning true");
        return true;

    }catch (err) {
        throw new InternalError('Error checking if username is NSFW')
    }
    
};

const isUsernameInList = (username: string) => {
    const popularNames = new Set([
        "liam", "olivia", "noah", "emma", "oliver", "ava", "elijah", "charlotte", "james", "sophia",
        "william", "amelia", "benjamin", "isabella", "lucas", "mia", "henry", "evelyn", "alexander", "harper",
        "mason", "luna", "michael", "camila", "ethan", "gianna", "daniel", "abigail", "jacob", "ella",
        "logan", "elizabeth", "jackson", "sofia", "sebastian", "avery", "jack", "scarlett", "aiden", "emily",
        "owen", "aria", "samuel", "penelope", "matthew", "chloe", "joseph", "layla", "levi", "mila",
        "mateo", "nora", "david", "hazel", "john", "madison", "wyatt", "ellie", "carter", "lily",
        "julian", "nova", "luke", "isla", "grayson", "grace", "isaac", "violet", "jayden", "aurora",
        "theodore", "riley", "gabriel", "zoey", "anthony", "willow", "dylan", "emilia", "leo", "stella",
        "lincoln", "zoe", "jaxon", "victoria", "asher", "hannah", "christopher", "addison", "josiah", "leah",
        "andrew", "lucy", "thomas", "eliana", "joshua", "ivy", "ezra", "everly", "adrian", "alex", "jordan", 
        "gregory", "greg"
    ]);

    return Promise.resolve(popularNames.has(username));
};

export default checkUsernameNSFW;
