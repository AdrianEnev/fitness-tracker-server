import express from 'express';
import getFoodDays from '../services/mobile/food/getFoodDays';
import getFoodDay from '../services/web/getFoodDay';
import addFoodItem from '../services/mobile/food/addFoodItem';
import deleteFoodItem from '../services/mobile/food/deleteFood';
import updateNutrients from '../services/mobile/food/updateFoodDayNutrients';
const foodDaysRouter = express.Router();

// Gets a snapshot of food day documents. Effective for updates but not for displaying info
foodDaysRouter.get('/:userId', async (req, res) => {
    
    const userId: string = req.params.userId;

    try {
        const foodDays = await getFoodDays(userId);

        if (foodDays) {
            res.json(foodDays);

        } else {
            res.status(404).json({ error: 'Food Days not found' });
        }
    } catch (error) {
        console.error('Error retrieving food days:', error);
        res.status(500).json({ error: 'Internal server error' });
    }

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

    try {
        await addFoodItem(itemInfo, formattedDate, userId);
        res.status(200).json({ message: "Food added successfully!" });
    } catch (error) {
        console.error('Error adding food item:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
   
});

// Update the nutrients of a specific food day
// Example -> 03.10.2069 - { calories: 100, protein: 100, carbs: 100, fat: 100 }
// -> 03.10.2069 - { calories: 200, protein: 200, carbs: 200, fat: 200 }
// Runs every time a food item is added to a food day
foodDaysRouter.put('/:userId/:foodDayDate', async (req, res) => {

    const { updatedNutrients } = req.body;
    const userId: string = req.params.userId;
    const formattedDate: string = req.params.foodDayDate;

    try {
        await updateNutrients(updatedNutrients, formattedDate, userId);
        res.status(200).json({ message: "Nutrients updated successfully!" });
    } catch (error) {
        console.error('Error updating nutrients:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
})

// Delete specific food day (user id -> food day id)
foodDaysRouter.delete('/:userId/:foodDayDate', async (req, res) => {

    // Food Day Item to delete
    const { item, updatedNutrients } = req.body
    
    const userId: string = req.params.userId;
    const formattedDate: string = req.params.foodDayDate;

    try {
        await deleteFoodItem(item, formattedDate, updatedNutrients, userId);
        res.status(200).json({ message: "Food day deleted successfully!" });
    } catch (error) {
        console.error('Error deleting workout/s:', error);
        res.status(500).json({ error: 'Internal server error' });
    }

});

// Gets info about specific food day using date
foodDaysRouter.get('/:userId/:foodDayDate', async (req, res) => {

    const foodDayDate: string = req.params.foodDayDate;
    const userId: string = req.params.userId;

    try {
        const foodDayInfo = await getFoodDay(foodDayDate, userId);

        if (foodDayInfo) {
            res.json(foodDayInfo);
        } else {
            res.status(404).json({ error: 'Food day not found' });
        }
    } catch (error) {
        console.error('Error retrieving food day:', error);
        res.status(500).json({ error: 'Internal server error' });
    }

});

export default foodDaysRouter;