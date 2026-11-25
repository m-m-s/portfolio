export type Photo = {
  /** Until it's set, the photo shows as a gray box of the same shape. */
  src?: string;
  alt: string;
  /** Width over height. */
  ratio: number;
};

/** Each gallery photo's alt text, keyed by its file name in the photos Blob store. */
export const photoAlts: Record<string, string> = {
  "r1-01-macau-hotel.jpg":
    "An ornate pale-pink hotel tower on a waterfront promenade, a long bridge fading into gray haze behind it",
  "r1-02-tomatoes.jpg":
    "Snap peas and cherry tomatoes on a dark plate in low light",
  "r1-03-hong-kong-taxis.jpg":
    "A quiet city street lined with tall apartment towers, two red taxis parked at the curb",
  "r1-04-white-cat.jpg": "A white cat resting on top of a carved stone post",
  "r1-05-canal-lanterns.jpg":
    "A narrow canal between whitewashed houses, red lanterns hanging from the eaves",
  "r1-06-cable-car.jpg":
    "Looking down from inside a cable car at a lakeside town, two passengers silhouetted at the window",
  "r1-07-porto-townhouse.jpg":
    "A weathered yellow townhouse at the end of a narrow street, ivy climbing the wall beside it",
  "r1-08-desert-plains.jpg":
    "Grassland blurred by motion under a pastel dusk sky, a lone hill on the horizon",
  "r1-09-dock-lamp.jpg":
    "A curved lamppost at the end of a lakeside dock, pink clouds over the mountains beyond",
  "r1-10-badlands-lavender.jpg":
    "Pale lavender and gray badland hills streaked by erosion under a cloudy sky",
  "r2-01-dove.jpg":
    "A white dove with wings spread landing on an outstretched hand, more pigeons perched in the trees behind",
  "r2-02-tuxedo-cat.jpg":
    "A black and white cat sitting on a stone path at the foot of mossy rock steps",
  "r2-03-creek-swimmers.jpg":
    "People sunbathing on boulders beside a creek, dwarfed by dense green forest",
  "r2-04-grand-canyon.jpg":
    "A river winding through the depths of a vast canyon, framed by pine branches",
  "r2-05-green-room.jpg":
    "Glass apothecary jars on a table beneath a gilded mirror in a dim green room",
  "r2-06-oak-creek.jpg":
    "A forested canyon seen from a rocky overlook under a bright blue sky",
  "r2-07-kitchen-window.jpg":
    "An old kitchen with wooden tubs and shelves beneath a window onto green trees",
  "r2-08-night-street.jpg":
    "A truck parked outside a shop on a city street at night, lit by a red neon sign",
  "r2-09-autumn-stream.jpg":
    "A rocky stream running through woods in full autumn color",
  "r2-10-mushrooms.jpg":
    "Mushrooms growing from a fallen birch log among autumn leaves",
  "r2-11-autumn-canopy.jpg":
    "Looking straight up through a canopy of orange and yellow autumn leaves",
  "r3-01-fish-lanterns.jpg":
    "A golden fish lantern and pink lotus lanterns strung across a lane of old gray brick houses",
  "r3-02-golden-cafe.jpg":
    "An empty café lit gold by low evening sun, its chairs reflected in the polished floor",
  "r3-03-orange-cat.jpg": "An orange tabby cat peering out of a cat tree",
  "r3-04-pink-courtyard.jpg":
    "Sunlight striping the gray columns and balconies of an ornate courtyard with dusty pink walls",
  "r3-05-bread.jpg":
    "Baguettes and round loaves lined up on bakery shelves, a server's arm passing in a blur",
  "r3-06-pear-cake.jpg":
    "A pear cake topped with fanned, curling pear slices on a wooden table",
  "r3-07-tennis-court.jpg":
    "A lone tennis player on a clay court below a yellow villa, a river mouth and beach beyond",
  "r3-08-desert-storm.jpg":
    "Rain falling from a dark storm cloud over a red desert canyon rim",
  "r3-09-red-mesa.jpg":
    "Red cliffs and desert scrub under a partly cloudy sky, seen from a moving car",
  "r3-10-pink-villa.jpg":
    "A pink Art Deco villa with a curved entrance against a deep blue sky",
  "r3-11-sedona.jpg":
    "Red rock formations under a blue sky with scattered white clouds",
  "r3-12-slot-canyon.jpg":
    "Smooth, curving sandstone walls of a slot canyon glowing pink and orange",
  "r4-01-incense-smoke.jpg":
    "Thick incense smoke rising over a crowd at a temple",
  "r4-02-foggy-towers.jpg":
    "Glass skyscrapers disappearing into fog above brick rowhouses, framed by bare branches",
  "r4-03-storm-valley.jpg":
    "Sunlight breaking through storm clouds onto rolling hills",
  "r4-04-green-bridge.jpg":
    "People walking dogs across a green truss bridge over a river under heavy clouds",
  "r4-05-no-pets-lawn.jpg":
    "“No Pets” and “Pet Area” signs standing on a bright green lawn below a wooded hill",
  "r4-06-little-island.jpg":
    "A park raised on white tulip-shaped pillars over the river, the Lower Manhattan skyline behind",
  "r4-07-blue-door.jpg":
    "A red scooter parked in front of a bright blue door under a tiled eave",
  "r4-08-squirrel.jpg":
    "A ground squirrel standing upright on a rock against a cloudy blue sky",
  "r4-09-badlands-blue.jpg":
    "Banded purple and gray badland hills under a blue sky",
  "r4-10-pagoda.jpg": "A pagoda at dusk, its railing tied with red ribbons",
  "r4-11-lake-dock.jpg":
    "Docks on a still lake at dusk, pink clouds reflected in the water",
  "r4-12-coney-fog.jpg":
    "A tall ride lit pink and red glowing through fog above a pier at night, people fishing along the rail",
};

const SHAPES = {
  "3:2": 3 / 2,
  "2:3": 2 / 3,
  "4:3": 4 / 3,
  "3:4": 3 / 4,
  "16:9": 16 / 9,
};
type Shape = keyof typeof SHAPES;

const row = (n: number, shapes: Shape[]): Photo[] =>
  shapes.map((shape, i) => ({
    alt: `[IMAGE: row ${n}, photo ${i + 1}]`,
    ratio: SHAPES[shape],
  }));

/** Shown where a build has no photos store (a local build). */
export const placeholderRows: Photo[][] = [
  row(1, ["3:2", "2:3", "16:9", "3:4", "3:2", "4:3", "2:3"]),
  row(2, [
    "2:3",
    "3:2",
    "3:2",
    "16:9",
    "3:4",
    "4:3",
    "2:3",
    "3:2",
    "4:3",
    "3:4",
  ]),
  row(3, [
    "3:2",
    "4:3",
    "2:3",
    "3:2",
    "16:9",
    "3:4",
    "3:2",
    "2:3",
    "4:3",
    "16:9",
    "3:2",
    "2:3",
  ]),
];
