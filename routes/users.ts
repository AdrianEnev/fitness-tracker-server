import express from 'express';
const userRouter = express.Router();
import getUserInfo from '../services/web/getUserInfo';

userRouter.get('/', (req, res) => {
    res.json({ message: 'Users list' });
});

userRouter.get('/:userId', async (req, res) => {

    const userId: string = req.params.userId;

    try {
        const userInfo = await getUserInfo(userId);

        if (userInfo) {
            res.json(userInfo);
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        console.error('Error retrieving user info:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default userRouter;