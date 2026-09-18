// KamKhoj Play — bundled content: word lists, quiz packs, Nepal questions,
// typing corpus. No network. Kept in one maintainable module.

export interface ScrambleWord {
  word: string;
  hint: string;
  category: string;
}

export const SCRAMBLE_WORDS: ScrambleWord[] = [
  { word: "EVEREST", hint: "World's tallest peak, in Nepal", category: "Nepal" },
  { word: "POKHARA", hint: "Lakeside city beneath the Annapurnas", category: "Nepal" },
  { word: "MOMO", hint: "Beloved Nepali dumpling", category: "Nepal" },
  { word: "KATHMANDU", hint: "Capital city of Nepal", category: "Nepal" },
  { word: "LUMBINI", hint: "Birthplace of the Buddha", category: "Nepal" },
  { word: "RHODODENDRON", hint: "Nepal's national flower (lali gurans)", category: "Nepal" },
  { word: "DHAKA", hint: "Traditional Nepali woven fabric", category: "Nepal" },
  { word: "YAK", hint: "High-altitude Himalayan animal", category: "Nepal" },
  { word: "COMPUTER", hint: "It runs your code", category: "Technology" },
  { word: "KEYBOARD", hint: "You type on it", category: "Technology" },
  { word: "INTERNET", hint: "Global network", category: "Technology" },
  { word: "SOFTWARE", hint: "Programs, collectively", category: "Technology" },
  { word: "DATABASE", hint: "Where structured data lives", category: "Technology" },
  { word: "PYTHON", hint: "A popular programming language", category: "Technology" },
  { word: "BROWSER", hint: "Chrome, Firefox, Safari…", category: "Technology" },
  { word: "ELEPHANT", hint: "Largest land animal", category: "Animals" },
  { word: "RHINOCEROS", hint: "One-horned animal of Chitwan", category: "Animals" },
  { word: "LEOPARD", hint: "Spotted big cat", category: "Animals" },
  { word: "DOLPHIN", hint: "Intelligent marine mammal", category: "Animals" },
  { word: "PENGUIN", hint: "Flightless Antarctic bird", category: "Animals" },
  { word: "CROCODILE", hint: "River reptile of the Terai", category: "Animals" },
  { word: "FRANCE", hint: "Eiffel Tower country", category: "Countries" },
  { word: "JAPAN", hint: "Land of the rising sun", category: "Countries" },
  { word: "BRAZIL", hint: "Largest South American country", category: "Countries" },
  { word: "EGYPT", hint: "Home of the pyramids", category: "Countries" },
  { word: "CANADA", hint: "Maple leaf country", category: "Countries" },
  { word: "PIZZA", hint: "Cheesy Italian dish", category: "Food" },
  { word: "CHOCOLATE", hint: "Sweet cocoa treat", category: "Food" },
  { word: "SANDWICH", hint: "Food between bread slices", category: "Food" },
  { word: "NOODLES", hint: "Long thin pasta-like food", category: "Food" },
  { word: "FOOTBALL", hint: "The world's most played sport", category: "Sports" },
  { word: "CRICKET", hint: "Bat-and-ball summer sport", category: "Sports" },
  { word: "TENNIS", hint: "Racket sport with a net", category: "Sports" },
  { word: "MARATHON", hint: "Very long running race", category: "Sports" },
  { word: "GARDEN", hint: "Where flowers grow", category: "General" },
  { word: "BRIDGE", hint: "It spans a river", category: "General" },
  { word: "LIBRARY", hint: "House of books", category: "General" },
  { word: "WINDOW", hint: "Glass opening in a wall", category: "General" },
  { word: "PLANET", hint: "Earth is one", category: "General" },
  { word: "GUITAR", hint: "Six-string instrument", category: "General" },
];

export interface HangmanWord {
  word: string;
  hint: string;
  category: string;
}

