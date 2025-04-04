import dotenv from 'dotenv'
dotenv.config();

const generateWorkout = async (
    experienceLevel: any, 
    primaryGoal: any, 
    numberOfDays: any, 
    workoutLocation: any, 
    specificBodyparts: any, 
    equipment: any,
    language: any
) => {

    const PAT = process.env.BACKEND_GPT_PAT;
    // Specify the correct user_id/app_id pairings
    // Since you're making inferences outside your app's scope
    const USER_ID = 'openai';    
    const APP_ID = 'chat-completion';
    // Change these to whatever model and text URL you want to use
    const MODEL_ID = 'gpt-4-turbo';
    const MODEL_VERSION_ID = process.env.BACKEND_GPT_MODEL_VERSION_ID; 

    const RAW_TEXT = `
    Generate a workout plan for a ${experienceLevel} level athlete for ${numberOfDays} days. 
    The workout should take place at ${workoutLocation} and should have slightly more volume or intensity dedicated to: ${specificBodyparts}. 
    ${!equipment && workoutLocation === 'outdoors' ? 'I have access to absolutely no equipment but can go outdoors.' : 
    !equipment && workoutLocation === 'calisthenics park' ? 'I have access to absolutely no equipment but can go to a calisthenics park.' :
    ``
    }
    ${equipment ? 'I have access to the following equipment: ' + equipment : ''}
    My primary goal is ${primaryGoal}. 
    Each exercise should only contain whole integers as values for sets, reps and weight.
    The splits should be balanced and tailored to my experience level and other information provided. You can take inspiration from
    modern science-based workout programmes like ones from Jeff Nippard and other famous influencers. You can also consider adding your own
    unique touch to the workout plan. You should consider 8 day weeks only if the number of days I can work out is 6 or 7, then 2 rest days should be included.
    The rest days should be labelled as an empty day in the workout plan and should be placed in the most optimal position for maximum recovery.
    Exclude olympic exercises like "clean and jerk" and follow a traditional route, inspired by modern science-based workout programmes.
    If an exercise requires bodyweight, the weight value should be set to 0.
    Do not add any comments and if you think the weight should be adjusted according to my one rep max, set the weight to whatever you think would suit my current level based on the information I've given you.
    Try not to overshoot with the weight on single-arm exercises.
    The names of the days and exercises should be in this language: ${language}. Only the name of a rest day should always remain "Rest Day" regardless of the language.
    
    Please provide the workout plan in the following JSON format:
    {
    "days": [
        {
        "day": "Day 1",
        "exercises": [
            {
            "name": "Exercise 1",
            "sets": 3,
            "reps": 12,
            "weight": 50
            },
            {
            "name": "Exercise 2",
            "sets": 3,
            "reps": 10,
            "weight": 70
            }
        ]
        },
        {
        "day": "Day 2",
        "exercises": [
            {
            "name": "Exercise 3",
            "sets": 4,
            "reps": 8,
            "weight": 60
            }
        ]
        }
    ]
    }
    `;

    console.log("Generating workout...");

    const raw = JSON.stringify({
        "user_app_id": {
            "user_id": USER_ID,
            "app_id": APP_ID
        },
        "inputs": [
            {
                "data": {
                    "text": {
                        "raw": RAW_TEXT
                    }
                }
            }
        ]
    });

    const requestOptions = {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Authorization': 'Key ' + PAT
        },
        body: raw
    };
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000); 

    try {
        const response = await fetch("https://api.clarifai.com/v2/models/" + MODEL_ID + "/versions/" + MODEL_VERSION_ID + "/outputs", {
            ...requestOptions,
            signal: controller.signal,
        });

        // Retreive text returned from the model
        const responseText = await response.text();
        const data = JSON.parse(responseText); 

        if (data.status.code !== 10000) {
            console.log(data.status);
            return null;
        } else {
            const embeddedJsonString = data.outputs[0].data.text.raw;
            const cleanedJsonString = embeddedJsonString.replace(/```json|```/g, '').trim();
            const validJsonString = cleanedJsonString.replace(/ per leg| per set for distance or time/g, '');
            const jsonStartIndex = validJsonString.indexOf('{');
            const jsonEndIndex = validJsonString.lastIndexOf('}') + 1;
            const jsonString = validJsonString.substring(jsonStartIndex, jsonEndIndex);
            const workoutPlan = JSON.parse(jsonString);
            return workoutPlan;
        }
    } catch (error: any) {
        if (error.name === 'AbortError') {
            console.log('Workout generation timed out');
            return null;
        } else {
            console.log('Error during workout generation:', error);
            return null; 
        }
    } finally {
        clearTimeout(timeoutId); 
    }
};
  
export default generateWorkout;