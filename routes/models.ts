
import express from 'express';
import checkUsernameNSFW from '../services/models/checkUsernameNSFW';
import generateWorkout from '../services/models/generateWorkout';
import scanImage from '../services/models/checkImageNSFW';
import fetchFoodData from '../services/models/searchFood';
const modelsRouter = express.Router();

modelsRouter.get('/', (req, res) => {
    res.json({ message: 'Models' });
});

modelsRouter.get('/checkUsernameNSFW/:username', async (req, res) => {

    const username = req.params.username;

    try {
        const isUsernameNSFW = await checkUsernameNSFW(username);
        res.json({ isUsernameNSFW });
        res.status(200).json({ message: "Username checked successfully!" });
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
        res.status(200).json({ message: "Image checked successfully!" });
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
            res.status(200).json({ message: "Workout generated successfully!" });
        } else {
            res.status(500).json({ error: 'Failed to generate workout plan' });
        }
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while generating the workout plan' });
    }
});

// Returns list of foods matching search query
// Example - search: "Apple"
// results: "Apple", "Apple pie", "Apple Something", "Apple another something" and so on...
modelsRouter.get('/searchFood', async (req, res) => {

    const searchQuery = req.query.searchQuery as string;

    try {
        // Result returns array full of objects
        const result = await fetchFoodData(searchQuery);

        // If {result} was passed it would wrap that array of objects all into one big object
        // So result is just passed raw instead of having to call data.result from the frontend
        res.json(result);
        res.status(200).json({ message: "Food found successfully!" });
    } catch (error) {
        res.status(400).json({ error: 'Invalid URL provided' });
    }

});

export default modelsRouter;