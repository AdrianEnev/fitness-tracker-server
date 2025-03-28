import express from 'express';
const foodDaysRouter = express.Router();
import { getFoodDay } from '../services/web/getFoodDay';

foodDaysRouter.get('/', (req, res) => {
    res.json({ message: 'Foods list Web' });
});

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