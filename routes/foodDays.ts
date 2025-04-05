import express from 'express';
import getFoodDays from '../services/mobile/food/getFoodDays';
import getFoodDay from '../services/web/getFoodDay';
import addFoodItem from '../services/mobile/food/addFoodItem';
import deleteFoodItem from '../services/mobile/food/deleteFood';
import updateNutrients from '../services/mobile/food/updateFoodDayNutrients';
import validateUserId from '../services/validateUserId';
import EntityNotFoundError from '../errors/custom_errors/EntityNotFoundError';
const foodDaysRouter = express.Router();

// Gets a snapshot of food day documents. Effective for updates but not for displaying info
foodDaysRouter.get('/:userId', async (req, res) => {
    
    const userId: string = req.params.userId;

    await validateUserId(userId)

    const foodDays = await getFoodDays(userId);

    if (!foodDays) {
        throw new EntityNotFoundError('Food Days not found!');
    }

    res.json(foodDays);
    
});

// Sync food days -> compare user Id firebase food days to provided asyncstorage food days and add any missing ones to firebase
// expects uer id
foodDaysRouter.put('/:userId', async (req, res) => {
    res.json({ message: "test" })
});

// Create/Add food item (food) to specific food day
// expects (food day info, formattedDate, user id)
foodDaysRouter.post('/:userId', async (req, res) => {

    const { itemInfo, formattedDate } = req.body;

    const userId: string = req.params.userId;
    await validateUserId(userId);

    await addFoodItem(itemInfo, formattedDate, userId);
    res.status(204).send();
   
});

// Update the nutrients of a specific food day
// Example -> 03.10.2069 - { calories: 100, protein: 100, carbs: 100, fat: 100 }
// -> 03.10.2069 - { calories: 200, protein: 200, carbs: 200, fat: 200 }
// Runs every time a food item is added to a food day
foodDaysRouter.put('/:userId/:foodDayDate', async (req, res) => {

    const { updatedNutrients } = req.body;
    const userId: string = req.params.userId;
    const formattedDate: string = req.params.foodDayDate;

    await validateUserId(userId);

    await updateNutrients(updatedNutrients, formattedDate, userId);
    res.status(204).send();
    
})

// Delete specific food day (user id -> food day id)
foodDaysRouter.delete('/:userId/:foodDayDate', async (req, res) => {

    // Food Day Item to delete
    const { item, updatedNutrients } = req.body
    
    const userId: string = req.params.userId;
    const formattedDate: string = req.params.foodDayDate;

    await validateUserId(userId);

    await deleteFoodItem(item, formattedDate, updatedNutrients, userId);
    res.status(204).send();    

});

// Gets info about specific food day using date
foodDaysRouter.get('/:userId/:foodDayDate', async (req, res) => {

    const foodDayDate: string = req.params.foodDayDate;
    const userId: string = req.params.userId;

    await validateUserId(userId);

    const foodDayInfo = await getFoodDay(foodDayDate, userId);

    if (!foodDayInfo) {
        throw new EntityNotFoundError('Food day not found!');
    }

    res.json(foodDayInfo);

});

export default foodDaysRouter;