export const HANGMAN_WORDS: HangmanWord[] = [
  { word: "EVEREST", hint: "Tallest mountain on Earth", category: "Nepal" },
  { word: "POKHARA", hint: "City of lakes", category: "Nepal" },
  { word: "BHAKTAPUR", hint: "Ancient Newar city", category: "Nepal" },
  { word: "CHITWAN", hint: "Famous national park", category: "Nepal" },
  { word: "GORKHA", hint: "Historic hill kingdom", category: "Nepal" },
  { word: "MUSTANG", hint: "Trans-Himalayan district", category: "Nepal" },
  { word: "DHALBHAT", hint: "Staple Nepali meal", category: "Nepal" },
  { word: "KUMARI", hint: "Living goddess tradition", category: "Nepal" },
  { word: "LAPTOP", hint: "Portable computer", category: "Technology" },
  { word: "SERVER", hint: "Serves data over a network", category: "Technology" },
  { word: "ROUTER", hint: "Directs network traffic", category: "Technology" },
  { word: "PIXEL", hint: "Smallest screen dot", category: "Technology" },
  { word: "ALGORITHM", hint: "Step-by-step procedure", category: "Technology" },
  { word: "NEPAL", hint: "Himalayan nation", category: "Countries" },
  { word: "INDIA", hint: "Nepal's southern neighbour", category: "Countries" },
  { word: "CHINA", hint: "Nepal's northern neighbour", category: "Countries" },
  { word: "BHUTAN", hint: "Himalayan kingdom east of Nepal", category: "Countries" },
  { word: "TITANIC", hint: "Famous 1997 ship film", category: "Movies" },
  { word: "AVATAR", hint: "Blue aliens of Pandora", category: "Movies" },
  { word: "INCEPTION", hint: "Dream-within-a-dream film", category: "Movies" },
  { word: "CRICKET", hint: "Growing sport in Nepal", category: "Sports" },
  { word: "VOLLEYBALL", hint: "Nepal's national sport", category: "Sports" },
  { word: "EVERESTBASE", hint: "Trekkers' famous destination", category: "Sports" },
  { word: "PLANET", hint: "Earth is one", category: "General" },
  { word: "OCEAN", hint: "Vast body of salt water", category: "General" },
  { word: "GARDEN", hint: "Where flowers grow", category: "General" },
  { word: "CASTLE", hint: "Fortified palace", category: "General" },
];

export interface QuizQuestion {
  id: string;
  category: string;
  type: "mcq" | "tf";
  question: string;
  choices: string[];
  answer: number; // index into choices
  explain?: string;
}

