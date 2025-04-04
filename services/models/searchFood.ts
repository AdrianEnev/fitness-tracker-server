import dotenv from 'dotenv'
import InternalError from '../../errors/custom_errors/InternalError';
dotenv.config()

const EDAMAM_APP_ID = process.env.BACKEND_EDAMAM_APP_ID;
const EDAMAM_APP_KEY = process.env.BACKEND_EDAMAM_APP_KEY;

// Returns list of foods matching search query
// Example - search: "Apple"
// results: "Apple", "Apple pie", "Apple Something", "Apple another something" and so on...
const fetchFoodData = async (search: string) => {

    console.log('Searching query in food database: ', search)

    try {
        const response = await fetch(
            `https://api.edamam.com/api/food-database/v2/parser?ingr=${search}&app_id=${EDAMAM_APP_ID}&app_key=${EDAMAM_APP_KEY}`
        );
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Foods successfuly retreived from database');
        return data.hints;

    } catch (error) {
        throw new InternalError(`Error fetching data for searched food (query: ${search})`)
    }
};

export default fetchFoodData;
