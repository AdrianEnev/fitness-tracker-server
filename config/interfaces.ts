import { Timestamp } from "firebase/firestore";

export interface Set {
    setIndex: any;
    reps: string;
    weight: string;
    intensity: number;
    id: string;
}

export interface Exercise {
    title: string;
    sets: Set[]; 
    exerciseIndex: number;
    id: string;
}

export interface Workout {
    title: string;
    previousTitle: string;
    exercises: Exercise[];
    id: string;
    colour: string;
    numberOfExercises: number;
    folderId: string | null;
    created: Timestamp | null;
}

export interface SavedWorkout {
    title: string;
    created: Timestamp;
    duration: number;
    id: string;
}

export interface Split {
    title: string;
    created: Timestamp;
    id: string;
}

export interface Friend {
    username: string;
    id: string;
}

export interface GoalNutrients {
    calories: string,
    protein: string,
    carbs: string,
    fat: string,
    id: string
}
export interface CurrentNutrients {
    calories: number,
    protein: number,
    carbs: number,
    fat: number,
    id: string
}

export interface Food {
    title: string;
    date?: any;
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    grams?: number;
    id: any;
}

export interface FoodDay {
    title: string;
    calories: number;
    carbs: number;
    protein: number;
    fat: number;
    id: string;
    created: any;
}

// Alternative to GoalNutrients used for the Settings page
export interface DailyGoal {
    carbs: number;
    protein: number;
    fat: number;
    calories: number;
    id: string;
    [key: string]: number | string;
}