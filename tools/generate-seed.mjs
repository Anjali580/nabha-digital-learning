#!/usr/bin/env node
/**
 * NabhaLearn seed generator.
 * Produces backend/src/main/resources/seed/seed.json and lightweight SVG artwork.
 * Run: node tools/generate-seed.mjs
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const SEED_PATH = join(ROOT, "backend/src/main/resources/seed/seed.json");
const ART_DIR = join(ROOT, "frontend/assets/explore");

const CLASSES = [
  { level: 6, description: "Foundations: numbers, living things, stories and our surroundings." },
  { level: 7, description: "Building understanding: integers, plants, heat and the world around us." },
  { level: 8, description: "Core middle school: rational numbers, electricity, light and the Constitution." },
  { level: 9, description: "Stronger concepts: real numbers, cells, democracy and digital skills." },
  { level: 10, description: "Board-year focus: quadratics, electricity, chemical reactions and nationalism." }
];

const SUBJECTS = {
  math: { name: "Mathematics", icon: "calculator", color: "#4F7DF3", description: "Numbers, patterns and problem solving for everyday life." },
  science: { name: "Science", icon: "flask", color: "#0E9F6E", description: "Understand the natural world through observation and experiments." },
  english: { name: "English", icon: "book", color: "#E3893B", description: "Reading, writing, grammar and confident communication." },
  social: { name: "Social Science", icon: "globe", color: "#8367E8", description: "People, places, history and how societies work." },
  computer: { name: "Computer Studies", icon: "chip", color: "#2F9EB5", description: "Practical digital skills for school and daily life." }
};

const CURRICULUM = {
  6: {
    math: [
      ["Knowing Our Numbers", [
        ["Comparing and Ordering Numbers", "Use place value to compare large numbers and arrange them in ascending or descending order."],
        ["Rounding and Estimation", "Round numbers to the nearest ten, hundred or thousand and use estimation in daily situations."]
      ]],
      ["Whole Numbers", [
        ["The Number Line and Properties", "Place whole numbers on a number line and use closure, commutativity and associativity."],
        ["Patterns and Simple Operations", "Spot number patterns and apply addition, subtraction and multiplication to whole numbers."]
      ]]
    ],
    science: [
      ["Food: Where Does It Come From?", [
        ["Plant Sources of Food", "Identify the parts of plants — roots, stems, leaves, flowers, fruits and seeds — that we eat."],
        ["Animal Sources of Food", "Understand how milk, eggs, honey and meat come from animals and why food hygiene matters."]
      ]],
      ["Components of Food", [
        ["Nutrients in Our Food", "Learn about carbohydrates, proteins, fats, vitamins, minerals, water and roughage."],
        ["Balanced Diet and Deficiency", "Build a balanced plate and recognise common deficiency diseases such as scurvy and rickets."]
      ]]
    ],
    english: [
      ["A Tale of Two Birds", [
        ["Reading the Story", "Read the story carefully, identify the main events and describe how the two birds grew up differently."],
        ["Words and Comprehension", "Build vocabulary from the chapter and answer comprehension questions using complete sentences."]
      ]],
      ["The Friendly Mongoose", [
        ["Story Sequence and Characters", "Retell the story in order and describe the mongoose, the farmer and his wife."],
        ["Nouns and Pronouns", "Recognise naming words and pronouns, and use them correctly in sentences."]
      ]]
    ],
    social: [
      ["Understanding Diversity", [
        ["What is Diversity?", "Understand how people differ in language, food, dress, festivals and beliefs."],
        ["Diversity in India", "Explore examples of India's regional diversity and why difference is not a problem."]
      ]],
      ["Diversity and Discrimination", [
        ["Prejudice and Stereotypes", "Explain how prejudice and stereotypes form and how they can hurt people."],
        ["Equality in Everyday Life", "Recognise unfair treatment and describe ways to treat everyone with respect."]
      ]]
    ],
    computer: [
      ["Introduction to Computers", [
        ["Parts of a Computer", "Identify the monitor, keyboard, mouse and CPU, and explain their basic jobs."],
        ["Input and Output Devices", "Sort common devices into input, output and storage categories."]
      ]],
      ["Using Windows and Files", [
        ["The Desktop and Windows", "Open, resize and close windows, and find programs from the desktop."],
        ["Files and Folders", "Create, rename, move and organise files into sensible folders."]
      ]]
    ]
  },
  7: {
    math: [
      ["Integers", [
        ["Operations on Integers", "Add, subtract, multiply and divide positive and negative numbers using the rules of signs."],
        ["Integers in Daily Life", "Use integers to represent temperature, bank balances, lifts and sea level."]
      ]],
      ["Fractions and Decimals", [
        ["Fractions in Real Situations", "Multiply and divide fractions and use them in recipes, measurements and sharing."],
        ["Decimal Operations", "Add, subtract and multiply decimals and convert between fractions and decimals."]
      ]]
    ],
    science: [
      ["Nutrition in Plants", [
        ["Photosynthesis", "Explain how green plants use sunlight, water and carbon dioxide to make food."],
        ["Other Modes of Nutrition", "Compare parasitic, saprophytic and insectivorous plants with green plants."]
      ]],
      ["Heat", [
        ["Temperature and Thermometers", "Measure temperature with clinical and laboratory thermometers and read the scales."],
        ["Transfer of Heat", "Understand conduction, convection and radiation with everyday examples."]
      ]]
    ],
    english: [
      ["Three Questions", [
        ["Reading and Theme", "Follow the king's search for answers and explain the story's message about the present moment."],
        ["Question Words and Sentences", "Use who, what, when, where, why and how to form clear questions."]
      ]],
      ["A Gift of Chappals", [
        ["Story and Characters", "Describe the children's kindness and the events that lead to the gift of chappals."],
        ["Adjectives in Description", "Use adjectives to describe people, places and feelings more clearly."]
      ]]
    ],
    social: [
      ["Environment", [
        ["Natural and Human Environment", "Distinguish natural surroundings from human-made places and see how they interact."],
        ["Ecosystem and Balance", "Explain food chains, interdependence and why balance in nature matters."]
      ]],
      ["Inside Our Earth", [
        ["Layers of the Earth", "Describe the crust, mantle and core and how scientists learn about them."],
        ["Rocks and Minerals", "Identify igneous, sedimentary and metamorphic rocks and common minerals."]
      ]]
    ],
    computer: [
      ["Computer Hardware", [
        ["Inside a Computer", "Identify the processor, memory and motherboard, and explain their roles."],
        ["Storage Devices", "Compare hard disks, pen drives, memory cards and cloud storage."]
      ]],
      ["Internet Basics", [
        ["What is the Internet?", "Understand networks, websites and how information travels between computers."],
        ["Safe Browsing", "Recognise safe links, strong passwords and what to do when something looks suspicious."]
      ]]
    ]
  },
  8: {
    math: [
      ["Rational Numbers", [
        ["What are Rational Numbers?", "Identify rational numbers and place them on the number line."],
        ["Operations and Properties", "Add, subtract, multiply and divide rational numbers and use their properties."]
      ]],
      ["Linear Equations in One Variable", [
        ["Solving Equations", "Use inverse operations to solve equations with one variable."],
        ["Word Problems with Equations", "Translate everyday situations into equations and check the answers."]
      ]]
    ],
    science: [
      ["Crop Production and Management", [
        ["Soil Preparation and Sowing", "Understand ploughing, levelling, manure and choosing good seeds."],
        ["Irrigation and Harvesting", "Compare irrigation methods, protect crops from weeds and harvest safely."]
      ]],
      ["Electricity and Circuits", [
        ["Electric Current and Circuits", "Explain current, cells, bulbs and how a closed circuit works."],
        ["Conductors and Insulators", "Test materials and explain why wires are insulated."]
      ]],
      ["Light", [
        ["Reflection of Light", "Explore how light bounces off mirrors and how we see objects."],
        ["Refraction and the Spectrum", "See how light bends and how white light splits into colours."]
      ]]
    ],
    english: [
      ["The Best Christmas Present in the World", [
        ["Reading and Theme", "Follow the story within a story and discuss peace, memory and kindness."],
        ["Descriptive Writing", "Use sensory details to describe a place or moment vividly."]
      ]],
      ["Grammar Essentials", [
        ["Tenses", "Use present, past and future forms accurately in speech and writing."],
        ["Active and Passive Voice", "Change sentences between active and passive voice without changing meaning."]
      ]]
    ],
    social: [
      ["Resources and Development", [
        ["Types of Resources", "Classify natural, human-made and human resources with examples."],
        ["Sustainable Use of Resources", "Explain conservation, reuse and why resources must be used carefully."]
      ]],
      ["The Indian Constitution", [
        ["Why a Constitution?", "Explain the need for rules, rights and limits on power."],
        ["Key Features of the Constitution", "Describe federalism, fundamental rights and the role of the Constitution."]
      ]]
    ],
    computer: [
      ["Computer Fundamentals", [
        ["Hardware and Software", "Separate physical parts from programs and understand system software."],
        ["Number Systems", "Convert simple numbers between decimal and binary."]
      ]],
      ["Internet and Web", [
        ["How the Internet Works", "Follow a web request from a browser to a server and back."],
        ["Email and Online Collaboration", "Write a clear email and use shared documents safely."]
      ]]
    ]
  },
  9: {
    math: [
      ["Number Systems", [
        ["Rational and Irrational Numbers", "Tell rational and irrational numbers apart and use decimal expansions."],
        ["Real Numbers and the Number Line", "Represent real numbers and simplify surds."]
      ]],
      ["Polynomials", [
        ["Polynomial Basics", "Identify the degree, coefficients and terms of polynomials."],
        ["Algebraic Identities", "Use identities such as (a+b)^2 to expand and factorise expressions."]
      ]]
    ],
    science: [
      ["Matter in Our Surroundings", [
        ["States of Matter", "Compare solids, liquids and gases using particle arrangement and movement."],
        ["Change of State", "Explain melting, evaporation, condensation and sublimation."]
      ]],
      ["The Fundamental Unit of Life", [
        ["The Cell", "Describe the cell as the basic unit of life and compare plant and animal cells."],
        ["Cell Organelles", "Explain the jobs of the nucleus, mitochondria and cell membrane."]
      ]]
    ],
    english: [
      ["The Fun They Had", [
        ["Reading and Theme", "Compare the mechanical school in the story with your own school."],
        ["Reported Speech", "Report what someone said using correct tense and pronoun changes."]
      ]],
      ["Wind and Rain", [
        ["Poetry Appreciation", "Read the poem aloud and discuss its images and mood."],
        ["Figures of Speech", "Identify simile, metaphor and personification in poems."]
      ]]
    ],
    social: [
      ["India – Size and Location", [
        ["Location and Extent", "Use latitude and longitude to describe India's position and size."],
        ["Neighbours and Coastline", "Identify India's neighbouring countries and major physical boundaries."]
      ]],
      ["Democracy in the Contemporary World", [
        ["What is Democracy?", "Explain participation, equality and accountability in a democracy."],
        ["Rights and Responsibilities", "Connect democratic rights with the duties of citizens."]
      ]]
    ],
    computer: [
      ["Digital Documentation", [
        ["Word Processing Basics", "Create, format and save a document with headings, lists and tables."],
        ["Formatting and Printing", "Use styles, page setup and print preview correctly."]
      ]],
      ["Electronic Spreadsheets", [
        ["Formulas and Functions", "Write formulas and use SUM, AVERAGE, MIN and MAX."],
        ["Charts and Data", "Choose a suitable chart to explain simple data."]
      ]]
    ]
  },
  10: {
    math: [
      ["Real Numbers", [
        ["Euclid's Division Lemma", "Use the division algorithm to find HCF and understand remainders."],
        ["HCF, LCM and Irrational Numbers", "Relate HCF and LCM and prove simple irrationality results."]
      ]],
      ["Quadratic Equations", [
        ["Solving Quadratic Equations", "Solve quadratic equations by factorisation and the quadratic formula."],
        ["Applications of Quadratics", "Model area, speed and number problems with quadratic equations."]
      ]]
    ],
    science: [
      ["Chemical Reactions and Equations", [
        ["Types of Chemical Reactions", "Recognise combination, decomposition, displacement and redox reactions."],
        ["Balancing Equations", "Balance chemical equations by conserving atoms."]
      ]],
      ["Electricity", [
        ["Electric Current and Ohm's Law", "Relate current, voltage and resistance using Ohm's law."],
        ["Series and Parallel Circuits", "Compare current and voltage in series and parallel circuits."]
      ]],
      ["Light – Reflection and Refraction", [
        ["Spherical Mirrors", "Draw ray diagrams for concave and convex mirrors."],
        ["Lenses and Image Formation", "Use lens formulae to locate images formed by convex and concave lenses."]
      ]]
    ],
    english: [
      ["A Letter to God", [
        ["Reading and Theme", "Discuss faith, hope and irony in the story of Lencho."],
        ["Writing a Formal Letter", "Structure a formal letter with address, subject and clear body."]
      ]],
      ["Nelson Mandela: Long Walk to Freedom", [
        ["Reading and Analysis", "Analyse Mandela's message about freedom and equality."],
        ["Tenses Review", "Revise tense consistency in narrative writing."]
      ]]
    ],
    social: [
      ["Nationalism in India", [
        ["Non-Cooperation Movement", "Explain why the movement began and how people participated."],
        ["Civil Disobedience", "Describe the Salt March and its importance."]
      ]],
      ["Resources and Development", [
        ["Resource Planning", "Explain why planning resources is important for a growing country."],
        ["Soil Conservation", "Identify soil erosion causes and conservation methods."]
      ]]
    ],
    computer: [
      ["Data and Information", [
        ["Data Representation", "Understand bits, bytes and how text, images and sound are stored."],
        ["Database Basics", "Explain tables, records and simple queries."]
      ]],
      ["Python Fundamentals", [
        ["Variables and Data Types", "Create variables and use numbers, strings and lists in Python."],
        ["Control Flow", "Write if statements and loops to make decisions and repeat work."]
      ]]
    ]
  }
};

const TOPIC_OVERRIDES = {
  "top-8-science-2-1": {
    sections: [
      {
        heading: "What is electric current?",
        body: "Electric current is the flow of electric charge through a material. In the wires of a circuit, tiny particles called electrons drift along the wire when a cell or battery pushes them. We measure current in amperes (A) and often use the symbol I. A current needs a complete path, called a closed circuit, before it can flow.",
        bullets: [
          "A cell has a positive terminal and a negative terminal.",
          "Current flows only when the circuit is closed, with no gaps.",
          "A switch is simply a controlled gap that opens or closes the circuit."
        ]
      },
      {
        heading: "How a bulb lights up",
        body: "Inside a torch bulb there is a thin tungsten filament. When current passes through it, the filament resists the flow and becomes very hot. It glows and gives out light. The glass bulb protects the filament and keeps oxygen away so it does not burn quickly. If the filament breaks, the circuit is open and the bulb stops glowing.",
        bullets: [
          "The filament's high resistance converts electrical energy into heat and light.",
          "Two terminals at the base of the bulb connect to the circuit."
        ]
      },
      {
        heading: "Cells, batteries and safe circuits",
        body: "A cell stores chemical energy and changes it into electrical energy. A battery is a group of cells joined together. In school experiments we use low-voltage cells and never connect the two terminals directly with a wire — that is a short circuit. It makes wires hot and can damage the cell or cause a fire."
      }
    ],
    definitions: [
      ["Electric current", "The flow of electric charge through a conductor, measured in amperes (A)."],
      ["Circuit", "A complete closed path through which electric current can flow."],
      ["Filament", "The thin high-resistance wire inside a bulb that glows when current passes."],
      ["Switch", "A device that opens or closes a circuit to control current."]
    ],
    notes: [
      "Draw every circuit as a clean diagram with symbols: cell, switch, bulb and connecting wires.",
      "An open circuit has a gap, so current cannot flow and the bulb does not glow.",
      "Never experiment with mains electricity (220 V). Use cells or batteries only."
    ],
    examples: [
      ["Torch", "The switch closes the circuit, current lights the bulb, and the reflector sends light forward."],
      ["Doorbell", "Pressing the button closes a circuit that feeds current to a small electromagnet, which rings the bell."],
      ["Emergency light with solar cell", "A solar panel charges a battery during the day; at night the battery powers an LED lamp."]
    ],
    images: [
      { url: "/assets/learn/electric-circuit.svg", caption: "A simple closed circuit: cell, switch, bulb and wires", alt: "Diagram of a cell, switch and glowing bulb connected by wires", kind: "IMAGE" }
    ],
    applications: [
      "Every torch, phone charger and solar lamp depends on a controlled electric circuit.",
      "Fuses and circuit breakers open a circuit automatically when too much current flows, protecting a home.",
      "A farmer's solar pump uses the same idea: panels charge a controller, which runs a motor to lift water."
    ],
    keyPoints: [
      "Current flows only in a closed circuit.",
      "A cell converts chemical energy into electrical energy.",
      "A bulb's filament glows because it resists current and gets hot.",
      "Switches control circuits by opening or closing the path.",
      "Never connect a cell's terminals directly — that creates a short circuit."
    ],
    practiceQuestions: [
      ["Why does a bulb not glow when its filament is broken?", "The filament is part of the conducting path. When it breaks, the circuit becomes open, so current cannot flow."],
      ["What is the difference between a cell and a battery?", "A cell is a single source of electrical energy; a battery is a group of two or more cells joined together."],
      ["Draw a circuit with one cell, one switch and one bulb.", "The cell, switch and bulb should be connected in a single closed loop with switch symbols and two terminals at each component."]
    ]
  },
  "top-8-science-3-1": {
    sections: [
      {
        heading: "Light travels in straight lines",
        body: "Light is a form of energy that lets us see. It travels in straight lines until it meets a surface. When light hits a smooth, shiny surface such as a plane mirror, it bounces back. This bouncing is called reflection. The ray that arrives is the incident ray, and the ray that leaves is the reflected ray.",
        bullets: [
          "The normal is a line perpendicular to the mirror at the point where light hits.",
          "Angle of incidence is measured between the incident ray and the normal.",
          "Angle of reflection is measured between the reflected ray and the normal."
        ]
      },
      {
        heading: "Laws of reflection",
        body: "The angle of incidence is always equal to the angle of reflection. The incident ray, the reflected ray and the normal all lie in the same plane. In a plane mirror the image is virtual, behind the mirror, the same size as the object, and left–right reversed. The image is as far behind the mirror as the object is in front of it."
      },
      {
        heading: "Seeing objects",
        body: "We see a book because light from the sun or a bulb falls on it and scatters into our eyes. We see an image in a mirror because reflected rays reach our eyes. In a completely dark room no light enters our eyes from objects, so we cannot see them — even though our eyes are open."
      }
    ],
    definitions: [
      ["Reflection", "The bouncing back of light when it hits a surface."],
      ["Normal", "A line drawn perpendicular to a surface at the point of incidence."],
      ["Virtual image", "An image from which light rays only appear to come; it cannot be caught on a screen."]
    ],
    notes: [
      "Always draw the normal as a dotted line.",
      "Plane mirrors produce virtual, erect images of the same size.",
      "Diffuse reflection from rough surfaces lets us see ordinary objects from many directions."
    ],
    examples: [
      ["Mirror at home", "A plane mirror forms an upright image and makes a room look larger."],
      ["Rear-view mirror", "A convex mirror gives a wider view of traffic behind a bus or tractor."],
      ["Reflective strip", "A cycle reflector reflects headlights back toward the driver."]
    ],
    images: [
      { url: "/assets/learn/reflection.svg", caption: "Angle of incidence equals angle of reflection", alt: "Light ray striking a plane mirror with equal angles marked", kind: "IMAGE" }
    ],
    applications: ["Mirrors in a dentist's tool let the dentist see hidden surfaces.", "Convex mirrors are used at blind corners on village roads.", "Solar cookers use reflectors to direct sunlight onto a cooking pot."],
    keyPoints: [
      "Light travels in straight lines.",
      "Angle of incidence = angle of reflection.",
      "A plane mirror forms a virtual, erect, same-size image.",
      "Rough surfaces scatter light, which is called diffuse reflection.",
      "We see non-luminous objects only when light from them reaches our eyes."
    ],
    practiceQuestions: [
      ["Why can you see your face in a mirror but not in a mud wall?", "A mirror has a smooth surface and reflects light in a regular way. A mud wall has a rough surface and scatters light in many directions."],
      ["State the two laws of reflection.", "1) Angle of incidence equals angle of reflection. 2) The incident ray, normal and reflected ray lie in the same plane."]
    ]
  },
  "top-8-science-1-1": {
    sections: [
      {
        heading: "Preparing the soil",
        body: "Farmers prepare land before sowing. Ploughing loosens and turns the soil, bringing nutrients to the surface and letting air and water enter. Wooden or iron ploughs are pulled by animals or tractors. After ploughing, the field is levelled so that water stays evenly distributed and seeds are sown at a similar depth.",
        bullets: ["Ploughing improves air circulation in the soil.", "Levelling prevents water from collecting in low patches.", "Manure and compost add organic matter and improve soil texture."]
      },
      {
        heading: "Choosing and sowing seeds",
        body: "Good seeds are healthy, clean, uniform in size and free from damage. Farmers sometimes soak seeds in water to test which ones are viable — healthy seeds sink. Sowing can be done by hand, by a seed drill, or by transplanting seedlings. The right spacing gives each plant enough sunlight, water and nutrients."
      },
      {
        heading: "Caring for the crop",
        body: "Crops need water at the right times. Irrigation may come from canals, wells, tube wells, ponds or rainwater harvesting. Weeds compete with crops for water and nutrients, so they are removed by hand, with a hoe, or with weedicides used carefully. Pests and diseases are controlled through observation, resistant varieties and safe practices."
      }
    ],
    definitions: [
      ["Ploughing", "Loosening and turning the soil to prepare it for sowing."],
      ["Irrigation", "Supplying water to crops at regular intervals."],
      ["Weeding", "Removing unwanted plants that compete with the crop."],
      ["Seed drill", "A tool that sows seeds at a uniform depth and spacing."]
    ],
    notes: ["Healthy seeds sink in water; damaged or hollow seeds float.", "Over-irrigation can waterlog the field and damage roots.", "Crop rotation helps maintain soil nutrients."],
    examples: [
      ["Wheat field", "Ploughing, levelling, sowing with a seed drill, irrigation at crown-root stages and careful harvesting."],
      ["Kitchen garden", "Adding compost, sowing seeds in rows and hand-weeding gives healthy vegetables."]
    ],
    images: [{ url: "/assets/learn/farming.svg", caption: "From prepared soil to a healthy harvest", alt: "Illustration of ploughing, irrigation and harvesting", kind: "IMAGE" }],
    applications: ["Seed drills save seed and keep rows even.", "Drip irrigation sends water directly to roots and saves water.", "Rainwater harvesting tanks help farmers during dry spells."],
    keyPoints: ["Ploughing loosens soil and improves air and water movement.", "Good seeds are healthy, clean and uniform.", "Irrigation must match the crop's needs.", "Weeds compete with crops and must be removed.", "Harvesting and safe storage protect the final produce."],
    practiceQuestions: [["Why is levelling important after ploughing?", "It prevents water from collecting in low areas and helps seeds germinate evenly."], ["Name two ways to remove weeds.", "By hand (manual weeding) and with a hoe or weedicide, used carefully."]]
  },
  "top-8-math-1-1": {
    sections: [
      {
        heading: "What is a rational number?",
        body: "A rational number is any number that can be written as p/q, where p and q are integers and q is not zero. Examples include 3/4, -5/7, 6 (because 6 = 6/1) and 0 (0/1). Rational numbers include integers, terminating decimals and repeating decimals.",
        bullets: ["Every integer is a rational number.", "0 is a rational number, but division by 0 is undefined.", "The same rational number has many equivalent forms, such as 1/2 = 2/4 = 50/100."]
      },
      {
        heading: "Placing them on the number line",
        body: "Rational numbers fill the spaces between integers. To place 3/4, divide the gap between 0 and 1 into four equal parts and count three parts. Negative rationals sit to the left of zero. Between any two rational numbers you can always find another rational number — for example, the average of 1/3 and 1/2 is 5/12."
      },
      {
        heading: "Working with rational numbers",
        body: "To add or subtract, write both numbers with a common denominator. To multiply, multiply numerators and denominators. To divide, multiply by the reciprocal. Always simplify the answer and keep the sign with the numerator. For example: 2/3 + 1/4 = 8/12 + 3/12 = 11/12."
      }
    ],
    definitions: [
      ["Rational number", "A number that can be written as p/q where p and q are integers and q ≠ 0."],
      ["Reciprocal", "The number obtained by swapping numerator and denominator; 3/5 and 5/3 are reciprocals."],
      ["Additive identity", "The number 0, because adding 0 does not change a number."]
    ],
    notes: ["A rational number has a terminating or repeating decimal expansion.", "Division by zero is not allowed.", "Keep answers in simplest form."],
    examples: [["Sharing a roti", "Three friends share two rotis equally: each gets 2/3 of a roti."], ["Temperature change", "A temperature of -2°C rising by 3/4°C becomes -5/4°C."]],
    applications: ["Recipes use fractions such as 1/2 cup or 3/4 teaspoon.", "Bank interest and discounts are often given as decimals, which are rational numbers.", "Carpenters measure lengths in halves and quarters."],
    keyPoints: ["Rational numbers are of the form p/q, q ≠ 0.", "Integers and terminating decimals are rational.", "Common denominators make addition and subtraction easy.", "Multiplying by the reciprocal performs division.", "There are infinitely many rational numbers between any two rational numbers."],
    practiceQuestions: [["Is 0.75 rational? Explain.", "Yes. 0.75 = 75/100 = 3/4, which is in p/q form."], ["Find 1/2 + 1/3.", "3/6 + 2/6 = 5/6."]]
  },
  "top-8-english-1-1": {
    sections: [
      {
        heading: "The story within the story",
        body: "The narrator visits an old house and finds a letter hidden in a desk. The letter tells of Jim Macpherson, a soldier in the First World War, and his wife Connie. Jim writes about a Christmas truce when soldiers from opposite sides stopped fighting, shared food and played football. The reader moves between the narrator's present and Jim's past.",
        bullets: ["Pay attention to dates and who is speaking.", "Notice how the truce contrasts with the war around it.", "The title refers to both the letter and the hope it carries."]
      },
      {
        heading: "Theme: peace and kindness",
        body: "The story asks what war does to ordinary people and how small acts of kindness survive inside it. Jim's letter is a gift of memory. When the narrator meets Connie, she believes her husband has returned; the story ends with tenderness rather than correction. The Christmas present is not an object — it is the message that humanity can still be found in terrible times."
      },
      {
        heading: "Reading like a writer",
        body: "Notice the descriptive details: the broken window, the old desk, the frozen field. These details build atmosphere. Dialogue in the letter makes Jim's voice feel immediate. When you write your own description, choose three strong sensory details instead of many weak ones."
      }
    ],
    definitions: [["Truce", "An agreement to stop fighting for a period of time."], ["Irony", "A situation that is strange or funny because it is the opposite of what you expect."], ["Theme", "The central idea or message explored by a story."]],
    notes: ["The story is set during the First World War.", "Connie's memory loss adds emotional depth.", "Use short quotations in answers about theme."],
    examples: [["Descriptive sentence", "The frozen field glittered under a grey sky as the soldiers climbed out of their trenches."]],
    applications: ["Reading stories from other times builds empathy.", "Descriptive writing helps you write clearer letters and reports."],
    keyPoints: ["The story moves between two time periods.", "The Christmas truce is a moment of shared humanity.", "The letter is both a memory and a gift.", "Connie's response adds tenderness and sadness.", "Specific details create a believable atmosphere."],
    practiceQuestions: [["Why is the letter important to Connie?", "It brings back the memory of her husband and the Christmas truce, giving her comfort and hope."], ["What does the story suggest about war?", "War separates ordinary people who may share the same hopes; kindness can appear even between enemies."]]
  },
  "top-8-english-2-1": {
    sections: [
      {
        heading: "Tense and time",
        body: "Tense tells us when an action happens. Simple present describes habits and facts: I walk to school. Present continuous describes actions happening now: I am walking. Present perfect connects the past to now: I have finished my homework. Simple past describes completed past actions, and simple future describes what will happen.",
        bullets: ["Use time markers such as now, yesterday, already and next week.", "Keep the tense consistent inside a paragraph unless the time changes.", "Irregular verbs have special past forms: go → went, write → wrote."]
      },
      {
        heading: "Choosing the right tense",
        body: "Ask: when did the action happen, and is it finished? For a school trip last week, use simple past. For a habit, use simple present. For an action that started in the past and still matters now, use present perfect. Sentences like 'I have visited Nabha last year' are wrong because 'last year' points to a finished time; say 'I visited Nabha last year.'"
      },
      {
        heading: "Practice with a paragraph",
        body: "Read your writing aloud and underline every verb. Check that the time each verb shows matches the time of the sentence. Then check subject–verb agreement: He writes, they write. This simple review catches most tense mistakes."
      }
    ],
    definitions: [["Tense", "The form of a verb that shows the time of an action."], ["Auxiliary verb", "A helping verb such as be, have or do."], ["Agreement", "Matching the verb with its subject in number and person."]],
    notes: ["Present perfect = have/has + past participle.", "Do not use a past-time expression with present perfect.", "Underline verbs when proofreading."],
    examples: [["Simple past", "We visited the solar plant yesterday."], ["Present perfect", "We have visited the solar plant twice."], ["Future", "We will visit the solar plant next month."]],
    applications: ["Clear tenses make applications, emails and exam answers easy to follow."],
    keyPoints: ["Tense shows time.", "Simple present is for habits and facts.", "Second form is for finished past actions.", "Present perfect links past to present.", "Keep tense consistent and match the subject."],
    practiceQuestions: [["Change to simple past: 'She writes a letter.'", "She wrote a letter."], ["Fill in: 'They ___ (finish) the project already.'", "They have finished the project already."]]
  },
  "top-8-social-2-2": {
    sections: [
      {
        heading: "A rulebook for the nation",
        body: "The Constitution is the highest law of India. It was adopted on 26 November 1949 and came into force on 26 January 1950. It explains how the government is formed, what powers it has, and what rights every person holds. No ordinary law can violate the Constitution."
      },
      {
        heading: "Federalism and separation of powers",
        body: "India has a federal system with a central government and state governments. Powers are divided by lists: Union, State and Concurrent. The Constitution also separates the legislature, executive and judiciary so that no single branch becomes too powerful. Courts can review whether laws follow the Constitution."
      },
      {
        heading: "Fundamental rights and equality",
        body: "Fundamental rights protect equality, freedom, life, education and protection from exploitation. They are enforceable in court. Rights come with responsibilities, and reasonable restrictions can be placed on them to protect public order and safety. The Constitution also names duties that guide citizens."
      }
    ],
    definitions: [["Constitution", "The fundamental law that sets out the structure and powers of government and the rights of citizens."], ["Federalism", "A system where power is shared between national and state governments."], ["Fundamental rights", "Basic rights guaranteed by the Constitution and protected by courts."]],
    notes: ["26 January is celebrated as Republic Day.", "Dr B. R. Ambedkar chaired the Drafting Committee.", "Fundamental rights apply to every person in India, not only citizens."],
    examples: [["Right to Education", "Children aged 6–14 have a constitutional right to free and compulsory education."], ["Equality before law", "The same law applies to every citizen, whatever their background."]],
    applications: ["Knowing your rights helps you respond to unfair treatment.", "Village committees and panchayats operate within constitutional rules."],
    keyPoints: ["The Constitution is the supreme law.", "It was adopted in 1949 and enforced in 1950.", "Federalism shares power between the Union and states.", "Fundamental rights protect individuals and are enforceable.", "Rights and duties go together."],
    practiceQuestions: [["Why is the Constitution called the supreme law?", "All other laws and government actions must follow it; courts can strike down laws that violate it."], ["Name two fundamental rights.", "The right to equality and the right to education (other valid answers include freedom, life and protection from exploitation)."]]
  },
  "top-7-science-1-1": {
    sections: [
      {
        heading: "Plants make their own food",
        body: "Green plants make food through photosynthesis. Leaves contain chlorophyll, a green pigment that captures sunlight. The plant takes carbon dioxide from the air through tiny openings called stomata and water from the soil through roots. Sunlight provides energy to combine these into glucose, and oxygen is released.",
        bullets: ["Carbon dioxide + water + sunlight → glucose + oxygen.", "Chlorophyll is found inside chloroplasts.", "Photosynthesis happens mainly in leaves."]
      },
      {
        heading: "Adaptations for photosynthesis",
        body: "Leaves are broad and flat to capture light, thin so gases diffuse easily, and have veins that carry water and glucose. Stomata open and close to balance gas exchange with water loss. Plants in bright sunlight may grow leaves at different angles to avoid overheating."
      },
      {
        heading: "Why it matters",
        body: "Photosynthesis produces the food at the base of almost every food chain. It also releases the oxygen we breathe. Protecting trees and green cover protects both food and air. In a village, shade trees and crop plants are part of the same global process."
      }
    ],
    definitions: [["Photosynthesis", "The process by which green plants use sunlight, water and carbon dioxide to make food."], ["Chlorophyll", "The green pigment in leaves that absorbs light energy."], ["Stomata", "Tiny openings on leaves that let gases enter and leave."]],
    notes: ["Photosynthesis needs light, chlorophyll, carbon dioxide and water.", "Oxygen is a by-product, not the main goal for the plant.", "At night, plants respire and take in oxygen."],
    examples: [["Potted plant near a window", "Leaves turn toward light and produce new growth faster."], ["Crop field", "Healthy green leaves capture more sunlight and produce a better yield."]],
    applications: ["Farmers manage spacing so each plant receives enough light.", "Forests cool the air and release oxygen through photosynthesis."],
    keyPoints: ["Plants are autotrophs: they make their own food.", "Chlorophyll captures light energy.", "Water and carbon dioxide are the raw materials.", "Oxygen is released during the process.", "Photosynthesis supports nearly all food chains."],
    practiceQuestions: [["Why are leaves broad and flat?", "To capture as much sunlight as possible."], ["What happens to photosynthesis at night?", "It stops because there is no sunlight; respiration continues."]]
  },
  "top-10-science-2-1": {
    sections: [
      {
        heading: "The three quantities",
        body: "Electric current (I) is the rate of flow of charge and is measured in amperes. Potential difference (V) is the work done to move a unit charge between two points and is measured in volts. Resistance (R) opposes the flow of current and is measured in ohms. Ohm's law connects them: V = IR at constant temperature."
      },
      {
        heading: "Understanding resistance",
        body: "A long, thin wire has more resistance than a short, thick one. Resistance depends on the material, length, thickness and temperature. Resistors are used to control current in circuits. A voltmeter is connected in parallel to measure potential difference, while an ammeter is connected in series to measure current."
      },
      {
        heading: "Using Ohm's law",
        body: "If a 6 V battery is connected across a 3 Ω resistor, the current is I = V/R = 2 A. Ohm's law works for metallic conductors at constant temperature. Filament bulbs do not obey it exactly because their temperature changes, but the law remains a useful starting point."
      }
    ],
    definitions: [["Ohm's law", "At constant temperature, V = IR for a metallic conductor."], ["Resistance", "The property that opposes current, measured in ohms (Ω)."], ["Potential difference", "Work done per unit charge between two points, measured in volts."]],
    notes: ["Use V = IR, I = V/R, R = V/I.", "Ammeter in series, voltmeter in parallel.", "Resistance increases with length and decreases with thickness."],
    examples: [["Torch circuit", "Two 1.5 V cells and a 3 Ω bulb draw about 1 A."], ["House wiring", "Thick copper wires reduce resistance and energy loss."]],
    applications: ["Electric heaters use high-resistance wire to produce heat.", "Fuses melt when current is too high, protecting appliances."],
    keyPoints: ["Current is measured in amperes.", "Potential difference is measured in volts.", "Resistance is measured in ohms.", "V = IR for metallic conductors at constant temperature.", "Meters must be connected correctly."],
    practiceQuestions: [["A 12 V battery drives 2 A through a resistor. Find R.", "R = V/I = 12/2 = 6 Ω."], ["Why is an ammeter connected in series?", "So that the whole current flows through it and can be measured."]]
  },
  "top-10-math-2-1": {
    sections: [
      {
        heading: "What makes an equation quadratic?",
        body: "A quadratic equation has the form ax² + bx + c = 0, where a ≠ 0. The highest power of the variable is 2. Examples include x² − 5x + 6 = 0 and 2x² + 3x − 2 = 0. Its solutions are called roots, and a quadratic has at most two real roots."
      },
      {
        heading: "Factorisation",
        body: "To solve x² − 5x + 6 = 0, find two numbers that multiply to 6 and add to −5: −2 and −3. Split the middle term, group and factor: (x − 2)(x − 3) = 0. So x = 2 or x = 3. Always set each factor to zero, never just one."
      },
      {
        heading: "Formula and discriminant",
        body: "When factorisation is difficult, use x = (−b ± √(b² − 4ac)) / 2a. The discriminant D = b² − 4ac tells us the nature of the roots: D > 0 gives two distinct real roots, D = 0 gives equal roots, and D < 0 gives no real roots. Check answers by substituting them back into the equation."
      }
    ],
    definitions: [["Quadratic equation", "An equation of the form ax² + bx + c = 0 with a ≠ 0."], ["Root", "A value of the variable that makes the equation true."], ["Discriminant", "b² − 4ac, which determines the nature of the roots."]],
    notes: ["Set the equation to zero before factorising.", "Do not divide by a variable that could be zero.", "Substitute roots back to verify."],
    examples: [["Area problem", "A rectangular plot has length x + 3 and width x; if area is 40, x² + 3x − 40 = 0, giving x = 5."], ["Number problem", "The product of two consecutive odd numbers is 63: x(x + 2) = 63."]],
    applications: ["Projectile paths and bridge arches are modelled by quadratics.", "Optimising area for a fixed fence length uses quadratic ideas."],
    keyPoints: ["Standard form: ax² + bx + c = 0, a ≠ 0.", "Factorisation finds roots quickly when factors are simple.", "The quadratic formula always works for real roots.", "The discriminant indicates the number of real roots.", "Always verify roots in the original equation."],
    practiceQuestions: [["Solve x² − 7x + 12 = 0.", "Factors (x − 3)(x − 4) = 0, so x = 3 or x = 4."], ["Find the discriminant of x² + 2x + 5 = 0.", "D = 4 − 20 = −16, so there are no real roots."]]
  },
  "top-9-science-1-1": {
    sections: [
      {
        heading: "Particles in three states",
        body: "Matter is made of tiny particles with spaces between them and motion of their own. In solids, particles are tightly packed and vibrate in place, so solids have fixed shape and volume. In liquids, particles are close but can slide, so liquids flow and take the shape of the container. In gases, particles are far apart and move quickly, filling any container.",
        bullets: ["Solids: fixed shape and volume.", "Liquids: fixed volume, take container shape.", "Gases: no fixed shape or volume, highly compressible."]
      },
      {
        heading: "Evidence from everyday life",
        body: "A drop of ink spreads in water without stirring because particles move and mix. The smell of incense travels across a room. Gases compress easily in a syringe, while a solid brick does not. These observations support the particle model of matter."
      },
      {
        heading: "Temperature and particle motion",
        body: "Heating increases the kinetic energy of particles. At a certain temperature, a solid melts and a liquid boils. Cooling removes energy and slows particles, allowing a gas to condense and a liquid to freeze. The temperature remains steady during a change of state because energy is used to break or form attractions rather than raise temperature."
      }
    ],
    definitions: [["Diffusion", "The spreading of particles from a region of higher concentration to lower concentration."], ["Kinetic energy", "Energy of motion possessed by particles."], ["Latent heat", "Heat absorbed or released during a change of state without a temperature change."]],
    notes: ["Particles are always in motion, even in solids.", "Gases are compressible because of large spaces between particles.", "Temperature stays constant during melting and boiling."],
    examples: [["Ink in water", "Diffusion spreads ink through water."], ["Pressure cooker", "Increasing temperature raises particle energy and pressure."]],
    applications: ["Ventilation removes warm, moist air from a kitchen.", "Refrigerators use evaporation and condensation to move heat."],
    keyPoints: ["Matter is particulate.", "Particle arrangement explains state properties.", "Diffusion is evidence of particle motion.", "Heating changes particle energy.", "Temperature is steady during state changes."],
    practiceQuestions: [["Why do gases fill their container?", "Their particles move rapidly and are far apart, so they spread to fill available space."], ["Why does temperature not rise while ice melts?", "Energy is used to overcome attractions between particles rather than increase kinetic energy."]]
  },
  "top-6-science-2-1": {
    sections: [
      {
        heading: "Food gives us more than energy",
        body: "Our food contains nutrients that the body needs for energy, growth and repair. Carbohydrates and fats are mainly energy sources. Proteins build and repair tissues. Vitamins and minerals protect us from disease and help body processes. Water carries nutrients and roughage helps digestion.",
        bullets: ["Carbohydrates: rice, wheat, potato.", "Proteins: dal, milk, eggs, groundnut.", "Vitamins and minerals: fruits and vegetables.", "Roughage: whole grains and salads."]
      },
      {
        heading: "Simple tests for nutrients",
        body: "Iodine solution turns blue-black with starch. Copper sulphate and caustic soda produce a violet colour with protein. A translucent spot on paper suggests fat. These simple tests help us understand what our food contains."
      },
      {
        heading: "A balanced plate",
        body: "A balanced diet includes energy foods, body-building foods and protective foods in the right amounts, along with water. Growing children need more protein. Too much sugar or fried food can harm health. Fresh, local foods are often the most affordable way to eat well."
      }
    ],
    definitions: [["Nutrient", "A substance in food that the body needs to work properly."], ["Balanced diet", "A diet containing all nutrients in the right amounts."], ["Roughage", "Indigestible fibre that helps keep the digestive system healthy."]],
    notes: ["Vitamin C prevents scurvy.", "Vitamin D helps the body absorb calcium.", "Iron deficiency causes anaemia."],
    examples: [["School lunch", "Roti, dal, seasonal vegetable, curd and fruit make a balanced meal."]],
    applications: ["Reading food labels helps choose healthier snacks.", "A school kitchen can plan a balanced weekly menu."],
    keyPoints: ["Carbohydrates and fats give energy.", "Proteins build the body.", "Vitamins and minerals protect health.", "Water and roughage are essential.", "A balanced diet prevents deficiency diseases."],
    practiceQuestions: [["Name two sources of protein.", "Dal and milk are two examples."], ["Why is roughage important?", "It helps food move through the digestive system and prevents constipation."]]
  }
};

const SUBJECT_EXTRAS = {
  Mathematics: {
    applications: ["Sharing and measuring fairly at home and in the shop.", "Understanding bills, discounts and simple interest.", "Planning a field, a budget or a journey."],
    study: "Write each step of a solution. Check the answer by substituting it back."
  },
  Science: {
    applications: ["Explaining weather, food, health and machines around you.", "Making careful observations before drawing conclusions.", "Using science to solve village-level problems such as water storage."],
    study: "Draw a labelled diagram and write the definition in your own words."
  },
  English: {
    applications: ["Writing clear applications, emails and reports.", "Reading notices, forms and news with understanding.", "Speaking confidently in interviews and group discussions."],
    study: "Read the passage aloud, underline new words and use each one in a sentence."
  },
  "Social Science": {
    applications: ["Understanding rights, duties and local government.", "Reading maps and interpreting news about places.", "Making informed choices as a citizen."],
    study: "Connect the idea to a place or event you know, then write a short timeline."
  },
  "Computer Studies": {
    applications: ["Typing, saving and sharing school work safely.", "Using spreadsheets for marks and budgets.", "Staying safe online and protecting your accounts."],
    study: "Practise on the device, then explain the steps to a friend without looking."
  }
};

const SUBJECT_KEY_BY_NAME = { Mathematics: "math", Science: "science", English: "english", "Social Science": "social", "Computer Studies": "computer" };

const now = new Date("2026-11-01T09:00:00.000Z");
const iso = (offsetMinutes = 0) => new Date(now.getTime() + offsetMinutes * 60000).toISOString();

const seed = {
  version: "2026.11.15-2",
  schools: [
    { id: "school-demo-1", name: "NabhaLearn Demo School", village: "Nabha (demo)", district: "Patiala", demo: true, createdAt: iso() },
    { id: "school-demo-2", name: "Sample Rural Senior Secondary School (Demo)", village: "Demo village", district: "Patiala", demo: true, createdAt: iso() }
  ],
  classes: [],
  subjects: [],
  chapters: [],
  topics: [],
  learningContents: [],
  exploreContents: [],
  quizzes: [],
  assignments: []
};

for (const [index, cls] of CLASSES.entries()) {
  const level = cls.level;
  seed.classes.push({
    id: `class-${level}`,
    name: `Class ${level}`,
    level,
    description: cls.description,
    order: index + 1,
    active: true
  });
}

let subjectOrder = 0;
for (const cls of CLASSES) {
  const level = cls.level;
  for (const [key, config] of Object.entries(SUBJECTS)) {
    subjectOrder++;
    const subjectId = `sub-${level}-${key}`;
    seed.subjects.push({
      id: subjectId,
      classId: `class-${level}`,
      name: config.name,
      slug: `${config.name.toLowerCase().replace(/[^a-z]+/g, "-")}-class-${level}`,
      description: config.description,
      icon: config.icon,
      color: config.color,
      order: subjectOrder,
      active: true,
      seeded: true
    });

    const chapters = CURRICULUM[level][key];
    for (const [chapterIndex, chapter] of chapters.entries()) {
      const chapterId = `chap-${level}-${key}-${chapterIndex + 1}`;
      seed.chapters.push({
        id: chapterId,
        subjectId,
        classId: `class-${level}`,
        title: chapter[0],
        description: `Understand ${chapter[0].toLowerCase()} with simple explanations, examples and practice.`,
        order: chapterIndex + 1,
        active: true,
        seeded: true
      });

      for (const [topicIndex, topic] of chapter[1].entries()) {
        const topicId = `top-${level}-${key}-${chapterIndex + 1}-${topicIndex + 1}`;
        seed.topics.push({
          id: topicId,
          chapterId,
          subjectId,
          classId: `class-${level}`,
          title: topic[0],
          summary: topic[1],
          order: topicIndex + 1,
          estimatedMinutes: 8 + ((topicIndex + chapterIndex) % 3) * 3,
          active: true,
          seeded: true
        });

        const override = TOPIC_OVERRIDES[topicId];
        const extras = SUBJECT_EXTRAS[config.name];
        seed.learningContents.push({
          id: `lc-${topicId}`,
          topicId,
          sections: override ? override.sections : [
            {
              heading: "The big idea",
              body: `${topic[1]} This lesson is part of ${config.name} in Class ${level}. Read the explanation once, then explain it aloud in your own words before moving on.`,
              bullets: [
                `Look for the key term: ${topic[0]}.`,
                "Write down one question you still have after reading.",
                "Connect the idea to something you have seen at home or in your village."
              ]
            },
            {
              heading: "How to study this well",
              body: `${extras.study} Use the notes and examples below, then attempt the practice questions without looking at the answers.`,
              bullets: []
            },
            {
              heading: "Why this matters",
              body: `Learning ${topic[0].toLowerCase()} is not only for exams. ${extras.applications[0]} ${extras.applications[1]}`
            }
          ],
          definitions: override ? override.definitions : [
            { term: topic[0], meaning: topic[1] },
            { term: config.name, meaning: config.description }
          ],
          notes: override ? override.notes : [
            `Write the main idea of ${topic[0]} in one sentence.`,
            "Use a labelled diagram or a small table to organise what you learn.",
            "Ask your teacher about anything that is still unclear."
          ],
          examples: override ? override.examples : [
            { title: "In the classroom", description: "Discuss this topic with a classmate and explain one example to each other." },
            { title: "At home", description: `Look for a situation at home where ${topic[0].toLowerCase()} is useful, and note it in your notebook.` }
          ],
          images: override ? override.images || [] : [],
          videos: [],
          applications: override ? override.applications : extras.applications,
          keyPoints: override ? override.keyPoints : [
            topic[1],
            `This topic belongs to ${config.name} and connects to the chapter "${chapter[0]}".`,
            "Review the key words, then test yourself with the practice questions."
          ],
          practiceQuestions: override ? override.practiceQuestions : [
            { question: `Explain ${topic[0]} in your own words.`, answer: topic[1] },
            { question: `Give one example of ${topic[0].toLowerCase()} from your surroundings.`, answer: "Answers vary. A good answer names a real object, event or situation and explains how it connects to the topic." }
          ],
          relatedTopicIds: [],
          seeded: true
        });
      }
    }
  }
}

// Related topics: link every topic to the next topic in the same subject.
const topicsBySubject = new Map();
for (const topic of seed.topics) {
  if (!topicsBySubject.has(topic.subjectId)) topicsBySubject.set(topic.subjectId, []);
  topicsBySubject.get(topic.subjectId).push(topic);
}
for (const [subjectId, topics] of topicsBySubject) {
  for (const topic of topics) {
    const content = seed.learningContents.find(c => c.topicId === topic.id);
    const others = topics.filter(t => t.id !== topic.id).slice(0, 2).map(t => t.id);
    content.relatedTopicIds = others;
  }
}

const E = (slug, title, shortDescription, category, minutes, sections, extra = {}) => ({
  id: `exp-${slug}`,
  slug,
  title,
  shortDescription,
  category,
  coverImage: `/assets/explore/${category.toLowerCase().replace(/_/g, "-")}.svg`,
  readingTimeMinutes: minutes,
  sections,
  definitions: extra.definitions || [],
  practicalExamples: extra.practicalExamples || [],
  images: extra.images || [],
  videos: [],
  keyTakeaways: extra.keyTakeaways || [],
  tags: extra.tags || [],
  relatedIds: extra.relatedIds || [],
  published: true,
  seeded: true,
  createdAt: iso(extra.offset || 0)
});

seed.exploreContents = [
  E("how-does-electricity-reach-our-homes", "How does electricity reach our homes?",
    "Follow the journey of electricity from a power station to the switch on your wall.",
    "SCIENCE_EVERYDAY_LIFE", 7,
    [
      { heading: "Generation", body: "Electricity is generated in power stations. In Punjab, thermal plants burn fuel, hydro plants use falling water, and solar farms convert sunlight. A generator produces alternating current by turning a coil inside a magnetic field.", bullets: ["Thermal, hydro, wind and solar all feed the same grid.", "The voltage is raised before transmission to reduce energy loss."] },
      { heading: "Transmission and distribution", body: "High-voltage lines carry electricity across long distances. Substations lower the voltage step by step. Distribution transformers bring it to a safe level for homes, and service wires connect to your electricity meter.", bullets: ["High voltage reduces current for the same power, so wires waste less energy.", "The meter records how much energy your home uses."] },
      { heading: "Inside the house", body: "Live, neutral and earth wires work together. The live wire carries current, the neutral completes the path, and the earth wire protects people if a metal casing becomes live. A switch opens the circuit so an appliance stops drawing current." }
    ],
    { definitions: [["Transformer", "A device that increases or decreases alternating voltage."], ["Grid", "The connected network of generation, transmission and distribution."]], practicalExamples: ["A ceiling fan stops when its switch opens the circuit.", "A fuse melts before a faulty appliance can overheat."], keyTakeaways: ["Generation, transmission and distribution are separate stages.", "Transformers change voltage safely.", "Earth wires and fuses protect people."], tags: ["electricity", "grid", "safety", "physics"], offset: 0 }
  ),
  E("how-do-solar-panels-generate-electricity", "How do solar panels generate electricity?",
    "Sunlight becomes electricity inside a silent, moving-part-free panel.",
    "SCIENCE_EVERYDAY_LIFE", 6,
    [
      { heading: "The photovoltaic effect", body: "A solar panel is made of many solar cells. Each cell has layers of silicon treated to have different electrical properties. When photons from sunlight strike the cell, they free electrons. The built-in electric field pushes those electrons in one direction, creating current.", bullets: ["Only sunlight, not heat alone, drives the photovoltaic effect.", "Cells are connected in series to raise voltage."] },
      { heading: "From panel to appliance", body: "Panels produce direct current (DC). An inverter converts it to alternating current (AC) for household appliances. A charge controller protects a battery in off-grid systems, and net metering lets surplus power flow back to the grid." },
      { heading: "Why it suits rural homes", body: "Solar pumps, lanterns and rooftop systems work without a diesel supply and need little maintenance. Panels produce most power around midday, so batteries or grid backup are needed for evening use. Dust reduces output, so regular cleaning matters." }
    ],
    { definitions: [["Photovoltaic effect", "The production of voltage when light strikes a material."], ["Inverter", "A device that changes DC into AC."]], practicalExamples: ["A solar pump lifts drinking water during the day.", "A rooftop system charges batteries for evening lights."], keyTakeaways: ["Sunlight frees electrons in silicon cells.", "Inverters make panel output usable at home.", "Batteries store energy for later."], tags: ["solar", "energy", "technology", "physics"], offset: 5 }
  ),
  E("how-does-the-internet-work", "How does the internet work?",
    "A request from your phone travels through networks and comes back with a web page.",
    "TECHNOLOGY", 7,
    [
      { heading: "Networks talking to networks", body: "The internet is a network of networks. Your phone connects to a router, which connects to your internet service provider. Data is broken into packets, each labelled with a destination address, and routers pass packets along the best available path.", bullets: ["Packets may travel different routes and are reassembled at the destination.", "IP addresses identify devices; DNS translates names like example.com into addresses."] },
      { heading: "Request and response", body: "When you open a website, your browser sends an HTTP request to a server. The server responds with HTML, CSS, JavaScript and images. HTTPS encrypts this exchange so that others on the network cannot read or change it.", bullets: ["A web server listens for requests on a port.", "Caching stores copies closer to you so pages load faster."] },
      { heading: "What this means for you", body: "Data travels over wires, optical fibre and mobile radio links. Distance and congestion affect speed. A weak mobile signal means more retransmissions and slower loading. This is why NabhaLearn keeps pages lightweight and avoids unnecessary downloads." }
    ],
    { definitions: [["Packet", "A small unit of data sent across a network."], ["DNS", "The system that maps domain names to IP addresses."], ["HTTPS", "Encrypted HTTP that protects data in transit."]], practicalExamples: ["A video call sends and receives packets continuously.", "A school computer loads a website through a local router."], keyTakeaways: ["The internet is a network of networks.", "Data travels as packets using IP addresses.", "HTTPS encrypts browser traffic.", "Caching and lightweight pages improve slow connections."], tags: ["internet", "networking", "web", "technology"], offset: 10 }
  ),
  E("how-does-a-refrigerator-work", "How does a refrigerator work?",
    "A fridge moves heat from inside to outside using evaporation and condensation.",
    "HOW_THINGS_WORK", 6,
    [
      { heading: "Moving heat, not making cold", body: "A refrigerator does not create cold. It removes heat from the food compartment and releases it at the back. A refrigerant flows through a closed loop, changing between liquid and gas as it moves.", bullets: ["Evaporation absorbs heat.", "Condensation releases heat."] },
      { heading: "The four parts", body: "The compressor raises the pressure and temperature of the refrigerant gas. In the condenser coils at the back, the gas releases heat and becomes liquid. The expansion valve lowers the pressure, and the evaporator inside the fridge lets the liquid absorb heat and turn back into gas." },
      { heading: "Using a fridge well", body: "Keep the door closed, leave space for air to circulate and never block the back coils. A fridge works harder in a hot room. Defrosting and cleaning door seals reduce electricity use." }
    ],
    { definitions: [["Refrigerant", "A fluid that absorbs and releases heat as it changes state."], ["Compressor", "A pump that raises refrigerant pressure."]], practicalExamples: ["The back of a fridge feels warm because it releases heat.", "A pressure cooker and a fridge both use pressure changes."], keyTakeaways: ["A fridge moves heat outside.", "Evaporation absorbs heat; condensation releases it.", "Good habits reduce electricity use."], tags: ["refrigerator", "heat", "machines", "science"], offset: 15 }
  ),
  E("how-do-farmers-use-modern-technology", "How do farmers use modern technology?",
    "From soil testing to drip irrigation, technology helps farmers save water and grow more.",
    "AGRICULTURE_FARMING", 7,
    [
      { heading: "Better decisions before sowing", body: "Soil testing measures nutrients and pH so farmers can add the right amount of fertiliser. Weather forecasts guide sowing dates. Certified seed varieties resist disease and give predictable yields.", bullets: ["Over-fertilising wastes money and harms soil.", "Seed treatment protects young plants."] },
      { heading: "Water and crop care", body: "Drip and sprinkler irrigation deliver water directly where it is needed, saving both water and labour. Soil moisture sensors tell farmers when to irrigate. Drones and phone apps can help spot pest outbreaks early, though they are not available to every farmer yet." },
      { heading: "Harvest, storage and market", body: "Combine harvesters speed up harvesting. Clean, dry storage limits mould. Mobile messages and online market platforms help farmers compare prices. Solar dryers preserve vegetables and fruit so less produce is wasted." }
    ],
    { definitions: [["Drip irrigation", "A system that delivers water drop by drop near plant roots."], ["Soil test", "A laboratory check of soil nutrients and pH."]], practicalExamples: ["A farmer uses a soil test to choose fertiliser.", "A solar dryer preserves vegetables for off-season sale."], keyTakeaways: ["Technology supports decisions, not just machines.", "Water-saving irrigation protects a shared resource.", "Storage and market information reduce losses."], tags: ["farming", "agriculture", "irrigation", "technology"], offset: 20 }
  ),
  E("how-does-a-water-pump-work", "How does a water pump work?",
    "A pump uses pressure differences to lift water from a well or borewell.",
    "MACHINES_ENGINEERING", 5,
    [
      { heading: "Creating a pressure difference", body: "A pump does not 'suck' water in the way we often say. It lowers the pressure at its inlet, and atmospheric pressure pushes water up into the pipe. Then the pump pushes the water out. The maximum practical lift is limited by atmospheric pressure and friction.", bullets: ["Pumps must be primed before they can move water.", "Air leaks in a suction pipe stop water from rising."] },
      { heading: "Common pump types", body: "A hand pump uses a piston and valves. A centrifugal pump spins an impeller that throws water outward, creating flow. A submersible pump sits inside a borewell and pushes water upward. Solar pumps use panels to run a motor without diesel." },
      { heading: "Care and efficiency", body: "Keep intake screens clean. Avoid running a pump dry. Match the pump size to the depth and required flow. A leaking pipe can waste more water than the pump can supply, so check joints regularly." }
    ],
    { definitions: [["Priming", "Filling a pump and suction pipe with water before starting."], ["Impeller", "A rotating part that moves water in a centrifugal pump."]], practicalExamples: ["A hand pump lifts water using a piston.", "A solar submersible pump fills a tank in a village."], keyTakeaways: ["Atmospheric pressure helps lift water.", "Different pumps suit different depths and uses.", "Maintenance and pipe checks save water."], tags: ["pumps", "water", "machines", "irrigation"], offset: 25 }
  ),
  E("why-does-the-moon-change-shape", "Why does the Moon change shape?",
    "The Moon does not change. We see different amounts of its sunlit side as it orbits Earth.",
    "SPACE_UNIVERSE", 5,
    [
      { heading: "A half-lit sphere in space", body: "The Moon has no light of its own; it reflects sunlight. At any moment half of the Moon is lit and half is dark. As the Moon orbits Earth, we see different portions of the lit half, producing phases from new moon to full moon." },
      { heading: "The monthly cycle", body: "A full cycle takes about 29.5 days. Starting from new moon, the crescent grows (waxing) to first quarter, then full moon. It then shrinks (wanes) through last quarter back to new moon. The phases are not caused by Earth's shadow — that causes eclipses, which are less frequent." },
      { heading: "Observing from Nabha", body: "The Moon rises at different times depending on its phase. A full moon rises near sunset and sets near sunrise. Keeping a simple drawing log for a month is an excellent astronomy project." }
    ],
    { definitions: [["Phase", "The visible portion of the Moon's sunlit side from Earth."], ["Waxing", "Growing from new moon toward full moon."]], practicalExamples: ["A full moon rising at sunset.", "A thin crescent visible just after sunset."], keyTakeaways: ["The Moon reflects sunlight.", "Phases come from our changing viewing angle.", "One cycle takes about a month."], tags: ["moon", "space", "astronomy"], offset: 30 }
  ),
  E("how-do-trees-help-a-village", "How do trees help a village?",
    "Trees cool air, hold soil, recharge water and support food and livelihoods.",
    "NATURE_ENVIRONMENT", 6,
    [
      { heading: "Shade and cooler air", body: "Trees release water vapour through transpiration, which cools the air around them. Their canopy blocks direct sunlight. A shaded street can be several degrees cooler than an open one." },
      { heading: "Soil and water", body: "Roots hold soil in place during rain, reducing erosion. Leaf litter and roots help rain soak into the ground instead of running off, supporting groundwater recharge. A small planted patch can protect a village pond's bank." },
      { heading: "Food, income and habitat", body: "Trees provide fruit, fodder, fuel and timber, and they shelter birds and insects. Native species need less water and support more local wildlife. Planting the right tree in the right place matters more than planting many random saplings." }
    ],
    { definitions: [["Transpiration", "Loss of water vapour from plant leaves."], ["Groundwater recharge", "Movement of surface water into underground stores."]], practicalExamples: ["Neem and peepal trees give shade and habitat.", "Contour planting on a slope slows runoff."], keyTakeaways: ["Trees cool and clean the environment.", "Roots reduce erosion and help recharge water.", "Native species are easier to sustain."], tags: ["trees", "environment", "water", "nature"], offset: 35 }
  ),
  E("why-do-we-have-time-zones", "Why do we have time zones?",
    "Earth spins, so noon arrives at different places at different moments.",
    "GENERAL_KNOWLEDGE", 4,
    [
      { heading: "A spinning planet", body: "Earth rotates once in about 24 hours, so the Sun appears to move across the sky. When it is noon in one place, it may be morning or evening elsewhere. Time zones give neighbouring regions a shared clock." },
      { heading: "How zones are drawn", body: "The world is roughly divided into 24 zones, each about 15 degrees of longitude wide. India follows a single time, IST (UTC+5:30), even though the country spans a wide longitude range. The half-hour offset keeps the whole country on one clock." },
      { heading: "Why the half hour", body: "India's standard meridian is 82.5°E, which gives a 5.5-hour offset from UTC. One national time simplifies railways, exams and business, even though sunrise in the east occurs earlier than in the west." }
    ],
    { definitions: [["UTC", "Coordinated Universal Time, the reference for world clocks."], ["Standard meridian", "The longitude chosen for a region's official time."]], practicalExamples: ["A train timetable uses one national time.", "A call to another country needs a time-zone check."], keyTakeaways: ["Time zones follow Earth's rotation.", "Most zones are one hour apart.", "India uses one time with a half-hour offset."], tags: ["time", "geography", "earth"], offset: 40 }
  ),
  E("how-to-keep-drinking-water-safe", "How to keep drinking water safe at home",
    "Simple habits — boiling, filtering and clean storage — prevent water-borne illness.",
    "PRACTICAL_LIFE_SKILLS", 5,
    [
      { heading: "Make water safe", body: "Boiling water for at least one minute kills most germs. Filtering removes mud and some contaminants, but a filter alone may not remove all microbes. Chlorination tablets are useful when boiling is not possible, if used exactly as directed." },
      { heading: "Store it cleanly", body: "Use a covered container with a tap or a clean ladle. Never dip dirty hands or cups into stored water. Clean the container regularly and keep it off the floor. Even safe water can become unsafe through careless storage." },
      { heading: "Protect the source", body: "Keep hand pumps and wells away from toilets and animal waste. Repair leaks, cover open wells and avoid dumping waste near a water source. Handwashing with soap remains one of the most effective health habits." }
    ],
    { definitions: [["Contamination", "The presence of harmful germs or chemicals in water."], ["Chlorination", "Adding a measured amount of chlorine to disinfect water."]], practicalExamples: ["Boiling water and cooling it covered.", "Using a ladle instead of a cup to take water."], keyTakeaways: ["Boiling is a reliable way to kill germs.", "Clean storage is as important as treatment.", "Protect water sources from waste."], tags: ["water", "health", "life skills", "hygiene"], offset: 45 }
  ),
  E("careers-around-agriculture", "Careers around agriculture and food science",
    "Farming is one part of a large chain of science, business and technology careers.",
    "CAREER_AWARENESS", 6,
    [
      { heading: "Science and technology roles", body: "Agricultural scientists study soil, seeds and pests. Food technologists develop safe packaged foods. Agricultural engineers design irrigation and farm machinery. Veterinary doctors keep animals healthy. These roles usually need a degree or diploma after Class 12." },
      { heading: "Business and services", body: "Agri-business managers buy, store and sell produce. Rural bankers help farmers plan loans. Supply-chain coordinators move food from farms to markets. Many of these careers combine agriculture knowledge with commerce or management." },
      { heading: "Building a path from school", body: "Focus on science and mathematics, practise careful observation and learn to use spreadsheets. Talk to local farmers, visit a soil-testing lab and join a school gardening project. Ask your teachers about diploma courses and scholarships rather than relying on rumour." }
    ],
    { definitions: [["Agronomy", "The science of crop production and soil management."], ["Food technology", "The study of processing, preserving and packaging food safely."]], practicalExamples: ["A soil-testing officer advises farmers.", "A food technologist checks packaged food safety."], keyTakeaways: ["Agriculture connects many careers.", "Science, commerce and management all apply.", "Practical projects and clear information help career choices."], tags: ["careers", "agriculture", "food science"], offset: 50 }
  ),
  E("five-surprising-facts-about-sound", "Five surprising facts about sound",
    "Sound is a vibration that needs a medium — and it can do some very strange things.",
    "INTERESTING_FACTS", 4,
    [
      { heading: "Sound needs a medium", body: "Sound travels as a wave of vibrating particles. It cannot travel through a vacuum because there are no particles to carry the vibration. This is why space is silent, even though films often add dramatic explosions." },
      { heading: "Speed depends on the material", body: "Sound travels faster in water than in air, and faster still in steel. Particles are packed closer together, so vibrations pass along more quickly. The speed of sound in air is about 343 m/s at room temperature." },
      { heading: "Pitch, loudness and echoes", body: "Pitch depends on frequency, and loudness depends on amplitude. An echo is a reflected sound. Bats use echoes to navigate, and ultrasound scanners use high-frequency sound to see inside the body." }
    ],
    { definitions: [["Frequency", "The number of vibrations per second, measured in hertz."], ["Echo", "A sound heard again after reflection from a surface."]], practicalExamples: ["Hearing an echo in a large hall.", "Bats locating insects using ultrasound."], keyTakeaways: ["Sound needs a medium.", "Sound travels faster in denser media.", "Frequency controls pitch."], tags: ["sound", "physics", "facts"], offset: 55 }
  ),
  E("how-newton-studied-motion", "How did Newton study motion?",
    "The famous apple story is only a hint. Newton built a system that explained falling and orbiting.",
    "EXPERIMENTS_DISCOVERIES", 6,
    [
      { heading: "The question", body: "Newton asked whether the force that pulls an apple to the ground could also be the force that keeps the Moon in orbit. Instead of treating these as separate phenomena, he looked for one rule that explained both." },
      { heading: "From observation to mathematics", body: "Newton used observations and mathematics to show that gravitational force depends on mass and distance. His laws of motion connected force, mass and acceleration. These ideas unified falling objects and planetary orbits under a single framework." },
      { heading: "How science really works", body: "The apple story is often simplified. Newton built on work by Galileo, Kepler and others, and his ideas were debated and tested. Science advances through observation, mathematics, criticism and repeated testing — not a single moment of inspiration." }
    ],
    { definitions: [["Gravity", "The attractive force between objects with mass."], ["Inertia", "An object's tendency to resist a change in motion."]], practicalExamples: ["A ball falls to the ground.", "The Moon orbits Earth under gravity."], keyTakeaways: ["Newton connected terrestrial and celestial motion.", "Science builds on earlier work.", "Mathematical models must be tested."], tags: ["newton", "gravity", "history", "discovery"], offset: 60 }
  )
];

const Q = (id, prompt, options, correct, topicId, explanation, type = "MULTIPLE_CHOICE") => ({
  id,
  type,
  prompt,
  topicId,
  options: type === "TRUE_FALSE" && !options.length
    ? [{ key: "TRUE", text: "True" }, { key: "FALSE", text: "False" }]
    : options.map((text, index) => ({ key: String.fromCharCode(65 + index), text })),
  correctOptionKey: type === "TRUE_FALSE" && !options.length ? correct : correct,
  explanation,
  marks: 1
});

const quiz = (id, title, description, classId, key, chapterId, topicId, duration, questions) => ({
  id,
  title,
  description,
  classId,
  subjectId: `sub-${classId.split("-")[1]}-${key}`,
  chapterId,
  topicId,
  durationMinutes: duration,
  totalMarks: questions.reduce((sum, question) => sum + question.marks, 0),
  published: true,
  questions,
  seeded: true,
  createdAt: iso(70)
});

seed.quizzes = [
  quiz("quiz-6-science-food", "Food Sources — Quick Check", "A short check on plant and animal sources of food.", "class-6", "science", "chap-6-science-1", "top-6-science-1-1", 6, [
    Q("q1", "Which part of the carrot plant do we eat?", ["Root", "Stem", "Leaf", "Flower"], "A", "top-6-science-1-1", "Carrot is a modified tap root."),
    Q("q2", "Which of these is an animal source of food?", ["Milk", "Rice", "Spinach", "Wheat"], "A", "top-6-science-1-2", "Milk comes from animals such as cows and buffaloes."),
    Q("q3", "Which nutrient gives us energy quickly?", ["Carbohydrate", "Vitamin C", "Iron", "Water"], "A", "top-6-science-2-1", "Carbohydrates are the body's main quick energy source.")
  ]),
  quiz("quiz-6-maths-numbers", "Large Numbers — Quick Check", "Comparing, rounding and place value.", "class-6", "math", "chap-6-math-1", "top-6-math-1-1", 6, [
    Q("q1", "What is the greatest 4-digit number?", ["9999", "1000", "9000", "9990"], "A", "top-6-math-1-1", "9999 is the largest number with four digits."),
    Q("q2", "What is the place value of 7 in 4,782?", ["700", "7", "70", "7000"], "A", "top-6-math-1-1", "7 is in the hundreds place, so its value is 700."),
    Q("q3", "Round 6,584 to the nearest hundred.", ["6,600", "6,500", "6,580", "7,000"], "A", "top-6-math-1-2", "The tens digit is 8, so round up to 6,600.")
  ]),
  quiz("quiz-6-english-nouns", "Nouns and Pronouns — Quick Check", "Identify naming words and pronouns.", "class-6", "english", "chap-6-english-2", "top-6-english-2-2", 5, [
    Q("q1", "Which word is a pronoun?", ["She", "Village", "Mango", "Run"], "A", "top-6-english-2-2", "‘She’ replaces a noun."),
    Q("q2", "Which word is a noun?", ["Book", "Quickly", "Beautiful", "Jump"], "A", "top-6-english-2-2", "A book is a naming word."),
    Q("q3", "Choose the correct sentence.", ["The children are playing.", "The children is playing.", "The children am playing.", "The children be playing."], "A", "top-6-english-2-2", "The plural subject ‘children’ takes ‘are’.")
  ]),
  quiz("quiz-7-science-photosynthesis", "Photosynthesis — Quick Check", "How green plants make food.", "class-7", "science", "chap-7-science-1", "top-7-science-1-1", 6, [
    Q("q1", "Which gas do plants take in during photosynthesis?", ["Carbon dioxide", "Oxygen", "Nitrogen", "Hydrogen"], "A", "top-7-science-1-1", "Plants use carbon dioxide from the air."),
    Q("q2", "What provides energy for photosynthesis?", ["Sunlight", "Soil", "Oxygen", "Nitrogen"], "A", "top-7-science-1-1", "Chlorophyll captures light energy."),
    Q("q3", "Photosynthesis mainly happens in leaves.", [], "TRUE", "top-7-science-1-1", "Leaves contain chlorophyll and stomata for gas exchange.", "TRUE_FALSE")
  ]),
  quiz("quiz-7-maths-integers", "Integers — Quick Check", "Operations with positive and negative numbers.", "class-7", "math", "chap-7-math-1", "top-7-math-1-1", 6, [
    Q("q1", "What is −5 + 8?", ["3", "−3", "13", "−13"], "A", "top-7-math-1-1", "Moving 8 steps right from −5 lands on 3."),
    Q("q2", "What is (−4) × (−3)?", ["12", "−12", "7", "−7"], "A", "top-7-math-1-1", "The product of two negative numbers is positive."),
    Q("q3", "Zero is neither positive nor negative.", [], "TRUE", "top-7-math-1-1", "Zero is the additive identity and is neither positive nor negative.", "TRUE_FALSE")
  ]),
  quiz("quiz-7-english-adjectives", "Adjectives — Quick Check", "Describe people, places and things.", "class-7", "english", "chap-7-english-2", "top-7-english-2-2", 5, [
    Q("q1", "Which word is an adjective?", ["Beautiful", "Slowly", "Run", "Village"], "A", "top-7-english-2-2", "‘Beautiful’ describes a noun."),
    Q("q2", "Choose the best adjective: The ___ river flowed past the fields.", ["wide", "widely", "width", "widen"], "A", "top-7-english-2-2", "‘Wide’ describes the noun ‘river’."),
    Q("q3", "In ‘The tall boy smiled’, which word is the adjective?", ["tall", "boy", "smiled", "The"], "A", "top-7-english-2-2", "‘Tall’ describes the boy.")
  ]),
  quiz("quiz-8-science-electricity", "Electricity and Circuits — Quick Check", "Cells, bulbs, switches and conductors.", "class-8", "science", "chap-8-science-2", "top-8-science-2-1", 8, [
    Q("q1", "When does a bulb in a simple circuit glow?", ["When the circuit is closed", "When the circuit is open", "When the switch is removed", "When the wire is cut"], "A", "top-8-science-2-1", "Current needs a complete path."),
    Q("q2", "Which material is an insulator?", ["Plastic", "Copper", "Iron", "Aluminium"], "A", "top-8-science-2-2", "Plastic does not allow electric current to flow easily."),
    Q("q3", "A switch controls current by opening or closing a circuit.", [], "TRUE", "top-8-science-2-1", "A switch is a controlled gap in the circuit.", "TRUE_FALSE")
  ]),
  quiz("quiz-8-science-light", "Light — Quick Check", "Reflection, mirrors and the spectrum.", "class-8", "science", "chap-8-science-3", "top-8-science-3-1", 8, [
    Q("q1", "The angle of incidence is ___ the angle of reflection.", ["equal to", "greater than", "less than", "unrelated to"], "A", "top-8-science-3-1", "This is the law of reflection."),
    Q("q2", "The image formed by a plane mirror is", ["virtual and erect", "real and inverted", "real and erect", "always enlarged"], "A", "top-8-science-3-1", "A plane mirror forms a virtual, erect image of the same size."),
    Q("q3", "A prism can split white light into colours.", [], "TRUE", "top-8-science-3-2", "This is dispersion of light.", "TRUE_FALSE")
  ]),
  quiz("quiz-8-science-crops", "Crop Production — Quick Check", "Soil, seeds, irrigation and weeds.", "class-8", "science", "chap-8-science-1", "top-8-science-1-1", 7, [
    Q("q1", "What is the main purpose of ploughing?", ["To loosen and turn the soil", "To harvest the crop", "To store grain", "To remove the crop"], "A", "top-8-science-1-1", "Ploughing improves air and water movement in soil."),
    Q("q2", "Supplying water to crops is called", ["irrigation", "weeding", "harvesting", "threshing"], "A", "top-8-science-1-2", "Irrigation supplies water at the right intervals."),
    Q("q3", "Unwanted plants growing with a crop are called weeds.", [], "TRUE", "top-8-science-1-2", "Weeds compete for water, light and nutrients.", "TRUE_FALSE")
  ]),
  quiz("quiz-8-maths-rational", "Rational Numbers — Quick Check", "Definition, number line and operations.", "class-8", "math", "chap-8-math-1", "top-8-math-1-1", 7, [
    Q("q1", "Which of these is a rational number?", ["3/4", "√2", "π", "√3"], "A", "top-8-math-1-1", "3/4 is in p/q form with q ≠ 0."),
    Q("q2", "What is the additive identity for rational numbers?", ["0", "1", "−1", "1/2"], "A", "top-8-math-1-2", "Adding 0 does not change the number."),
    Q("q3", "1/2 + 1/3 = ?", ["5/6", "2/5", "1/6", "3/5"], "A", "top-8-math-1-2", "3/6 + 2/6 = 5/6.")
  ]),
  quiz("quiz-8-maths-linear", "Linear Equations — Quick Check", "Solving equations in one variable.", "class-8", "math", "chap-8-math-2", "top-8-math-2-1", 7, [
    Q("q1", "Solve 2x + 5 = 17.", ["6", "11", "7", "12"], "A", "top-8-math-2-1", "2x = 12, so x = 6."),
    Q("q2", "‘5 more than twice a number is 17’ is written as", ["2x + 5 = 17", "5x + 2 = 17", "2(x + 5) = 17", "5x = 17"], "A", "top-8-math-2-2", "Twice a number is 2x; five more gives 2x + 5."),
    Q("q3", "The solution of an equation makes both sides equal.", [], "TRUE", "top-8-math-2-1", "Substituting the solution should balance the equation.", "TRUE_FALSE")
  ]),
  quiz("quiz-8-english-tenses", "Tenses — Quick Check", "Present, past and future forms.", "class-8", "english", "chap-8-english-2", "top-8-english-2-1", 6, [
    Q("q1", "Choose the present perfect sentence.", ["I have finished my homework.", "I finish my homework yesterday.", "I finishing my homework.", "I will finished my homework."], "A", "top-8-english-2-1", "Present perfect uses have/has + past participle."),
    Q("q2", "What is the past form of ‘go’?", ["went", "goed", "gone", "going"], "A", "top-8-english-2-1", "‘Went’ is the simple past form."),
    Q("q3", "‘She has visited Nabha last year’ is correct.", [], "FALSE", "top-8-english-2-1", "A finished past time expression should be used with simple past: ‘She visited Nabha last year.’", "TRUE_FALSE")
  ]),
  quiz("quiz-8-social-constitution", "The Indian Constitution — Quick Check", "Rights, federalism and the rule of law.", "class-8", "social", "chap-8-social-2", "top-8-social-2-2", 7, [
    Q("q1", "Why do we need a Constitution?", ["To set rules for government and protect rights", "To conduct exams", "To collect fees", "To build roads"], "A", "top-8-social-2-1", "It defines power and protects fundamental rights."),
    Q("q2", "Sharing power between the Union and states is called", ["federalism", "monarchy", "dictatorship", "colonialism"], "A", "top-8-social-2-2", "Federalism divides power between levels of government."),
    Q("q3", "Fundamental rights can be enforced in court.", [], "TRUE", "top-8-social-2-2", "Courts protect fundamental rights.", "TRUE_FALSE")
  ]),
  quiz("quiz-8-computer-internet", "Internet and Web — Quick Check", "Requests, servers and safe browsing.", "class-8", "computer", "chap-8-computer-2", "top-8-computer-2-1", 6, [
    Q("q1", "What does a browser send to a web server?", ["An HTTP request", "A printer command", "A spreadsheet", "A password file"], "A", "top-8-computer-2-1", "Browsers request resources using HTTP or HTTPS."),
    Q("q2", "Which is the safest habit?", ["Using a strong unique password", "Sharing your password with friends", "Clicking every unknown link", "Using the same password everywhere"], "A", "top-8-computer-2-2", "A strong unique password protects your account."),
    Q("q3", "HTTPS encrypts data between the browser and server.", [], "TRUE", "top-8-computer-2-1", "Encryption protects data in transit.", "TRUE_FALSE")
  ]),
  quiz("quiz-9-science-matter", "States of Matter — Quick Check", "Particles, diffusion and changes of state.", "class-9", "science", "chap-9-science-1", "top-9-science-1-1", 7, [
    Q("q1", "In which state are particles most tightly packed?", ["Solid", "Liquid", "Gas", "All are equal"], "A", "top-9-science-1-1", "Solids have closely packed particles."),
    Q("q2", "The spreading of ink in water is called", ["diffusion", "condensation", "sublimation", "freezing"], "A", "top-9-science-1-1", "Particles move and mix by diffusion."),
    Q("q3", "Camphor changing directly from solid to gas is sublimation.", [], "TRUE", "top-9-science-1-2", "Sublimation skips the liquid state.", "TRUE_FALSE")
  ]),
  quiz("quiz-9-maths-irrational", "Number Systems — Quick Check", "Rational, irrational and real numbers.", "class-9", "math", "chap-9-math-1", "top-9-math-1-1", 7, [
    Q("q1", "Which number is irrational?", ["√2", "0.25", "3/5", "0.333..."], "A", "top-9-math-1-1", "√2 cannot be written as p/q."),
    Q("q2", "0.333... is a rational number.", [], "TRUE", "top-9-math-1-1", "It can be written as 1/3.", "TRUE_FALSE"),
    Q("q3", "Which of these is a real number?", ["All of these", "√2", "−4", "3/7"], "A", "top-9-math-1-2", "Rational and irrational numbers together form real numbers.")
  ]),
  quiz("quiz-9-english-reported", "Reported Speech — Quick Check", "Report what someone said accurately.", "class-9", "english", "chap-9-english-1", "top-9-english-1-2", 6, [
    Q("q1", "Direct: ‘I am tired.’ Reported: She said that she ___ tired.", ["was", "is", "were", "be"], "A", "top-9-english-1-2", "Present tense usually shifts to past in reported speech."),
    Q("q2", "Direct: ‘I will come tomorrow.’ Reported: He said he ___ come the next day.", ["would", "will", "can", "shall"], "A", "top-9-english-1-2", "‘Will’ changes to ‘would’."),
    Q("q3", "In reported speech, pronouns often need to change.", [], "TRUE", "top-9-english-1-2", "Pronouns shift according to the speaker and listener.", "TRUE_FALSE")
  ]),
  quiz("quiz-10-science-reactions", "Chemical Reactions — Quick Check", "Types of reactions and balancing.", "class-10", "science", "chap-10-science-1", "top-10-science-1-1", 8, [
    Q("q1", "Breaking a compound into simpler substances is", ["decomposition", "combination", "displacement", "neutralisation"], "A", "top-10-science-1-1", "A single compound splits in decomposition."),
    Q("q2", "Rusting of iron is an example of", ["oxidation", "reduction", "sublimation", "distillation"], "A", "top-10-science-1-1", "Iron reacts with oxygen and moisture."),
    Q("q3", "A balanced equation has the same number of atoms of each element on both sides.", [], "TRUE", "top-10-science-1-2", "Mass is conserved in a chemical reaction.", "TRUE_FALSE")
  ]),
  quiz("quiz-10-science-electricity", "Electricity — Quick Check", "Ohm's law and circuits.", "class-10", "science", "chap-10-science-2", "top-10-science-2-1", 8, [
    Q("q1", "Ohm's law is", ["V = IR", "V = I/R", "R = VI", "I = VR"], "A", "top-10-science-2-1", "Voltage equals current times resistance."),
    Q("q2", "Two 2 Ω and 3 Ω resistors in series give", ["5 Ω", "1.2 Ω", "6 Ω", "2.5 Ω"], "A", "top-10-science-2-2", "Series resistances add: 2 + 3 = 5 Ω."),
    Q("q3", "In a series circuit, the current is the same through each component.", [], "TRUE", "top-10-science-2-2", "There is only one path for the current.", "TRUE_FALSE")
  ]),
  quiz("quiz-10-maths-quadratic", "Quadratic Equations — Quick Check", "Roots, factorisation and the discriminant.", "class-10", "math", "chap-10-math-2", "top-10-math-2-1", 8, [
    Q("q1", "The roots of x² − 5x + 6 = 0 are", ["2 and 3", "−2 and −3", "1 and 6", "−1 and −6"], "A", "top-10-math-2-1", "Factorise as (x − 2)(x − 3) = 0."),
    Q("q2", "The discriminant of ax² + bx + c = 0 is", ["b² − 4ac", "b² + 4ac", "4ac − b²", "−b/2a"], "A", "top-10-math-2-1", "The discriminant determines the nature of the roots."),
    Q("q3", "If D < 0, the quadratic has no real roots.", [], "TRUE", "top-10-math-2-1", "A negative discriminant means no real solutions.", "TRUE_FALSE")
  ]),
  quiz("quiz-10-english-formal", "Formal Letters — Quick Check", "Structure and tone of a formal letter.", "class-10", "english", "chap-10-english-1", "top-10-english-1-2", 6, [
    Q("q1", "A formal letter usually begins with", ["the sender's address", "a joke", "a poem", "a shopping list"], "A", "top-10-english-1-2", "Formal letters include the sender's address and date."),
    Q("q2", "Which closing is most formal?", ["Yours faithfully", "See ya", "Bye", "Take care!"], "A", "top-10-english-1-2", "‘Yours faithfully’ is a standard formal closing."),
    Q("q3", "A formal letter should have a clear subject line.", [], "TRUE", "top-10-english-1-2", "The subject tells the reader what the letter is about.", "TRUE_FALSE")
  ]),
  quiz("quiz-10-social-nationalism", "Nationalism in India — Quick Check", "Movements, leaders and the Salt March.", "class-10", "social", "chap-10-social-1", "top-10-social-1-2", 7, [
    Q("q1", "The Salt March took place in", ["1930", "1919", "1942", "1947"], "A", "top-10-social-1-2", "Gandhi marched to Dandi in 1930."),
    Q("q2", "The Non-Cooperation Movement was launched in", ["1920", "1930", "1942", "1905"], "A", "top-10-social-1-1", "It began in 1920 under Gandhi's leadership."),
    Q("q3", "The Salt March protested against the British salt tax.", [], "TRUE", "top-10-social-1-2", "Salt became a symbol of colonial injustice.", "TRUE_FALSE")
  ])
];

const assignmentSpecs = [
  ["science", "Science Diagram and Explanation", "Prepare a labelled diagram of a simple electric circuit and explain in 5 lines how the bulb glows.", "Draw the circuit neatly with a pencil. Label the cell, switch, bulb and wires. Write five complete sentences. Upload a clear photo or PDF.", "chap-8-science-2", 10],
  ["english", "Descriptive Writing Task", "Write a 120–150 word description of a place in your village during the monsoon.", "Use at least three sensory details. Include a clear beginning, middle and end. Check spelling before submitting.", "chap-8-english-1", 10]
];

seed.assignments = [];for (const cls of CLASSES) {
  const level = cls.level;
  const specs = [
    ["science", `Class ${level} Science: Concept Poster`, `Create a one-page poster that explains a key idea from your Science chapter "${CURRICULUM[level].science[0][0]}".`, "Use a clear title, one labelled diagram and five key points written in your own words.", "chap-8-science-2", 10],
    ["english", `Class ${level} English: Short Writing Task`, `Write a short paragraph of 120–150 words connected to "${CURRICULUM[level].english[0][0]}".`, "Include a topic sentence, supporting details and a concluding sentence. Check grammar and spelling before submitting.", "chap-8-english-1", 10]
  ];
  for (const [key, title, description, instruction, chapterRef, maxMarks] of specs) {
    const chapter = key === "science"
      ? `chap-${level}-science-1`
      : `chap-${level}-english-1`;
    seed.assignments.push({
      id: `assign-${level}-${key}`,
      classId: `class-${level}`,
      subjectId: `sub-${level}-${key}`,
      title,
      description,
      instructions: [
        instruction,
        "Submit a PDF, JPG or PNG file up to 5 MB, or type your response in the text box.",
        "Late submissions are accepted and marked as late."
      ],
      assignedDate: null,
      dueDate: null,
      maxMarks,
      attachments: [
        { name: "Assignment submission guide", url: "/assets/resources/assignment-guide.html", contentType: "text/html" }
      ],
      published: true,
      seeded: true,
      createdAt: iso(80)
    });
  }
}

mkdirSync(dirname(SEED_PATH), { recursive: true });

const pairToObject = (pair) => Array.isArray(pair)
  ? (pair.length >= 2 ? { term: pair[0], meaning: pair[1] } : { term: String(pair[0] || ""), meaning: "" })
  : pair;
const exampleToObject = (example) => Array.isArray(example)
  ? { title: example[0], description: example[1] }
  : example;
const practiceToObject = (item) => Array.isArray(item)
  ? { question: item[0], answer: item[1] }
  : item;

seed.learningContents = seed.learningContents.map((content) => ({
  ...content,
  sections: content.sections.map((section) => ({
    heading: section.heading,
    body: section.body,
    bullets: section.bullets || []
  })),
  definitions: (content.definitions || []).map(pairToObject),
  examples: (content.examples || []).map(exampleToObject),
  practiceQuestions: (content.practiceQuestions || []).map(practiceToObject)
}));

seed.exploreContents = seed.exploreContents.map((content) => ({
  ...content,
  definitions: (content.definitions || []).map(pairToObject),
  keyTakeaways: content.keyTakeaways || [],
  practicalExamples: content.practicalExamples || [],
  tags: content.tags || []
}));

writeFileSync(SEED_PATH, JSON.stringify(seed, null, 2));

const categories = {
  "science-everyday-life": ["#0E9F6E", "#DFF7EC"],
  "technology": ["#4F7DF3", "#E6EDFF"],
  "how-things-work": ["#F2994A", "#FFF0DF"],
  "space-universe": ["#8367E8", "#EFE9FF"],
  "nature-environment": ["#2FA36B", "#E4F7ED"],
  "agriculture-farming": ["#7BAE37", "#EFF8E1"],
  "machines-engineering": ["#64748B", "#EDF1F6"],
  "experiments-discoveries": ["#E3A008", "#FFF6D8"],
  "general-knowledge": ["#3B82C4", "#E7F2FC"],
  "practical-life-skills": ["#D9538C", "#FDE9F1"],
  "career-awareness": ["#7C5CD6", "#F0EAFE"],
  "interesting-facts": ["#F2B01E", "#FFF6DE"]
};

mkdirSync(ART_DIR, { recursive: true });
for (const [slugName, [color, tint]] of Object.entries(categories)) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 400" role="img" aria-label="Abstract illustration">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${tint}"/><stop offset="1" stop-color="#ffffff"/>
    </linearGradient>
  </defs>
  <rect width="640" height="400" fill="url(#g)"/>
  <circle cx="520" cy="80" r="120" fill="${color}" opacity="0.12"/>
  <circle cx="100" cy="330" r="90" fill="${color}" opacity="0.10"/>
  <path d="M80 300 C180 180 300 360 420 220 C500 130 560 190 590 150" fill="none" stroke="${color}" stroke-width="14" stroke-linecap="round" opacity="0.45"/>
  <rect x="250" y="120" width="160" height="160" rx="34" fill="#ffffff" opacity="0.82"/>
  <circle cx="330" cy="200" r="44" fill="${color}" opacity="0.85"/>
  <path d="M305 200 l18 18 l34 -38" fill="none" stroke="#ffffff" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="465" cy="290" r="22" fill="${color}" opacity="0.35"/>
  <circle cx="170" cy="110" r="14" fill="${color}" opacity="0.35"/>
</svg>`;
  writeFileSync(join(ART_DIR, `${slugName}.svg`), svg);
}

console.log(`Seed written: ${seed.classes.length} classes, ${seed.subjects.length} subjects, ${seed.chapters.length} chapters, ${seed.topics.length} topics, ${seed.quizzes.length} quizzes, ${seed.assignments.length} assignments, ${seed.exploreContents.length} explore articles.`);
