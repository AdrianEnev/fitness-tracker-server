
import express from 'express';
import checkUsernameNSFW from '../services/models/checkUsernameNSFW';
import generateWorkout from '../services/models/generateWorkout';
import scanImage from '../services/models/checkImageNSFW';
import fetchFoodData from '../services/models/searchFood';
import BadRequestError from '../errors/custom_errors/BadRequestError';
import InternalError from '../errors/custom_errors/InternalError';
const modelsRouter = express.Router();

modelsRouter.get('/', (req, res) => {
    res.json({ message: 'Models' });
});

modelsRouter.get('/checkUsernameNSFW/:username', async (req, res) => {

    const username = req.params.username;

    const isUsernameNSFW = await checkUsernameNSFW(username);
    res.json({ isUsernameNSFW });

});

modelsRouter.get('/checkImageNSFW/:uri', async (req, res) => {
   
    const uri = req.params.uri;

    // Validate if the URI is a valid URL
    const url = new URL(uri);

    if (!url) {
        throw new BadRequestError('Invalid URL format!');
    }

    const isImageNSFW = await scanImage(url.toString());
    res.json({ isImageNSFW });
   
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

    const workoutPlan = await generateWorkout(
        experienceLevel,
        primaryGoal,
        numberOfDays,
        workoutLocation,
        specificBodyparts,
        equipment,
        language
    );

    if (!workoutPlan) {
        throw new InternalError('Failed to generate workout plan!');
    }

    res.json(workoutPlan);
   
});

// Returns list of foods matching search query
// Example - search: "Apple"
// results: "Apple", "Apple pie", "Apple Something", "Apple another something" and so on...
modelsRouter.get('/searchFood', async (req, res) => {

    const searchQuery = req.query.searchQuery as string;

    // Result returns array full of objects
    const result = await fetchFoodData(searchQuery);
    res.json(result);

});

export default modelsRouter;