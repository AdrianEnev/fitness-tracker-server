
import express from 'express';
import checkUsernameNSFW from '../services/models/checkUsernameNSFW';
import generateWorkout from '../services/models/generateWorkout';
import scanImage from '../services/models/checkImageNSFW';
const modelsRouter = express.Router();

modelsRouter.get('/', (req, res) => {
    res.json({ message: 'Models' });
});

modelsRouter.get('/checkUsernameNSFW/:username', async (req, res) => {

    const username = req.params.username;

    try {
        const isUsernameNSFW = await checkUsernameNSFW(username);
        res.json({ isUsernameNSFW });
    }catch (error) {
        console.error('Error retrieving user info:', error);
        res.status(500).json({ error: 'Internal server error' });
    }

});

modelsRouter.get('/checkImageNSFW/:uri', async (req, res) => {
   
    const uri = req.params.uri;

    // Validate if the URI is a valid URL
    try {
        const url = new URL(uri);

        const isImageNSFW = await scanImage(url.toString());
        res.json({ isImageNSFW });
    } catch (error) {
        res.status(400).json({ error: 'Invalid URL provided' });
    }

});

modelsRouter.post('/generateWorkout', async (req, res) => {

    const {
        experienceLevel,
        primaryGoal,
        numberOfDays,
        workoutLocation,
        specificBodyparts,
        equipment,
        language
    } = req.body;

    try {
        const workoutPlan = await generateWorkout(
            experienceLevel,
            primaryGoal,
            numberOfDays,
            workoutLocation,
            specificBodyparts,
            equipment,
            language
        );

        if (workoutPlan) {
            res.json(workoutPlan);
        } else {
            res.status(500).json({ error: 'Failed to generate workout plan' });
        }
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while generating the workout plan' });
    }
});

export default modelsRouter;