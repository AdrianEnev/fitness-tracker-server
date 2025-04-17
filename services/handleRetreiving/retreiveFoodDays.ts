import { FIRESTORE_ADMIN } from "@config/firebaseConfig";
import InternalError from "@custom_errors/InternalError";

// Compare asyncstorage food days to database food days.  
// If there is a difference, return database food days
const retreiveFoodDays = async (
    asyncStorageFoodDayKeys: string[],
    userId: string
): Promise<
    | {
          missingFoodDays: Array<{
              id: string;
              data: any;
              foods: Array<{ id: string; [key: string]: any }>;
          }>;
      }
    | null
> => {
    
    try {
        const foodDaysCollectionRef = FIRESTORE_ADMIN
            .collection('users')
            .doc(userId)
            .collection('food_days');

        const foodDaysSnapshot = await foodDaysCollectionRef.get();

        // All foodDay IDs in Firestore
        const foodDayIdsInDB = foodDaysSnapshot.docs.map((doc: any) => doc.id);

        // Helper to extract and normalize date from AsyncStorage key
        function extractDateFromKey(key: string): string | null {
            // Match the pattern: foodDay-14-4-2025 or any prefix ending with -foodDay-<d>-<m>-<y>
            const match = key.match(/foodDay-(\d{1,2})-(\d{1,2})-(\d{4})/);
            if (!match) return null;
            const [ , day, month, year ] = match;
            // Pad day and month with leading zeros if needed
            const dd = day.padStart(2, '0');
            const mm = month.padStart(2, '0');
            return `${year}-${mm}-${dd}`;
        }

        // Find foodDay IDs not present in AsyncStorage keys (normalized date match)
        const missingFoodDays = foodDayIdsInDB.filter((foodDay: string) => {
            //console.log("Checking food day:", foodDay);
            const found = asyncStorageFoodDayKeys.some((foodDayKey: string) => {
                const extractedDate = extractDateFromKey(foodDayKey);
                return extractedDate === foodDay;
            });
            return !found;
        });

        if (missingFoodDays.length === 0) {
            return null;
        }

        // Fetch all info for each missing food day
        const missingFoodDayInfos = await Promise.all(
            missingFoodDays.map(async (foodDayId: string) => {
                // Get food day document data
                const foodDayDocRef = foodDaysCollectionRef.doc(foodDayId);
                const foodDayDocSnap = await foodDayDocRef.get();
                const foodDayData = foodDayDocSnap.exists ? foodDayDocSnap.data() : {};

                // Get foods subcollection
                const foodsCollectionRef = foodDayDocRef.collection('foods');
                const foodsSnapshot = await foodsCollectionRef.get();
                const foods = foodsSnapshot.docs.map((foodDoc: any) => ({
                    id: foodDoc.id,
                    ...foodDoc.data(),
                }));

                return {
                    id: foodDayId,
                    data: foodDayData,
                    foods,
                };
            })
        );

        return { missingFoodDays: missingFoodDayInfos };
    }catch(error: any){
        throw new InternalError(error)
    }
    
};

export default retreiveFoodDays;