// Stable, low-risk general facts only.
export const QUIZ_QUESTIONS: QuizQuestion[] = [
  { id: "s1", category: "Science", type: "mcq", question: "How many days does Earth take to orbit the Sun?", choices: ["265", "365", "385", "400"], answer: 1 },
  { id: "s2", category: "Science", type: "mcq", question: "What is H2O commonly known as?", choices: ["Salt", "Water", "Oxygen", "Hydrogen"], answer: 1 },
  { id: "s3", category: "Science", type: "tf", question: "Sound travels faster than light.", choices: ["True", "False"], answer: 1 },
  { id: "s4", category: "Science", type: "mcq", question: "Which planet is known as the Red Planet?", choices: ["Venus", "Mars", "Jupiter", "Mercury"], answer: 1 },
  { id: "s5", category: "Science", type: "mcq", question: "How many legs does a spider have?", choices: ["6", "8", "10", "12"], answer: 1 },
  { id: "t1", category: "Technology", type: "mcq", question: "What does CPU stand for?", choices: ["Central Processing Unit", "Computer Personal Utility", "Central Program Utility", "Core Processing Utility"], answer: 0 },
  { id: "t2", category: "Technology", type: "mcq", question: "Which company created the iPhone?", choices: ["Samsung", "Google", "Apple", "Nokia"], answer: 2 },
  { id: "t3", category: "Technology", type: "tf", question: "HTML is a programming language.", choices: ["True", "False"], answer: 1, explain: "HTML is a markup language." },
  { id: "t4", category: "Technology", type: "mcq", question: "What does Wi-Fi most commonly provide?", choices: ["Wired printing", "Wireless networking", "Satellite TV", "Battery charging"], answer: 1 },
  { id: "t5", category: "Technology", type: "mcq", question: "Which storage unit is the largest?", choices: ["Megabyte", "Gigabyte", "Terabyte", "Kilobyte"], answer: 2 },
  { id: "w1", category: "World", type: "mcq", question: "Which is the largest ocean on Earth?", choices: ["Atlantic", "Indian", "Arctic", "Pacific"], answer: 3 },
  { id: "w2", category: "World", type: "mcq", question: "How many continents are there?", choices: ["5", "6", "7", "8"], answer: 2 },
  { id: "w3", category: "World", type: "tf", question: "The Sahara is the world's largest hot desert.", choices: ["True", "False"], answer: 0 },
  { id: "w4", category: "World", type: "mcq", question: "Which country has the largest population?", choices: ["USA", "Indonesia", "India", "Brazil"], answer: 2 },
  { id: "h1", category: "History", type: "mcq", question: "In which year did humans first land on the Moon?", choices: ["1959", "1969", "1979", "1989"], answer: 1 },
  { id: "h2", category: "History", type: "tf", question: "The Great Wall is in China.", choices: ["True", "False"], answer: 0 },
  { id: "h3", category: "History", type: "mcq", question: "Which ancient civilization built the pyramids of Giza?", choices: ["Romans", "Greeks", "Egyptians", "Mayans"], answer: 2 },
  { id: "e1", category: "Entertainment", type: "mcq", question: "How many players are on a football (soccer) team on the field?", choices: ["9", "10", "11", "12"], answer: 2 },
  { id: "e2", category: "Entertainment", type: "tf", question: "Chess is played on an 8x8 board.", choices: ["True", "False"], answer: 0 },
  { id: "sp1", category: "Sports", type: "mcq", question: "In cricket, how many balls are in one over?", choices: ["5", "6", "8", "10"], answer: 1 },
  { id: "sp2", category: "Sports", type: "mcq", question: "Which sport uses a shuttlecock?", choices: ["Tennis", "Badminton", "Squash", "Table tennis"], answer: 1 },
  { id: "g1", category: "Geography", type: "mcq", question: "Which is the longest river in the world?", choices: ["Amazon", "Nile", "Yangtze", "Mississippi"], answer: 1, explain: "Commonly cited; Amazon is a close contender by some measures." },
  { id: "g2", category: "Geography", type: "tf", question: "Mount Everest lies in the Himalayas.", choices: ["True", "False"], answer: 0 },
  { id: "gk1", category: "General Knowledge", type: "mcq", question: "How many days are in a leap year?", choices: ["365", "366", "364", "367"], answer: 1 },
  { id: "gk2", category: "General Knowledge", type: "mcq", question: "Which gas do plants absorb for photosynthesis?", choices: ["Oxygen", "Nitrogen", "Carbon dioxide", "Helium"], answer: 2 },
  { id: "gk3", category: "General Knowledge", type: "tf", question: "A decade lasts 10 years.", choices: ["True", "False"], answer: 0 },
  { id: "gk4", category: "General Knowledge", type: "mcq", question: "How many colors are in a rainbow?", choices: ["5", "6", "7", "8"], answer: 2 },
  { id: "gk5", category: "General Knowledge", type: "mcq", question: "Which instrument has 88 keys?", choices: ["Guitar", "Piano", "Violin", "Flute"], answer: 1 },
];

export interface NepalQuestion {
  id: string;
  category: string;
  type: "mcq" | "tf";
  question: string;
  choices: string[];
  answer: number;
}

// Conservative, stable facts about Nepal.
export const NEPAL_QUESTIONS: NepalQuestion[] = [
  { id: "n1", category: "General", type: "mcq", question: "What is the capital city of Nepal?", choices: ["Pokhara", "Kathmandu", "Biratnagar", "Nepalgunj"], answer: 1 },
  { id: "n2", category: "General", type: "mcq", question: "What is the currency of Nepal?", choices: ["Taka", "Rupee", "Rupiah", "Kyat"], answer: 1 },
  { id: "n3", category: "Geography", type: "mcq", question: "Which mountain is the tallest in the world and lies in Nepal?", choices: ["K2", "Kanchenjunga", "Mount Everest", "Makalu"], answer: 2 },
  { id: "n4", category: "Geography", type: "mcq", question: "How many provinces does Nepal have?", choices: ["5", "6", "7", "9"], answer: 2 },
  { id: "n5", category: "Provinces", type: "mcq", question: "Which province contains Kathmandu?", choices: ["Gandaki", "Bagmati", "Lumbini", "Koshi"], answer: 1 },
  { id: "n6", category: "Provinces", type: "mcq", question: "Pokhara is the capital of which province?", choices: ["Gandaki", "Karnali", "Sudurpashchim", "Madhesh"], answer: 0 },
  { id: "n7", category: "Provinces", type: "mcq", question: "Which is Nepal's easternmost province?", choices: ["Koshi", "Bagmati", "Gandaki", "Karnali"], answer: 0 },
  { id: "n8", category: "Cities", type: "mcq", question: "Which city is famous for Phewa Lake?", choices: ["Pokhara", "Dharan", "Butwal", "Hetauda"], answer: 0 },
  { id: "n9", category: "Cities", type: "mcq", question: "Lumbini is best known as…", choices: ["A mountain pass", "Birthplace of the Buddha", "A hydropower plant", "A border market"], answer: 1 },
  { id: "n10", category: "Landmarks", type: "mcq", question: "Sagarmatha is the Nepali name for…", choices: ["Annapurna", "Mount Everest", "Machhapuchhre", "Dhaulagiri"], answer: 1 },
  { id: "n11", category: "Landmarks", type: "mcq", question: "Chitwan National Park is famous for…", choices: ["One-horned rhinos", "Polar bears", "Penguins", "Kangaroos"], answer: 0 },
  { id: "n12", category: "Culture", type: "mcq", question: "Dashain is…", choices: ["Nepal's biggest Hindu festival", "A mountain", "A river", "A currency"], answer: 0 },
  { id: "n13", category: "Culture", type: "mcq", question: "Tihar is also known as the festival of…", choices: ["Kites", "Lights", "Boats", "Snow"], answer: 1 },
  { id: "n14", category: "Culture", type: "mcq", question: "What is momo?", choices: ["A drum", "A dumpling dish", "A hat", "A dance"], answer: 1 },
  { id: "n15", category: "Culture", type: "mcq", question: "Which animal appears on Nepal's national emblem context as a revered animal?", choices: ["Cow", "Tiger", "Elephant", "Yak"], answer: 0 },
  { id: "n16", category: "Geography", type: "tf", question: "Nepal is a landlocked country.", choices: ["True", "False"], answer: 0 },
  { id: "n17", category: "Geography", type: "tf", question: "Nepal shares a border with Bangladesh.", choices: ["True", "False"], answer: 1 },
  { id: "n18", category: "Districts", type: "mcq", question: "Kathmandu Valley contains which three historic cities?", choices: ["Kathmandu, Lalitpur, Bhaktapur", "Pokhara, Chitwan, Butwal", "Dharan, Itahari, Biratnagar", "Nepalgunj, Dhangadhi, Mahendranagar"], answer: 0 },
  { id: "n19", category: "General", type: "mcq", question: "Nepal's national sport is…", choices: ["Football", "Cricket", "Volleyball", "Kabaddi"], answer: 2 },
  { id: "n20", category: "General", type: "mcq", question: "The Nepali flag is…", choices: ["Rectangular", "Double-pennant shaped", "Circular", "Triangular"], answer: 1 },
  { id: "n21", category: "Districts", type: "mcq", question: "Mustang district is best described as…", choices: ["A Terai plain", "A trans-Himalayan rain-shadow region", "A coastal zone", "A desert island"], answer: 1 },
  { id: "n22", category: "Cities", type: "mcq", question: "Biratnagar is an important city in which region?", choices: ["Eastern Terai", "Far-western hills", "High Himalayas", "Kathmandu Valley"], answer: 0 },
  { id: "n23", category: "Landmarks", type: "mcq", question: "Boudhanath is…", choices: ["A large Buddhist stupa in Kathmandu", "A hydropower dam", "A ski resort", "A seaport"], answer: 0 },
  { id: "n24", category: "Culture", type: "mcq", question: "The Kumari tradition is associated with…", choices: ["A living goddess", "A mountain festival", "A river ritual", "A harvest dance"], answer: 0 },
];

export const TYPING_WORDS: string[] = (
  "time people way day man thing woman life child world school state family student group country problem hand part place over such again only round morning water paper mountain river nepali himalaya kathmandu pokhara travel food music light heart dream peace river cloud forest trail peak lake village market bridge light stone snow sun moon star song journey summit climb prayer flag temple lake forest cloud music story night morning light brave kind quick brown fox jumps over lazy dog practice makes perfect type fast steady rhythm focus calm mind hands dance across keys while words flow like rivers through valleys"
    .split(/\s+/)
    .filter(Boolean)
);

export const TYPING_QUOTES: string[] = [
  "The mountains of Nepal remind us that great heights are reached one steady step at a time.",
  "Typing fast is a rhythm sport: relax your shoulders, trust your fingers, and keep your eyes ahead.",
  "Pokhara mornings are calm and golden, with boats drifting slow across the glassy lake.",
  "Consistency beats bursts. Smooth keystrokes today become effortless speed tomorrow.",
  "Every expert was once a beginner who refused to stop practicing their craft daily.",
  "The trail to the summit is long, but each small step forward is a quiet victory.",
];
